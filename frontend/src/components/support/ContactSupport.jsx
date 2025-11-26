import { useState } from 'react';
import { Mail, Phone, MessageCircle, Clock, Send, User, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useChatbot } from '../../context/ChatbotContext';
import { sendSupportEmail } from '../../utils/emailService';

const ContactSupport = () => {
  const { openChatbot } = useChatbot();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    orderNumber: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendSupportEmail(formData);
      
      if (result.success) {
        toast.success('Your support ticket has been submitted successfully! We will get back to you soon.');
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          orderNumber: '',
          description: ''
        });
      } else {
        toast.error(result.message || 'Failed to submit support ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error(error.message || 'Failed to submit support ticket. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            📞 Contact Support
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! If you have any questions, issues, or need assistance with your order, 
            please reach out using one of the following methods.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Email Support */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">📧 Email Support</h3>
            <a 
              href="mailto:marwan222004@gmail.com" 
              className="text-blue-600 hover:text-blue-800 font-medium block text-center mb-2"
            >
              marwan222004@gmail.com
            </a>
            <p className="text-sm text-gray-600 text-center">
              We reply within 24 hours.
            </p>
          </div>

          {/* Phone Support */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">📱 Phone Support</h3>
            <a 
              href="tel:+201234567890" 
              className="text-green-600 hover:text-green-800 font-medium block text-center mb-2"
            >
              +20 123 456 7890
            </a>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Available: 10:00 AM – 10:00 PM</span>
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 mx-auto">
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">💬 Live Chat</h3>
            <p className="text-sm text-gray-600 text-center mb-3">
              Chat with us directly through the website for quick help.
            </p>
            <button 
              onClick={openChatbot}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Start Chat
            </button>
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📝 Submit a Support Ticket</h2>
            <p className="text-gray-600">
              If your issue is related to an order or product, please include the following information:
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Your full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="+20 XXX XXX XXXX"
              />
            </div>

            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Order number (optional)
              </label>
              <input
                type="text"
                id="orderNumber"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter order number if applicable"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Description of your issue <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                placeholder="Please describe your issue in detail..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Support Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            For urgent matters, please call us directly at{' '}
            <a href="tel:+201234567890" className="text-blue-600 hover:text-blue-800 font-medium">
              +20 123 456 7890
            </a>
            {' '}during business hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;

