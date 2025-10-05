import { useState, useRef, useEffect } from 'react';
import apiService from '../services/api.js';

function AIChatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your NASA Space Biology AI assistant. Ask me about space biology data, experiments, or analysis!' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Try to send to backend chatbot
      const response = await apiService.sendChatMessage(userMessage, sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
    } catch (error) {
      // Fallback AI responses for demo
      const aiResponse = generateFallbackResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    }
    setLoading(false);
  };

  const generateFallbackResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('dataset') || lowerMessage.includes('data')) {
      return 'I can help you analyze NASA space biology datasets! We have data from GeneLab including studies on plant growth in microgravity, astronaut health monitoring, and cellular responses to space radiation. What specific type of data are you interested in?';
    }
    
    if (lowerMessage.includes('plant') || lowerMessage.includes('growth')) {
      return 'Space plant studies show fascinating adaptations! Plants in microgravity exhibit altered gene expression, modified root growth patterns, and changes in cell wall composition. Would you like me to analyze specific plant experiment data?';
    }
    
    if (lowerMessage.includes('astronaut') || lowerMessage.includes('human')) {
      return 'Astronaut health data reveals important insights about human adaptation to space. Key areas include bone density changes, muscle atrophy, cardiovascular deconditioning, and immune system modifications. I can help analyze health trends and risk factors.';
    }
    
    if (lowerMessage.includes('analysis') || lowerMessage.includes('analyze')) {
      return 'I can perform various analyses: statistical analysis of experimental data, gene expression pattern recognition, health risk prediction models, and comparative studies between Earth and space conditions. What would you like me to analyze?';
    }
    
    return 'That\'s an interesting question about space biology! I can help with data analysis, experiment interpretation, and insights from NASA\'s biological research. Could you be more specific about what you\'d like to explore?';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="chatbot-modal">
        <div className="chatbot-header">
          <h2>🤖 NASA Space Biology AI Assistant</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chatbot-input">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about space biology data, experiments, or analysis..."
            rows="2"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !inputMessage.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChatbot;