'use client';

import { useState, useEffect } from 'react';
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
  Chrome,
  Phone,
  CheckCircle
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';

export function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode } = useUIStore();
  const { login, register, isLoading } = useAuthStore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password & reset password local states
  const [subMode, setSubMode] = useState<'auth' | 'forgot' | 'reset'>('auth');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  useEffect(() => {
    if (!isAuthModalOpen) {
      setSubMode('auth');
      resetForm();
    }
  }, [isAuthModalOpen]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập email', variant: 'destructive' });
      return;
    }
    setIsSubmittingForgot(true);
    try {
      await authApi.forgotPassword(email);
      toast({
        title: 'Thành công',
        description: 'Mã OTP xác minh đã được gửi đến email của bạn!',
      });
      setSubMode('reset');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Email không tồn tại trong hệ thống',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập mã OTP gồm 6 chữ số', variant: 'destructive' });
      return;
    }
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passRegex.test(newPassword)) {
      toast({ title: 'Lỗi', description: 'Mật khẩu phải từ 8 ký tự, gồm ít nhất một chữ cái, một số và một ký tự đặc biệt', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Lỗi', description: 'Mật khẩu xác nhận không khớp', variant: 'destructive' });
      return;
    }

    setIsSubmittingForgot(true);
    try {
      await authApi.resetPassword(email, otpCode, newPassword);
      toast({
        title: 'Đặt lại mật khẩu thành công!',
        description: 'Vui lòng đăng nhập bằng mật khẩu mới',
      });
      setSubMode('auth');
      setAuthMode('login');
      // Keep email for login convenience
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Mã xác thực không chính xác hoặc đã hết hạn',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingForgot(false);
    }
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
        if (!fullName.trim()) {
          toast({ title: 'Lỗi', description: 'Vui lòng nhập họ tên', variant: 'destructive' });
          return;
        }
        
        const nameRegex = /^[\p{L}\s]+$/u;
        if (!nameRegex.test(fullName.trim())) {
          toast({ title: 'Lỗi', description: 'Họ tên không được chứa số hoặc ký tự đặc biệt', variant: 'destructive' });
          return;
        }

        const phoneRegex = /^(0[35789])[0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
          toast({ title: 'Lỗi', description: 'Số điện thoại không hợp lệ (VD: 0912345678)', variant: 'destructive' });
          return;
        }

        const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passRegex.test(password)) {
          toast({ title: 'Lỗi', description: 'Mật khẩu phải từ 8 ký tự, gồm ít nhất một chữ cái, một số và một ký tự đặc biệt', variant: 'destructive' });
          return;
        }
        
        if (password !== confirmPassword) {
          toast({ title: 'Lỗi', description: 'Mật khẩu xác nhận không khớp', variant: 'destructive' });
          return;
        }

        await register(fullName, email, phone, password);
        toast({
          title: 'Đăng ký thành công!',
          description: 'Tài khoản đã được tạo',
        });
        // Auto-redirect if ADMIN after registration
        const user = useAuthStore.getState().user;
        if (user?.role === 'ADMIN') {
          // Trigger admin mode on the home page via setAdminMode indirectly 
          // or directly if we use URL params which we are currently using
          router.push('/?admin=dashboard');
          return; // Prevent further execution if redirecting
        }
      }
      closeAuthModal();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: authMode === 'login' 
          ? (error.message || 'Email hoặc mật khẩu không đúng') 
          : (error.message || 'Không thể tạo tài khoản. Email có thể đã tồn tại.'),
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
            {subMode === 'forgot' && 'Quên mật khẩu'}
            {subMode === 'reset' && 'Đặt lại mật khẩu'}
            {subMode === 'auth' && (authMode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            {subMode === 'forgot' && 'Nhập email của bạn để nhận mã xác minh'}
            {subMode === 'reset' && 'Nhập mã OTP từ email và mật khẩu mới'}
            {subMode === 'auth' && (authMode === 'login' 
              ? 'Đăng nhập để tiếp tục mua sắm' 
              : 'Tạo tài khoản mới để trải nghiệm tốt hơn')}
          </DialogDescription>
        </DialogHeader>

        {subMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isSubmittingForgot}
            >
              {isSubmittingForgot && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gửi mã xác minh
            </Button>

            <div className="text-center text-sm">
              <Button 
                type="button" 
                variant="link" 
                className="px-1 text-amber-600"
                onClick={() => setSubMode('auth')}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </form>
        )}

        {subMode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-code">Mã xác minh (OTP gồm 6 số)</Label>
              <div className="relative">
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center tracking-[0.5em] font-mono text-lg font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {/* Password Validation Rules UI */}
              <div className="space-y-1.5 mt-2 text-xs p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-700 mb-2">Yêu cầu bảo mật mật khẩu:</p>
                <div className={`flex items-center gap-2 transition-colors duration-300 ${newPassword.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Tối thiểu 8 ký tự
                </div>
                <div className={`flex items-center gap-2 transition-colors duration-300 ${/[A-Za-z]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Ít nhất một chữ cái
                </div>
                <div className={`flex items-center gap-2 transition-colors duration-300 ${/\d/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Ít nhất một chữ số
                </div>
                <div className={`flex items-center gap-2 transition-colors duration-300 ${/[@$!%*#?&]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Ký tự đặc biệt (@, $, !, %, *, #, ?, &)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isSubmittingForgot}
            >
              {isSubmittingForgot && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xác nhận đặt lại
            </Button>

            <div className="text-center text-sm">
              <Button 
                type="button" 
                variant="link" 
                className="px-1 text-amber-600"
                onClick={() => setSubMode('auth')}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </form>
        )}

        {subMode === 'auth' && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Name & Phone fields - only for register */}
            {authMode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Họ tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </>
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
                  minLength={authMode === 'register' ? 8 : undefined}
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
              {/* Password Validation Rules UI - Only Register */}
              {authMode === 'register' && (
                <div className="space-y-1.5 mt-2 text-xs p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Yêu cầu bảo mật mật khẩu:</p>
                  <div className={`flex items-center gap-2 transition-colors duration-300 ${password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> Tối thiểu 8 ký tự
                  </div>
                  <div className={`flex items-center gap-2 transition-colors duration-300 ${/[A-Za-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> Ít nhất một chữ cái
                  </div>
                  <div className={`flex items-center gap-2 transition-colors duration-300 ${/\d/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> Ít nhất một chữ số
                  </div>
                  <div className={`flex items-center gap-2 transition-colors duration-300 ${/[@$!%*#?&]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> Ký tự đặc biệt (@, $, !, %, *, #, ?, &)
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password - only for register */}
            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Forgot password - only for login */}
            {authMode === 'login' && (
              <div className="text-right">
                <Button 
                  type="button" 
                  variant="link" 
                  className="px-0 text-sm text-amber-600"
                  onClick={() => setSubMode('forgot')}
                >
                  Quên mật khẩu?
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
