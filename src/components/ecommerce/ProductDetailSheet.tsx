'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Star, 
  Clock, 
  Flame, 
  Heart,
  Share2
} from 'lucide-react';
import type { Product } from '@/types';
import { useCartStore, useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/hooks/use-toast';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

// Generate consistent rating based on product id
function getProductRating(id: number): { rating: string; count: number; time: number; calories: number } {
  return {
    rating: (3.5 + (id % 15) / 10).toFixed(1),
    count: 50 + (id * 7) % 200,
    time: 10 + (id * 3) % 20,
    calories: 200 + (id * 47) % 300,
  };
}

export function ProductDetailSheet() {
  const { isProductDetailOpen, selectedProduct, closeProductDetail, openCart, openAuthModal } = useUIStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const { rating, count, time, calories } = getProductRating(product.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      toast({
        title: 'Thành công!',
        description: `Đã thêm ${quantity}x "${product.name}" vào giỏ hàng`,
      });
      setQuantity(1);
      closeProductDetail();
      openCart();
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

  const incrementQuantity = () => {
    if (quantity < (product.stockQuantity || 99)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Sheet open={isProductDetailOpen} onOpenChange={(open) => !open && closeProductDetail()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-0 p-0">
          <SheetTitle className="sr-only">{product.name}</SheetTitle>
          <SheetDescription className="sr-only">{product.description}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                <span className="text-8xl">🍜</span>
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/90 backdrop-blur-sm text-amber-700 border-0">
                {product.category?.name || 'Khác'}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <Button 
                size="icon" 
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={() => toast({ title: 'Đã thêm vào yêu thích!', duration: 1500 })}
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={() => toast({ title: 'Đã sao chép liên kết!', duration: 1500 })}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Title and Rating */}
            <div>
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{rating}</span>
                  <span className="text-muted-foreground">({count} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {time} phút
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Flame className="w-4 h-4" />
                  {calories} calo
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Mô tả</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tình trạng:</span>
              {product.stockQuantity > 0 ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Còn {product.stockQuantity} phần
                </Badge>
              ) : (
                <Badge variant="destructive">Hết hàng</Badge>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stockQuantity > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Số lượng:</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-8 w-8"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= (product.stockQuantity || 99)}
                    className="h-8 w-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between py-2 bg-muted/50 rounded-lg px-4">
              <span className="font-medium">Tổng cộng:</span>
              <span className="text-xl font-bold text-amber-600">
                {formatPrice(product.price * quantity)}
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
              onClick={handleAddToCart}
              disabled={isAdding || product.stockQuantity <= 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
