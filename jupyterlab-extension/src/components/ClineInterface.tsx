import React, { useState, useEffect, useRef } from 'react';

import { ClineJupyterLabAdapter } from '../cline-adapter';
import { ClineMessage, ClineTask } from '../core';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ClineInterfaceProps {
  clineCore: ClineJupyterLabAdapter;
  onStateChange?: () => void;
}

export const ClineInterface: React.FC<ClineInterfaceProps> = ({ clineCore, onStateChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Cline connection
    initializeCline();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeCline = async () => {
    try {
      setIsConnected(true);
      addSystemMessage('Cline AI Assistant ready! I can help you with coding tasks in JupyterLab.');
      
      // Load current task if any
      const currentTask = clineCore.getCurrentTask();
      if (currentTask) {
        // Convert ClineMessage to our local Message format
        const convertedMessages = currentTask.messages.map(msg => ({
          id: msg.id,
          type: msg.type as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.timestamp
        }));
        setMessages(convertedMessages);
      }
    } catch (error) {
      console.error('Failed to initialize Cline:', error);
      addSystemMessage('Failed to connect to Cline AI. Please check your configuration.');
    }
  };

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    onStateChange?.();
  };

  const addSystemMessage = (content: string) => {
    addMessage('system', content);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await clineCore.sendMessage(userMessage);
      addMessage('assistant', response.content);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('system', 'Error: Failed to send message to Cline AI.');
      setIsLoading(false);
    }
  };

  const startNewTask = async () => {
    try {
      await clineCore.startNewTask();
      setMessages([]);
      addSystemMessage('Started new task. How can I help you with your JupyterLab work today?');
    } catch (error) {
      console.error('Failed to start new task:', error);
      addSystemMessage('Error: Failed to start new task.');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="cline-interface">
      <div className="cline-header">
        <div className="cline-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <button 
          className="new-task-button"
          onClick={startNewTask}
          disabled={!isConnected}
        >
          New Task
        </button>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.type}`}>
            <div className="message-header">
              <span className="message-sender">
                {message.type === 'user' ? 'You' : 
                 message.type === 'assistant' ? 'Cline' : 'System'}
              </span>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message message-assistant">
            <div className="message-header">
              <span className="message-sender">Cline</span>
              <span className="message-time">...</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Cline for help with your code..."
            className="message-input"
            rows={3}
            disabled={!isConnected || isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!input.trim() || !isConnected || isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};