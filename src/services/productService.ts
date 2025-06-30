// Enhanced Product API Service for Fashion-Only Dynamic Product Generation
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
  // Enhanced fashion-specific fields
  features?: string[];
  brand?: string;
  inStock?: boolean;
  discount?: number;
  tags?: string[];
  thumbnail?: string;
  viewers?: number;
  // New fashion-specific properties
  material?: string;
  color_options?: string[];
  size_options?: string[];
  occasion?: string[];
  style_tags?: string[];
  fit?: string;
  care_instructions?: string;
}

export interface ProductSearchParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  style?: string;
  occasion?: string;
  color?: string;
}

// Fashion-only categories
const FASHION_CATEGORIES = [
  "men's clothing",
  "women's clothing", 
  "accessories",
  "footwear",
  "bags",
  "jewelry"
];

// Enhanced cache with longer duration and better management
const productCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
let isLoading = false;
let loadingPromise: Promise<Product[]> | null = null;

// Fashion-specific brand mapping
const fashionBrandMap = new Map([
  ["men's clothing", ["StyleCraft", "UrbanEdge", "ClassicFit", "ModernMan", "Dapper & Co", "Gentleman's Choice"]],
  ["women's clothing", ["ElegantStyle", "ChicBoutique", "FashionForward", "GracefulWear", "Bella Couture", "Luxe Femme"]],
  ["accessories", ["AccessoryLux", "StyleAccents", "ChicDetails", "Refined Touch", "Statement Pieces"]],
  ["footwear", ["StepStyle", "WalkElegant", "FootFashion", "Stride & Style", "Sole Couture"]],
  ["bags", ["CarryChic", "BagCouture", "HandheldLux", "Tote & Style", "Clutch Craft"]],
  ["jewelry", ["LuxeGems", "BrilliantCraft", "PreciousDesigns", "EliteJewels", "Sparkle & Shine"]]
]);

// Fashion-specific feature mapping
const fashionFeatureMap = new Map([
  ["men's clothing", ["Premium fabric", "Tailored fit", "Wrinkle-resistant", "Breathable material", "Classic design", "Modern cut"]],
  ["women's clothing", ["Flattering silhouette", "Luxurious fabric", "Comfortable wear", "Trendy design", "Versatile styling", "Figure-enhancing"]],
  ["accessories", ["Handcrafted details", "Premium materials", "Timeless design", "Versatile styling", "Statement piece"]],
  ["footwear", ["Comfortable sole", "Premium leather", "All-day comfort", "Stylish design", "Durable construction"]],
  ["bags", ["Spacious interior", "Premium hardware", "Multiple compartments", "Durable construction", "Elegant design"]],
  ["jewelry", ["Hypoallergenic materials", "Elegant design", "Durable finish", "Gift-ready packaging", "Timeless appeal"]]
]);

// Material options for fashion items
const materialOptions = {
  "men's clothing": ["Cotton", "Wool", "Linen", "Silk", "Cashmere", "Denim", "Leather"],
  "women's clothing": ["Silk", "Cotton", "Chiffon", "Satin", "Wool", "Cashmere", "Lace", "Velvet"],
  "accessories": ["Leather", "Metal", "Fabric", "Silk", "Cotton", "Wool"],
  "footwear": ["Leather", "Suede", "Canvas", "Synthetic", "Rubber"],
  "bags": ["Leather", "Canvas", "Nylon", "Suede", "Synthetic"],
  "jewelry": ["Gold", "Silver", "Platinum", "Stainless Steel", "Titanium", "Gemstone"]
};

// Color options
const colorOptions = ["Black", "White", "Navy", "Gray", "Brown", "Beige", "Red", "Blue", "Green", "Pink", "Purple", "Yellow", "Orange"];

// Size options
const sizeOptions = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  footwear: ["6", "7", "8", "9", "10", "11", "12"],
  accessories: ["One Size", "S", "M", "L"]
};

// Occasion tags
const occasionTags = ["Casual", "Business", "Formal", "Evening", "Weekend", "Date Night", "Work", "Party", "Travel", "Vacation"];

// Style tags
const styleTags = ["Classic", "Modern", "Trendy", "Vintage", "Minimalist", "Bohemian", "Edgy", "Romantic", "Sporty", "Elegant"];

// Pexels image search mapping for fashion items
const pexelsImageMap = new Map([
  // Men's clothing
  ["shirt", "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?w=400"],
  ["blazer", "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400"],
  ["jacket", "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?w=400"],
  ["pants", "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?w=400"],
  ["jeans", "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?w=400"],
  ["suit", "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?w=400"],
  
  // Women's clothing
  ["dress", "https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?w=400"],
  ["blouse", "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400"],
  ["skirt", "https://images.pexels.com/photos/1631181/pexels-photo-1631181.jpeg?w=400"],
  ["cardigan", "https://images.pexels.com/photos/1536620/pexels-photo-1536620.jpeg?w=400"],
  ["top", "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400"],
  
  // Accessories
  ["handbag", "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=400"],
  ["purse", "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=400"],
  ["bag", "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=400"],
  ["scarf", "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400"],
  ["belt", "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?w=400"],
  ["hat", "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400"],
  
  // Footwear
  ["shoes", "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=400"],
  ["boots", "https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?w=400"],
  ["sneakers", "https://images.pexels.com/photos/1598510/pexels-photo-1598510.jpeg?w=400"],
  ["heels", "https://images.pexels.com/photos/1598511/pexels-photo-1598511.jpeg?w=400"],
  
  // Jewelry
  ["necklace", "https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?w=400"],
  ["earrings", "https://images.pexels.com/photos/1721559/pexels-photo-1721559.jpeg?w=400"],
  ["bracelet", "https://images.pexels.com/photos/1721560/pexels-photo-1721560.jpeg?w=400"],
  ["ring", "https://images.pexels.com/photos/1721561/pexels-photo-1721561.jpeg?w=400"],
  ["watch", "https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?w=400"]
]);

// Enhanced product enhancement with fashion-specific data
const enhanceProduct = (product: any): Product => {
  // Only process fashion categories
  if (!FASHION_CATEGORIES.includes(product.category)) {
    return null;
  }
  
  const categoryBrands = fashionBrandMap.get(product.category) || ["Premium Fashion"];
  const categoryFeatures = fashionFeatureMap.get(product.category) || ["High quality", "Stylish design"];
  const materials = materialOptions[product.category] || ["Premium material"];
  
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
    discount: product.id % 5 === 0 ? Math.floor(Math.random() * 20) + 10 : undefined,
    // Fashion-specific enhancements
    material: materials[Math.floor(Math.random() * materials.length)],
    color_options: colorOptions.slice(0, Math.floor(Math.random() * 4) + 2),
    size_options: product.category.includes('clothing') ? sizeOptions.clothing : 
                  product.category === 'footwear' ? sizeOptions.footwear : 
                  sizeOptions.accessories,
    occasion: occasionTags.slice(0, Math.floor(Math.random() * 3) + 1),
    style_tags: styleTags.slice(0, Math.floor(Math.random() * 3) + 1),
    fit: product.category.includes('clothing') ? ['Regular', 'Slim', 'Relaxed'][Math.floor(Math.random() * 3)] : undefined,
    care_instructions: product.category.includes('clothing') ? "Machine wash cold, tumble dry low" : "Spot clean only"
  };
};

// Check cache validity
const isCacheValid = (cacheKey: string): boolean => {
  const cached = productCache.get(cacheKey);
  return cached ? (Date.now() - cached.timestamp) < CACHE_DURATION : false;
};

// Optimized fetch with fashion-only filtering
export const fetchAllProducts = async (): Promise<Product[]> => {
  const cacheKey = 'fashion_products';
  
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
      console.log('🔄 Fetching fashion products from API...');
      const response = await fetch('https://fakestoreapi.com/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      
      // Filter and enhance only fashion products
      const fashionProducts = products
        .filter(product => FASHION_CATEGORIES.includes(product.category))
        .map(enhanceProduct)
        .filter(Boolean); // Remove null values
      
      // Add curated fashion fallback products
      const fallbackProducts = getFashionFallbackProducts();
      const allProducts = [...fashionProducts, ...fallbackProducts];
      
      // Cache the results
      productCache.set(cacheKey, {
        data: allProducts,
        timestamp: Date.now()
      });
      
      console.log('✅ Fetched and cached', allProducts.length, 'fashion products');
      return allProducts;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return getFashionFallbackProducts();
    } finally {
      isLoading = false;
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

// Fashion-only category fetch
export const fetchCategories = async (): Promise<string[]> => {
  const cacheKey = 'fashion_categories';
  
  if (isCacheValid(cacheKey)) {
    return productCache.get(cacheKey)!.data;
  }

  try {
    // Return our curated fashion categories
    const fashionCategories = FASHION_CATEGORIES;
    
    productCache.set(cacheKey, {
      data: fashionCategories,
      timestamp: Date.now()
    });
    
    return fashionCategories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return FASHION_CATEGORIES;
  }
};

// Enhanced dynamic product creation - the core of our unlimited catalog
export const createDynamicFashionProduct = (description: string, additionalParams: any = {}): Product => {
  console.log('🎭 Creating dynamic fashion product for:', description);
  
  // Parse the description to extract key information
  const lowerDesc = description.toLowerCase();
  
  // Determine category based on description
  let category = "women's clothing"; // default
  if (lowerDesc.includes('men') || lowerDesc.includes('guy') || lowerDesc.includes('masculine')) {
    category = "men's clothing";
  } else if (lowerDesc.includes('bag') || lowerDesc.includes('purse') || lowerDesc.includes('handbag')) {
    category = "bags";
  } else if (lowerDesc.includes('shoe') || lowerDesc.includes('boot') || lowerDesc.includes('sneaker') || lowerDesc.includes('heel')) {
    category = "footwear";
  } else if (lowerDesc.includes('necklace') || lowerDesc.includes('earring') || lowerDesc.includes('bracelet') || lowerDesc.includes('ring') || lowerDesc.includes('watch')) {
    category = "jewelry";
  } else if (lowerDesc.includes('scarf') || lowerDesc.includes('belt') || lowerDesc.includes('hat') || lowerDesc.includes('accessory')) {
    category = "accessories";
  }
  
  // Extract color from description
  const detectedColor = colorOptions.find(color => 
    lowerDesc.includes(color.toLowerCase())
  ) || colorOptions[Math.floor(Math.random() * colorOptions.length)];
  
  // Extract style from description
  const detectedStyle = styleTags.find(style => 
    lowerDesc.includes(style.toLowerCase())
  ) || styleTags[Math.floor(Math.random() * styleTags.length)];
  
  // Extract occasion from description
  const detectedOccasion = occasionTags.find(occasion => 
    lowerDesc.includes(occasion.toLowerCase())
  ) || occasionTags[Math.floor(Math.random() * occasionTags.length)];
  
  // Generate appropriate image based on item type
  const getImageForItem = (desc: string): string => {
    for (const [keyword, imageUrl] of pexelsImageMap.entries()) {
      if (desc.toLowerCase().includes(keyword)) {
        return imageUrl;
      }
    }
    // Default fashion image
    return "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400";
  };
  
  // Generate realistic price based on category and style
  const generatePrice = (): number => {
    const basePrices = {
      "men's clothing": [45, 120],
      "women's clothing": [35, 150],
      "accessories": [25, 80],
      "footwear": [60, 200],
      "bags": [40, 180],
      "jewelry": [30, 300]
    };
    
    const [min, max] = basePrices[category] || [30, 100];
    let price = Math.floor(Math.random() * (max - min) + min);
    
    // Premium styles cost more
    if (detectedStyle === 'Elegant' || detectedStyle === 'Classic') {
      price *= 1.3;
    }
    
    return Math.round(price);
  };
  
  const brands = fashionBrandMap.get(category) || ["StyleCraft"];
  const features = fashionFeatureMap.get(category) || ["High quality", "Stylish design"];
  const materials = materialOptions[category] || ["Premium material"];
  
  // Generate unique ID
  const id = `dynamic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create the product title from description
  const title = description.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    id,
    title,
    price: additionalParams.price || generatePrice(),
    description: additionalParams.description || `Beautiful ${description.toLowerCase()} perfect for any ${detectedOccasion.toLowerCase()} occasion`,
    category,
    image: getImageForItem(description),
    thumbnail: getImageForItem(description),
    rating: { 
      rate: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0 rating
      count: Math.floor(Math.random() * 200) + 50 
    },
    features: features.slice(0, 3),
    brand: brands[Math.floor(Math.random() * brands.length)],
    inStock: true,
    tags: [category, detectedStyle, detectedOccasion],
    viewers: Math.floor(Math.random() * 50) + 10,
    // Fashion-specific properties
    material: materials[Math.floor(Math.random() * materials.length)],
    color_options: [detectedColor, ...colorOptions.filter(c => c !== detectedColor).slice(0, 2)],
    size_options: category.includes('clothing') ? sizeOptions.clothing : 
                  category === 'footwear' ? sizeOptions.footwear : 
                  sizeOptions.accessories,
    occasion: [detectedOccasion],
    style_tags: [detectedStyle],
    fit: category.includes('clothing') ? ['Regular', 'Slim', 'Relaxed'][Math.floor(Math.random() * 3)] : undefined,
    care_instructions: category.includes('clothing') ? "Machine wash cold, tumble dry low" : "Spot clean only"
  };
};

// Enhanced search with dynamic product generation
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
  
  // Enhanced search in title, description, and fashion-specific fields
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      (p.features && p.features.some(f => f.toLowerCase().includes(searchTerm))) ||
      (p.style_tags && p.style_tags.some(s => s.toLowerCase().includes(searchTerm))) ||
      (p.occasion && p.occasion.some(o => o.toLowerCase().includes(searchTerm))) ||
      (p.material && p.material.toLowerCase().includes(searchTerm)) ||
      (p.color_options && p.color_options.some(c => c.toLowerCase().includes(searchTerm)))
    );
    
    // If no matches found, create dynamic products based on search term
    if (filtered.length === 0 && params.search) {
      console.log('🎨 No existing products found, creating dynamic products for:', params.search);
      
      // Generate 3-5 dynamic products based on the search term
      const dynamicProducts = [];
      const variations = [
        `${params.search}`,
        `${params.search} top`,
        `${params.search} dress`,
        `${params.search} jacket`,
        `${params.search} accessory`
      ];
      
      for (let i = 0; i < Math.min(4, variations.length); i++) {
        try {
          const dynamicProduct = createDynamicFashionProduct(variations[i]);
          dynamicProducts.push(dynamicProduct);
        } catch (error) {
          console.error('Error creating dynamic product:', error);
        }
      }
      
      filtered = dynamicProducts;
    }
  }
  
  // Filter by style
  if (params.style) {
    filtered = filtered.filter(p => 
      p.style_tags && p.style_tags.some(s => s.toLowerCase().includes(params.style!.toLowerCase()))
    );
  }
  
  // Filter by occasion
  if (params.occasion) {
    filtered = filtered.filter(p => 
      p.occasion && p.occasion.some(o => o.toLowerCase().includes(params.occasion!.toLowerCase()))
    );
  }
  
  // Filter by color
  if (params.color) {
    filtered = filtered.filter(p => 
      p.color_options && p.color_options.some(c => c.toLowerCase().includes(params.color!.toLowerCase()))
    );
  }
  
  // Apply limit
  if (params.limit) {
    filtered = filtered.slice(0, params.limit);
  }
  
  return filtered;
};

// Enhanced product by ID fetch with dynamic generation
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    console.log('🔍 Looking for fashion product ID:', id);
    
    // First try to get from cached products
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
      console.warn(`⚠️  API returned ${response.status} for product ID: ${id}, creating dynamic product`);
      return createDynamicFashionProduct(`Product ${id}`);
    }
    
    const text = await response.text();
    if (!text.trim()) {
      console.warn(`⚠️  Empty response for product ID: ${id}, creating dynamic product`);
      return createDynamicFashionProduct(`Product ${id}`);
    }
    
    const productData = JSON.parse(text);
    
    // Only return if it's a fashion product
    if (!FASHION_CATEGORIES.includes(productData.category)) {
      console.log('🚫 Non-fashion product, creating dynamic fashion alternative');
      return createDynamicFashionProduct(`Stylish ${productData.title}`);
    }
    
    const enhancedProduct = enhanceProduct(productData);
    console.log('✅ Successfully fetched and enhanced fashion product:', enhancedProduct.title);
    return enhancedProduct;
    
  } catch (error) {
    console.error('❌ Error fetching product by ID:', error);
    return createDynamicFashionProduct(`Fashion Item ${id}`);
  }
};

// Optimized featured products
export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  const allProducts = await fetchAllProducts();
  
  // Sort by rating and return top products
  return allProducts
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, limit);
};

// Curated fashion fallback products
const getFashionFallbackProducts = (): Product[] => {
  return [
    {
      id: "fashion_001",
      title: "Classic White Button-Down Shirt",
      price: 89,
      description: "Timeless white button-down shirt in premium cotton",
      category: "women's clothing",
      image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400",
      thumbnail: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400",
      rating: { rate: 4.8, count: 156 },
      features: ["Premium cotton", "Classic fit", "Wrinkle-resistant"],
      brand: "ElegantStyle",
      inStock: true,
      tags: ["classic", "versatile"],
      viewers: 42,
      material: "Cotton",
      color_options: ["White", "Light Blue", "Pink"],
      size_options: ["XS", "S", "M", "L", "XL"],
      occasion: ["Business", "Casual"],
      style_tags: ["Classic", "Minimalist"],
      fit: "Regular",
      care_instructions: "Machine wash cold, tumble dry low"
    },
    {
      id: "fashion_002",
      title: "Midnight Black Blazer",
      price: 189,
      description: "Sophisticated black blazer perfect for any occasion",
      category: "women's clothing",
      image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400",
      thumbnail: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400",
      rating: { rate: 4.9, count: 203 },
      features: ["Tailored fit", "Premium fabric", "Versatile styling"],
      brand: "ChicBoutique",
      inStock: true,
      tags: ["formal", "elegant"],
      viewers: 67,
      material: "Wool blend",
      color_options: ["Black", "Navy", "Gray"],
      size_options: ["XS", "S", "M", "L", "XL"],
      occasion: ["Business", "Formal", "Evening"],
      style_tags: ["Classic", "Elegant"],
      fit: "Tailored",
      care_instructions: "Dry clean only"
    },
    {
      id: "fashion_003",
      title: "Leather Crossbody Bag",
      price: 129,
      description: "Elegant leather crossbody bag with adjustable strap",
      category: "bags",
      image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=400",
      thumbnail: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=400",
      rating: { rate: 4.7, count: 89 },
      features: ["Genuine leather", "Adjustable strap", "Multiple compartments"],
      brand: "CarryChic",
      inStock: true,
      tags: ["leather", "crossbody"],
      viewers: 34,
      material: "Leather",
      color_options: ["Black", "Brown", "Tan"],
      size_options: ["One Size"],
      occasion: ["Casual", "Work", "Travel"],
      style_tags: ["Classic", "Modern"],
      care_instructions: "Spot clean only"
    }
  ];
};

// Clear cache function for debugging
export const clearProductCache = () => {
  productCache.clear();
  console.log('🗑️ Fashion product cache cleared');
};

// Export the dynamic product creation function for AI use
export { createDynamicFashionProduct };