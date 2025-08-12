import React, { useEffect } from 'react';

declare global {
  interface Window {
    chatbaseConfig: {
      chatbotId: string;
    };
  }
}

const ChatbaseWidget: React.FC = () => {
  useEffect(() => {
    // Load Chatbase script
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.defer = true;
    document.body.appendChild(script);

    // Configure Chatbase
    window.chatbaseConfig = {
      chatbotId: 'YuEdJoJnuX7Q3aI0Ldrya'
    };

    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default ChatbaseWidget; 