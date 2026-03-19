'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { profileApi, addressApi, productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Loader2, 
  Plus, 
  Trash2, 
  Edit, 
  Star, 
  ArrowLeft,
  Heart
} from 'lucide-react';
import { UpdateProfileRequest, Address, AddressRequest, Product } from '@/types';
import { ProductCard } from './ProductCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface UserProfileProps {
  onBack: () => void;
}

export function UserProfile({ onBack }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'liked'>('profile');
  const { toast } = useToast();

  // Initialize active tab from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'liked' || tabParam === 'addresses' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, []);

  // Profile State
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    username: '',
    email: '',
    fullName: '',
    phone: '',
  });

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Liked Products State
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);
  
  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressRequest>({
    recipientName: '',
    phone: '',
    addressLine: '',
    district: '',
    city: '',
    isDefault: false,
  });

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    } else if (activeTab === 'addresses') {
      fetchAddresses();
    } else if (activeTab === 'liked') {
      fetchLikedProducts();
    }
  }, [activeTab]);

  // --- Profile Methods ---
  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await profileApi.getProfile();
      if (response.data) {
        setProfileData({
          username: response.data.username || '',
          email: response.data.email || '',
          fullName: response.data.fullName || '',
          phone: response.data.phone || '',
        });
      }
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải thông tin cá nhân.', variant: 'destructive' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await profileApi.updateProfile(profileData);
      toast({ title: 'Thành công', description: 'Cập nhật thông tin cá nhân thành công!' });
    } catch (error) {
      toast({ title: 'Lỗi', description: (error as Error).message || 'Có lỗi xảy ra khi cập nhật.', variant: 'destructive' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Liked Products Methods ---
  const fetchLikedProducts = async () => {
    setIsLoadingLiked(true);
    try {
      const response = await productsApi.getLiked();
      setLikedProducts(response.data || []);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách sản phẩm yêu thích.', variant: 'destructive' });
    } finally {
      setIsLoadingLiked(false);
    }
  };

  // --- Address Methods ---
  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const response = await addressApi.getAll();
      // Normalize: Java/Spring Jackson may serialize `isDefault` as `default`
      const normalized = (response.data || []).map((addr: any) => ({
        ...addr,
        isDefault: addr.isDefault ?? addr.default ?? false,
      }));
      setAddresses(normalized);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách địa chỉ.', variant: 'destructive' });
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleOpenAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({
        recipientName: address.recipientName,
        phone: address.phone,
        addressLine: address.addressLine,
        district: address.district,
        city: address.city,
        isDefault: address.isDefault || (address as any).default || false,
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        recipientName: '',
        phone: '',
        addressLine: '',
        district: '',
        city: '',
        isDefault: false,
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      if (editingAddressId) {
        await addressApi.update(editingAddressId, addressForm);
        toast({ title: 'Thành công', description: 'Cập nhật địa chỉ thành công!' });
      } else {
        await addressApi.create(addressForm);
        toast({ title: 'Thành công', description: 'Thêm địa chỉ mới thành công!' });
      }
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (error) {
      toast({ title: 'Lỗi', description: (error as Error).message || 'Lỗi khi lưu địa chỉ.', variant: 'destructive' });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await addressApi.delete(id);
      toast({ title: 'Thành công', description: 'Đã xóa địa chỉ!' });
      fetchAddresses();
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa địa chỉ.', variant: 'destructive' });
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await addressApi.setDefault(id);
      toast({ title: 'Thành công', description: 'Đã cập nhật địa chỉ mặc định!' });
      fetchAddresses();
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể thiết lập địa chỉ mặc định.', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 space-y-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-medium'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Thông tin cá nhân</span>
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'addresses'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-medium'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-100'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>Sổ địa chỉ</span>
          </button>
          
          <button
            onClick={() => setActiveTab('liked')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'liked'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-medium'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-100'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Sản phẩm yêu thích</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm relative min-h-[500px]">
          
          {/* PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>
              {isLoadingProfile ? (
                 <div className="flex justify-center items-center py-20">
                   <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                 </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="max-w-xl space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-gray-50/50"
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground mt-1">Tên đăng nhập không thể thay đổi.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="bg-amber-500 hover:bg-amber-600 text-white min-w-[150px]"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ADDRESSES VIEW */}
          {activeTab === 'addresses' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Sổ địa chỉ</h2>
                <Button 
                  onClick={() => handleOpenAddressModal()}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm địa chỉ mới
                </Button>
              </div>

              {isLoadingAddresses ? (
                 <div className="flex justify-center items-center py-20">
                   <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                 </div>
              ) : addresses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có địa chỉ nào</h3>
                  <p className="text-gray-500 max-w-sm">Bạn chưa lưu địa chỉ nhận hàng nào. Hãy thêm địa chỉ để việc thanh toán nhanh chóng hơn.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`relative p-5 rounded-2xl border ${
                        (addr.isDefault || (addr as any).default) ? 'border-amber-500 bg-amber-50 shadow-md ring-1 ring-amber-500' : 'border-gray-200'
                      } hover:border-amber-400 hover:shadow-md transition-all duration-300`}
                    >
                      {(addr.isDefault || (addr as any).default) && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-2xl flex items-center shadow-sm">
                          <Star className="w-3.5 h-3.5 mr-1 fill-white" /> 
                          Địa chỉ mặc định
                        </div>
                      )}
                      
                      <div className="pr-20 mb-3 mt-2">
                        <div className="font-semibold text-gray-900 flex items-center gap-2 text-base">
                          {addr.recipientName}
                          <span className="text-gray-300 font-normal">|</span>
                          <span className="text-gray-500 font-normal">{addr.phone}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                        {addr.fullAddress}
                      </p>
                      
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100/50 mt-auto">
                        <button 
                          onClick={() => handleOpenAddressModal(addr)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>
                        
                        {!(addr.isDefault || (addr as any).default) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-auto text-xs h-7 px-3"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                          >
                            Đặt làm mặc định
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIKED PRODUCTS VIEW */}
          {activeTab === 'liked' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Sản phẩm đánh dấu yêu thích</h2>
              </div>

              {isLoadingLiked ? (
                 <div className="flex justify-center items-center py-20">
                   <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                 </div>
              ) : likedProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có sản phẩm yêu thích</h3>
                  <p className="text-gray-500 max-w-sm">Hãy thả tim cho những món ăn bạn lưu luyến để dễ dàng đặt lại lần sau.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {likedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveAddress} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Tên người nhận</Label>
                <Input
                  id="recipientName"
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, recipientName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressPhone">Số điện thoại</Label>
                <Input
                  id="addressPhone"
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine">Địa chỉ cụ thể (Số nhà, đường)</Label>
              <Input
                id="addressLine"
                value={addressForm.addressLine}
                onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input
                  id="district"
                  value={addressForm.district}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, district: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố/Tỉnh</Label>
                <Input
                  id="city"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isDefault" 
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
              />
              <Label htmlFor="isDefault" className="font-normal cursor-pointer">
                Đặt làm địa chỉ mặc định
              </Label>
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddressModalOpen(false)}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSavingAddress}
              >
                {isSavingAddress ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Lưu địa chỉ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
