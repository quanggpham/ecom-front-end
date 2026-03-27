'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { productsApi, reviewsApi, profileApi } from '@/lib/api';
import { useCartStore, useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { Header, Footer, CartDrawer, AuthModal, ChatBot, CreateReviewModal } from '@/components/ecommerce';
import type { Product, ReviewResponse, User } from '@/types';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewResponse | null>(null);
  const [reviewableItems, setReviewableItems] = useState<Set<number>>(new Set());
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const { addToCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { openAuthModal, openCart } = useUIStore();
  const { toast } = useToast();

  const fetchReviews = () => {
    if (!id) return;
    reviewsApi.getByProduct(id).then(res => setReviewsData(res.data)).catch(() => {});
  };

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    productsApi.getById(id).then((res) => {
      setProduct(res.data);
    }).catch(() => {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy sản phẩm',
        variant: 'destructive',
      });
    }).finally(() => setIsLoading(false));

    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      profileApi.getProfile().then(res => setUserProfile(res.data)).catch(() => {});
      
      reviewsApi.getReviewableOrders().then(res => {
        const items = new Set<number>();
        res.data?.forEach(order => {
          order.items?.forEach(item => {
            if (item.productId === id) items.add(item.orderItemId);
          });
        });
        setReviewableItems(items);
      }).catch(() => {});
    }
  }, [isAuthenticated, id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!product) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      toast({
        title: 'Thành công!',
        description: `Đã thêm ${quantity}x "${product.name}" vào giỏ hàng`,
      });
      openCart();
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm vào giỏ hàng',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Đã sao chép liên kết!', duration: 1500 });
    } catch {
      toast({ title: 'Đã sao chép!', duration: 1500 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="w-32 h-8 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="w-3/4 h-8" />
              <Skeleton className="w-1/2 h-6" />
              <Skeleton className="w-1/3 h-10" />
              <Skeleton className="w-full h-20" />
              <Skeleton className="w-full h-12" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Utensils className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-muted-foreground mb-4">Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-amber-500 to-orange-500">
              Về trang chủ
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const rating = reviewsData?.stats?.avgRating?.toFixed(1) || '0.0';
  const count = reviewsData?.stats?.totalReviews || 0;
  const ratingNum = reviewsData?.stats?.avgRating || 0;
  const userReview = reviewsData?.reviews.items.find(r => r.userId === userProfile?.id);
  const reviewableItemIds = Array.from(reviewableItems);
  const hasReviewable = reviewableItemIds.length > 0;
  const inStock = product.stockQuantity > 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 max-w-6xl py-4">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <button onClick={() => router.push('/')} className="hover:text-amber-600 transition-colors cursor-pointer">
              Trang chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="hover:text-amber-600 transition-colors cursor-pointer">
              {product.category?.name || 'Sản phẩm'}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Product Detail */}
        <section className="container mx-auto px-4 max-w-6xl pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                    <Utensils className="w-24 h-24 text-amber-300" />
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-sm text-amber-700 border-0 px-3 py-1 text-sm shadow-sm">
                    {product.category?.name || 'Khác'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm cursor-pointer ${
                      isFavorited ? 'text-red-500' : ''
                    }`}
                    onClick={() => {
                      setIsFavorited(!isFavorited);
                      toast({ title: isFavorited ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích!', duration: 1500 });
                    }}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm cursor-pointer"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Out of stock overlay */}
                {!inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-6 py-2">Hết hàng</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-3">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(ratingNum)
                            ? 'fill-amber-400 text-amber-400'
                            : i < ratingNum
                            ? 'fill-amber-200 text-amber-400'
                            : 'fill-muted text-muted-foreground/30'
                        }`}
                      />
                    ))}
                    <span className="ml-1 font-semibold text-amber-600">{rating}</span>
                    <span className="text-muted-foreground text-sm">({count} đánh giá)</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </span>
              </div>

              <Separator />

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Tình trạng:</span>
                {inStock ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Còn {product.stockQuantity} phần
                  </Badge>
                ) : (
                  <Badge variant="destructive">Hết hàng</Badge>
                )}
              </div>

              {/* Quantity Selector */}
              {inStock && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">Số lượng:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 h-10 flex items-center justify-center font-semibold border-x text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity || 99, quantity + 1))}
                        disabled={quantity >= (product.stockQuantity || 99)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Tổng: <span className="font-bold text-amber-600 text-lg">{formatPrice(product.price * quantity)}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <div className="flex gap-3 pt-2">
                <Button
                  size="lg"
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg text-base cursor-pointer"
                  onClick={handleAddToCart}
                  disabled={isAdding || !inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </Button>
              </div>

              <Separator />

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Giao hàng nhanh</p>
                    <p className="text-xs text-muted-foreground">Trong vòng 30 phút</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Đảm bảo chất lượng</p>
                    <p className="text-xs text-muted-foreground">Hoàn tiền 100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Description / Reviews */}
          <div className="mt-12">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'description'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Mô tả sản phẩm
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Đánh giá ({count})
              </button>
            </div>

            <div className="py-6">
              {activeTab === 'description' ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Reviews CTA */}
                  {isAuthenticated && userReview ? (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex-1">
                        <p className="font-semibold text-amber-800">Đánh giá của bạn:</p>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < userReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{userReview.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                      <div>
                        <p className="font-medium">Bạn đã thưởng thức món này?</p>
                        <p className="text-sm text-muted-foreground">Hãy chia sẻ cảm nhận với mọi người nhé.</p>
                      </div>
                      <Button onClick={() => {
                        if (!isAuthenticated) openAuthModal('login');
                        else setIsReviewModalOpen(true);
                       }}>
                        Viết đánh giá của bạn
                      </Button>
                    </div>
                  )}

                  {/* Rating Summary */}
                  <div className="flex items-center gap-6 p-6 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-amber-600">{rating}</div>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(ratingNum) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{count} đánh giá</p>
                    </div>
                    <Separator orientation="vertical" className="h-16" />
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const dist = reviewsData?.stats?.ratingDistribution as Record<string, number> || {};
                        const starCount = dist[String(stars)] || 0;
                        const pct = count > 0 ? (starCount / count) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-2 text-sm">
                            <span className="w-3 text-right">{stars}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-xs text-muted-foreground">{Math.round(pct)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {!reviewsData?.reviews.items || reviewsData.reviews.items.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
                    ) : (
                      reviewsData.reviews.items.map((review) => (
                        <div key={review.id} className="p-4 border rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center font-semibold text-amber-700 flex-shrink-0 uppercase">
                              {review.userName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{review.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <div className="flex gap-0.5 mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'}`} />
                                ))}
                              </div>
                              <p className="text-sm text-foreground mt-2 leading-relaxed">{review.content}</p>
                              {review.sellerReply && (
                                <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                                  <p className="font-semibold text-amber-700 mb-1">Phản hồi từ quán:</p>
                                  <p className="text-muted-foreground">{review.sellerReply}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Global Modals */}
      <CartDrawer />
      <AuthModal />
      <ChatBot />

      <CreateReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderItemId={hasReviewable ? reviewableItemIds[0] : 0}
        productName={product.name}
        onSuccess={() => {
          fetchReviews();
          if (hasReviewable) {
            setReviewableItems(prev => {
              const next = new Set(prev);
              next.delete(reviewableItemIds[0]);
              return next;
            });
          }
        }}
      />
    </div>
  );
}
