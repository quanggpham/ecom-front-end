'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ecommerce/Header';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [status, setStatus] = useState<'LOADING' | 'NOT_FOUND' | 'POLLING' | 'SUCCESS' | 'TIMEOUT'>('LOADING');

  useEffect(() => {
    const pendingId = localStorage.getItem('pending_stripe_order_id');
    if (!pendingId) {
      setStatus('NOT_FOUND');
      return;
    }
    setOrderId(Number(pendingId));
    setStatus('POLLING');
  }, []);

  useEffect(() => {
    if (status !== 'POLLING' || !orderId) return;

    let attempts = 0;
    const maxAttempts = 20; // 60 seconds (20 * 3s)
    
    const interval = setInterval(async () => {
      try {
        attempts++;
        const res = await ordersApi.getById(orderId);
        
        const orderStatus = res.data?.status;
        if (orderStatus === 'CONFIRMED' || orderStatus === 'SHIPPING' || orderStatus === 'COMPLETED') {
          clearInterval(interval);
          setStatus('SUCCESS');
          localStorage.removeItem('pending_stripe_order_id');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatus('TIMEOUT');
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin đơn hàng', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, orderId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center space-y-6">
          {status === 'LOADING' && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          )}

          {status === 'NOT_FOUND' && (
            <>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy đơn hàng chờ</h2>
              <p className="text-slate-600">
                Không có đơn hàng nào đang chờ xác nhận thanh toán trên trình duyệt này.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => router.push('/')}>
                  Về trang chủ
                </Button>
                <Button onClick={() => router.push('/?view=orders')} className="bg-orange-500 hover:bg-orange-600">
                  Xem đơn hàng
                </Button>
              </div>
            </>
          )}

          {status === 'POLLING' && (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin absolute" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Đang xác nhận thanh toán</h2>
              <p className="text-slate-600">
                Hệ thống đang kiểm tra kết quả thanh toán từ Stripe. Quá trình này có thể mất vài giây...
              </p>
            </>
          )}

          {status === 'SUCCESS' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Thanh toán thành công!</h2>
              <p className="text-slate-600">
                Đơn hàng #{orderId} của bạn đã được thanh toán thành công qua Stripe.
              </p>
              <div className="pt-4">
                <Button onClick={() => router.push('/?view=orders')} className="w-full bg-green-600 hover:bg-green-700">
                  Xem đơn hàng
                </Button>
              </div>
            </>
          )}

          {status === 'TIMEOUT' && (
            <>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Đang chờ xử lý</h2>
              <p className="text-slate-600">
                Hệ thống Stripe có thể phản hồi chậm. Đơn hàng #{orderId} sẽ tự động cập nhật khi nhận được thanh toán.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => router.push('/')}>
                  Về trang chủ
                </Button>
                <Button onClick={() => router.push('/?view=orders')} className="bg-amber-600 hover:bg-amber-700">
                  Xem đơn hàng
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
