import React, { useState, useEffect, useRef } from 'react';
import './DashboardPage.css'; // Make sure to create this CSS file
import apiClient from '../../config/axiosConfig'; // Assuming you use axios

// Simple Avatar SVGs (can be replaced with images or more complex components)
const UserAvatar = () => (
  <svg className="avatar user-avatar" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#28a745" />
    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="white" fontSize="40">U</text>
  </svg>
);

const AiAvatar = () => (
  <svg className="avatar ai-avatar" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#007bff" />
    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="white" fontSize="40">AI</text>
  </svg>
);

function DashboardPage() {
  // State for the AI Chat
  const [chatInput, setChatInput] = useState('');
  const [conversation, setConversation] = useState([
    { sender: 'ai', text: 'Hello Admin! How can I assist you today?' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const messagesEndRef = useRef(null); // For auto-scrolling

  const initialConversation = [
    { sender: 'ai', text: 'Hello Admin! How can I assist you today?' }
  ];

  // Function to clear the conversation
  const handleClearConversation = () => {
    setConversation([...initialConversation]); // Reset to initial state
    setAiError(null); // Also clear any errors
  };

  // Function to handle sending message to the backend AI endpoint
  const handleSendMessage = async () => {
    const userMessage = chatInput.trim();
    if (!userMessage) return;

    // Add user message to conversation
    setConversation(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setIsAiLoading(true);
    setAiError(null);

    try {
      // Call the backend endpoint 
      const response = await apiClient.post('ai-admin-chat/', { command: userMessage });
      
      setConversation(prev => [...prev, { sender: 'ai', text: response.data.message || 'Received empty response.' }]);
      
      if (response.data.type === 'error') {
        setAiError(response.data.message);
      }

    } catch (err) {
      console.error("AI Chat Error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to communicate with AI assistant.';
      setConversation(prev => [...prev, { sender: 'ai', text: `Error: ${errorMsg}` }]);
      setAiError(errorMsg); 
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
      handleSendMessage();
    }
  };

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [conversation]); // Scroll whenever conversation changes

  return (
    <div className="admin-dashboard-page">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <p className="dashboard-subtitle">Welcome back, Admin!</p>

      {/* Placeholder for future dashboard cards/widgets */}
      <div className="dashboard-widgets-placeholder">
         {/* Example: <div className="widget-card">Stats</div> */}
      </div>

      {/* --- AI Chat Section --- */}
      <div className="ai-chat-container">
        <div className="ai-chat-widget">
          <div className="ai-chat-header">
            <h2>AI Assistant</h2>
            <button 
              onClick={handleClearConversation} 
              className="clear-chat-button" 
              title="Clear Conversation"
              disabled={conversation.length <= initialConversation.length} // Disable if already cleared
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px">
                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div id="ai-chat-messages" className="ai-chat-messages">
            {conversation.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender}-row`}>
                 {msg.sender === 'ai' ? <AiAvatar /> : null}
                <div className={`message ${msg.sender}-message`}>
                  {/* Removed sender span, rely on alignment/style */}
                  <span className="message-text">{msg.text}</span>
                </div>
                 {msg.sender === 'user' ? <UserAvatar /> : null}
              </div>
            ))}
            {isAiLoading && (
              <div className="message-row ai-row">
                 <AiAvatar />
                <div className="message ai-message loading-message">
                  <span className="message-text"><i>Thinking...</i></span>
                </div>
              </div>
            )}
            {aiError && !isAiLoading && (
               <div className="message-row ai-row error-indicator">
                 <AiAvatar />
                 <div className="message ai-message error-message">
                   <span className="message-text">{aiError}</span>
                 </div>
              </div>
            )}
             {/* Dummy div to ensure scrolling works to the very bottom */}
             <div ref={messagesEndRef} /> 
          </div>
          <div className="ai-chat-input-area">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the AI assistant... (e.g., list locations)"
              rows="1" // Start with 1 row, CSS will handle expansion
              disabled={isAiLoading}
            />
            <button onClick={handleSendMessage} disabled={isAiLoading || !chatInput.trim()} title="Send Message">
              {/* Replace text with an icon, e.g., Send icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* --- End AI Chat Section --- */}
    </div>
  );
}

export default DashboardPage; 