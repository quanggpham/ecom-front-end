'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen && isAuthenticated) {
      fetchCart();
    }
  }, [isCartOpen, isAuthenticated, fetchCart]);

  useEffect(() => {
    // Auto select all items when cart loads or changes items significantly
    if (cart?.items) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        cart.items.forEach(item => next.add(item.productId));
        return next;
      });
    }
  }, [cart?.items?.length]);

  const toggleItem = (productId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === (cart?.items?.length || 0)) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart?.items?.map(i => i.productId)));
    }
  };

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
    if (selectedIds.size === 0) {
      toast({ title: 'Chưa chọn sản phẩm', description: 'Vui lòng chọn ít nhất 1 món ăn để thanh toán.', variant: 'destructive' });
      return;
    }
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    
    // Save selected item ids
    localStorage.setItem('checkout_selected_ids', JSON.stringify(Array.from(selectedIds)));
    closeCart();
    router.push('/?view=checkout');
  };

  const itemsCount = cart?.items?.length || 0;
  const selectedItems = cart?.items?.filter(i => selectedIds.has(i.productId)) || [];
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.subTotal, 0);

  return (
    <>
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            <SheetTitle>Giỏ hàng</SheetTitle>
            {itemsCount > 0 && (
              <span className="ml-auto text-sm text-muted-foreground mr-6">
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
            {/* Action Bar */}
            <div className="px-4 py-2 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  checked={cart?.items?.length > 0 && selectedIds.size === cart?.items?.length}
                  onChange={toggleAll}
                  id="selectAll"
                />
                <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer select-none">
                  Chọn tất cả
                </label>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                onClick={() => setShowClearConfirm(true)}
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
                    className={`flex gap-3 p-3 rounded-xl border transition-all duration-200 [-webkit-tap-highlight-color:transparent] ${
                      selectedIds.has(item.productId) ? 'bg-amber-50/50 border-amber-200' : 'bg-muted/30 border-transparent opacity-80'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 accent-amber-500 text-amber-500 focus:ring-0 focus:ring-offset-0 focus:outline-none w-5 h-5 cursor-pointer shadow-none [-webkit-tap-highlight-color:transparent]"
                        checked={selectedIds.has(item.productId)}
                        onChange={() => toggleItem(item.productId)}
                      />
                    </div>

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
                        {updatingId === item.productId ? (
                          <span className="w-10 flex justify-center text-sm"><Loader2 className="w-3 h-3 animate-spin inline" /></span>
                        ) : (
                          <QuantityInput
                            itemQuantity={item.quantity}
                            productId={item.productId}
                            handleUpdateQuantity={handleUpdateQuantity}
                          />
                        )}
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
            <div className="border-t p-4 space-y-4 shadow-[0_-4px_10px_rgb(0,0,0,0.03)] bg-white z-10">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Tổng ({selectedIds.size} món):</span>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {formatPrice(selectedTotal)}
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

    {/* Clear Cart Confirmation Dialog */}
    <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-center">Xóa toàn bộ giỏ hàng?</DialogTitle>
          <DialogDescription className="text-center">
            Bạn có chắc muốn xóa tất cả <span className="font-semibold text-foreground">{itemsCount} món ăn</span> khỏi giỏ hàng? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
            className="flex-1"
          >
            Không, giữ lại
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setShowClearConfirm(false);
              handleClearCart();
            }}
            className="flex-1"
          >
            Xóa tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function QuantityInput({ 
  itemQuantity, 
  productId, 
  handleUpdateQuantity 
}: { 
  itemQuantity: number; 
  productId: number; 
  handleUpdateQuantity: (id: number, qt: number) => void 
}) {
  const [val, setVal] = useState(itemQuantity.toString());
  
  useEffect(() => {
    setVal(itemQuantity.toString());
  }, [itemQuantity]);

  const commitValue = () => {
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1) {
      if (num !== itemQuantity) {
        handleUpdateQuantity(productId, num);
      }
    } else {
      setVal(itemQuantity.toString());
    }
  };

  return (
    <input
      type="number"
      min="1"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commitValue}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className="w-10 text-center text-sm font-medium border-0 focus:ring-0 focus:outline-none bg-transparent p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}
