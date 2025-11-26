import { useState } from 'react';
import { Mail, Phone, MessageCircle, Clock, AlertTriangle, ChevronRight, HelpCircle, Package, CreditCard, Truck, User, FileText, ArrowLeftRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { sendSupportEmail } from '../../utils/emailService';

const HelpCenter = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    orderNumber: '',
    message: ''
  });

  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickHelpTopics = [
    {
      id: 1,
      title: 'How to order medicine',
      icon: Package,
      description: 'Learn how to place and manage your orders'
    },
    {
      id: 2,
      title: 'How to track your order',
      icon: Truck,
      description: 'Track your order status and delivery'
    },
    {
      id: 3,
      title: 'Refund & return policy',
      icon: ArrowLeftRight,
      description: 'Understand our return and refund process'
    },
    {
      id: 4,
      title: 'Product expiry questions',
      icon: AlertTriangle,
      description: 'Information about product expiration dates'
    },
    {
      id: 5,
      title: 'Account & login help',
      icon: User,
      description: 'Get help with your account and login issues'
    },
    {
      id: 6,
      title: 'Payment & billing',
      icon: CreditCard,
      description: 'Payment methods and billing information'
    },
    {
      id: 7,
      title: 'Delivery information',
      icon: Truck,
      description: 'Shipping and delivery details'
    },
    {
      id: 8,
      title: 'How to contact supplier support',
      icon: MessageCircle,
      description: 'Connect with supplier support team'
    }
  ];

  const faqs = [
    {
      id: 1,
      question: 'How can I return or exchange a product?',
      answer: 'You can request a return through your account or contact support within 7 days of delivery. Simply go to your orders page, select the item you want to return, and follow the return process. Our support team will assist you with the exchange or refund.'
    },
    {
      id: 2,
      question: 'What if a product is near expiry?',
      answer: 'We guarantee that all medicines have a valid shelf life. If you receive a near-expiry product, contact support immediately for replacement. We ensure all products meet quality standards and have sufficient shelf life remaining.'
    },
    {
      id: 3,
      question: 'How long does shipping take?',
      answer: 'Orders usually arrive within 1–3 days depending on your location. Express delivery options are available for urgent orders. You can track your order in real-time through your account dashboard.'
    },
    {
      id: 4,
      question: 'What payment methods do you accept?',
      answer: 'We accept cash on delivery, credit/debit cards (Visa/Mastercard), and wallet payments if supported. All payment methods are secure and encrypted for your safety.'
    },
    {
      id: 5,
      question: 'Can I cancel my order after placing it?',
      answer: 'Yes, you can cancel your order within 2 hours of placing it, provided it hasn\'t been shipped yet. Go to your orders page and click the cancel button. Refunds will be processed within 3-5 business days.'
    },
    {
      id: 6,
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and going to the "My Orders" section. You\'ll see real-time updates on your order status, from processing to delivery. You\'ll also receive SMS and email notifications.'
    }
  ];

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
    if (!formData.fullName || !formData.email || !formData.message) {
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
      const result = await sendSupportEmail({
        ...formData,
        description: formData.message
      });
      
      if (result.success) {
        toast.success('Your support request has been submitted successfully! We will get back to you soon.');
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          orderNumber: '',
          message: ''
        });
      } else {
        toast.error(result.message || 'Failed to submit support request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error(error.message || 'Failed to submit support request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Find answers to common questions or contact our support team.
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Medical Emergency Notice
              </h3>
              <p className="text-red-800">
                ⚠️ For medical emergencies, please contact your doctor or emergency services immediately. 
                This website does not provide medical advice. Always consult with a healthcare professional for medical concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Support Email</h3>
                <a href="mailto:marwan222004@gmail.com" className="text-blue-600 hover:text-blue-800 text-sm">
                  marwan222004@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Phone Number</h3>
                <a href="tel:+201234567890" className="text-green-600 hover:text-green-800 text-sm">
                  +20 123 456 7890
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">WhatsApp Support</h3>
                <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 text-sm">
                  +20 123 456 7890
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                <span className="text-purple-600 text-sm">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-blue-50 rounded-xl p-6 mb-12">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Working Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">📅 Sunday – Thursday</p>
              <p className="text-gray-600">⏰ 10:00 AM – 10:00 PM</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">📅 Friday & Saturday</p>
              <p className="text-gray-600">⏰ 2:00 PM – 10:00 PM</p>
            </div>
          </div>
        </div>

        {/* Quick Help Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Help Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickHelpTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <div
                  key={topic.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-500 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
                      <Icon className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Form and FAQs Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Support Form */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Support Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+20 XXX XXX XXXX"
                />
              </div>
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter order number if applicable"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message/Issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe your issue or question..."
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
                  <span>Submit Request</span>
                )}
              </button>
            </form>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <HelpCircle className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-5 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

