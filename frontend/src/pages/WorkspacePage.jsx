import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UploadBox from '../components/UploadBox';
import DocumentList from '../components/DocumentList';
import ChatWindow from '../components/ChatWindow';
import SettingsModal from '../components/SettingsModal';
import {
  getDocuments,
  deleteDocument,
  askQuestion,
  getChatHistory,
  clearChatHistory,
  getHealth
} from '../api/client';

export default function WorkspacePage() {
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load initial documents & system health
  const fetchData = async () => {
    try {
      const [docsData, healthData] = await Promise.all([
        getDocuments(),
        getHealth().catch(() => null)
      ]);
      setDocuments(docsData);
      setHealth(healthData);

      // Auto-select first doc if none selected
      if (!activeDoc && docsData && docsData.length > 0) {
        setActiveDoc(docsData[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  // Load chat history when active document changes
  const fetchHistory = async () => {
    try {
      const history = await getChatHistory(activeDoc?.id || null);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [activeDoc]);

  const handleUploadSuccess = (newDoc) => {
    fetchData();
    setActiveDoc(newDoc);
  };

  const handleDeleteDocument = async (id) => {
    try {
      await deleteDocument(id);
      if (activeDoc?.id === id) {
        setActiveDoc(null);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleSendMessage = async (questionText) => {
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      message: questionText,
      sources: []
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const response = await askQuestion(questionText, activeDoc?.id || null);
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        message: response.answer,
        sources: response.sources
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to ask question:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        message: `An error occurred: ${err.response?.data?.detail || err.message || 'Unable to generate response.'}`,
        sources: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory(activeDoc?.id || null);
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navigation */}
      <Navbar
        activeDoc={activeDoc}
        health={health}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Document Library & Uploader */}
        <aside className="w-80 md:w-96 border-r border-slate-800 bg-slate-900/70 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Upload Notes / PDF
            </h2>
            <UploadBox onUploadSuccess={handleUploadSuccess} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Document Library ({documents.length})
              </h3>
            </div>
            <DocumentList
              documents={documents}
              activeDoc={activeDoc}
              onSelectDoc={(doc) => setActiveDoc(doc)}
              onDeleteDoc={handleDeleteDocument}
            />
          </div>
        </aside>

        {/* Right Main Panel: Chat & Citations */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/30">
          <ChatWindow
            messages={messages}
            activeDoc={activeDoc}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
          />
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdated={fetchData}
        currentStatus={health}
      />
    </div>
  );
}
