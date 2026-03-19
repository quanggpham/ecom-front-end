'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-3 pt-1 px-1">
          {/* All categories option */}
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              'px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium border whitespace-nowrap',
              selectedCategory === null
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md shadow-amber-200 translate-y-[-1px]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600'
            )}
          >
            Tất cả
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium border whitespace-nowrap',
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md shadow-amber-200 translate-y-[-1px]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
}

// Sidebar version for larger screens
export function CategorySidebar({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-1.5">
      <h3 className="font-bold text-slate-900 mb-4 px-2 tracking-tight">Danh mục</h3>
      
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group',
          selectedCategory === null
            ? 'bg-amber-50 text-amber-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
      >
        <span>Tất cả món ăn</span>
        {selectedCategory === null && (
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        )}
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group',
            selectedCategory === category.id
              ? 'bg-amber-50 text-amber-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          <span className="truncate mr-2">{category.name}</span>
          {selectedCategory === category.id && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
        </button>
      ))}
    </div>
  );
}
