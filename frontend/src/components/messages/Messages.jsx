import { useState, useEffect } from 'react';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Mail, 
  MailOpen, 
  Filter,
  Eye,
  X,
  RefreshCw,
  MessageSquare,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchMessages();
    }
  }, [user, filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === 'unread';
      const response = await messagesAPI.getMyMessages(unreadOnly);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId, isRead) => {
    try {
      await messagesAPI.markAsRead(messageId, isRead);
      toast.success(isRead ? 'Message marked as read' : 'Message marked as unread');
      fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, isRead, readAt: isRead ? new Date() : null });
      }
    } catch (error) {
      toast.error('Failed to update message status');
      console.error(error);
    }
  };

  const openMessageDetails = async (message) => {
    setSelectedMessage(message);
    setShowDetailsModal(true);
    
    // Mark as read when opening
    if (!message.isRead) {
      await handleMarkAsRead(message.id, true);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedMessage(null);
  };

  const getUnreadCount = () => {
    return messages.filter(m => !m.isRead).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          Messages
        </h1>
        <p className="text-gray-600">View and manage messages from administrators</p>
      </div>

      {/* Filter and Stats */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {getUnreadCount()} Unread
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
              <MailOpen className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {messages.length} Total
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
            <button
              onClick={fetchMessages}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages</h3>
          <p className="text-gray-600">
            {filter === 'unread' 
              ? "You don't have any unread messages" 
              : filter === 'read'
              ? "You don't have any read messages"
              : "You don't have any messages yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                !message.isRead ? 'border-l-4 border-blue-600' : ''
              }`}
              onClick={() => openMessageDetails(message)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {message.subject}
                    </h3>
                    {!message.isRead && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {message.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {message.adminName && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>From: {message.adminName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {!message.isRead ? (
                    <Mail className="w-6 h-6 text-blue-600" />
                  ) : (
                    <MailOpen className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Details Modal */}
      {showDetailsModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.subject}</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 space-y-2">
                {selectedMessage.adminName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-5 h-5" />
                    <span className="font-medium">From: {selectedMessage.adminName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {format(new Date(selectedMessage.createdAt), 'MMMM dd, yyyy HH:mm')}
                  </span>
                </div>
                {selectedMessage.readAt && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MailOpen className="w-4 h-4" />
                    <span>
                      Read on {format(new Date(selectedMessage.readAt), 'MMMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.content}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => handleMarkAsRead(selectedMessage.id, !selectedMessage.isRead)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedMessage.isRead
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedMessage.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </button>
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;

