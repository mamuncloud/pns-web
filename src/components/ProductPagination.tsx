'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProductPaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function ProductPagination({ totalPages, currentPage }: ProductPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  // Logic to generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show neighbors of current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Link
          href={createPageURL(currentPage - 1)}
          className={cn(
            "transition-all duration-300",
            currentPage <= 1 ? "pointer-events-none opacity-50" : ""
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-2 hover:bg-primary hover:text-white hover:border-primary w-12 h-12 shadow-sm transition-all"
            disabled={currentPage <= 1}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </Button>
        </Link>

        {/* Page Numbers */}
        <div className="flex items-center gap-2 bg-[#f6f6f6] p-1.5 rounded-full shadow-inner">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 text-dark/30 font-bold">...</span>
              ) : (
                <Link href={createPageURL(page)}>
                  <Button
                    variant={currentPage === page ? "default" : "ghost"}
                    className={cn(
                      "rounded-full px-5 py-2 font-bold transition-all duration-300 min-w-[44px]",
                      currentPage === page 
                        ? "bg-primary text-white shadow-md transform scale-110" 
                        : "hover:bg-white hover:text-primary"
                    )}
                  >
                    {page}
                  </Button>
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <Link
          href={createPageURL(currentPage + 1)}
          className={cn(
            "transition-all duration-300",
            currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-2 hover:bg-primary hover:text-white hover:border-primary w-12 h-12 shadow-sm transition-all"
            disabled={currentPage >= totalPages}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </Button>
        </Link>
      </div>
      
      <p className="text-on-background/40 font-medium text-xs tracking-wider uppercase">
        Halaman {currentPage} dari {totalPages}
      </p>
    </div>
  );
}
