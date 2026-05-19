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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ordersApi, reviewsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Order, ReviewableOrder } from '@/types';
import { CreateReviewModal } from '@/components/ecommerce/CreateReviewModal';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Clock, bgColor: 'border-yellow-200' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle, bgColor: 'border-blue-200' },
  SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700', icon: Truck, bgColor: 'border-purple-200' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle, bgColor: 'border-green-200' },
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
  const [reviewableItems, setReviewableItems] = useState<Set<number>>(new Set());
  const [reviewableOrdersList, setReviewableOrdersList] = useState<ReviewableOrder[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [reviewModalData, setReviewModalData] = useState<{ id: number; name: string } | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const pageSize = 10;

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xử lý' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'SHIPPING', label: 'Đang giao' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' },
    { key: 'REVIEWABLE', label: 'Chờ đánh giá' },
  ];
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (activeTab === 'REVIEWABLE') {
      setOrders([]);
      setTotalPages(1);
      return; 
    }

    setIsLoading(true);
    try {
      const response = await ordersApi.getMyOrders({ 
        page: currentPage, 
        size: pageSize,
        ...(activeTab !== 'ALL' ? { status: activeTab } : {})
      });
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

  const fetchReviewableItems = async () => {
    try {
      const res = await reviewsApi.getReviewableOrders();
      setReviewableOrdersList(res.data || []);
      const items = new Set<number>();
      res.data?.forEach(order => {
        order.items?.forEach(item => items.add(item.orderItemId));
      });
      setReviewableItems(items);
    } catch {
      // ignore silently
    }
  };

  useEffect(() => {
    fetchReviewableItems();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeTab]);

  const handleTabChange = (key: string) => {
    if (key !== activeTab) {
      setActiveTab(key);
      setCurrentPage(1);
    }
  };

  const handleReviewSuccess = () => {
    if (reviewModalData) {
      setReviewableItems(prev => {
        const next = new Set(prev);
        next.delete(reviewModalData.id);
        return next;
      });
      setReviewableOrdersList(prev => prev.map(order => ({
        ...order,
        items: order.items.filter(i => i.orderItemId !== reviewModalData.id)
      })).filter(order => order.items.length > 0));
      setReviewModalData(null);
    }
  };

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

        {/* View Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b mb-6 border-border/50">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`whitespace-nowrap px-4 py-3 font-medium text-sm transition-colors border-b-2 outline-none ${
                  isActive ? 'border-amber-600 text-amber-600' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label} {tab.key === 'REVIEWABLE' && reviewableItems.size > 0 && `(${reviewableItems.size})`}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && activeTab !== 'REVIEWABLE' ? (
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
        ) : activeTab === 'REVIEWABLE' ? (
          /* Unreviewed Products List */
          <div className="space-y-4">
            {reviewableOrdersList.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tuyệt vời!</h3>
                <p className="text-muted-foreground">Bạn đã đánh giá tất cả sản phẩm đã mua.</p>
              </div>
            ) : (
              reviewableOrdersList.flatMap(order => 
                order.items.map(item => (
                  <Card key={item.orderItemId} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                            <Package className="w-6 h-6 text-amber-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div>
                        <div className="font-semibold text-lg">{item.productName}</div>
                        <div className="text-sm text-muted-foreground mt-1">Đơn hàng #{order.orderId} • {formatDate(order.createdAt)}</div>
                        <div className="text-sm text-muted-foreground">Số lượng: {item.quantity}</div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setReviewModalData({ id: item.orderItemId, name: item.productName })}
                      className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-sm w-full sm:w-auto"
                    >
                      Viết đánh giá
                    </Button>
                  </Card>
                ))
              )
            )}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === 'ALL' ? 'Hãy khám phá thực đơn và đặt món ngay!' : 'Không có đơn hàng nào ở trạng thái này.'}
            </p>
            {activeTab === 'ALL' && (
              <Button
                onClick={onBack}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Khám phá thực đơn
              </Button>
            )}
          </div>
        ) : (
          /* Order List */
          <div className="space-y-4">
            {orders.map((order) => {
              const baseStatus = statusConfig[order.status] || statusConfig.PENDING;
              const status = { ...baseStatus };
              if (order.status === 'PENDING') {
                status.label = order.paymentMethod === 'STRIPE' ? 'Chờ thanh toán' : 'Chờ xác nhận';
              } else if (order.status === 'CONFIRMED') {
                status.label = order.paymentMethod === 'STRIPE' ? 'Đã thanh toán' : 'Đã xác nhận';
              }
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
                          {order.orderDetails?.map((item) => {
                            const isCompleted = order.status === 'COMPLETED';
                            const isReviewable = reviewableItems.has(item.id);
                            
                            return (
                              <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b last:border-0 border-border/50">
                                <div>
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span>{item.name}</span>
                                    <span className="text-muted-foreground mr-1"> x{item.quantity}</span>
                                    {isCompleted && (
                                      <Badge variant={isReviewable ? "outline" : "secondary"} className={isReviewable ? "text-amber-600 border-amber-200 bg-amber-50 text-[10px] h-5 px-1.5" : "bg-green-100 text-green-700 hover:bg-green-100 text-[10px] h-5 px-1.5 border-none"}>
                                        {isReviewable ? 'Chưa đánh giá' : 'Đã đánh giá'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                  {isCompleted && isReviewable && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReviewModalData({ id: item.id, name: item.name });
                                      }}
                                    >
                                      Viết đánh giá
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
                            onClick={() => setCancelConfirmId(order.id)}
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
      
      <CreateReviewModal
        isOpen={!!reviewModalData}
        onClose={() => setReviewModalData(null)}
        orderItemId={reviewModalData?.id || 0}
        productName={reviewModalData?.name || ''}
        onSuccess={handleReviewSuccess}
      />

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={!!cancelConfirmId} onOpenChange={(open) => !open && setCancelConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-center">Xác nhận hủy đơn hàng</DialogTitle>
            <DialogDescription className="text-center">
              Bạn có chắc muốn hủy đơn hàng <span className="font-semibold text-foreground">#{cancelConfirmId}</span>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => setCancelConfirmId(null)}
              className="flex-1"
            >
              Không, giữ lại
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (cancelConfirmId) {
                  handleCancelOrder(cancelConfirmId);
                  setCancelConfirmId(null);
                }
              }}
              disabled={cancellingId !== null}
              className="flex-1"
            >
              Hủy đơn hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
