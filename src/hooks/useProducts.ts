// Optimized React hook for managing product data
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchAllProducts, 
  fetchCategories, 
  searchProducts, 
  getFeaturedProducts,
  Product,
  ProductSearchParams 
} from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized load function to prevent unnecessary re-renders
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load products and categories in parallel
      const [productsData, categoriesData] = await Promise.all([
        fetchAllProducts(),
        fetchCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error loading initial product data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data only once on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Memoized search function
  const searchProductsAsync = useCallback(async (params: ProductSearchParams) => {
    try {
      const results = await searchProducts(params);
      return results;
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, []);

  // Memoized featured products function
  const getFeaturedAsync = useCallback(async (limit?: number) => {
    try {
      return await getFeaturedProducts(limit);
    } catch (err) {
      console.error('Error fetching featured products:', err);
      return [];
    }
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    searchProducts: searchProductsAsync,
    getFeatured: getFeaturedAsync,
    refresh: loadInitialData
  };
};