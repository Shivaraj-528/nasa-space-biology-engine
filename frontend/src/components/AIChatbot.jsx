import { useState, useRef, useEffect } from 'react';
import apiService from '../services/api.js';

function AIChatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! 👋 I\'m your NASA Space Biology AI assistant. I\'m here to help you explore the fascinating world of space biology research! Feel free to ask me anything - whether it\'s about our datasets, how plants grow in space, astronaut health, or just want to have a friendly chat about science. What\'s on your mind today?' }
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
    
    // Greetings
    if (lowerMessage.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
      return 'Hello! Great to meet you! I\'m your NASA Space Biology AI assistant. I\'m here to help you explore fascinating space biology data and research. What would you like to know about?';
    }
    
    // How are you / personal questions
    if (lowerMessage.match(/\b(how are you|how\'s it going|what\'s up)\b/)) {
      return 'I\'m doing wonderfully, thank you for asking! I\'m excited to help you explore the amazing world of space biology. There\'s so much fascinating research happening - from how plants grow in zero gravity to how astronauts\' bodies adapt to space. What interests you most?';
    }
    
    // Thank you
    if (lowerMessage.match(/\b(thank you|thanks|appreciate)\b/)) {
      return 'You\'re very welcome! I\'m happy to help. Feel free to ask me anything about space biology, NASA research, or if you need help analyzing any data. I\'m here whenever you need assistance!';
    }
    
    // Help requests
    if (lowerMessage.match(/\b(help|what can you do|capabilities)\b/)) {
      return 'I\'d be happy to help! I can assist you with:\n\n• Analyzing NASA space biology datasets\n• Explaining space research experiments\n• Discussing how life adapts to space environments\n• Interpreting biological data and trends\n• Answering questions about astronaut health\n• Exploring plant and microbial studies in space\n\nWhat would you like to explore first?';
    }
    
    // Dataset/data questions
    if (lowerMessage.includes('dataset') || lowerMessage.includes('data')) {
      return 'Excellent question about our data! NASA\'s GeneLab has incredible datasets covering genomics, proteomics, and metabolomics from space missions. We study everything from how plants respond to microgravity to changes in astronaut physiology. What type of biological data interests you most?';
    }
    
    // Plant/biology questions
    if (lowerMessage.includes('plant') || lowerMessage.includes('growth') || lowerMessage.includes('biology')) {
      return 'Space plant biology is absolutely fascinating! In microgravity, plants show remarkable adaptations - their roots grow in different patterns, gene expression changes dramatically, and they develop unique strategies to sense \'up\' and \'down\'. Some plants even become more resistant to stress! Would you like to dive deeper into any specific aspect?';
    }
    
    // Astronaut/human questions
    if (lowerMessage.includes('astronaut') || lowerMessage.includes('human') || lowerMessage.includes('health')) {
      return 'Human adaptation to space is incredible! Astronauts experience fascinating physiological changes - their bones and muscles adapt to weightlessness, their cardiovascular system adjusts, and even their immune system responds differently. We monitor everything to keep them healthy and understand how humans might live in space long-term. What aspect of astronaut health interests you?';
    }
    
    // Analysis questions
    if (lowerMessage.includes('analysis') || lowerMessage.includes('analyze')) {
      return 'I love helping with analysis! I can help you understand statistical trends, identify patterns in biological data, compare Earth vs. space conditions, and interpret experimental results. Whether it\'s gene expression data, physiological measurements, or growth patterns, I\'m here to make sense of it all. What would you like to analyze?';
    }
    
    // Space/NASA questions
    if (lowerMessage.includes('space') || lowerMessage.includes('nasa') || lowerMessage.includes('mission')) {
      return 'Space biology research is at the heart of NASA\'s mission to understand life beyond Earth! We study how organisms adapt, survive, and even thrive in the unique environment of space. This research helps us prepare for long-duration missions to Mars and beyond, while also advancing our understanding of life itself. What aspect of space biology excites you most?';
    }
    
    // Conversational responses
    const responses = [
      'That\'s a great question! While I specialize in space biology, I\'m always happy to chat. Is there anything about NASA\'s biological research or space science that interests you?',
      'I appreciate you sharing that with me! I\'m here to help with space biology topics, but I enjoy our conversation. What would you like to explore about life in space?',
      'Interesting! I\'m most knowledgeable about space biology and NASA research, but I\'m curious - have you ever wondered how living things adapt to the space environment?',
      'Thanks for chatting with me! I love discussing space biology and helping people understand NASA\'s amazing research. Is there anything about space life sciences you\'d like to know more about?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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