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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useCartStore, useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/hooks/use-toast';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function CartDrawer() {
  const { cart, isLoading, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isCartOpen, closeCart, openAuthModal } = useUIStore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (isCartOpen && isAuthenticated) {
      fetchCart();
    }
  }, [isCartOpen, isAuthenticated, fetchCart]);

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingId(productId);
    try {
      await updateQuantity(productId, newQuantity);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật số lượng',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItem(productId);
      toast({
        title: 'Đã xóa',
        description: 'Sản phẩm đã được xóa khỏi giỏ hàng',
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa sản phẩm',
        variant: 'destructive',
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: 'Đã xóa',
        description: 'Giỏ hàng đã được xóa',
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa giỏ hàng',
        variant: 'destructive',
      });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    closeCart();
    window.location.href = '/?view=checkout';
  };

  const itemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            <SheetTitle>Giỏ hàng</SheetTitle>
            {itemsCount > 0 && (
              <span className="ml-auto text-sm text-muted-foreground">
                {itemsCount} món
              </span>
            )}
          </div>
          <SheetDescription className="sr-only">
            Xem và quản lý các món ăn trong giỏ hàng
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Đăng nhập để xem giỏ hàng</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn
            </p>
            <Button 
              onClick={() => {
                closeCart();
                openAuthModal('login');
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              Đăng nhập
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : !cart?.items?.length ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Giỏ hàng trống</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Bạn chưa có món ăn nào trong giỏ hàng
            </p>
            <Button 
              variant="outline"
              onClick={closeCart}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <>
            {/* Clear Cart Button */}
            <div className="px-4 py-2 border-b flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleClearCart}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa tất cả
              </Button>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {cart.items.map((item) => (
                  <div 
                    key={item.itemId}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                          <span className="text-2xl">🍜</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-amber-600 font-medium">
                        {formatPrice(item.price)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={updatingId === item.productId || item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">
                          {updatingId === item.productId ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={updatingId === item.productId}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal and Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <p className="text-sm font-semibold">
                        {formatPrice(item.subTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Tổng cộng:</span>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {formatPrice(cart.totalAmt)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                onClick={handleCheckout}
              >
                Thanh toán
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={closeCart}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
