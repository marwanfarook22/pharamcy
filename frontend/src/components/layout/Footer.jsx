import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Contact Us</h3>
            <div className="space-y-3">
              <a 
                href="mailto:info@pharmacystore.com" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>info@pharmacystore.com</span>
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>+1 (234) 567-890</span>
              </a>
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-blue-600 border border-gray-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-blue-600 border border-gray-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-blue-600 border border-gray-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-blue-600 border border-gray-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">PharmaTech</h3>
            <p className="text-gray-600 text-sm">
              Your trusted partner for quality medicines and healthcare products.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} PharmaTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

