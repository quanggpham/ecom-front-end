'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Flame,
  Star,
  Tag,
  Gift,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { bannersApi, mediaApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Banner, BannerRequest, BadgeIcon } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const BADGE_ICON_OPTIONS: { value: BadgeIcon; label: string; Icon: React.ElementType | null }[] = [
  { value: 'NONE', label: 'Không có icon', Icon: null },
  { value: 'FLAME', label: '🔥 Flame (Hot)', Icon: Flame },
  { value: 'STAR', label: '⭐ Star (Nổi bật)', Icon: Star },
  { value: 'TAG', label: '🏷️ Tag (Khuyến mãi)', Icon: Tag },
  { value: 'GIFT', label: '🎁 Gift (Quà)', Icon: Gift },
];

const OVERLAY_COLORS = [
  { value: 'from-amber-500/80', label: 'Cam vàng', bg: 'bg-amber-500' },
  { value: 'from-orange-500/80', label: 'Cam đậm', bg: 'bg-orange-500' },
  { value: 'from-red-500/80', label: 'Đỏ', bg: 'bg-red-500' },
  { value: 'from-green-600/80', label: 'Xanh lá', bg: 'bg-green-600' },
  { value: 'from-blue-600/80', label: 'Xanh dương', bg: 'bg-blue-600' },
  { value: 'from-purple-600/80', label: 'Tím', bg: 'bg-purple-600' },
  { value: 'from-pink-500/80', label: 'Hồng', bg: 'bg-pink-500' },
  { value: 'from-gray-800/80', label: 'Tối', bg: 'bg-gray-800' },
];

const INITIAL_FORM: BannerRequest = {
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  badgeText: '',
  badgeIcon: 'NONE',
  overlayColor: 'from-amber-500/80',
  displayOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ─── Mini Preview ─────────────────────────────────────────────────────────
function BannerPreview({ form }: { form: BannerRequest }) {
  const iconOpt = BADGE_ICON_OPTIONS.find((o) => o.value === form.badgeIcon);
  const IconComp = iconOpt?.Icon ?? null;
  const overlayColor = form.overlayColor || 'from-amber-500/80';

  return (
    <div className="relative w-full h-28 rounded-lg overflow-hidden border border-border">
      {form.imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${form.imageUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <div className={`absolute inset-0 bg-gradient-to-r ${overlayColor} via-black/40 to-transparent`} />
      <div className="relative h-full px-3 py-2 flex flex-col justify-center text-white">
        {form.badgeText && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-medium w-fit mb-1">
            {IconComp && <IconComp className="w-3 h-3 text-amber-300" />}
            {form.badgeText}
          </div>
        )}
        {form.subtitle && <p className="text-[10px] text-white/80">{form.subtitle}</p>}
        <p className="text-sm font-bold leading-tight line-clamp-1">{form.title || 'Tiêu đề banner'}</p>
        {form.description && (
          <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5">{form.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerRequest>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();

  // ─── Fetch ────────────────────────────────────────────────────────────
  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bannersApi.getAll({ page: currentPage - 1, size: pageSize });
      setBanners(res.data?.items || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách banner', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, toast]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  // ─── Dialog helpers ───────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({ ...INITIAL_FORM, displayOrder: totalElements });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      description: banner.description ?? '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? '',
      badgeText: banner.badgeText ?? '',
      badgeIcon: banner.badgeIcon,
      overlayColor: banner.overlayColor ?? 'from-amber-500/80',
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  // ─── Image Upload ─────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Lỗi', description: 'Vui lòng chọn file ảnh', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Lỗi', description: 'Ảnh không được lớn hơn 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const res = await mediaApi.upload(file);
      setFormData((prev) => ({ ...prev, imageUrl: res.data }));
      toast({ title: 'Upload thành công', description: 'Ảnh đã được tải lên' });
    } catch {
      toast({ title: 'Lỗi upload', description: 'Không thể tải ảnh lên', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: 'Lỗi', description: 'Tiêu đề banner là bắt buộc', variant: 'destructive' });
      return;
    }
    if (!formData.imageUrl.trim()) {
      toast({ title: 'Lỗi', description: 'URL ảnh là bắt buộc', variant: 'destructive' });
      return;
    }

    const payload: BannerRequest = {
      ...formData,
      subtitle: formData.subtitle || undefined,
      description: formData.description || undefined,
      linkUrl: formData.linkUrl || undefined,
      badgeText: formData.badgeText || undefined,
      startDate: formData.startDate ? `${formData.startDate}T00:00:00` : undefined,
      endDate: formData.endDate ? `${formData.endDate}T23:59:59` : undefined,
    };

    setIsSubmitting(true);
    try {
      if (editingBanner) {
        await bannersApi.update(editingBanner.id, payload);
        toast({ title: 'Thành công', description: 'Cập nhật banner thành công' });
      } else {
        await bannersApi.create(payload);
        toast({ title: 'Thành công', description: 'Tạo banner mới thành công' });
      }
      setIsDialogOpen(false);
      fetchBanners();
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể lưu banner', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Bạn có chắc muốn xoá banner "${banner.title}"?`)) return;
    try {
      await bannersApi.delete(banner.id);
      toast({ title: 'Thành công', description: 'Đã xoá banner' });
      fetchBanners();
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xoá banner', variant: 'destructive' });
    }
  };

  // ─── Toggle status ────────────────────────────────────────────────────
  const handleToggleStatus = async (banner: Banner) => {
    try {
      await bannersApi.changeStatus(banner.id, !banner.isActive);
      toast({
        title: 'Thành công',
        description: banner.isActive ? 'Đã tắt banner' : 'Đã bật banner',
      });
      fetchBanners();
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể thay đổi trạng thái', variant: 'destructive' });
    }
  };

  // ─── Reorder (move up/down) ───────────────────────────────────────────
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= banners.length) return;

    const updated = [...banners];
    const temp = updated[index].displayOrder;
    updated[index] = { ...updated[index], displayOrder: updated[swapIndex].displayOrder };
    updated[swapIndex] = { ...updated[swapIndex], displayOrder: temp };

    // Optimistic UI
    setBanners([...updated].sort((a, b) => a.displayOrder - b.displayOrder));

    try {
      await bannersApi.reorder([
        { id: updated[index].id, displayOrder: updated[index].displayOrder },
        { id: updated[swapIndex].id, displayOrder: updated[swapIndex].displayOrder },
      ]);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật thứ tự', variant: 'destructive' });
      fetchBanners(); // revert
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Banner</h1>
          <p className="text-muted-foreground">
            Tổng {totalElements} banner — hiển thị trên trang chủ
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm banner
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-16 h-10 rounded" />
                  <Skeleton className="flex-1 h-5" />
                  <Skeleton className="w-20 h-5" />
                  <Skeleton className="w-24 h-5" />
                </div>
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">Chưa có banner nào</p>
              <p className="text-sm text-muted-foreground mt-1">
                Nhấn &quot;Thêm banner&quot; để tạo banner đầu tiên
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Ảnh</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="w-[100px]">Badge</TableHead>
                    <TableHead className="w-[80px] text-center">Thứ tự</TableHead>
                    <TableHead className="w-[160px]">Thời gian</TableHead>
                    <TableHead className="w-[100px]">Trạng thái</TableHead>
                    <TableHead className="w-[120px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner, idx) => (
                    <TableRow key={banner.id} className={!banner.isActive ? 'opacity-50' : ''}>
                      {/* Thumbnail */}
                      <TableCell>
                        <div className="w-[72px] h-10 rounded overflow-hidden border border-border bg-muted flex-shrink-0">
                          {banner.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Title */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{banner.title}</p>
                          {banner.subtitle && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{banner.subtitle}</p>
                          )}
                          {banner.linkUrl && (
                            <a
                              href={banner.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link
                            </a>
                          )}
                        </div>
                      </TableCell>

                      {/* Badge */}
                      <TableCell>
                        {banner.badgeText ? (
                          <Badge variant="outline" className="text-xs gap-1 whitespace-nowrap">
                            {banner.badgeText}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Order controls */}
                      <TableCell>
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            onClick={() => handleMoveOrder(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-mono text-muted-foreground">
                            {banner.displayOrder}
                          </span>
                          <button
                            onClick={() => handleMoveOrder(idx, 'down')}
                            disabled={idx === banners.length - 1}
                            className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>

                      {/* Time range */}
                      <TableCell>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {banner.startDate || banner.endDate ? (
                            <>
                              <div>{formatDate(banner.startDate)} →</div>
                              <div>{formatDate(banner.endDate)}</div>
                            </>
                          ) : (
                            <span className="text-green-600 font-medium">Luôn hiển thị</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status toggle */}
                      <TableCell>
                        <button
                          onClick={() => handleToggleStatus(banner)}
                          className="cursor-pointer"
                          title={banner.isActive ? 'Tắt banner' : 'Bật banner'}
                        >
                          {banner.isActive ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 gap-1 text-xs">
                              <ToggleRight className="w-3.5 h-3.5" />
                              Bật
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-200 gap-1 text-xs">
                              <ToggleLeft className="w-3.5 h-3.5" />
                              Tắt
                            </Badge>
                          )}
                        </button>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(banner)}
                            className="h-8 w-8"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(banner)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Trước
          </Button>
          <span className="flex items-center px-4 text-sm">
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

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
            </DialogTitle>
            <DialogDescription>
              {editingBanner
                ? 'Cập nhật thông tin banner quảng cáo'
                : 'Tạo banner mới hiển thị trên trang chủ'}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-1">
            <form id="banner-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Preview */}
              <div className="space-y-1.5">
                <Label>Xem trước</Label>
                <BannerPreview form={formData} />
              </div>

              <Separator />

              {/* Title & Subtitle */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="b-title">Tiêu đề *</Label>
                  <Input
                    id="b-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: Phở Bò Hà Nội"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-subtitle">Sub-title</Label>
                  <Input
                    id="b-subtitle"
                    value={formData.subtitle ?? ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="VD: Hương vị truyền thống"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="b-desc">Mô tả</Label>
                <Textarea
                  id="b-desc"
                  value={formData.description ?? ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn về banner..."
                  rows={2}
                />
              </div>

              {/* Image */}
              <div className="space-y-1.5">
                <Label htmlFor="b-image">Ảnh nền *</Label>
                <div className="flex gap-2">
                  <Input
                    id="b-image"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://... hoặc upload ảnh"
                    className="flex-1"
                    required
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading}
                      asChild
                    >
                      <span>
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                        <span className="ml-2">{isUploading ? 'Uploading...' : 'Upload'}</span>
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Link URL */}
              <div className="space-y-1.5">
                <Label htmlFor="b-link">URL liên kết (khi click)</Label>
                <Input
                  id="b-link"
                  value={formData.linkUrl ?? ''}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://... (bỏ trống = scroll tới menu)"
                />
              </div>

              {/* Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="b-badge-text">Nội dung badge</Label>
                  <Input
                    id="b-badge-text"
                    value={formData.badgeText ?? ''}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="VD: Best Seller, Giảm 20%"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Icon badge</Label>
                  <Select
                    value={formData.badgeIcon ?? 'NONE'}
                    onValueChange={(v) => setFormData({ ...formData, badgeIcon: v as BadgeIcon })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BADGE_ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Overlay Color */}
              <div className="space-y-1.5">
                <Label>Màu overlay</Label>
                <div className="flex flex-wrap gap-2">
                  {OVERLAY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      title={color.label}
                      onClick={() => setFormData({ ...formData, overlayColor: color.value })}
                      className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-transform ${
                        formData.overlayColor === color.value
                          ? 'border-foreground scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="b-order">Thứ tự (nhỏ → hiển thị trước)</Label>
                  <Input
                    id="b-order"
                    type="number"
                    min={0}
                    value={formData.displayOrder ?? 0}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Trạng thái</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      id="b-active"
                      checked={formData.isActive ?? true}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="b-active" className="font-normal cursor-pointer">
                      {formData.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="b-start">Ngày bắt đầu (tuỳ chọn)</Label>
                  <Input
                    id="b-start"
                    type="date"
                    value={formData.startDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-end">Ngày kết thúc (tuỳ chọn)</Label>
                  <Input
                    id="b-end"
                    type="date"
                    value={formData.endDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="banner-form"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingBanner ? 'Cập nhật' : 'Tạo banner'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
