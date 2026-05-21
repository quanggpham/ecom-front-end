// API Response Types
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  items: T[];
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description: string | null;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  isActive: boolean | null;
  category: Category;
  createdAt: string;
  likeCount?: number;
  liked?: boolean;
  avgRating?: number;
  totalReviews?: number;
}

// Cart Types
export interface CartItem {
  itemId: number;
  productId: number;
  productName: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  totalAmt: number;
}

// Order Types
export interface OrderDetail {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  fullName: string;
  phoneNumber: string;
  shippingAddress: string;
  note: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subTotal: number;
  discountAmount: number;
  totalMoney: number;
  createdAt: string | null;
  orderDetails: OrderDetail[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO' | 'STRIPE' | 'SEPAY';

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  id: number;
  username: string | null;
  email: string;
  fullName: string;
  phone: string | null;
  imageUrl: string | null;
  address: string | null;
  role: 'USER' | 'ADMIN';
  createAt: string;
}

export interface UserRequest {
  username?: string;
  password?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: string;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
  fullName: string;
  phone: string;
}

export interface Address {
  id: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  district: string;
  city: string;
  isDefault: boolean;
  fullAddress: string;
}

export interface AddressRequest {
  recipientName: string;
  phone: string;
  addressLine: string;
  district: string;
  city: string;
  isDefault: boolean;
}

// Statistics Types
export interface RevenueData {
  date: string;
  revenue: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  productImage: string | null;
}

// Checkout Request
export interface CheckoutRequest {
  fullName: string;
  phoneNumber: string;
  shippingAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  code?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

// Product Search Params
export interface ProductSearchParams {
  name?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

// Import Excel Types
export interface ImportExcelResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

// Import Excel Types
export interface ImportExcelResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

// Coupon Types
export type DiscountType = 'FIXED_AMOUNT' | 'PERCENTAGE';
export type PromotionType = 'ORDER' | 'CATEGORY' | 'PRODUCT';

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number;
  promotionType: PromotionType;
  categoryId: number | null;
  productId: number | null;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  expirationDate: string;
  active: boolean;
  createdAt: string;
}

export interface CouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number;
  promotionType: PromotionType;
  categoryId: number | null;
  productId: number | null;
  minOrderValue: number;
  usageLimit: number;
  startDate: string;
  expirationDate: string;
  active: boolean;
}

// Review & Rating Types
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewStats {
  productId: number;
  avgRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface Review {
  id: number;
  productId: number;
  productName: string;
  orderItemId: number;
  userId: number;
  userName: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  reportCount: number;
  sellerReply: string | null;
  rejectionReason: string | null;
  sellerReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  stats: ReviewStats;
  reviews: PaginatedResponse<Review>;
}

export interface ReviewRequest {
  orderItemId: number;
  rating: number;
  content: string;
}

export interface ReviewableOrderItem {
  orderItemId: number;
  productId: number;
  productName: string;
  imageUrl: string | null;
  quantity: number;
}

export interface ReviewableOrder {
  orderId: number;
  status: OrderStatus;
  createdAt: string;
  items: ReviewableOrderItem[];
}

// Banner Types
export type BadgeIcon = 'FLAME' | 'STAR' | 'TAG' | 'GIFT' | 'NONE';

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  badgeText: string | null;
  badgeIcon: BadgeIcon;
  overlayColor: string | null;
  displayOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerRequest {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  badgeText?: string;
  badgeIcon?: BadgeIcon;
  overlayColor?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

// Promotion Banner Types (section #promotions trên homepage)
export interface PromotionBanner {
  id: number;
  title: string;
  discountLabel: string;
  couponCode: string | null;
  description: string | null;
  linkUrl: string | null;
  bgColor: string | null;
  displayOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
}

export interface PromotionBannerRequest {
  title: string;
  discountLabel: string;
  couponCode?: string;
  description?: string;
  linkUrl?: string;
  bgColor?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}
