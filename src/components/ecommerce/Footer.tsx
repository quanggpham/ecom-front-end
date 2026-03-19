'use client';

import Link from 'next/link';
import { 
  ChefHat, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Send,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-amber-50 to-orange-50 border-t">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Việt Food
                </span>
                <p className="text-[10px] text-muted-foreground -mt-1">Đồ ăn Việt Nam</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chúng tôi mang đến những món ăn Việt Nam truyền thống với hương vị đậm đà, 
              được chế biến từ nguyên liệu tươi ngon mỗi ngày.
            </p>
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full hover:bg-amber-100 hover:border-amber-300"
              >
                <Facebook className="w-4 h-4 text-amber-600" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full hover:bg-amber-100 hover:border-amber-300"
              >
                <Instagram className="w-4 h-4 text-amber-600" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full hover:bg-amber-100 hover:border-amber-300"
              >
                <Youtube className="w-4 h-4 text-amber-600" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên kết nhanh</h3>
            <nav className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                Trang chủ
              </Link>
              <Link href="#menu" className="block text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                Thực đơn
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                Khuyến mãi
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                Về chúng tôi
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="#" className="block text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                Điều khoản sử dụng
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  123 Đ Nguyễn Trãi, Quận 1,<br />
                  TP. Hồ Chí Minh, Việt Nam
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="tel:+84123456789" className="text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                  0123 456 789
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="mailto:contact@vietfood.vn" className="text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                  contact@vietfood.vn
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p>Thứ 2 - Thứ 6: 8:00 - 22:00</p>
                  <p>Thứ 7 - CN: 9:00 - 23:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Đăng ký nhận tin</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nhận thông tin khuyến mãi và món ăn mới nhất
            </p>
            <form className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="flex-1 bg-white"
                />
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            
            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Phương thức thanh toán</p>
              <div className="flex gap-2 flex-wrap">
                <div className="px-2 py-1 bg-white rounded border text-xs font-medium">COD</div>
                <div className="px-2 py-1 bg-white rounded border text-xs font-medium">VNPay</div>
                <div className="px-2 py-1 bg-white rounded border text-xs font-medium">MoMo</div>
                <div className="px-2 py-1 bg-white rounded border text-xs font-medium">Visa</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-amber-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>
              © {currentYear} Việt Food. Tất cả quyền được bảo lưu.
            </p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 fill-red-500 text-red-500 inline" /> in Vietnam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
