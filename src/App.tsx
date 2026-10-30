/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { FileUploader } from './components/FileUploader';
import { AssetViewerModal } from './components/AssetViewerModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { LibraryPage } from './pages/LibraryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Asset } from './types';

// App Layout Shell
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  // Global keyboard shortcut for Command+K or Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setShowUploadModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar only on protected/app routes */}
        {!isPublicPage && <Sidebar />}

        {/* Dynamic Route Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSelectAsset={(asset) => setSelectedAsset(asset)}
        />
      )}

      {/* Global Upload Drawer Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl">
            <FileUploader
              onClose={() => setShowUploadModal(false)}
              onUploadComplete={() => {
                setShowUploadModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Inspector Modal if opened from search */}
      {selectedAsset && (
        <AssetViewerModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
