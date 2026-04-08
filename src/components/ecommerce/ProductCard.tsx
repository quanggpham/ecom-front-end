'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Star, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';
import { useCartStore, useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { productsApi, reviewsApi } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

// Format price to VND currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}



export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLiked, setIsLiked] = useState(product.liked || false);
  const [isLiking, setIsLiking] = useState(false);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { toast } = useToast();
  const router = useRouter();

  const [ratingStats, setRatingStats] = useState({
    rating: (product.avgRating || 0).toFixed(1),
    count: product.totalReviews || 0
  });

  useEffect(() => {
    // Fetch stats async if they weren't provided in the Product list response
    if (product.avgRating === undefined) {
      const fetchStats = async () => {
        try {
          const res = await reviewsApi.getByProduct(product.id, { size: 1 });
          if (res.data?.stats) {
            setRatingStats({
              rating: res.data.stats.avgRating.toFixed(1),
              count: res.data.stats.totalReviews
            });
          }
        } catch {
          // Silent catch to prevent UI breakage
        }
      };
      fetchStats();
    }
  }, [product.id, product.avgRating]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      toast({
        title: 'Thành công!',
        description: `Đã thêm "${product.name}" vào giỏ hàng`,
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousState = isLiked;
    setIsLiked(!isLiked); // Optimistic UI
    
    try {
      const response = await productsApi.toggleLike(product.id);
      if (response.data && response.data.liked !== undefined) {
        setIsLiked(response.data.liked);
        toast({ 
          title: response.data.liked ? 'Đã thêm vào yêu thích!' : 'Đã bỏ yêu thích', 
          duration: 1500 
        });
      }
    } catch (error) {
      setIsLiked(previousState); // Revert on failure
      toast({ 
        title: 'Lỗi', 
        description: 'Vui lòng thử lại sau',
        variant: 'destructive',
        duration: 1500 
      });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card 
      className="group relative flex flex-col p-0 gap-0 overflow-hidden transition-all duration-500 cursor-pointer border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 bg-white rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50/50">
        {/* Product Image */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
            <span className="text-4xl sm:text-6xl drop-shadow-sm">🍜</span>
          </div>
        )}
        
        {/* Dynamic Gradient Overlay on hover */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 ease-in-out ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          {/* Category Badge */}
          <Badge 
            variant="secondary"
            className="bg-white/90 text-gray-800 backdrop-blur-md font-semibold text-[10px] sm:text-xs shadow-sm border border-white/20 rounded-full px-2.5 py-0.5"
          >
            {product.category?.name || 'Khác'}
          </Badge>
          
          {/* Stock Status */}
          {product.stockQuantity <= 0 ? (
            <Badge variant="destructive" className="text-[10px] sm:text-xs font-semibold rounded-full shadow-sm">
              Hết hàng
            </Badge>
          ) : product.stockQuantity <= 10 ? (
            <Badge variant="outline" className="bg-amber-100/95 backdrop-blur-md text-amber-800 text-[10px] sm:text-xs font-semibold border-amber-200/50 shadow-sm rounded-full">
              Sắp hết ({product.stockQuantity})
            </Badge>
          ) : null}
        </div>

        {/* Action Buttons on hover - Slide up effect */}
        <div 
          className={`absolute bottom-4 left-4 right-4 flex gap-2.5 transition-all duration-500 ease-out z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button 
            size="sm" 
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-[0_8px_16px_rgb(245,158,11,0.3)] hover:shadow-[0_12px_24px_rgb(245,158,11,0.4)] border-0 rounded-xl font-semibold transition-all duration-300 transform active:scale-95"
            onClick={handleAddToCart}
            disabled={isAdding || product.stockQuantity <= 0}
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            {isAdding ? 'Đang thêm' : 'Thêm vào giỏ'}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className={`bg-white/95 backdrop-blur-md border border-white/50 hover:bg-red-50 hover:border-red-100 shadow-sm rounded-xl aspect-square p-0 w-9 transition-all duration-300 ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
            onClick={handleFavoriteClick}
            disabled={isLiking}
          >
            <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 sm:p-5 relative bg-white z-20">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex bg-amber-50 px-1.5 py-0.5 rounded-md items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">{ratingStats.rating}</span>
          </div>
          <span className="text-[11px] font-medium text-gray-400">({ratingStats.count} đánh giá)</span>
        </div>
        
        {/* Product Name */}
        <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 mb-1.5 text-gray-800 group-hover:text-amber-600 transition-colors duration-300">
          {product.name}
        </h3>
        
        {/* Description - subtlely faded */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-3 hidden sm:block font-medium">
          {product.description}
        </p>
        
        {/* Price and Add button (visible on mobile / non-hover) */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Giá bán</span>
            <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`w-9 h-9 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-110 active:scale-95 transition-all duration-300 md:opacity-0 group-hover:opacity-0 ${isHovered ? 'scale-75' : 'scale-100'}`}
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
