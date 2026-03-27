'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reviewsApi } from '@/lib/api';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: number;
  productName: string;
  onSuccess: () => void;
}

export function CreateReviewModal({
  isOpen,
  onClose,
  orderItemId,
  productName,
  onSuccess,
}: CreateReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung đánh giá',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewsApi.create({
        orderItemId,
        rating,
        content: content.trim(),
      });
      toast({
        title: 'Thành công',
        description: 'Cảm ơn bạn đã đánh giá!',
      });
      setContent('');
      setRating(5);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="text-center font-medium">{productName}</div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Chất lượng sản phẩm</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-colors cursor-pointer"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm font-medium text-amber-600">
              {rating === 5 && 'Tuyệt vời'}
              {rating === 4 && 'Rất tốt'}
              {rating === 3 && 'Bình thường'}
              {rating === 2 && 'Tệ'}
              {rating === 1 && 'Rất tệ'}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nội dung đánh giá</label>
            <Textarea
              placeholder="Chia sẻ trải nghiệm của bạn về món ăn này nhé..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-amber-500 to-orange-500"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
