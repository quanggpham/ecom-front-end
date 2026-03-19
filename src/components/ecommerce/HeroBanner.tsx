'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Star, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    title: 'Phở Bò Hà Nội',
    subtitle: 'Hương vị truyền thống',
    description: 'Phở bò truyền thống với nước dùng đậm đà, thịt bò tươi ngon và rau thơm đặc trưng',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1200&h=600&fit=crop',
    color: 'from-amber-500/80',
    badge: 'Best Seller',
    Icon: Flame,
    iconColor: 'text-amber-400',
  },
  {
    id: 2,
    title: 'Bánh Mì Việt Nam',
    subtitle: 'Street Food Quốc Dân',
    description: 'Bánh mì giòn rụm với nhân thịt nướng, pa-tê, đồ chua và rau thơm tươi mát',
    image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=1200&h=600&fit=crop',
    color: 'from-orange-500/80',
    badge: 'Được yêu thích',
    Icon: Star,
    iconColor: 'text-amber-300',
  },
  {
    id: 3,
    title: 'Bún Chả Hà Nội',
    subtitle: 'Đặc sản Thủ đô',
    description: 'Bún chả thơm lừng với thịt nướng than hoa, nước chấm chua ngọt đậm đà',
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=1200&h=600&fit=crop',
    color: 'from-red-500/80',
    badge: 'Giảm 20%',
    Icon: Tag,
    iconColor: 'text-red-300',
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-in-out',
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          )}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          
          {/* Gradient Overlay */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-r via-black/40 to-transparent',
            slide.color
          )} />
          
          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="max-w-xl text-white space-y-4 md:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                <slide.Icon className={cn("w-4 h-4", slide.iconColor)} />
                {slide.badge}
              </div>
              
              {/* Title */}
              <div>
                <p className="text-sm md:text-base font-medium text-white/90 mb-1">
                  {slide.subtitle}
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {slide.title}
                </h2>
              </div>
              
              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-md hidden sm:block">
                {slide.description}
              </p>
              
              {/* CTA Button */}
              <div className="flex gap-3">
                <Button 
                  size="lg"
                  className="bg-white text-amber-600 hover:bg-white/90 font-semibold px-8"
                  onClick={() => {
                    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Đặt ngay
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-amber-600 hover:bg-white/90"
                >
                  Xem thêm
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
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
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
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
    </section>
  );
}
