'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Tag,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Store,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore, useUIStore } from '@/store';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    key: 'dashboard',
  },
  {
    title: 'Sản phẩm',
    icon: Package,
    key: 'products',
  },
  {
    title: 'Danh mục',
    icon: FolderTree,
    key: 'categories',
  },
  {
    title: 'Đơn hàng',
    icon: ShoppingCart,
    key: 'orders',
  },
  {
    title: 'Mã giảm giá',
    icon: Tag,
    key: 'coupons',
  },
  {
    title: 'Người dùng',
    icon: Users,
    key: 'users',
  },
];

interface SidebarContentProps {
  collapsed: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

function SidebarContent({ collapsed, activeTab, onTabChange, onLogout }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center border-b px-4 h-16",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  isActive
                    ? "bg-amber-100 text-amber-700 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <button
          onClick={() => window.location.href = '/?view=profile'}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          <User className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Hồ sơ</span>}
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Cài đặt</span>}
        </button>
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-red-600 hover:bg-red-50",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center border-b px-4 h-16 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="font-bold text-lg">Admin</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex"
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>
        <SidebarContent
          collapsed={collapsed}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile/Tablet Sidebar (Sheet) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-full pt-6">
            <SidebarContent
              collapsed={false}
              activeTab={activeTab}
              onTabChange={(tab) => {
                onTabChange(tab);
                // Document click to close sheet is handled by Sheet primitive
              }}
              onLogout={handleLogout}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
