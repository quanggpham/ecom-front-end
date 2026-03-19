'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Layers,
  ArrowUpRight,
  BarChart3,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statisticsApi, productsApi, categoriesApi, ordersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { RevenueData, TopProduct, Order } from '@/types';

interface StatsOverview {
  totalOrders: number;
  totalRevenue: number;
}

export function AdminDashboard() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, revenueRes, topRes, recentRes, productsRes, categoriesRes] = await Promise.all([
          statisticsApi.getOverview(),
          statisticsApi.getRevenueByDate(),
          statisticsApi.getTopProducts(undefined, undefined, 5),
          ordersApi.getAll({ page: 1, size: 5 }),
          productsApi.getAll({ size: 1 }),
          categoriesApi.getAll(),
        ]);

        if (overviewRes.data) {
          setOverview({
            totalOrders: overviewRes.data.totalOrders || 0,
            totalRevenue: overviewRes.data.totalRevenue || 0,
          });
        }
        setRevenueData(revenueRes.data || []);
        setTopProducts(topRes.data || []);
        setRecentOrders(recentRes.data?.items || []);
        setProductCount(productsRes.data?.totalElements || 0);
        setCategoryCount(categoriesRes.data?.length || 0);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải dữ liệu dashboard. Đang hiển thị dữ liệu trống.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const statCards = [
    {
      title: 'Tổng đơn hàng',
      value: overview?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(overview?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Sản phẩm',
      value: productCount,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Danh mục',
      value: categoryCount,
      icon: Layers,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.trend && (
                      <div className="flex items-center gap-1 text-sm">
                        {stat.trendUp ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={stat.trendUp ? 'text-green-500' : 'text-red-500'}>
                          {stat.trend}
                        </span>
                        <span className="text-muted-foreground">so với tháng trước</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              Doanh thu theo ngày
            </CardTitle>
            <CardDescription>Biểu đồ doanh thu những ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : revenueData.length > 0 ? (
              <div className="h-[250px] flex items-end justify-between gap-2 pt-4">
                {revenueData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div 
                      className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-sm transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(item.revenue / maxRevenue) * 180}px`, minHeight: '2px' }}
                    />
                    <span className="text-[10px] text-muted-foreground rotate-45 mt-2 origin-left whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-[10px] p-2 rounded whitespace-nowrap z-10">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
                <p>Không có dữ liệu doanh thu</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Sản phẩm bán chạy nhất
            </CardTitle>
            <CardDescription>Top sản phẩm mang lại doanh thu cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                        {product.productImage ? (
                          <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium line-clamp-1">{product.productName}</p>
                        <p className="text-xs text-muted-foreground">{product.totalQuantity} sản phẩm đã bán</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                        Top {i + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
                <p>Chưa có dữ liệu sản phẩm</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>Các đơn hàng vừa được đặt</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8">Xem tất cả</Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-md border shadow-sm">
                        <ShoppingCart className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Đơn #{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.fullName || 'Khách hàng'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{formatCurrency(order.totalMoney)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-2">
                        {order.status}
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                <p>Không có đơn hàng gần đây</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
