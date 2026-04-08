'use client';

import { useState, useEffect } from 'react';
import { Star, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { promotionBannersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { PromotionBanner } from '@/types';

// Fallback bg colors when backend không trả về
const FALLBACK_BG = [
  'bg-white/15',
  'bg-white/10',
  'bg-white/20',
];

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function PromotionsSkeleton() {
  return (
    <section className="py-12 bg-gradient-to-r from-amber-500 to-orange-500">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="h-9 w-56 bg-white/20 rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-5 w-80 bg-white/15 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl bg-white/15 border border-white/20 space-y-3 animate-pulse">
              <div className="h-5 w-3/4 bg-white/20 rounded" />
              <div className="h-8 w-1/2 bg-white/20 rounded" />
              <div className="h-4 w-1/3 bg-white/15 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Single Promo Card ───────────────────────────────────────────────────────
function PromoCard({ banner, index }: { banner: PromotionBanner; index: number }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (banner.couponCode) {
      try {
        await navigator.clipboard.writeText(banner.couponCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: 'Đã sao chép mã!',
          description: `Mã giảm giá "${banner.couponCode}" đã được sao chép.`,
        });
      } catch {
        toast({ title: 'Không thể sao chép', variant: 'destructive' });
      }
    }
  };

  const bgClass = banner.bgColor ?? FALLBACK_BG[index % FALLBACK_BG.length];
  const isClickable = !!banner.linkUrl || !!banner.couponCode;

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        'p-6 rounded-xl border border-white/20 text-white transition-all duration-300',
        bgClass,
        isClickable
          ? 'cursor-pointer hover:-translate-y-1 hover:bg-white/25 hover:shadow-xl'
          : 'cursor-default'
      )}
    >
      <h3 className="text-lg font-bold mb-1 line-clamp-1">{banner.title}</h3>
      <p className="text-2xl font-bold mb-3">{banner.discountLabel}</p>

      {banner.description && (
        <p className="text-sm text-white/80 mb-3 line-clamp-2">{banner.description}</p>
      )}

      <div className="flex items-center gap-2 mt-auto">
        {banner.couponCode && (
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-mono font-semibold">
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-300" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {banner.couponCode}
          </div>
        )}
        {banner.linkUrl && !banner.couponCode && (
          <div className="flex items-center gap-1 text-sm text-white/80">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem thêm</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Section ────────────────────────────────────────────────────────────
export function PromotionsSection() {
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await promotionBannersApi.getActive();
        if (!cancelled && res.data?.length) {
          setBanners(res.data);
        }
      } catch {
        // API lỗi → section ẩn gracefully
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) return <PromotionsSkeleton />;
  if (!banners.length) return null;

  return (
    <section id="promotions" className="py-12 bg-gradient-to-r from-amber-500 to-orange-500">
      <div className="container mx-auto px-4">
        <div className="text-center text-white mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-yellow-300" />
            Khuyến mãi đặc biệt
          </h2>
          <p className="text-white/90">
            Click vào thẻ để sao chép mã giảm giá
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner, index) => (
            <PromoCard key={banner.id} banner={banner} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
