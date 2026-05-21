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
  PromotionsSection,
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
  AdminPromotionBanners,
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
            {adminTab === 'promo-banners' && <AdminPromotionBanners />}
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

        {/* Promotions Section — dynamic from API */}
        <PromotionsSection />

        {/* Product List */}
        <ProductList />
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
