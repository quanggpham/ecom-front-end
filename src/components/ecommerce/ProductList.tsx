'use client';

import { useState, useEffect, useCallback } from 'react';
import { UtensilsCrossed, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}export function ProductList({ initialProducts, initialCategories }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [isLoading, setIsLoading] = useState(!initialProducts);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Active query parameters (triggers fetchProducts when changed)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt,desc');
  const [currentPage, setCurrentPage] = useState(0);

  // Temporary inputs (user typing but not yet submitted/applied)
  const [searchInput, setSearchInput] = useState('');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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
        page: currentPage,
        size: pageSize,
        sort: sortBy,
      };

      if (searchQuery.trim()) {
        params.name = searchQuery.trim();
      }

      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      if (minPrice.trim()) {
        params.minPrice = Number(minPrice);
      }

      if (maxPrice.trim()) {
        params.maxPrice = Number(maxPrice);
      }

      const response = await productsApi.getAll(params);
      setProducts(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalElements(response.data?.totalElements || 0);
    } catch (error) {
      // console.error('Failed to fetch products:', error);
      // toast({
      //   title: 'Lỗi',
      //   description: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.',
      //   variant: 'destructive',
      // });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentPage, sortBy, searchQuery, selectedCategory, minPrice, maxPrice, toast]);

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, initialProducts]);

  // Listen for search events from header
  useEffect(() => {
    const handleSearch = (e: CustomEvent) => {
      setSearchInput(e.detail);
      setSearchQuery(e.detail);
      setCurrentPage(0);
    };
    
    window.addEventListener('search', handleSearch as EventListener);
    return () => window.removeEventListener('search', handleSearch as EventListener);
  }, []);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(0);
  };

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setMinPrice(minPriceInput);
    setMaxPrice(maxPriceInput);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory(null);
    setMinPriceInput('');
    setMinPrice('');
    setMaxPriceInput('');
    setMaxPrice('');
    setCurrentPage(0);
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
            Hôm nay <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">có gì?</span>
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

          {/* Search, Filter Toggle and Sort Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm món ăn..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-10">
                  Tìm
                </Button>
              </form>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className={`flex items-center gap-2 h-10 px-4 transition-colors ${
                    isFilterExpanded || minPrice || maxPrice
                      ? 'border-amber-500 text-amber-600 bg-amber-50/50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Bộ lọc</span>
                  {(minPrice || maxPrice) && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-10">
                    <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
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
          </div>

          {/* Collapsible Advanced Price Filter Panel */}
          {isFilterExpanded && (
            <div className="p-5 bg-white rounded-2xl border border-amber-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <form onSubmit={handleApplyPriceFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="min-price" className="text-xs font-semibold text-gray-600">Giá tối thiểu (VND)</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="Ví dụ: 20000"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="h-10 border-gray-200 focus-visible:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-price" className="text-xs font-semibold text-gray-600">Giá tối đa (VND)</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="Ví dụ: 100000"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="h-10 border-gray-200 focus-visible:ring-amber-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-10 shadow-sm">
                    Áp dụng giá
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleClearFilters} className="text-gray-500 hover:text-gray-700 h-10">
                    Xóa tất cả lọc
                  </Button>
                </div>
              </form>

              {/* Price Presets */}
              <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-50">
                <span className="text-xs font-medium text-gray-400 mr-2">Khoảng giá nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setMinPriceInput('');
                    setMaxPriceInput('50000');
                    setMinPrice('');
                    setMaxPrice('50000');
                    setCurrentPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    !minPrice && maxPrice === '50000'
                      ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  Dưới 50k
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMinPriceInput('50000');
                    setMaxPriceInput('100000');
                    setMinPrice('50000');
                    setMaxPrice('100000');
                    setCurrentPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    minPrice === '50000' && maxPrice === '100000'
                      ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  50k - 100k
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMinPriceInput('100000');
                    setMaxPriceInput('');
                    setMinPrice('100000');
                    setMaxPrice('');
                    setCurrentPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    minPrice === '100000' && !maxPrice
                      ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  Trên 100k
                </button>
              </div>
            </div>
          )}
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
                      onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                      className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                    
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage <= 2) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
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
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                      className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
