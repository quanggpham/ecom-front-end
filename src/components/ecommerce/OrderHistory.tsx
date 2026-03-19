'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Clock, bgColor: 'border-yellow-200' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle, bgColor: 'border-blue-200' },
  SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700', icon: Truck, bgColor: 'border-purple-200' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle, bgColor: 'border-green-200' },
  DELIVERED: { label: 'Đã giao', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, bgColor: 'border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle, bgColor: 'border-red-200' },
};

interface OrderHistoryProps {
  onBack: () => void;
}

export function OrderHistory({ onBack }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const pageSize = 10;
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getMyOrders({ page: currentPage, size: pageSize });
      setOrders(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalElements(response.data?.totalElements || 0);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đơn hàng',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handleCancelOrder = async (orderId: number) => {
    setCancellingId(orderId);
    try {
      await ordersApi.cancel(orderId);
      toast({
        title: 'Thành công',
        description: 'Đơn hàng đã được hủy',
      });
      fetchOrders();
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy đơn hàng',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <section className="py-8 sm:py-12 bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? '...' : `${totalElements} đơn hàng`}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="w-24 h-5" />
                    <Skeleton className="w-20 h-5" />
                  </div>
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-1/2 h-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground mb-4">
              Hãy khám phá thực đơn và đặt món ngay!
            </p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Khám phá thực đơn
            </Button>
          </div>
        ) : (
          /* Order List */
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <Card key={order.id} className={`overflow-hidden border-l-4 ${status.bgColor} transition-all`}>
                  <CardContent className="p-0">
                    {/* Order Header - clickable */}
                    <button
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-bold text-sm">#{order.id}</span>
                          <Badge className={`${status.color} text-xs`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          {order.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="text-sm text-muted-foreground">
                            {order.orderDetails?.length || 0} món
                          </span>
                          <span className="font-semibold text-amber-600">
                            {formatCurrency(order.totalMoney || 0)}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t">
                        {/* Shipping Info */}
                        <div className="pt-3 space-y-1 text-sm">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-24 flex-shrink-0">Người nhận:</span>
                            <span className="font-medium">{order.fullName}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-24 flex-shrink-0">SĐT:</span>
                            <span>{order.phoneNumber}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-24 flex-shrink-0">Địa chỉ:</span>
                            <span>{order.shippingAddress}</span>
                          </div>
                          {order.note && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-24 flex-shrink-0">Ghi chú:</span>
                              <span>{order.note}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-24 flex-shrink-0">Thanh toán:</span>
                            <span>{order.paymentMethod}</span>
                          </div>
                        </div>

                        <Separator />

                        {/* Items */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Chi tiết đơn hàng</h4>
                          {order.orderDetails?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <div>
                                <span>{item.name}</span>
                                <span className="text-muted-foreground"> x{item.quantity}</span>
                              </div>
                              <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        {/* Totals */}
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tạm tính</span>
                            <span>{formatCurrency(order.subTotal || 0)}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Giảm giá</span>
                              <span>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-base pt-1 border-t">
                            <span>Tổng cộng</span>
                            <span className="text-amber-600">{formatCurrency(order.totalMoney || 0)}</span>
                          </div>
                        </div>

                        {/* Cancel Button */}
                        {order.status === 'PENDING' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            disabled={cancellingId === order.id}
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  Trước
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
