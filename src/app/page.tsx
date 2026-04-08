'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Header,
  HeroBanner,
  ProductList,
  CartDrawer,
  AuthModal,
  Checkout,
  OrderHistory,
  ChatBot,
  UserProfile,
  Footer,
} from '@/components/ecommerce';
import {
  AdminSidebar,
  AdminDashboard,
  AdminProducts,
  AdminCategories,
  AdminOrders,
  AdminCoupons,
  AdminUsers,
  AdminReviews,
  AdminBanners,
} from '@/components/admin';
import { useAuthStore, useCartStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Truck, Leaf, ChefHat, ShieldCheck,
  Soup, Sandwich, UtensilsCrossed, Coffee, Salad, CakeSlice,
  User, Star,
  Store, ShieldAlert,
  ArrowRight, ChevronRight, Settings, Clock, CheckCircle, Lock,
} from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const adminTab = searchParams.get('admin');
  const customerView = searchParams.get('view');
  const isAdminMode = !!adminTab;

  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const { fetchCart } = useCartStore();
  const isAdmin = user?.role === 'ADMIN';

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch cart if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleTabChange = (tab: string) => {
    router.push(`/?admin=${tab}`);
  };

  const exitAdminMode = () => {
    router.push('/');
  };

  // Admin Mode - only allow ADMIN role
  if (isAdminMode) {
    // Not logged in or not admin -> show access denied
    if (!isAuthenticated || !isAdmin) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 gap-6 p-8">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h1 className="text-2xl font-bold text-foreground">
              Không có quyền truy cập
            </h1>
            <p className="text-muted-foreground">
              {!isAuthenticated
                ? 'Bạn cần đăng nhập bằng tài khoản quản trị viên để vào trang này.'
                : 'Tài khoản của bạn không có quyền quản trị. Vui lòng liên hệ kỹ thuật viên.'}
            </p>
          </div>
          <Button onClick={exitAdminMode} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Button>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex bg-muted/30">
        <AdminSidebar activeTab={adminTab} onTabChange={handleTabChange} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Admin Header with Close Button */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Hệ thống Quản trị
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={exitAdminMode}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại trang chủ
              </Button>
            </div>
            {adminTab === 'dashboard' && <AdminDashboard />}
            {adminTab === 'products' && <AdminProducts />}
            {adminTab === 'categories' && <AdminCategories />}
            {adminTab === 'orders' && <AdminOrders />}
            {adminTab === 'coupons' && <AdminCoupons />}
            {adminTab === 'users' && <AdminUsers />}
            {adminTab === 'reviews' && <AdminReviews />}
            {adminTab === 'banners' && <AdminBanners />}
            {adminTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Cài đặt</h1>
                <p className="text-muted-foreground">Trang cài đặt đang được phát triển...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Customer Mode
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {customerView === 'profile' && isAuthenticated ? (
          <UserProfile onBack={() => router.push('/')} />
        ) : customerView === 'checkout' && isAuthenticated ? (
          <Checkout onBack={() => router.push('/')} onSuccess={() => router.push('/?view=orders')} />
        ) : customerView === 'orders' && isAuthenticated ? (
          <OrderHistory onBack={() => router.push('/')} />
        ) : (
          <>
        {/* Hero Banner */}
        <HeroBanner />

        {/* Features Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { Icon: Truck, title: 'Giao hàng nhanh', desc: 'Trong 30 phút', color: 'text-blue-500' },
                { Icon: Leaf, title: 'Nguyên liệu tươi', desc: '100% tự nhiên', color: 'text-green-500' },
                { Icon: ChefHat, title: 'Đầu bếp chuyên nghiệp', desc: 'Kinh nghiệm 10+ năm', color: 'text-amber-500' },
                { Icon: ShieldCheck, title: 'Chất lượng đảm bảo', desc: 'Hoàn tiền 100%', color: 'text-purple-500' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-default"
                >
                  <feature.Icon className={`w-10 h-10 mb-4 ${feature.color}`} />
                  <h3 className="font-semibold text-sm md:text-base">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product List */}
        <ProductList />

        {/* Promotions Section */}
        <section id="promotions" className="py-12 bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="container mx-auto px-4">
            <div className="text-center text-white mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-yellow-300" />
                Khuyến mãi đặc biệt
              </h2>
              <p className="text-white/90">
                Giảm ngay 20% cho đơn hàng đầu tiên - Sử dụng mã: VIETFOOD20
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Combo Gia Đình', discount: 'Giảm 30%', code: 'FAMILY30' },
                { title: 'Freeship Đơn từ 200K', discount: 'Miễn phí ship', code: 'FREESHIP' },
                { title: 'Món mới thử', discount: 'Giảm 15%', code: 'NEWFOOD' },
              ].map((promo, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:-translate-y-1 hover:bg-white/25 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-lg font-bold mb-1">{promo.title}</h3>
                  <p className="text-2xl font-bold mb-2">{promo.discount}</p>
                  <p className="text-sm opacity-90">Mã: {promo.code}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Items Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <Store className="w-8 h-8 text-amber-500" />
                Món ăn được yêu thích
              </h2>
              <p className="text-muted-foreground">
                Những món ăn được khách hàng đánh giá cao nhất
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Phở Bò', Icon: Soup, orders: '2.5k+', color: 'text-amber-600', bg: 'bg-amber-50' },
                { name: 'Bánh Mì', Icon: Sandwich, orders: '3.1k+', color: 'text-orange-500', bg: 'bg-orange-50' },
                { name: 'Bún Chả', Icon: UtensilsCrossed, orders: '1.8k+', color: 'text-red-500', bg: 'bg-red-50' },
                { name: 'Cà Phê Sữa', Icon: Coffee, orders: '4.2k+', color: 'text-stone-700', bg: 'bg-stone-50' },
                { name: 'Gỏi Cuốn', Icon: Salad, orders: '2.1k+', color: 'text-green-500', bg: 'bg-green-50' },
                { name: 'Bánh Xèo', Icon: CakeSlice, orders: '1.5k+', color: 'text-yellow-600', bg: 'bg-yellow-50' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`w-16 h-16 rounded-full ${item.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <item.Icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.orders} đơn</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                Khách hàng nói gì
              </h2>
              <p className="text-muted-foreground">
                Đánh giá từ những khách hàng đã sử dụng dịch vụ
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Nguyễn Văn A',
                  Icon: User,
                  rating: 5,
                  content: 'Phở bò rất ngon, nước dùng đậm đà. Giao hàng nhanh, đóng gói cẩn thận. Sẽ đặt lại!',
                },
                {
                  name: 'Trần Thị B',
                  Icon: User,
                  rating: 5,
                  content: 'Bún chả Hà Nội chuẩn vị, thịt nướng thơm lừng. Giá cả hợp lý, phục vụ nhiệt tình.',
                },
                {
                  name: 'Lê Văn C',
                  Icon: User,
                  rating: 5,
                  content: 'Đã đặt cơm trưa cho cả văn phòng. Món ăn đa dạng, giao đúng giờ. Rất hài lòng!',
                },
              ].map((review, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100/50 rounded-full flex items-center justify-center text-amber-600">
                      <review.Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">{review.name}</h4>
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">“{review.content}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
      <ChatBot />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
