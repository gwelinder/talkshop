export const categories = [
  { name: 'Fashion', icon: '👗', count: 245 },
  { name: 'Beauty', icon: '💄', count: 189 },
  { name: 'Tech', icon: '📱', count: 156 },
  { name: 'Home', icon: '🏠', count: 201 },
  { name: 'Luxury', icon: '💎', count: 78 }
];

export const products = [
  {
    id: "prod_001",
    name: "Midnight Velvet Blazer",
    category: "Fashion",
    price: 289,
    description: "Luxurious velvet blazer with satin lapels, perfect for evening occasions",
    thumbnail: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400",
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=800",
    rating: 4.8,
    viewers: 42,
    features: ["Premium Italian velvet", "Satin peak lapels", "Fully lined", "Two button closure", "Inside pockets"],
    relatedProducts: ["prod_006", "prod_007"]
  },
  {
    id: "prod_002",
    name: "AuraGlow Pro Skincare Set",
    category: "Beauty",
    price: 156,
    description: "Complete skincare routine with vitamin C serum and retinol cream",
    thumbnail: "https://images.pexels.com/photos/7625046/pexels-photo-7625046.jpeg?w=400",
    image: "https://images.pexels.com/photos/7625046/pexels-photo-7625046.jpeg?w=800",
    rating: 4.9,
    viewers: 38,
    features: ["Vitamin C serum 30ml", "Hyaluronic acid moisturizer", "Retinol night cream", "SPF 50 day cream", "Jade roller included"],
    relatedProducts: ["prod_008", "prod_009"]
  },
  {
    id: "prod_003",
    name: "Quantum Wireless Earbuds",
    category: "Tech",
    price: 199,
    description: "Next-gen wireless earbuds with spatial audio and 30-hour battery",
    thumbnail: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=400",
    image: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=800",
    rating: 4.7,
    viewers: 55,
    features: ["Spatial audio technology", "30-hour battery life", "Active noise cancellation", "IPX7 water resistance", "Wireless charging case"],
    relatedProducts: ["prod_010", "prod_011"]
  },
  {
    id: "prod_004",
    name: "Artisan Ceramic Vase Collection",
    category: "Home",
    price: 89,
    description: "Hand-crafted ceramic vases in modern minimalist design",
    thumbnail: "https://images.pexels.com/photos/1029896/pexels-photo-1029896.jpeg?w=400",
    image: "https://images.pexels.com/photos/1029896/pexels-photo-1029896.jpeg?w=800",
    rating: 4.6,
    viewers: 23,
    features: ["Hand-thrown ceramic", "Minimalist design", "Set of 3 sizes", "Glazed finish", "Drainage holes"],
    relatedProducts: ["prod_012", "prod_013"]
  },
  {
    id: "prod_005",
    name: "Swiss Chronograph Watch",
    category: "Luxury",
    price: 899,
    description: "Precision Swiss movement with sapphire crystal and titanium case",
    thumbnail: "https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?w=400",
    image: "https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?w=800",
    rating: 4.9,
    viewers: 67,
    features: ["Swiss automatic movement", "Sapphire crystal glass", "Titanium case", "50m water resistance", "Leather strap"],
    relatedProducts: ["prod_014", "prod_015"]
  },
  {
    id: "prod_006",
    name: "Silk Evening Dress",
    category: "Fashion",
    price: 345,
    description: "Elegant silk dress with hand-beaded details",
    thumbnail: "https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?w=400",
    image: "https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?w=800",
    rating: 4.8,
    viewers: 31,
    features: ["100% silk fabric", "Hand-beaded details", "A-line silhouette", "Hidden zipper", "Dry clean only"],
    relatedProducts: ["prod_001", "prod_007"]
  },
  {
    id: "prod_007",
    name: "Designer Leather Handbag",
    category: "Fashion",
    price: 425,
    description: "Italian leather handbag with gold hardware",
    thumbnail: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=400",
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=800",
    rating: 4.7,
    viewers: 45,
    features: ["Italian leather", "Gold-tone hardware", "Multiple compartments", "Adjustable strap", "Dust bag included"],
    relatedProducts: ["prod_001", "prod_006"]
  },
  {
    id: "prod_008",
    name: "Platinum Face Serum",
    category: "Beauty",
    price: 224,
    description: "Anti-aging serum with platinum peptides and collagen",
    thumbnail: "https://images.pexels.com/photos/5938436/pexels-photo-5938436.jpeg?w=400",
    image: "https://images.pexels.com/photos/5938436/pexels-photo-5938436.jpeg?w=800",
    rating: 4.9,
    viewers: 29,
    features: ["Platinum peptides", "Marine collagen", "Hyaluronic acid", "Anti-aging formula", "Dropper bottle"],
    relatedProducts: ["prod_002", "prod_009"]
  }
];