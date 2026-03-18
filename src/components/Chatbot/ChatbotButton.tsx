import React from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({ isOpen, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50",
        isOpen 
          ? "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rotate-90" 
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      )}
    >
      {isOpen ? (
        <MessageSquare className="h-6 w-6" />
      ) : (
        <div className="relative">
          <Bot className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
        </div>
      )}
    </motion.button>
  );
};
