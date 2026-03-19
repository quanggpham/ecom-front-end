'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Loader2,
  Chrome
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/hooks/use-toast';

export function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode } = useUIStore();
  const { login, register, isLoading } = useAuthStore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (authMode === 'login') {
        await login(email, password);
        // After login, check decoded role - ADMIN goes to admin dashboard
        const { user: freshUser } = useAuthStore.getState();
        closeAuthModal();
        resetForm();
        if (freshUser?.role === 'ADMIN') {
          toast({ title: 'Đăng nhập thành công!', description: 'Chào mừng Admin trở lại' });
          router.push('/?admin=dashboard');
          return;
        }
        toast({ title: 'Đăng nhập thành công!', description: 'Chào mừng bạn trở lại' });
        return;
      } else {
        if (!name.trim()) {
          toast({
            title: 'Lỗi',
            description: 'Vui lòng nhập họ tên',
            variant: 'destructive',
          });
          return;
        }
        await register(name, email, password);
        toast({
          title: 'Đăng ký thành công!',
          description: 'Tài khoản đã được tạo',
        });
        // Auto-redirect if ADMIN after registration
        const user = useAuthStore.getState().user;
        if (user?.role === 'ADMIN') {
          // Trigger admin mode on the home page via setAdminMode indirectly 
          // or directly if we use URL params which we are currently using
          window.location.href = '/?admin=dashboard';
          return; // Prevent further execution if redirecting
        }
      }
      closeAuthModal();
      resetForm();
    } catch {
      toast({
        title: 'Lỗi',
        description: authMode === 'login' 
          ? 'Email hoặc mật khẩu không đúng' 
          : 'Không thể tạo tài khoản. Email có thể đã tồn tại.',
        variant: 'destructive',
      });
    }
  };

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    resetForm();
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-center">
            {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {authMode === 'login' 
              ? 'Đăng nhập để tiếp tục mua sắm' 
              : 'Tạo tài khoản mới để trải nghiệm tốt hơn'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name field - only for register */}
          {authMode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Forgot password - only for login */}
          {authMode === 'login' && (
            <div className="text-right">
              <Button 
                type="button" 
                variant="link" 
                className="px-0 text-sm text-amber-600"
              >
                Quên mật khẩu?
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>

          {/* Social Login */}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => toast({ title: 'Tính năng đang phát triển', duration: 1500 })}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Tiếp tục với Google
          </Button>

          {/* Switch Mode */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {authMode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </span>
            <Button 
              type="button" 
              variant="link" 
              className="px-1 text-amber-600"
              onClick={switchMode}
            >
              {authMode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
