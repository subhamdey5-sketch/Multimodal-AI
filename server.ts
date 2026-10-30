import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';

import { db, Asset } from './server/db.js';
import {
  authMiddleware,
  AuthRequest,
  generateToken,
  hashPassword,
  comparePassword,
  registerSchema,
  loginSchema,
} from './server/auth.js';
import { analyzeUploadedAsset, processMultimodalChat } from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Ensure upload directory exists
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/m4a',
      'audio/x-m4a',
      'audio/ogg',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('text/') || file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Helper to determine asset file_type category
function determineFileType(mimetype: string, filename: string): 'image' | 'audio' | 'video' | 'document' {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'video';
  const ext = path.extname(filename).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return 'image';
  if (['.mp3', '.wav', '.m4a', '.ogg'].includes(ext)) return 'audio';
  if (['.mp4', '.mov', '.webm', '.mkv'].includes(ext)) return 'video';
  return 'document';
}

// ----------------------------------------------------
// 1. AUTH ROUTES
// ----------------------------------------------------
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existing = db.findUserByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await hashPassword(validated.password);
    const user = db.createUser({
      email: validated.email,
      password_hash,
      full_name: validated.full_name,
      role: validated.role || 'Multimodal AI Specialist',
    });

    const token = generateToken(user);
    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message || 'Validation failed' });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = db.findUserByEmail(validated.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const matches = await comparePassword(validated.password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message || 'Validation failed' });
    }
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

app.get('/api/user/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.findUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    },
  });
});

// ----------------------------------------------------
// 2. ASSETS ROUTES
// ----------------------------------------------------
app.post('/api/assets/upload', authMiddleware, upload.array('files', 10), async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload.' });
    }

    const createdAssets: Asset[] = [];

    for (const file of files) {
      const fileType = determineFileType(file.mimetype, file.originalname);
      const fileUrl = `/uploads/${file.filename}`;

      // Run automatic AI categorization, keyword extraction, and sentiment/topic analysis via Gemini
      const analysis = await analyzeUploadedAsset(file.path, file.originalname, file.mimetype, fileType);

      const asset = db.createAsset({
        user_id: req.user!.id,
        file_name: file.originalname,
        file_type: fileType,
        file_url: fileUrl,
        file_size: file.size,
        extracted_summary: analysis.summary,
        metadata: {
          title: analysis.title,
          category: analysis.category,
          summary: analysis.summary,
          key_topics: analysis.key_topics,
          sentiment: analysis.sentiment,
          domain: analysis.domain,
          mime_type: file.mimetype,
          tokens_estimate: Math.ceil(file.size / 512),
        },
      });

      createdAssets.push(asset);
    }

    return res.status(201).json({
      message: `Successfully processed ${createdAssets.length} asset(s).`,
      assets: createdAssets,
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: err.message || 'File upload and processing failed.' });
  }
});

app.get('/api/assets', authMiddleware, (req: AuthRequest, res: Response) => {
  const { file_type, search, domain } = req.query as { file_type?: string; search?: string; domain?: string };
  const assets = db.getAssetsByUserId(req.user!.id, { file_type, search, domain });
  return res.json({ assets });
});

app.get('/api/assets/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const asset = db.getAssetById(req.params.id, req.user!.id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found.' });
  }
  return res.json({ asset });
});

app.delete('/api/assets/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const success = db.deleteAsset(req.params.id, req.user!.id);
  if (!success) {
    return res.status(404).json({ error: 'Asset not found or unauthorized.' });
  }
  return res.json({ message: 'Asset deleted successfully.' });
});

// ----------------------------------------------------
// 3. CHAT SESSIONS & MESSAGES ROUTES
// ----------------------------------------------------
const chatPromptSchema = z.object({
  sessionId: z.string().min(1),
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  assetIds: z.array(z.string()).optional(),
});

app.get('/api/chat/sessions', authMiddleware, (req: AuthRequest, res: Response) => {
  const sessions = db.getSessionsByUserId(req.user!.id);
  return res.json({ sessions });
});

app.post('/api/chat/sessions', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, domain } = req.body;
  const session = db.createSession(
    req.user!.id,
    title || `Workspace Session ${new Date().toLocaleDateString()}`,
    domain
  );
  return res.status(201).json({ session });
});

app.delete('/api/chat/sessions/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const success = db.deleteSession(req.params.id, req.user!.id);
  if (!success) {
    return res.status(404).json({ error: 'Session not found or unauthorized.' });
  }
  return res.json({ message: 'Session deleted successfully.' });
});

app.get('/api/chat/sessions/:id/messages', authMiddleware, (req: AuthRequest, res: Response) => {
  const messages = db.getMessagesBySessionId(req.params.id, req.user!.id);
  return res.json({ messages });
});

app.post('/api/chat/multimodal', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const validated = chatPromptSchema.parse(req.body);
    const userId = req.user!.id;

    // Verify session belongs to user
    let session = db.getSessionById(validated.sessionId, userId);
    if (!session) {
      session = db.createSession(userId, validated.prompt.slice(0, 40) + '...');
    }

    // Resolve attached assets belonging to user
    const assetIds = validated.assetIds || [];
    const attachedAssets: Asset[] = [];
    for (const aId of assetIds) {
      const found = db.getAssetById(aId, userId);
      if (found) attachedAssets.push(found);
    }

    // Record user message
    const userMessage = db.createMessage({
      session_id: session.id,
      sender: 'user',
      content: validated.prompt,
      attached_asset_ids: assetIds,
      tokens_used: Math.ceil(validated.prompt.length / 4),
    });

    // Fetch conversation history for session
    const allMessages = db.getMessagesBySessionId(session.id, userId);
    const history = allMessages
      .filter((m) => m.id !== userMessage.id)
      .slice(-6)
      .map((m) => ({ sender: m.sender, content: m.content }));

    // Execute multimodal query using Gemini 3.8 Flash
    const aiResult = await processMultimodalChat({
      prompt: validated.prompt,
      assets: attachedAssets,
      history,
    });

    // Record AI response message
    const aiMessage = db.createMessage({
      session_id: session.id,
      sender: 'ai',
      content: aiResult.text,
      attached_asset_ids: assetIds,
      tokens_used: aiResult.tokensUsed,
      metadata: {
        citations: aiResult.citations,
        domain: session.domain,
      },
    });

    return res.json({
      userMessage,
      aiMessage,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message || 'Invalid chat parameters' });
    }
    console.error('Multimodal chat error:', err);
    return res.status(500).json({ error: 'Failed to process multimodal query.' });
  }
});

// ----------------------------------------------------
// 4. CROSS-MODAL SEMANTIC SEARCH
// ----------------------------------------------------
app.get('/api/search', authMiddleware, (req: AuthRequest, res: Response) => {
  const query = ((req.query.q as string) || '').toLowerCase().trim();
  const userId = req.user!.id;

  if (!query) {
    return res.json({ assets: [], messages: [] });
  }

  const allAssets = db.getAssetsByUserId(userId);
  const matchedAssets = allAssets.filter((a) => {
    return (
      a.file_name.toLowerCase().includes(query) ||
      a.extracted_summary.toLowerCase().includes(query) ||
      (a.metadata?.key_topics || []).some((t) => t.toLowerCase().includes(query)) ||
      (a.metadata?.category || '').toLowerCase().includes(query)
    );
  });

  const sessions = db.getSessionsByUserId(userId);
  const matchedMessages: any[] = [];
  sessions.forEach((s) => {
    const msgs = db.getMessagesBySessionId(s.id, userId);
    msgs.forEach((m) => {
      if (m.content.toLowerCase().includes(query)) {
        matchedMessages.push({
          ...m,
          session_title: s.title,
        });
      }
    });
  });

  return res.json({
    assets: matchedAssets,
    messages: matchedMessages.slice(0, 10),
  });
});

// ----------------------------------------------------
// 5. DASHBOARD & ANALYTICS
// ----------------------------------------------------
app.get('/api/analytics', authMiddleware, (req: AuthRequest, res: Response) => {
  const analytics = db.getAnalytics(req.user!.id);
  return res.json(analytics);
});

// ----------------------------------------------------
// VITE DEV SERVER / PRODUCTION SERVING
// ----------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OmniMind AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
