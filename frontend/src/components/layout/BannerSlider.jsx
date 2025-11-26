import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { bannerImagesAPI } from '../../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const BannerSlider = () => {
  const location = useLocation();
  const [banners, setBanners] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Only show slider on the store page (home page)
  const shouldShow = location.pathname === '/';

  // Embla Carousel setup with Autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 20 },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerImagesAPI.getAll(true); // Get only active banners
      const sortedBanners = (response.data || []).sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      setBanners(sortedBanners);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Embla Carousel callbacks
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  if (!shouldShow) {
    return null; // Only show on store page
  }

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (banners.length === 0) {
    return null; // Don't show slider if no banners
  }

  return (
    <div 
      className="w-full relative bg-gray-200 group overflow-hidden"
      style={{ height: '400px' }}
      onMouseEnter={() => {
        if (emblaApi) {
          const autoplay = emblaApi.plugins().autoplay;
          if (autoplay) autoplay.stop();
        }
      }}
      onMouseLeave={() => {
        if (emblaApi) {
          const autoplay = emblaApi.plugins().autoplay;
          if (autoplay) autoplay.play();
        }
      }}
    >
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {banners.map((banner, index) => {
            const shouldLoad = Math.abs(index - selectedIndex) <= 1;
            
            return (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                {banner.linkUrl ? (
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full cursor-pointer"
                  >
                    {shouldLoad ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || 'Banner'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/1200x400?text=Banner+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    )}
                  </a>
                ) : (
                  <div className="relative w-full h-full">
                    {shouldLoad ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || 'Banner'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/1200x400?text=Banner+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradient overlay at bottom for better dot visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* Previous Button - Amazon style */}
      {banners.length > 1 && (
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full p-2 shadow-lg hover:shadow-xl"
          aria-label="Previous slide"
          style={{ width: '40px', height: '100px' }}
        >
          <ChevronLeft className="w-6 h-6 text-gray-800 mx-auto" />
        </button>
      )}

      {/* Next Button - Amazon style */}
      {banners.length > 1 && (
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full p-2 shadow-lg hover:shadow-xl"
          aria-label="Next slide"
          style={{ width: '40px', height: '100px' }}
        >
          <ChevronRight className="w-6 h-6 text-gray-800 mx-auto" />
        </button>
      )}

      {/* Dots Navigation - Amazon style */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-white w-8 h-2.5'
                  : 'bg-white/60 hover:bg-white/80 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;

