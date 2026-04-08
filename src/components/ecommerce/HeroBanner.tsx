'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Star, Tag, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { bannersApi } from '@/lib/api';
import type { Banner, BadgeIcon } from '@/types';

// Map badgeIcon string → Lucide component
const BADGE_ICON_MAP: Record<BadgeIcon, React.ElementType | null> = {
  FLAME: Flame,
  STAR: Star,
  TAG: Tag,
  GIFT: Gift,
  NONE: null,
};

// Fallback overlay colors khi backend chưa có dữ liệu
const FALLBACK_COLORS = [
  'from-amber-500/80',
  'from-orange-500/80',
  'from-red-500/80',
];

// ─── Loading Skeleton ───────────────────────────────────────────────────────
function HeroBannerSkeleton() {
  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden bg-gray-200 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-300/80 via-gray-200/40 to-transparent" />
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-xl space-y-4 md:space-y-6">
          {/* Badge skeleton */}
          <div className="inline-block w-28 h-7 bg-gray-300 rounded-full" />
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-300 rounded" />
            <div className="w-72 h-12 bg-gray-300 rounded" />
          </div>
          {/* Description skeleton */}
          <div className="hidden sm:block space-y-2">
            <div className="w-80 h-4 bg-gray-300 rounded" />
            <div className="w-64 h-4 bg-gray-300 rounded" />
          </div>
          {/* Button skeleton */}
          <div className="flex gap-3">
            <div className="w-32 h-11 bg-gray-300 rounded" />
            <div className="w-28 h-11 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await bannersApi.getActive();
        if (!cancelled && res.data?.length) {
          setBanners(res.data);
        }
      } catch {
        // Nếu API lỗi, banners giữ nguyên [] → section ẩn
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Auto-advance slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (isLoading) return <HeroBannerSkeleton />;
  if (!banners.length) return null;

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % banners.length);

  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden">
      {/* Slides */}
      {banners.map((banner, index) => {
        const IconComponent = BADGE_ICON_MAP[banner.badgeIcon ?? 'NONE'];
        const overlayColor = banner.overlayColor ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

        return (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-in-out',
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
            />

            {/* Gradient Overlay */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-r via-black/40 to-transparent',
                overlayColor
              )}
            />

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 flex items-center">
              <div className="max-w-xl text-white space-y-4 md:space-y-6">
                {/* Badge */}
                {(banner.badgeText || IconComponent) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 text-amber-300" />
                    )}
                    {banner.badgeText}
                  </div>
                )}

                {/* Title */}
                <div>
                  {banner.subtitle && (
                    <p className="text-sm md:text-base font-medium text-white/90 mb-1">
                      {banner.subtitle}
                    </p>
                  )}
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    {banner.title}
                  </h2>
                </div>

                {/* Description */}
                {banner.description && (
                  <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-md hidden sm:block">
                    {banner.description}
                  </p>
                )}

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-amber-600 hover:bg-white/90 font-semibold px-8"
                    onClick={() => {
                      if (banner.linkUrl) {
                        window.location.href = banner.linkUrl;
                      } else {
                        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Đặt ngay
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-amber-600 hover:bg-white/90"
                    onClick={() =>
                      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    Xem thêm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows — only show when >1 slide */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  'w-2 h-2 md:w-3 md:h-3 rounded-full transition-all',
                  index === currentSlide
                    ? 'bg-white w-6 md:w-8'
                    : 'bg-white/50 hover:bg-white/70'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
