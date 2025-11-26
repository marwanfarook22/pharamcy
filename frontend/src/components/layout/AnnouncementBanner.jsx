import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const AnnouncementBanner = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Only show banner on the main page (home page)
  const shouldShow = location.pathname === '/';

  // Configuration for the banner
  const bannerConfig = {
    message: 'see our last offers',
    buttonText: 'view now',
    buttonLink: '/50-off', // Can be a route or external URL
    variant: 'orange', // 'purple', 'dark', 'blue', 'green', 'orange'
    showButton: true
  };

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Animation duration
  };

  // Don't show if not on main page or if dismissed
  if (!shouldShow || !isVisible) return null;

  // Variant styles
  const variants = {
    purple: {
      bg: 'bg-gradient-to-r from-purple-600 to-indigo-600',
      text: 'text-white',
      button: 'bg-purple-700 hover:bg-purple-800 text-white',
      close: 'text-white hover:text-gray-200'
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      button: 'bg-gray-800 hover:bg-gray-700 text-white',
      close: 'text-white hover:text-gray-300'
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      text: 'text-white',
      button: 'bg-blue-700 hover:bg-blue-800 text-white',
      close: 'text-white hover:text-gray-200'
    },
    green: {
      bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
      text: 'text-white',
      button: 'bg-green-700 hover:bg-green-800 text-white',
      close: 'text-white hover:text-gray-200'
    },
    orange: {
      bg: 'bg-gradient-to-r from-orange-500 to-red-600',
      text: 'text-white',
      button: 'bg-orange-600 hover:bg-orange-700 text-white',
      close: 'text-white hover:text-gray-200'
    }
  };

  const variant = variants[bannerConfig.variant] || variants.purple;

  // Check if buttonLink is external
  const isExternalLink = bannerConfig.buttonLink?.startsWith('http');

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] ${variant.bg} ${variant.text} transition-all duration-300 ${
        isClosing ? 'opacity-0 -translate-y-full h-0' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Message */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm sm:text-base font-medium">
              {bannerConfig.message}
            </p>
          </div>

          {/* Button and Close */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {bannerConfig.showButton && bannerConfig.buttonText && (
              <>
                {isExternalLink ? (
                  <a
                    href={bannerConfig.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${variant.button} px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 whitespace-nowrap`}
                  >
                    <span>{bannerConfig.buttonText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link
                    to={bannerConfig.buttonLink}
                    className={`${variant.button} px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 whitespace-nowrap`}
                  >
                    <span>{bannerConfig.buttonText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </>
            )}

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className={`${variant.close} p-1 rounded-md hover:bg-white/10 transition-colors`}
              aria-label="Dismiss banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;

