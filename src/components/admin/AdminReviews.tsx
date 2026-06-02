'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reviewsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/date';
import type { Review } from '@/types';

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modals
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [modalText, setModalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await reviewsApi.getAdminReviews({
        page: currentPage,
        size: 10,
        sort: 'createdAt,desc',
      });
      setReviews(res.data?.items || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách đánh giá', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const handleModalSubmit = async () => {
    if (!selectedReview) return;
    if (!modalText.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập nội dung', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewsApi.replyAsSeller(selectedReview.id, modalText.trim());
      toast({ title: 'Thành công', description: 'Đã phản hồi đánh giá' });
      setIsReplyOpen(false);
      setModalText('');
      fetchReviews();
    } catch {
      toast({ title: 'Lỗi', description: 'Đã xảy ra lỗi', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Đánh giá</h1>
          <p className="text-muted-foreground text-sm">
            {totalElements} đánh giá trong hệ thống
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">Đang tải...</div>
            ) : reviews.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">Không có đánh giá nào.</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* INFO */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{review.userName}</span>
                        <span className="text-muted-foreground text-sm">đã đánh giá</span>
                        <span className="font-medium">{review.productName}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'}`} />
                        ))}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {formatDateTime(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm rounded-lg bg-muted/50 p-3 mb-3 border">
                        {review.content}
                      </p>
                      
                      {review.sellerReply && (
                        <div className="bg-amber-50 rounded-lg p-3 text-sm border border-amber-100 mt-2">
                          <p className="font-semibold text-amber-700 mb-1 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Cửa hàng phản hồi:
                          </p>
                          <p className="text-amber-900">{review.sellerReply}</p>
                        </div>
                      )}
                      
                      {review.rejectionReason && (
                        <div className="bg-red-50 rounded-lg p-3 text-sm border border-red-100 mt-2">
                          <p className="font-semibold text-red-700 mb-1">Lý do từ chối:</p>
                          <p className="text-red-900">{review.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="md:w-48 shrink-0 flex flex-col items-end gap-3 justify-between">
                      <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                        Công khai
                      </Badge>
                      
                      <div className="flex flex-col gap-2 w-full mt-4">
                        {!review.sellerReply && (
                          <Button size="sm" variant="outline" onClick={() => { setSelectedReview(review); setIsReplyOpen(true); }} className="w-full text-amber-600 hover:bg-amber-50 border-amber-200">
                            <MessageSquare className="w-4 h-4 mr-2" /> Trả lời
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage <= 0}>Trước</Button>
          <span className="flex items-center px-4 text-sm font-medium">{currentPage + 1} / {totalPages}</span>
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>Sau</Button>
        </div>
      )}

      {/* Action Modal (Reply) */}
      <Dialog open={isReplyOpen} onOpenChange={(open) => { if (!open) setIsReplyOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
               Cho đánh giá của: <span className="font-semibold text-foreground">{selectedReview?.userName}</span>
            </p>
            <Textarea 
              placeholder="Nhập nội dung phản hồi..."
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyOpen(false)} disabled={isSubmitting}>Hủy</Button>
            <Button 
              onClick={handleModalSubmit} 
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
