'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  ChevronUp, ChevronDown, Loader2, Megaphone, Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { promotionBannersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { PromotionBanner, PromotionBannerRequest } from '@/types';

// Preset bg color options
const BG_OPTIONS = [
  { label: 'Trắng mờ nhạt', value: 'bg-white/10' },
  { label: 'Trắng mờ', value: 'bg-white/15' },
  { label: 'Trắng mờ đậm', value: 'bg-white/20' },
  { label: 'Trắng mờ rất đậm', value: 'bg-white/30' },
  { label: 'Đen mờ nhạt', value: 'bg-black/10' },
  { label: 'Đen mờ', value: 'bg-black/20' },
];

const EMPTY_FORM: PromotionBannerRequest = {
  title: '',
  discountLabel: '',
  couponCode: '',
  description: '',
  linkUrl: '',
  bgColor: 'bg-white/15',
  displayOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
};

// ─── Mini Preview Card ───────────────────────────────────────────────────────
function MiniPreview({ form }: { form: PromotionBannerRequest }) {
  return (
    <div className="rounded-xl p-4 bg-gradient-to-r from-amber-500 to-orange-500">
      <div
        className={`rounded-lg p-4 border border-white/20 text-white ${form.bgColor || 'bg-white/15'} backdrop-blur-sm`}
      >
        <p className="font-bold text-sm line-clamp-1">{form.title || 'Tiêu đề'}</p>
        <p className="text-lg font-bold mt-1">{form.discountLabel || 'Label giảm giá'}</p>
        {form.description && (
          <p className="text-xs text-white/80 mt-1 line-clamp-2">{form.description}</p>
        )}
        {form.couponCode && (
          <div className="mt-2 flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-0.5 w-fit text-xs font-mono font-semibold">
            <Copy className="w-3 h-3" />
            {form.couponCode}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AdminPromotionBanners() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionBanner | null>(null);
  const [form, setForm] = useState<PromotionBannerRequest>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await promotionBannersApi.getAll();
      // Support both paginated and plain array responses
      const items = (res.data as any)?.items ?? (res.data as any)?.content ?? res.data ?? [];
      setBanners(Array.isArray(items) ? items : []);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách promo banners.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingBanner(null);
    setForm({ ...EMPTY_FORM, displayOrder: banners.length });
    setIsDialogOpen(true);
  };

  const openEdit = (banner: PromotionBanner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      discountLabel: banner.discountLabel,
      couponCode: banner.couponCode ?? '',
      description: banner.description ?? '',
      linkUrl: banner.linkUrl ?? '',
      bgColor: banner.bgColor ?? 'bg-white/15',
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
      startDate: banner.startDate ?? '',
      endDate: banner.endDate ?? '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.discountLabel.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập tiêu đề và label giảm giá.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const payload: PromotionBannerRequest = {
        ...form,
        couponCode: form.couponCode || undefined,
        description: form.description || undefined,
        linkUrl: form.linkUrl || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };

      if (editingBanner) {
        await promotionBannersApi.update(editingBanner.id, payload);
        toast({ title: 'Thành công', description: 'Cập nhật promo banner thành công.' });
      } else {
        await promotionBannersApi.create(payload);
        toast({ title: 'Thành công', description: 'Tạo promo banner mới thành công.' });
      }
      setIsDialogOpen(false);
      fetchBanners();
    } catch (err) {
      toast({ title: 'Lỗi', description: (err as Error).message || 'Lưu thất bại.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (banner: PromotionBanner) => {
    try {
      await promotionBannersApi.changeStatus(banner.id, !banner.isActive);
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể thay đổi trạng thái.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await promotionBannersApi.delete(deleteId);
      toast({ title: 'Đã xoá', description: 'Promo banner đã được xoá.' });
      setDeleteId(null);
      fetchBanners();
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xoá banner.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= banners.length) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[swapIndex]] = [newBanners[swapIndex], newBanners[index]];
    const updated = newBanners.map((b, i) => ({ ...b, displayOrder: i }));
    setBanners(updated);
    try {
      await promotionBannersApi.reorder(updated.map(b => ({ id: b.id, displayOrder: b.displayOrder })));
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể lưu thứ tự.', variant: 'destructive' });
      fetchBanners();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            Quản lý Promo Banners
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tổng {banners.length} banner — hiển thị trong section Khuyến mãi trang chủ
          </p>
        </div>
        <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
          <Plus className="w-4 h-4" /> Thêm banner
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-muted rounded-xl text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có promo banner nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-left">Label giảm giá</th>
                <th className="px-4 py-3 text-left">Mã coupon</th>
                <th className="px-4 py-3 text-center">Thứ tự</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {banners.map((banner, index) => (
                <tr key={banner.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{banner.title}</p>
                    {banner.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{banner.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-amber-600">{banner.discountLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    {banner.couponCode ? (
                      <Badge variant="outline" className="font-mono text-xs">{banner.couponCode}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => handleReorder(index, 'up')}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono text-muted-foreground">{banner.displayOrder}</span>
                      <button
                        onClick={() => handleReorder(index, 'down')}
                        disabled={index === banners.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => handleToggleStatus(banner)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <span className={`text-xs font-medium ${banner.isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {banner.isActive ? 'Bật' : 'Tắt'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(banner.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Chỉnh sửa' : 'Tạo'} Promo Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Live Preview */}
            <MiniPreview form={form} />

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Tiêu đề *</Label>
                <Input
                  placeholder="vd: Combo Gia Đình"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Label giảm giá *</Label>
                <Input
                  placeholder="vd: Giảm 30%, Miễn phí ship"
                  value={form.discountLabel}
                  onChange={e => setForm(p => ({ ...p, discountLabel: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Mô tả</Label>
                <Textarea
                  rows={2}
                  placeholder="Mô tả ngắn (tuỳ chọn)"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mã coupon</Label>
                <Input
                  placeholder="vd: FAMILY30"
                  className="font-mono uppercase"
                  value={form.couponCode}
                  onChange={e => setForm(p => ({ ...p, couponCode: e.target.value.toUpperCase() }))}
                />
                <p className="text-xs text-muted-foreground">Hiển thị nút copy khi click thẻ</p>
              </div>
              <div className="space-y-1.5">
                <Label>Link URL</Label>
                <Input
                  placeholder="https://..."
                  value={form.linkUrl}
                  onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Nếu có → mở link khi click thẻ</p>
              </div>
            </div>

            {/* BG Color Picker */}
            <div className="space-y-1.5">
              <Label>Màu nền thẻ</Label>
              <div className="flex flex-wrap gap-2">
                {BG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(p => ({ ...p, bgColor: opt.value }))}
                    className={`px-3 py-1.5 rounded-lg text-xs border-2 transition-all ${
                      form.bgColor === opt.value
                        ? 'border-amber-500 bg-amber-50 font-semibold'
                        : 'border-transparent bg-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Settings Row */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Thứ tự hiển thị</p>
                <p className="text-xs text-muted-foreground">Số nhỏ hơn hiển thị trước</p>
              </div>
              <Input
                type="number"
                min={0}
                className="w-20 text-center"
                value={form.displayOrder}
                onChange={e => setForm(p => ({ ...p, displayOrder: Number(e.target.value) }))}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Switch
                checked={form.isActive}
                onCheckedChange={val => setForm(p => ({ ...p, isActive: val }))}
                className="data-[state=checked]:bg-green-500"
              />
              <div>
                <p className="text-sm font-medium">Kích hoạt ngay</p>
                <p className="text-xs text-muted-foreground">Hiển thị trên trang chủ</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 hover:bg-amber-600 text-white">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingBanner ? 'Lưu thay đổi' : 'Tạo banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá promo banner?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
