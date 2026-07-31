// src/data/products.dummy.ts
import { Product } from '@/types/product';

export const dummyProducts: Product[] = [
  // ========== DESKTOPS ==========
  {
    _id: '1',
    name: 'Intel Core i9 Gaming Beast',
    slug: 'intel-core-i9-gaming-beast',
    description: 'Ultimate gaming desktop with Intel Core i9-13900K, RTX 4090.',
    price: 285000,
    discountPrice: 259000,
    category: 'desktops',
    path: ['desktops', 'gaming', 'intel', 'core-i9'], // 4 levels deep!
    images: ['https://placehold.co/600x400/1a1a2e/white?text=i9+Gaming'],
    stock: 5,
    averageRating: 4.9,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'AMD Ryzen 9 Gaming Monster',
    slug: 'amd-ryzen-9-gaming-monster',
    description: 'Top-tier gaming desktop with AMD Ryzen 9 7950X, RX 7900 XTX.',
    price: 265000,
    discountPrice: 239000,
    category: 'desktops',
    path: ['desktops', 'gaming', 'ryzen', 'ryzen-9'],
    images: ['https://placehold.co/600x400/1b1b2f/white?text=Ryzen+9+Gaming'],
    stock: 4,
    averageRating: 4.8,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Apple iMac 24" M3 (AI Ready)',
    slug: 'apple-imac-24-m3-ai',
    description: 'All-in-one desktop with Apple M3 chip, 16GB RAM.',
    price: 185000,
    discountPrice: 169000,
    category: 'desktops',
    path: ['desktops', 'all-in-one', 'apple'],
    images: ['https://placehold.co/600x400/4a4a4a/white?text=iMac+M3'],
    stock: 3,
    averageRating: 4.9,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ========== LAPTOPS ==========
  {
    _id: '4',
    name: 'ASUS ROG Strix G16 (2024)',
    slug: 'asus-rog-strix-g16',
    description:
      'Gaming laptop with Intel Core i9-14900HX, RTX 4080, 32GB DDR5.',
    price: 215000,
    discountPrice: 199000,
    category: 'laptops',
    path: ['laptops', 'gaming', 'asus', 'rog'],
    images: ['https://placehold.co/600x400/2d2d2d/white?text=ROG+Strix+G16'],
    stock: 6,
    averageRating: 4.7,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'MacBook Pro 14" M3 Pro',
    slug: 'macbook-pro-14-m3-pro',
    description: 'Professional laptop with M3 Pro chip, 18GB RAM, 1TB SSD.',
    price: 245000,
    discountPrice: 229000,
    category: 'laptops',
    path: ['laptops', 'ultrabook', 'apple', 'macbook-pro'],
    images: ['https://placehold.co/600x400/5c5c5c/white?text=MacBook+Pro'],
    stock: 8,
    averageRating: 4.8,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'Dell XPS 16 (Intel Ultra 9)',
    slug: 'dell-xps-16-ultra-9',
    description:
      'Premium ultrabook with Intel Core Ultra 9, 32GB RAM, 4K OLED.',
    price: 175000,
    discountPrice: 159000,
    category: 'laptops',
    path: ['laptops', 'ultrabook', 'dell', 'xps'],
    images: ['https://placehold.co/600x400/3a3a3a/white?text=Dell+XPS+16'],
    stock: 5,
    averageRating: 4.6,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ========== COMPONENTS - GPU ==========
  {
    _id: '7',
    name: 'NVIDIA RTX 4090 24GB',
    slug: 'nvidia-rtx-4090-24gb',
    description: 'Flagship gaming GPU with 24GB GDDR6X, 16384 CUDA cores.',
    price: 185000,
    discountPrice: 169000,
    category: 'components',
    path: ['components', 'gpu', 'nvidia', 'rtx-4090'],
    images: ['https://placehold.co/600x400/1a1a2e/white?text=RTX+4090'],
    stock: 3,
    averageRating: 4.9,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '8',
    name: 'AMD Radeon RX 7900 XTX',
    slug: 'amd-radeon-rx-7900-xtx',
    description: 'High-end AMD GPU with 24GB GDDR6, 6144 stream processors.',
    price: 135000,
    discountPrice: 119000,
    category: 'components',
    path: ['components', 'gpu', 'amd', 'rx-7900xtx'],
    images: ['https://placehold.co/600x400/1b1b2f/white?text=RX+7900+XTX'],
    stock: 4,
    averageRating: 4.7,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '9',
    name: 'ASUS TUF RTX 4070 Ti SUPER',
    slug: 'asus-tuf-rtx-4070-ti-super',
    description: 'Mid-range gaming GPU with 16GB GDDR6X, DLSS 3 support.',
    price: 95000,
    discountPrice: 84900,
    category: 'components',
    path: ['components', 'gpu', 'nvidia', 'rtx-4070', 'asus'], // 5 levels deep!
    images: ['https://placehold.co/600x400/0f3460/white?text=RTX+4070+Ti'],
    stock: 10,
    averageRating: 4.5,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ========== COMPONENTS - CPU ==========
  {
    _id: '10',
    name: 'Intel Core i9-14900K',
    slug: 'intel-core-i9-14900k',
    description: 'Intel flagship CPU with 24 cores, 32 threads, 6.0GHz boost.',
    price: 68000,
    discountPrice: 59900,
    category: 'components',
    path: ['components', 'cpu', 'intel', 'core-i9'],
    images: ['https://placehold.co/600x400/2b2b2b/white?text=i9-14900K'],
    stock: 15,
    averageRating: 4.8,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '11',
    name: 'AMD Ryzen 9 7950X',
    slug: 'amd-ryzen-9-7950x',
    description: 'AMD flagship CPU with 16 cores, 32 threads, 5.7GHz boost.',
    price: 62000,
    discountPrice: 54900,
    category: 'components',
    path: ['components', 'cpu', 'amd', 'ryzen-9'],
    images: ['https://placehold.co/600x400/3c3c3c/white?text=Ryzen+9+7950X'],
    stock: 12,
    averageRating: 4.7,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ========== MONITORS ==========
  {
    _id: '12',
    name: 'Samsung Odyssey G9 (49" Curved)',
    slug: 'samsung-odyssey-g9',
    description: '49" 240Hz curved gaming monitor, 5120x1440, HDR1000.',
    price: 165000,
    discountPrice: 149000,
    category: 'monitors',
    path: ['monitors', 'gaming', 'samsung', 'odyssey'],
    images: [
      'https://placehold.co/600x400/1a1a2e/white?text=Samsung+Odyssey+G9',
    ],
    stock: 2,
    averageRating: 4.9,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '13',
    name: 'LG UltraGear 27" 4K',
    slug: 'lg-ultragear-27-4k',
    description: '27" 4K IPS monitor, 144Hz, G-Sync compatible, HDR400.',
    price: 75000,
    discountPrice: 68900,
    category: 'monitors',
    path: ['monitors', '4k', 'lg', 'ultragear'],
    images: ['https://placehold.co/600x400/16213e/white?text=LG+UltraGear+4K'],
    stock: 8,
    averageRating: 4.6,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ========== PHONES ==========
  {
    _id: '14',
    name: 'iPhone 16 Pro Max (1TB)',
    slug: 'iphone-16-pro-max-1tb',
    description: 'Apple flagship with A18 Pro chip, 6.9" OLED, 5x zoom camera.',
    price: 185000,
    discountPrice: 169000,
    category: 'phones',
    path: ['phones', 'apple', 'iphone', 'pro-max'],
    images: [
      'https://placehold.co/600x400/4a4a4a/white?text=iPhone+16+Pro+Max',
    ],
    stock: 10,
    averageRating: 4.9,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '15',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description:
      'Android flagship with Snapdragon 8 Gen 3, 200MP camera, S-Pen.',
    price: 135000,
    discountPrice: 119000,
    category: 'phones',
    path: ['phones', 'samsung', 'galaxy-s', 'ultra'],
    images: ['https://placehold.co/600x400/3a3a5c/white?text=S24+Ultra'],
    stock: 12,
    averageRating: 4.8,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ========== TABLETS ==========
  {
    _id: '16',
    name: 'iPad Pro 13" M4 (1TB)',
    slug: 'ipad-pro-13-m4',
    description: 'Apple tablet with M4 chip, Ultra Retina XDR display, 5G.',
    price: 165000,
    discountPrice: 149000,
    category: 'tablets',
    path: ['tablets', 'apple', 'ipad-pro'],
    images: ['https://placehold.co/600x400/5c5c5c/white?text=iPad+Pro+M4'],
    stock: 6,
    averageRating: 4.9,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '17',
    name: 'Samsung Galaxy Tab S9 Ultra',
    slug: 'samsung-galaxy-tab-s9-ultra',
    description: 'Android tablet with 14.6" AMOLED, Snapdragon 8 Gen 2, S-Pen.',
    price: 115000,
    discountPrice: 99900,
    category: 'tablets',
    path: ['tablets', 'samsung', 'galaxy-tab'],
    images: ['https://placehold.co/600x400/6a6a6a/white?text=Tab+S9+Ultra'],
    stock: 5,
    averageRating: 4.7,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ========== GAMING ==========
  {
    _id: '18',
    name: 'PlayStation 5 Slim (Digital)',
    slug: 'ps5-slim-digital',
    description:
      'Sony PS5 Slim Digital Edition, 1TB SSD, DualSense controller.',
    price: 55000,
    discountPrice: 49900,
    category: 'gaming',
    path: ['gaming', 'console', 'playstation', 'ps5'],
    images: ['https://placehold.co/600x400/1a1a2e/white?text=PS5+Slim'],
    stock: 15,
    averageRating: 4.8,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '19',
    name: 'Xbox Series X 1TB',
    slug: 'xbox-series-x-1tb',
    description: 'Microsoft Xbox Series X, 4K Gaming, 1TB SSD, Quick Resume.',
    price: 58000,
    discountPrice: 52900,
    category: 'gaming',
    path: ['gaming', 'console', 'xbox', 'series-x'],
    images: ['https://placehold.co/600x400/1b1b2f/white?text=Xbox+Series+X'],
    stock: 10,
    averageRating: 4.7,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ========== NETWORKING ==========
  {
    _id: '20',
    name: 'TP-Link Archer AX73 (WiFi 6)',
    slug: 'tp-link-archer-ax73',
    description: 'AX5400 Dual-Band WiFi 6 Router, 8 antennas, OFDMA.',
    price: 9500,
    discountPrice: 8490,
    category: 'networking',
    path: ['networking', 'routers', 'wifi-6', 'tp-link'],
    images: ['https://placehold.co/600x400/3c3c3c/white?text=Archer+AX73'],
    stock: 25,
    averageRating: 4.4,
    ratings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================
// 🔥 UNIVERSAL FILTER FUNCTION (Works with ANY nested path)
// ============================================================
export const filterProductsByPath = (
  products: Product[],
  slugs: string[]
): Product[] => {
  if (!slugs || slugs.length === 0) {
    // No slug = show everything or main categories (your choice)
    return products;
  }

  // Filter products where the user's slug path is a PREFIX of the product's path
  // Example: user wants ['components', 'gpu'] -> matches product.path that starts with ['components', 'gpu']
  // Example: user wants ['components', 'gpu', 'nvidia'] -> matches product.path starting with that
  return products.filter((product) => {
    // Check if product.path is long enough
    if (product.path.length < slugs.length) return false;

    // Check every segment matches
    for (let i = 0; i < slugs.length; i++) {
      if (product.path[i].toLowerCase() !== slugs[i].toLowerCase()) {
        return false;
      }
    }
    return true;
  });
};

// ============================================================
// 📍 Generate Page Title from Slug
// ============================================================
export const getTitleFromSlug = (slugs: string[]): string => {
  if (!slugs || slugs.length === 0) return 'All Products';

  const titleMap: Record<string, string> = {
    desktops: 'Desktops',
    laptops: 'Laptops',
    components: 'Components',
    monitors: 'Monitors',
    phones: 'Phones',
    tablets: 'Tablets',
    gaming: 'Gaming',
    networking: 'Networking',
    accessories: 'Accessories',
    // Add more as needed
  };

  // Capitalize each slug and join with " > "
  const capitalized = slugs.map(
    (slug) =>
      titleMap[slug] ||
      slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
  );

  return capitalized.join(' > ');
};

// Get a single product by slug
export const getProductBySlug = (slug: string): Product | undefined => {
  return dummyProducts.find((p) => p.slug === slug);
};

// Get related products (same category, or same sub-category, excluding current product)
export const getRelatedProducts = (
  product: Product,
  limit: number = 4
): Product[] => {
  return dummyProducts
    .filter((p) => p._id !== product._id && p.category === product.category)
    .slice(0, limit);
};
