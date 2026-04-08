'use client';

import { useState, useEffect, useCallback } from 'react';
import { UtensilsCrossed, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from './ProductCard';
import { CategoryFilter } from './CategoryFilter';
import { productsApi, categoriesApi } from '@/lib/api';
import type { Product, Category, ProductSearchParams } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProductListProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
}

export function ProductList({ initialProducts, initialCategories }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [isLoading, setIsLoading] = useState(!initialProducts);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt,desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;
  const { toast } = useToast();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    if (!initialCategories || initialCategories.length === 0) {
      fetchCategories();
    }
  }, [initialCategories]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ProductSearchParams = {
        page: currentPage, // API uses 1-indexed pages
        size: pageSize,
        sort: sortBy,
      };

      if (searchQuery) {
        params.name = searchQuery;
      }

      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      const response = await productsApi.getAll(params);
      setProducts(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalElements(response.data?.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentPage, sortBy, searchQuery, selectedCategory, toast]);

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, initialProducts]);

  // Listen for search events from header
  useEffect(() => {
    const handleSearch = (e: CustomEvent) => {
      setSearchQuery(e.detail);
      setCurrentPage(1);
    };
    
    window.addEventListener('search', handleSearch as EventListener);
    return () => window.removeEventListener('search', handleSearch as EventListener);
  }, []);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of product list
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="menu" className="py-8 sm:py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-3">
            <UtensilsCrossed className="w-4 h-4" />
            Thực đơn
          </div> */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Món ăn <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">nổi bật</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Khám phá các món ăn Việt Nam truyền thống với hương vị đậm đà, được chế biến từ nguyên liệu tươi ngon
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Filter - Horizontal */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />

          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                Tìm
              </Button>
            </form>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt,desc">Mới nhất</SelectItem>
                <SelectItem value="price,asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price,desc">Giá cao đến thấp</SelectItem>
                <SelectItem value="name,asc">Tên A-Z</SelectItem>
                <SelectItem value="name,desc">Tên Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Tìm thấy ${totalElements} món ăn`
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="relative min-h-[400px]">
          {/* Loading Overlay */}
          {isLoading && !isInitialLoad && (
            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center transition-opacity duration-300">
              <div className="bg-white p-3 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-amber-700">Đang cập nhật...</span>
              </div>
            </div>
          )}

          {isInitialLoad && isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy món ăn</h3>
              <p className="text-muted-foreground mb-4">
                Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && products.length > 0 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                    
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
