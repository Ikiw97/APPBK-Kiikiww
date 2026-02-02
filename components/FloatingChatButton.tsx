import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useFeatureSettings } from '@/lib/useFeatureSettings';
import { useAuth } from '@/lib/authContextSupabase';
import CounselingChat from './CounselingChat';

interface FloatingChatButtonProps {
  setCurrentPage?: (page: string) => void;
  currentPage?: string;
}

export default function FloatingChatButton({ setCurrentPage, currentPage }: FloatingChatButtonProps) {
  const { settings, loading } = useFeatureSettings();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Only show for students when feature is enabled
  // Also hide if already on the chat page (avoids obstruction)
  if (loading || !settings) return null;
  if (user?.role !== 'student') return null;
  if (!settings.services?.counseling_chat) return null;
  if (currentPage === 'counseling-chat') return null;

  const handleClick = () => {
    if (setCurrentPage) {
      // If setCurrentPage is provided, navigate to the chat page
      setCurrentPage('counseling-chat');
    } else {
      // Otherwise, toggle the modal
      setIsChatOpen(true);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-bounce-slow"
        title="Chat dengan Guru BK"
        aria-label="Buka Chat Konseling"
      >
        <MessageCircle size={26} className="group-hover:scale-110 transition-transform" />

        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-25"></span>

        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat Konseling
        </span>
      </button>

      {/* Chat Modal (if not using page navigation) */}
      {isChatOpen && !setCurrentPage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Close Button */}
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Chat Component */}
            <CounselingChat />
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
