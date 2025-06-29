// TanStack Query optimized hook for managing product data
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { 
  fetchAllProducts, 
  fetchCategories, 
  searchProducts, 
  getFeaturedProducts,
  Product,
  ProductSearchParams 
} from '../services/productService';

// Query keys
const QUERY_KEYS = {
  products: ['products'] as const,
  categories: ['categories'] as const,
  featured: (limit?: number) => ['products', 'featured', limit] as const,
  search: (params: ProductSearchParams) => ['products', 'search', params] as const,
};

export const useProducts = () => {
  const queryClient = useQueryClient();

  // Main products query
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: fetchAllProducts,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Categories query
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Combined loading state
  const loading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  // Memoized search function with TanStack Query
  const searchProductsAsync = useCallback(async (params: ProductSearchParams) => {
    return queryClient.fetchQuery({
      queryKey: QUERY_KEYS.search(params),
      queryFn: () => searchProducts(params),
      staleTime: 5 * 60 * 1000, // 5 minutes for search results
    });
  }, [queryClient]);

  // Memoized featured products function
  const getFeaturedAsync = useCallback(async (limit?: number) => {
    return queryClient.fetchQuery({
      queryKey: QUERY_KEYS.featured(limit),
      queryFn: () => getFeaturedProducts(limit),
      staleTime: 10 * 60 * 1000, // 10 minutes for featured
    });
  }, [queryClient]);

  // Prefetch function for hover optimization
  const prefetchProduct = useCallback((productId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', productId],
      queryFn: () => import('../services/productService').then(m => m.getProductById(productId)),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  // Refresh function
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
  }, [queryClient]);

  return {
    products,
    categories,
    loading,
    error: error?.message || null,
    searchProducts: searchProductsAsync,
    getFeatured: getFeaturedAsync,
    prefetchProduct,
    refresh
  };
};

// Hook for featured products with suspense support
export const useFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: QUERY_KEYS.featured(limit),
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook for product search
export const useProductSearch = (params: ProductSearchParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.search(params),
    queryFn: () => searchProducts(params),
    enabled: !!params.search || !!params.category,
    staleTime: 5 * 60 * 1000,
  });
};