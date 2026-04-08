'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Search,
  Loader2,
  Calendar,
  Hash,
  Copy,
  Check,
  FolderTree,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { couponsApi, categoriesApi, productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Coupon, CouponRequest, DiscountType, PromotionType, Category, Product } from '@/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const initialForm: CouponRequest = {
  code: '',
  discountType: 'FIXED_AMOUNT',
  discountValue: 0,
  maxDiscountAmount: 0,
  minOrderValue: 0,
  usageLimit: 100,
  startDate: new Date().toISOString().split('T')[0],
  expirationDate: '',
  active: true,
  promotionType: 'ORDER',
  categoryId: null,
  productId: null,
};

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponRequest>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Categories & Products state
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    // Tải danh mục và sản phẩm cho form
    categoriesApi.getAll().then(res => setCategories(res.data || []));
    productsApi.getAll({ size: 1000 }).then(res => setProducts((res.data as any)?.items || []));
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await couponsApi.getAll({ page: currentPage, size: pageSize });
      setCoupons(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalElements(response.data?.totalElements || 0);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải mã giảm giá', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData(initialForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderValue: coupon.minOrderValue,
      usageLimit: coupon.usageLimit,
      startDate: coupon.startDate,
      expirationDate: coupon.expirationDate,
      active: coupon.active,
      promotionType: coupon.promotionType || 'ORDER',
      categoryId: coupon.categoryId,
      productId: coupon.productId,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.expirationDate) {
      toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate theo rule backend chặn
      const submitData = { ...formData };
      if (submitData.promotionType === 'ORDER') {
        submitData.categoryId = null;
        submitData.productId = null;
      } else if (submitData.promotionType === 'CATEGORY') {
        submitData.productId = null;
        if (!submitData.categoryId) throw new Error('Vui lòng chọn danh mục áp dụng');
      } else if (submitData.promotionType === 'PRODUCT') {
        submitData.categoryId = null;
        if (!submitData.productId) throw new Error('Vui lòng chọn sản phẩm áp dụng');
      }

      if (editingCoupon) {
        await couponsApi.update(editingCoupon.id, submitData);
        toast({ title: 'Thành công', description: 'Cập nhật mã giảm giá thành công' });
      } else {
        await couponsApi.create(formData);
        toast({ title: 'Thành công', description: 'Tạo mã giảm giá thành công' });
      }
      setIsDialogOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.message || 'Không thể lưu mã giảm giá', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Bạn có chắc muốn xóa mã "${coupon.code}"?`)) return;
    try {
      await couponsApi.delete(coupon.id);
      toast({ title: 'Thành công', description: 'Xóa mã giảm giá thành công' });
      fetchCoupons();
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xóa mã giảm giá', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await couponsApi.changeStatus(coupon.id, !coupon.active);
      toast({
        title: 'Thành công',
        description: coupon.active ? 'Đã vô hiệu hóa mã giảm giá' : 'Đã kích hoạt mã giảm giá',
      });
      fetchCoupons();
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể thay đổi trạng thái', variant: 'destructive' });
    }
  };

  const handleCopyCode = async (coupon: Coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedId(coupon.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  const isExpired = (coupon: Coupon) => {
    return new Date(coupon.expirationDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
          <p className="text-muted-foreground">Tổng {totalElements} mã giảm giá</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm mã giảm giá
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-24 h-6" />
                  <Skeleton className="flex-1 h-6" />
                  <Skeleton className="w-32 h-6" />
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có mã giảm giá nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Phạm vi</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead>Đơn tối thiểu</TableHead>
                    <TableHead>Sử dụng</TableHead>
                    <TableHead>Thời hạn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-[120px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => {
                    const expired = isExpired(coupon);
                    return (
                      <TableRow key={coupon.id} className={expired ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-mono text-sm font-semibold">
                              {coupon.code}
                            </code>
                            <button
                              onClick={() => handleCopyCode(coupon)}
                              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Sao chép"
                            >
                              {copiedId === coupon.id ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {coupon.discountType === 'PERCENTAGE' ? (
                              <><Percent className="w-3 h-3" /> Phần trăm</>
                            ) : (
                              <><DollarSign className="w-3 h-3" /> Cố định</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.promotionType === 'CATEGORY' ? (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent shadow-none font-medium gap-1">
                              <FolderTree className="w-3.5 h-3.5" />
                              Danh mục 
                            </Badge>
                          ) : coupon.promotionType === 'PRODUCT' ? (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-transparent shadow-none font-medium gap-1">
                              <Package className="w-3.5 h-3.5" />
                              Sản phẩm
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent shadow-none font-medium gap-1">
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Toàn đơn
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}% (tối đa ${formatCurrency(coupon.maxDiscountAmount)})`
                            : formatCurrency(coupon.discountValue)}
                        </TableCell>
                        <TableCell>{formatCurrency(coupon.minOrderValue)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {coupon.usedCount}/{coupon.usageLimit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-0.5">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(coupon.startDate)} - {formatDate(coupon.expirationDate)}
                            </div>
                            {expired && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Hết hạn
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className="cursor-pointer"
                            title={coupon.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {coupon.active ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 transition-colors gap-1">
                                <ToggleRight className="w-3.5 h-3.5" />
                                Hoạt động
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors gap-1">
                                <ToggleLeft className="w-3.5 h-3.5" />
                                Tắt
                              </Badge>
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(coupon)}
                              className="h-8 w-8"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(coupon)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
          <span className="flex items-center px-4">
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Cập nhật thông tin mã giảm giá' : 'Tạo mã giảm giá mới cho khách hàng'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Mã giảm giá *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: GIAM50K"
                className="font-mono uppercase"
                required
              />
            </div>

            {/* Discount Type & Promotion Scope */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Loại giảm giá *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v) => setFormData({ ...formData, discountType: v as DiscountType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED_AMOUNT">Số tiền (VNĐ)</SelectItem>
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phạm vi áp dụng *</Label>
                <Select
                  value={formData.promotionType}
                  onValueChange={(v) => setFormData({ ...formData, promotionType: v as PromotionType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORDER">Toàn bộ đơn hàng</SelectItem>
                    <SelectItem value="CATEGORY">Danh mục sản phẩm</SelectItem>
                    <SelectItem value="PRODUCT">Sản phẩm cụ thể</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target ID Selection (Conditional) */}
            {formData.promotionType === 'CATEGORY' && (
              <div className="space-y-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <Label className="text-blue-700 shrink-0">Chọn danh mục áp dụng *</Label>
                <Select
                  value={formData.categoryId?.toString() || ''}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: Number(v) })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="-- Chọn danh mục --" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.promotionType === 'PRODUCT' && (
              <div className="space-y-2 p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                <Label className="text-orange-700 shrink-0">Chọn sản phẩm áp dụng *</Label>
                <Select
                  value={formData.productId?.toString() || ''}
                  onValueChange={(v) => setFormData({ ...formData, productId: Number(v) })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="-- Chọn sản phẩm --" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}


            {/* Discount Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === 'PERCENTAGE' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue || ''}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  min={0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDiscountAmount">Giảm tối đa (VNĐ)</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  value={formData.maxDiscountAmount || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                  min={0}
                  required={formData.discountType === 'PERCENTAGE'}
                  disabled={formData.discountType === 'FIXED_AMOUNT'}
                />
              </div>
            </div>

            {/* Min Order & Usage Limit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minOrderValue">Đơn tối thiểu (VNĐ)</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  value={formData.minOrderValue || ''}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  min={0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit || ''}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  min={1}
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Ngày hết hạn</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-500 to-orange-500"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingCoupon ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
