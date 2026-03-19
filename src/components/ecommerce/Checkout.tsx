'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CreditCard, 
  Truck, 
  Phone, 
  User, 
  MapPin, 
  MessageSquare,
  Loader2,
  CheckCircle,
  Tag,
  ArrowLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useCartStore } from '@/store';
import { ordersApi, addressApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { PaymentMethod, Address, AddressRequest, CheckoutRequest } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function Checkout({ onBack, onSuccess }: CheckoutProps) {
  const { cart, clearCart } = useCartStore();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressRequest>({
    recipientName: '',
    phone: '',
    addressLine: '',
    district: '',
    city: '',
    isDefault: false,
  });
  
  // Order Form Data
  const [formData, setFormData] = useState({
    note: '',
    paymentMethod: 'COD' as PaymentMethod,
    couponCode: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const response = await addressApi.getAll();
      const fetchedAddresses = response.data || [];
      setAddresses(fetchedAddresses);
      
      // Auto-select Default Address
      if (fetchedAddresses.length > 0) {
        const defaultAddr = fetchedAddresses.find(a => a.isDefault) || fetchedAddresses[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải sổ địa chỉ.', variant: 'destructive' });
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value as PaymentMethod }));
  };

  // --- Address Modal Methods ---
  const handleOpenNewAddressModal = () => {
    setAddressForm({
      recipientName: '', phone: '', addressLine: '', district: '', city: '', isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const response = await addressApi.create(addressForm);
      toast({ title: 'Thành công', description: 'Thêm địa chỉ mới thành công!' });
      setIsAddressModalOpen(false);
      
      const newAddr = response.data;
      if (newAddr) {
        setAddresses(prev => [...prev, newAddr]);
        setSelectedAddressId(newAddr.id);
      } else {
        fetchAddresses();
      }
    } catch (error) {
      toast({ title: 'Lỗi', description: (error as Error).message || 'Lỗi khi lưu địa chỉ.', variant: 'destructive' });
    } finally {
      setIsSavingAddress(false);
    }
  };

  // --- Submit Order ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Giỏ hàng đang trống.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedAddress) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng chọn địa chỉ giao hàng.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: CheckoutRequest = {
        fullName: selectedAddress.recipientName,
        phoneNumber: selectedAddress.phone,
        shippingAddress: selectedAddress.fullAddress,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        code: formData.couponCode || undefined,
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
      
      const response = await ordersApi.checkout(requestData);
      
      setIsSuccess(true);
      if (response.data?.id) {
        setOrderId(response.data.id);
      }
      clearCart();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: (error as Error).message || 'Không thể đặt hàng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    onSuccess();
  };

  if (!isSuccess && (!cart || cart.items.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-20 mt-16 max-w-4xl flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Truck className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Chưa có sản phẩm</h2>
        <p className="text-gray-500 mb-8 max-w-md">Bạn cần thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.</p>
        <Button onClick={onBack} size="lg" className="bg-amber-500 hover:bg-amber-600">
          Quay lại mua sắm
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 mt-16 max-w-xl flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-green-700">Đặt hàng thành công!</h2>
        <p className="text-gray-600 mb-2">
          Cảm ơn bạn đã đặt hàng tại Việt Food.
        </p>
        {orderId && (
          <p className="text-gray-800 font-medium mb-8">
            Mã đơn hàng của bạn là: <span className="text-amber-600">#{orderId}</span>
          </p>
        )}
        <div className="flex gap-4">
          <Button onClick={handleFinish} variant="outline" className="min-w-[140px]">
            Tiếp tục mua sắm
          </Button>
          <Button onClick={() => window.location.href='/?view=orders'} className="bg-amber-500 hover:bg-amber-600 min-w-[140px]">
            Xem đơn hàng
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cart?.totalAmt || 0;
  const shippingFee = 15000;
  const total = subtotal + shippingFee;

  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Thanh Toán</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" /> Địa chỉ nhận hàng
              </h2>
              {addresses.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setIsAddressPickerOpen(true)} className="text-blue-600 p-0 h-auto hover:bg-transparent hover:text-blue-800">
                  Thay đổi
                </Button>
              )}
            </div>

            {isLoadingAddresses ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
            ) : selectedAddress ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-1">
                  {selectedAddress.recipientName} <span className="text-gray-400 font-normal mx-1">|</span> {selectedAddress.phone}
                </div>
                <div className="text-gray-600 text-sm">{selectedAddress.fullAddress}</div>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p className="text-gray-500 mb-3">Bạn chưa có địa chỉ nhận hàng nào</p>
                <Button onClick={handleOpenNewAddressModal} className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ
                </Button>
              </div>
            )}
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" /> Ghi chú đơn hàng
              </h2>
              <Textarea
                name="note"
                placeholder="Ví dụ: Lấy nhiều tương ớt, không lấy hành tây..."
                value={formData.note}
                onChange={handleInputChange}
                className="resize-none border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                rows={3}
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" /> Phương thức thanh toán
              </h2>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="cod"
                  className={`flex items-center justify-between px-4 py-4 border rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === 'COD' 
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm' 
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="COD" id="cod" className="text-amber-500" />
                    <div>
                      <p className="font-medium text-gray-900">Tiền mặt (COD)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Thanh toán khi nhận hàng</p>
                    </div>
                  </div>
                </Label>

                <Label
                  htmlFor="vnpay"
                  className={`flex items-center justify-between px-4 py-4 border rounded-xl cursor-not-allowed opacity-60 bg-gray-50`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="VNPAY" id="vnpay" disabled />
                    <div>
                      <p className="font-medium text-gray-900">VNPAY</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Đang bảo trì</p>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </div>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-border p-6 rounded-2xl sticky top-24">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b">Chi tiết đơn hàng</h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart?.items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-white border overflow-hidden flex-shrink-0">
                    <img 
                      src={item.imageUrl || 'https://via.placeholder.com/80'} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.productName}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      <p className="text-sm font-semibold text-amber-600">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="mb-4" />

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-gray-900">{formatPrice(shippingFee)}</span>
              </div>
            </div>

            <Separator className="mb-4" />

            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
              <span className="font-bold text-2xl text-amber-600">{formatPrice(total)}</span>
            </div>

            <Button 
              type="submit"
              form="checkout-form"
              className="w-full h-12 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg text-white font-bold"
              disabled={isSubmitting || cart?.items.length === 0 || !selectedAddressId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đặt hàng ngay'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Address Picker Dialog */}
      <Dialog open={isAddressPickerOpen} onOpenChange={setIsAddressPickerOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chọn địa chỉ nhận hàng</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {addresses.map((addr) => (
              <div 
                key={addr.id}
                onClick={() => {
                  setSelectedAddressId(addr.id);
                  setIsAddressPickerOpen(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedAddressId === addr.id 
                    ? 'border-amber-500 bg-amber-50/50' 
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      {addr.recipientName} 
                      {addr.isDefault && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Mặc định</span>}
                    </div>
                    <div className="text-gray-500 text-sm mb-1">{addr.phone}</div>
                    <div className="text-gray-700 text-sm">{addr.fullAddress}</div>
                  </div>
                  {selectedAddressId === addr.id && (
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              className="w-full border-dashed"
              onClick={() => {
                setIsAddressPickerOpen(false);
                handleOpenNewAddressModal();
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Address Dialog Form */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm địa chỉ mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAddress} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Tên người nhận</Label>
                <Input
                  id="recipientName"
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, recipientName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressPhone">Số điện thoại</Label>
                <Input
                  id="addressPhone"
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine">Địa chỉ cụ thể</Label>
              <Input
                id="addressLine"
                value={addressForm.addressLine}
                onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input
                  id="district"
                  value={addressForm.district}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, district: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố/Tỉnh</Label>
                <Input
                  id="city"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isDefault" 
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
              />
              <Label htmlFor="isDefault" className="font-normal cursor-pointer">
                Đặt làm địa chỉ mặc định
              </Label>
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddressModalOpen(false)}>Hủy</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={isSavingAddress}>
                {isSavingAddress ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Lưu địa chỉ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
