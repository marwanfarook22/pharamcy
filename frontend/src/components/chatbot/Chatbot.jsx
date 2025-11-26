import { useState, useEffect, useRef } from 'react';
import { medicinesAPI, cartAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useChatbot } from '../../context/ChatbotContext';
import { MessageCircle, X, Send, Bot, User, ShoppingCart } from 'lucide-react';

const Chatbot = () => {
  const { user } = useAuth();
  const { isOpen, setIsOpen, closeChatbot } = useChatbot();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hello! I'm your pharmacy assistant. How can I help you today? What medicine are you looking for?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedMedicines, setSuggestedMedicines] = useState([]);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const searchMedicines = async (query) => {
    try {
      const response = await medicinesAPI.getAll(null, query);
      return response.data.filter(medicine => medicine.totalStock > 0);
    } catch (error) {
      console.error('Error searching medicines:', error);
      return [];
    }
  };

  const addToCart = async (medicineId, quantity = 1) => {
    try {
      await cartAPI.addItem({ medicineId, quantity });
      toast.success('Added to cart successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const simulateTyping = (callback, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setWaitingForResponse(false);

    // Add user message
    const newUserMessage = {
      type: 'user',
      text: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Check if user is responding to a suggestion
    const lowerMessage = userMessage.toLowerCase();
    const isYes = lowerMessage.includes('yes') || lowerMessage === 'y' || lowerMessage === 'yeah' || lowerMessage === 'yep' || lowerMessage === 'sure' || lowerMessage === 'ok' || lowerMessage === 'okay';
    const isNo = lowerMessage.includes('no') || lowerMessage === 'n' || lowerMessage === 'nope' || lowerMessage === 'nah';

    if (waitingForResponse && isYes && currentSuggestions.length > 0) {
      // Add first suggested medicine to cart
      const medicineToAdd = currentSuggestions[0];
      simulateTyping(() => {
        const success = addToCart(medicineToAdd.id, 1);
        if (success) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              text: `Great! I've added "${medicineToAdd.name}" to your cart. Is there anything else you need?`,
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              text: `I encountered an issue adding the item to your cart. Please try again or visit the cart page.`,
              timestamp: new Date(),
            },
          ]);
        }
        setCurrentSuggestions([]);
        setWaitingForResponse(false);
      }, 800);
      return;
    }

    if (waitingForResponse && isNo && currentSuggestions.length > 1) {
      // Suggest next medicine
      const nextSuggestions = currentSuggestions.slice(1);
      setCurrentSuggestions(nextSuggestions);
      simulateTyping(() => {
        if (nextSuggestions.length > 0) {
          const nextMedicine = nextSuggestions[0];
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              text: `No problem! Here's another option:\n\n**${nextMedicine.name}**\n${nextMedicine.description || 'No description available'}\nPrice: $${nextMedicine.unitPrice.toFixed(2)}\n\nWould you like to add this to your cart?`,
              timestamp: new Date(),
            },
          ]);
          setWaitingForResponse(true);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              text: `I've shown you all available options. Would you like to search for something else?`,
              timestamp: new Date(),
            },
          ]);
          setCurrentSuggestions([]);
          setWaitingForResponse(false);
        }
      }, 800);
      return;
    }

    if (waitingForResponse && isNo && currentSuggestions.length <= 1) {
      simulateTyping(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: `No problem! What else can I help you find?`,
            timestamp: new Date(),
          },
        ]);
        setCurrentSuggestions([]);
        setWaitingForResponse(false);
      }, 800);
      return;
    }

    // Search for medicines
    setIsTyping(true);
    const medicines = await searchMedicines(userMessage);

    simulateTyping(() => {
      if (medicines.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: `I couldn't find any medicines matching "${userMessage}". Could you describe what you need in a different way? For example, "stomach pain", "headache", "fever", etc.`,
            timestamp: new Date(),
          },
        ]);
      } else {
        // Show first 3 suggestions
        const suggestions = medicines.slice(0, 3);
        setCurrentSuggestions(suggestions);
        
        let responseText = `Here are some medicines that might help with "${userMessage}":\n\n`;
        
        suggestions.forEach((medicine, index) => {
          responseText += `**${index + 1}. ${medicine.name}**\n`;
          if (medicine.description) {
            responseText += `${medicine.description}\n`;
          }
          responseText += `Price: $${medicine.unitPrice.toFixed(2)}\n\n`;
        });

        responseText += `Would you like to add "${suggestions[0].name}" to your cart?`;

        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: responseText,
            timestamp: new Date(),
          },
        ]);
        setWaitingForResponse(true);
      }
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text) => {
    // Simple markdown-like formatting
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Don't show chatbot if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
          aria-label="Open chatbot"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Pharmacy Assistant</span>
            </div>
            <button
              onClick={() => {
                closeChatbot();
                setWaitingForResponse(false);
                setCurrentSuggestions([]);
              }}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chatbot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {formatMessage(message.text)}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {waitingForResponse && (
              <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                <ShoppingCart className="h-3 w-3" />
                <span>You can reply with "yes" or "no"</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

