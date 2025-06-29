// Optimized Product API Service with better error handling and fallback products
export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  // Enhanced fields for better AI demonstrations
  features?: string[];
  brand?: string;
  inStock?: boolean;
  discount?: number;
  tags?: string[];
  thumbnail?: string;
  viewers?: number;
}

export interface ProductSearchParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
}

// Enhanced cache with longer duration and better management
const productCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
let isLoading = false;
let loadingPromise: Promise<Product[]> | null = null;

// Pre-generated enhanced data to avoid runtime computation
const brandMap = new Map([
  ["men's clothing", ["StyleCraft", "UrbanEdge", "ClassicFit", "ModernMan"]],
  ["women's clothing", ["ElegantStyle", "ChicBoutique", "FashionForward", "GracefulWear"]],
  ["jewelery", ["LuxeGems", "BrilliantCraft", "PreciousDesigns", "EliteJewels"]],
  ["electronics", ["TechPro", "InnovateTech", "DigitalEdge", "SmartChoice"]]
]);

const featureMap = new Map([
  ["men's clothing", ["Premium fabric", "Comfortable fit", "Durable construction", "Easy care"]],
  ["women's clothing", ["Flattering silhouette", "High-quality materials", "Comfortable wear", "Trendy design"]],
  ["jewelery", ["Hypoallergenic materials", "Elegant design", "Durable finish", "Gift-ready packaging"]],
  ["electronics", ["Latest technology", "Energy efficient", "User-friendly interface", "Reliable performance"]]
]);

// Fallback products for AI demonstrations when requested products don't exist
const fallbackProductsMap = new Map([
  ["TS123", {
    id: "TS123",
    title: "Diamond Necklace",
    price: 899,
    description: "Stunning diamond necklace with 18k gold chain",
    category: "jewelery",
    image: "https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?w=400",
    rating: { rate: 4.9, count: 156 },
    features: ["18k Gold", "0.5 Carat Diamond", "Elegant design", "Gift box included"],
    brand: "LuxeGems",
    inStock: true,
    tags: ["luxury", "jewelry"],
    viewers: 89
  }],
  ["prod_001", {
    id: "prod_001",
    title: "Midnight Velvet Blazer",
    price: 289,
    description: "Luxurious velvet blazer with satin lapels, perfect for evening occasions",
    category: "men's clothing",
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400",
    rating: { rate: 4.8, count: 142 },
    features: ["Premium Italian velvet", "Satin peak lapels", "Fully lined", "Two button closure"],
    brand: "StyleCraft",
    inStock: true,
    tags: ["formal", "luxury"],
    viewers: 42
  }],
  ["prod_002", {
    id: "prod_002",
    title: "AuraGlow Pro Skincare Set",
    price: 156,
    description: "Complete skincare routine with vitamin C serum and retinol cream",
    category: "women's clothing",
    image: "https://images.pexels.com/photos/7625046/pexels-photo-7625046.jpeg?w=400",
    rating: { rate: 4.9, count: 238 },
    features: ["Vitamin C serum 30ml", "Hyaluronic acid moisturizer", "Retinol night cream", "SPF 50 day cream"],
    brand: "GlowBeauty",
    inStock: true,
    tags: ["skincare", "beauty"],
    viewers: 38
  }],
  ["prod_003", {
    id: "prod_003",
    title: "Quantum Wireless Earbuds",
    price: 199,
    description: "Next-gen wireless earbuds with spatial audio and 30-hour battery",
    category: "electronics",
    image: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=400",
    rating: { rate: 4.7, count: 455 },
    features: ["Spatial audio technology", "30-hour battery life", "Active noise cancellation", "IPX7 water resistance"],
    brand: "TechPro",
    inStock: true,
    tags: ["wireless", "audio"],
    viewers: 55
  }],
  ["prod_005", {
    id: "prod_005",
    title: "Swiss Chronograph Watch",
    price: 899,
    description: "Precision Swiss movement with sapphire crystal and titanium case",
    category: "jewelery",
    image: "https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?w=400",
    rating: { rate: 4.9, count: 267 },
    features: ["Swiss automatic movement", "Sapphire crystal glass", "Titanium case", "50m water resistance"],
    brand: "SwissTime",
    inStock: true,
    tags: ["luxury", "watches"],
    viewers: 67
  }]
]);

// Optimized product enhancement with memoization
const enhanceProduct = (product: any): Product => {
  const categoryBrands = brandMap.get(product.category) || ["Premium"];
  const categoryFeatures = featureMap.get(product.category) || ["High quality"];
  
  return {
    id: product.id.toString(),
    title: product.title,
    price: product.price,
    description: product.description,
    category: product.category,
    image: product.image,
    thumbnail: product.image,
    rating: product.rating,
    inStock: true,
    brand: categoryBrands[product.id % categoryBrands.length],
    features: categoryFeatures.slice(0, 3),
    tags: [product.category],
    viewers: Math.floor(Math.random() * 50) + 10,
    discount: product.id % 5 === 0 ? Math.floor(Math.random() * 20) + 10 : undefined
  };
};

// Check cache validity
const isCacheValid = (cacheKey: string): boolean => {
  const cached = productCache.get(cacheKey);
  return cached ? (Date.now() - cached.timestamp) < CACHE_DURATION : false;
};

// Optimized fetch with singleton pattern to prevent multiple requests
export const fetchAllProducts = async (): Promise<Product[]> => {
  const cacheKey = 'all_products';
  
  // Return cached data if valid
  if (isCacheValid(cacheKey)) {
    return productCache.get(cacheKey)!.data;
  }

  // If already loading, return the existing promise
  if (isLoading && loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  isLoading = true;
  loadingPromise = (async () => {
    try {
      console.log('🔄 Fetching products from API...');
      const response = await fetch('https://fakestoreapi.com/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      const enhancedProducts = products.map(enhanceProduct);
      
      // Add fallback products to the mix
      const fallbackProducts = Array.from(fallbackProductsMap.values());
      const allProducts = [...enhancedProducts, ...fallbackProducts];
      
      // Cache the results
      productCache.set(cacheKey, {
        data: allProducts,
        timestamp: Date.now()
      });
      
      console.log('✅ Fetched and cached', allProducts.length, 'products');
      return allProducts;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return getFallbackProducts();
    } finally {
      isLoading = false;
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

// Optimized category fetch
export const fetchCategories = async (): Promise<string[]> => {
  const cacheKey = 'categories';
  
  if (isCacheValid(cacheKey)) {
    return productCache.get(cacheKey)!.data;
  }

  try {
    const response = await fetch('https://fakestoreapi.com/products/categories');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    
    productCache.set(cacheKey, {
      data: categories,
      timestamp: Date.now()
    });
    
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    const fallbackCategories = ['electronics', 'jewelery', "men's clothing", "women's clothing"];
    
    productCache.set(cacheKey, {
      data: fallbackCategories,
      timestamp: Date.now()
    });
    
    return fallbackCategories;
  }
};

// Optimized search with client-side filtering
export const searchProducts = async (params: ProductSearchParams): Promise<Product[]> => {
  const allProducts = await fetchAllProducts();
  
  let filtered = allProducts;
  
  // Filter by category
  if (params.category) {
    filtered = filtered.filter(p => 
      p.category.toLowerCase() === params.category!.toLowerCase()
    );
  }
  
  // Filter by price range
  if (params.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= params.minPrice!);
  }
  
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= params.maxPrice!);
  }
  
  // Search in title and description
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      (p.features && p.features.some(f => f.toLowerCase().includes(searchTerm)))
    );
  }
  
  // Apply limit
  if (params.limit) {
    filtered = filtered.slice(0, params.limit);
  }
  
  return filtered;
};

// Enhanced product by ID fetch with fallback support
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    console.log('🔍 Looking for product ID:', id);
    
    // First check fallback products for AI-requested items
    if (fallbackProductsMap.has(id)) {
      console.log('✅ Found fallback product for ID:', id);
      return fallbackProductsMap.get(id)!;
    }
    
    // Then try to get from cached products
    const allProducts = await fetchAllProducts();
    const product = allProducts.find(p => p.id === id);
    if (product) {
      console.log('✅ Found product in cache for ID:', id);
      return product;
    }

    // If not in cache, try to fetch directly from API
    console.log('🌐 Fetching product from API for ID:', id);
    const response = await fetch(`https://fakestoreapi.com/products/${id}`);
    
    if (!response.ok) {
      console.warn(`⚠️  API returned ${response.status} for product ID: ${id}`);
      return createDynamicFallbackProduct(id);
    }
    
    const text = await response.text();
    if (!text.trim()) {
      console.warn(`⚠️  Empty response for product ID: ${id}`);
      return createDynamicFallbackProduct(id);
    }
    
    const productData = JSON.parse(text);
    const enhancedProduct = enhanceProduct(productData);
    console.log('✅ Successfully fetched and enhanced product:', enhancedProduct.title);
    return enhancedProduct;
    
  } catch (error) {
    console.error('❌ Error fetching product by ID:', error);
    return createDynamicFallbackProduct(id);
  }
};

// Create a dynamic fallback product when AI requests non-existent products
const createDynamicFallbackProduct = (id: string): Product => {
  console.log('🎭 Creating dynamic fallback product for ID:', id);
  
  // Generate product based on ID pattern
  const categories = ['electronics', 'jewelery', "men's clothing", "women's clothing"];
  const category = categories[id.length % categories.length];
  
  const productNames = {
    'electronics': ['Smart Watch', 'Wireless Speaker', 'Gaming Headset', 'Tablet'],
    'jewelery': ['Diamond Ring', 'Gold Bracelet', 'Pearl Earrings', 'Silver Necklace'],
    "men's clothing": ['Casual Shirt', 'Dress Pants', 'Leather Jacket', 'Polo Shirt'],
    "women's clothing": ['Summer Dress', 'Blouse', 'Cardigan', 'Skirt']
  };
  
  const names = productNames[category as keyof typeof productNames];
  const name = names[id.charCodeAt(0) % names.length];
  
  return {
    id: id,
    title: name,
    price: Math.floor(Math.random() * 200) + 50,
    description: `High-quality ${name.toLowerCase()} perfect for any occasion`,
    category: category,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400",
    thumbnail: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400",
    rating: { rate: 4.5, count: Math.floor(Math.random() * 200) + 50 },
    features: ["High quality", "Great value", "Customer favorite"],
    brand: "TalkShop",
    inStock: true,
    tags: [category],
    viewers: Math.floor(Math.random() * 50) + 10
  };
};

// Optimized featured products
export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  const allProducts = await fetchAllProducts();
  
  // Simple sort by rating and return top products
  return allProducts
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, limit);
};

// Enhanced fallback products
const getFallbackProducts = (): Product[] => {
  return Array.from(fallbackProductsMap.values()).concat([
    {
      id: "fallback_1",
      title: "Premium Cotton T-Shirt",
      price: 29.99,
      description: "Comfortable cotton t-shirt",
      category: "men's clothing",
      image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400",
      thumbnail: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400",
      rating: { rate: 4.5, count: 120 },
      features: ["100% cotton", "Comfortable fit", "Machine washable"],
      brand: "StyleCraft",
      inStock: true,
      tags: ["casual"],
      viewers: 25
    },
    {
      id: "fallback_2",
      title: "Wireless Headphones",
      price: 79.99,
      description: "High-quality wireless headphones",
      category: "electronics",
      image: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=400",
      thumbnail: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=400",
      rating: { rate: 4.8, count: 89 },
      features: ["Wireless", "Noise cancellation", "20-hour battery"],
      brand: "TechPro",
      inStock: true,
      tags: ["wireless"],
      viewers: 42
    }
  ]);
};

// Clear cache function for debugging
export const clearProductCache = () => {
  productCache.clear();
  console.log('🗑️ Product cache cleared');
};