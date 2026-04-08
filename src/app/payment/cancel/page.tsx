'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ecommerce/Header';
import { paymentsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function PaymentCancelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const pendingId = localStorage.getItem('pending_stripe_order_id');
    if (pendingId) {
      setOrderId(Number(pendingId));
    }
  }, []);

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setIsRetrying(true);
    try {
      const stripeRes = await paymentsApi.createStripeCheckout(orderId);
      if (stripeRes.data?.checkoutUrl) {
        window.location.href = stripeRes.data.checkoutUrl;
      } else {
        throw new Error('Thử lại thất bại, vui lòng thử lại ở luồng đơn hàng');
      }
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể kết nối với cổng thanh toán Stripe. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
      setIsRetrying(false);
    }
  };

  const handleViewOrders = () => {
    // Clear localStorage because the user abandons the active retry
    localStorage.removeItem('pending_stripe_order_id');
    router.push('/?view=orders');
  };

  const handleGoHome = () => {
    localStorage.removeItem('pending_stripe_order_id');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800">Thanh toán chưa hoàn tất</h2>
          
          <p className="text-slate-600">
            Bạn đã rời khỏi cổng thanh toán Stripe hoặc giao dịch bị huỷ. 
            Đơn hàng {orderId ? `#${orderId}` : ''} của bạn vẫn đang chờ thanh toán.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            {orderId && (
              <Button 
                onClick={handleRetryPayment} 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Thanh toán lại
              </Button>
            )}
            
            <Button variant="outline" onClick={handleViewOrders} className="w-full">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Xem đơn hàng
            </Button>
            
            <Button variant="ghost" onClick={handleGoHome} className="text-muted-foreground mt-2">
              Về trang chủ
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
