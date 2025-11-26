import emailjs from '@emailjs/browser';

// EmailJS Configuration
// You need to set these values in your .env file or replace them with your actual EmailJS credentials
// To set up EmailJS:
// 1. Sign up at https://www.emailjs.com/
// 2. Create an email service (Gmail, Outlook, etc.)
// 3. Create an email template with variables: {{name}}, {{email}}, {{message}}, {{time}}, {{title}}
// 4. Get your Public Key from Account > API Keys
// 5. Create a .env file in the frontend directory with:
//    VITE_EMAILJS_SERVICE_ID=your_service_id
//    VITE_EMAILJS_TEMPLATE_ID=your_template_id
//    VITE_EMAILJS_PUBLIC_KEY=your_public_key

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Check if EmailJS is configured
const isEmailJSConfigured = () => {
  return EMAILJS_SERVICE_ID !== 'your_service_id' && 
         EMAILJS_TEMPLATE_ID !== 'your_template_id' && 
         EMAILJS_PUBLIC_KEY !== 'your_public_key';
};

// Initialize EmailJS if configured
if (isEmailJSConfigured()) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Send support ticket email using EmailJS
 * @param {Object} formData - Form data containing support request details
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendSupportEmail = async (formData) => {
  // Check if EmailJS is configured
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS is not configured. Please set up your EmailJS credentials in .env file.');
    // For development: still show success but log to console
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    console.log('Support request data (EmailJS not configured):', {
      name: formData.fullName,
      email: formData.email,
      message: formData.message || formData.description,
      time: currentTime,
      title: formData.orderNumber || 'Support Request',
    });
    
    // Return success for development purposes
    // In production, you should configure EmailJS
    return {
      success: true,
      message: 'Support request logged (EmailJS not configured). Please configure EmailJS for production use.',
    };
  }

  try {
    // Get current time in HH:MM format
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    // Prepare template parameters matching EmailJS template structure
    const templateParams = {
      name: formData.fullName,
      email: formData.email,
      message: formData.message || formData.description,
      time: currentTime,
      title: formData.orderNumber || 'Support Request',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return {
      success: true,
      message: 'Support request sent successfully!',
      response,
    };
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw {
      success: false,
      message: error.text || 'Failed to send support request. Please try again.',
      error,
    };
  }
};

