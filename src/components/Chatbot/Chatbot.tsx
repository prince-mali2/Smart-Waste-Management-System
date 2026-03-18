import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatbotButton } from './ChatbotButton';
import { ChatWindow } from './ChatWindow';

export const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for citizens
  if (!user || user.role !== 'citizen') {
    return null;
  }

  return (
    <>
      <ChatbotButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
