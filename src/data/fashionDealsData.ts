import { FashionOffer } from '../types';

export const ADMIN_EMAIL = 'karunapilli1526@gmail.com';
export const ADMIN_SECRET_PIN = '1526'; // Secret PIN creator override for instant Play Store access

/**
 * Partner & Affiliate Configuration
 * - Amazon Associate Tag: karu0b-21
 * - EarnKaro Publisher / User ID: 5579960
 */
export const DEFAULT_AFFILIATE_CONFIG = {
  amazonTag: 'karu0b-21',
  earnkaroUserId: '5579960',
  cuelinksPublisherId: 'kloset_publisher',
  myntraRef: '5579960',
  nykaaRef: '5579960',
  tatacliqRef: '5579960',
  flipkartRef: '5579960',
  meeshoRef: '5579960',
  westsideRef: '5579960',
  lifestyleRef: '5579960',
  ajioRef: '5579960',
  zaraRef: '5579960',
};

/**
 * Check if the user is authorized as the Creator / Admin
 */
export function isUserAdmin(email?: string | null, customPin?: string | null): boolean {
  if (email && email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  if (customPin && customPin.trim() === ADMIN_SECRET_PIN) {
    return true;
  }
  return false;
}

/**
 * Helper to build an affiliate link with EarnKaro (r=5579960) or Amazon (tag=karu0b-21)
 */
export function buildAffiliateUrl(targetUrl: string, brandName: string): string {
  const isAmazon = /amazon\./i.test(targetUrl) || /Amazon/i.test(brandName);
  
  if (isAmazon) {
    const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    urlObj.searchParams.set('tag', DEFAULT_AFFILIATE_CONFIG.amazonTag);
    urlObj.searchParams.set('ascsubtag', `kloset_user_${DEFAULT_AFFILIATE_CONFIG.earnkaroUserId}`);
    return urlObj.toString();
  }

  // Route through EarnKaro affiliate profit bridge
  const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
  return `https://earnkaro.com/deals?r=${DEFAULT_AFFILIATE_CONFIG.earnkaroUserId}&url=${encodeURIComponent(cleanUrl)}`;
}

export const BASE_FASHION_DEALS: FashionOffer[] = [
  {
    id: 'deal_myntra_01',
    brand: 'Myntra',
    title: 'Pure Linen Relaxed Fit Resort Shirt',
    subtitle: 'High-breathability French linen blend in sand beige',
    category: 'Western & Casual',
    originalPrice: 2499,
    discountedPrice: 999,
    discountPercent: 60,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.myntra.com/shirts/roadster/resort-linen-beige', 'Myntra'),
    couponCode: 'MYNTRA500',
    tagline: '🔥 Today’s Top Trending Western Drop on Myntra',
    rating: 4.6,
    reviewsCount: 1820,
    rewardSlots: 2,
    isFeatured: true,
    trendingScore: 98,
  },
  {
    id: 'deal_nykaa_01',
    brand: 'Nykaa Fashion',
    title: 'Handcrafted Chanderi Silk Anarkali Set',
    subtitle: 'Zari embroidery detailing with organza dupatta',
    category: 'Ethnic',
    originalPrice: 6999,
    discountedPrice: 3499,
    discountPercent: 50,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.nykaafashion.com/festive-chanderi-silk-anarkali-suit', 'Nykaa Fashion'),
    couponCode: 'NYKAAEXTRA20',
    tagline: '✨ Nykaa Festive & Wedding Season Spotlight',
    rating: 4.8,
    reviewsCount: 940,
    rewardSlots: 2,
    isFeatured: true,
    trendingScore: 96,
  },
  {
    id: 'deal_tatacliq_01',
    brand: 'Tata CLiQ',
    title: 'Classic Structured Double-Breasted Blazer',
    subtitle: 'Tailored navy blue power blazer for boardroom & evening wear',
    category: 'Office & Formal',
    originalPrice: 5999,
    discountedPrice: 2899,
    discountPercent: 52,
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.tatacliq.com/luxury-navy-double-breasted-blazer', 'Tata CLiQ'),
    couponCode: 'CLIQLUXE',
    tagline: '💎 Tata CLiQ Luxury Workwear Selection',
    rating: 4.7,
    reviewsCount: 650,
    rewardSlots: 2,
    isFeatured: true,
    trendingScore: 94,
  },
  {
    id: 'deal_amazon_01',
    brand: 'Amazon Fashion',
    title: 'Minimalist Chunky Leather Sneakers',
    subtitle: 'Cloud-cushion orthopedic memory foam sole in pristine chalk white',
    category: 'Footwear',
    originalPrice: 3999,
    discountedPrice: 1799,
    discountPercent: 55,
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.amazon.in/dp/B08XYZ1234?offer=white_sneakers', 'Amazon Fashion'),
    couponCode: 'AMZNSHOE10',
    tagline: '👟 Amazon Prime Daily Lightning Fashion Deal',
    rating: 4.5,
    reviewsCount: 3420,
    rewardSlots: 2,
    isFeatured: true,
    trendingScore: 95,
  },
  {
    id: 'deal_westside_01',
    brand: 'Westside',
    title: 'Boho Floral Print Tiered Midi Dress',
    subtitle: 'Breathable rayon with smocked bodice & puff sleeves',
    category: 'Western & Casual',
    originalPrice: 2299,
    discountedPrice: 1299,
    discountPercent: 43,
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.westside.com/dresses/boho-floral-midi-dress', 'Westside'),
    couponCode: 'WESTSIDE15',
    tagline: '🌸 Westside Weekend Brunch Edition',
    rating: 4.6,
    reviewsCount: 420,
    rewardSlots: 2,
    isFeatured: false,
    trendingScore: 89,
  },
  {
    id: 'deal_flipkart_01',
    brand: 'Flipkart',
    title: 'High-Waist Wide Leg Pleated Trousers',
    subtitle: 'Korean street style drape pants with adjustable waistband',
    category: 'Western & Casual',
    originalPrice: 1999,
    discountedPrice: 699,
    discountPercent: 65,
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.flipkart.com/korean-wide-leg-trousers/p/itm12345', 'Flipkart'),
    couponCode: 'FKFASHION100',
    tagline: '⚡ Flipkart Super Value Fashion Sale',
    rating: 4.4,
    reviewsCount: 5120,
    rewardSlots: 2,
    isFeatured: false,
    trendingScore: 92,
  },
  {
    id: 'deal_meesho_01',
    brand: 'Meesho',
    title: 'Pure Cotton Hand-Block Print Saree',
    subtitle: 'Mulmul cotton with contrast unstitched blouse piece',
    category: 'Ethnic',
    originalPrice: 1499,
    discountedPrice: 449,
    discountPercent: 70,
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.meesho.com/mulmul-cotton-handblock-saree/p/xyz789', 'Meesho'),
    couponCode: 'MEESHOFIRST',
    tagline: '🛍️ Direct Artisan Value Deal on Meesho',
    rating: 4.3,
    reviewsCount: 8900,
    rewardSlots: 2,
    isFeatured: false,
    trendingScore: 88,
  },
  {
    id: 'deal_lifestyle_01',
    brand: 'Lifestyle',
    title: 'Genuine Leather Crossbody Saddle Bag',
    subtitle: 'Brass buckle hardware with multi-compartment zip storage',
    category: 'Accessories',
    originalPrice: 3499,
    discountedPrice: 1699,
    discountPercent: 51,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.lifestylestores.com/bags/leather-saddle-crossbody', 'Lifestyle'),
    couponCode: 'LIFEEXTRA15',
    tagline: '👜 Lifestyle End of Season Accessory Steal',
    rating: 4.7,
    reviewsCount: 310,
    rewardSlots: 2,
    isFeatured: false,
    trendingScore: 91,
  },
  {
    id: 'deal_ajio_01',
    brand: 'Ajio',
    title: 'Indigo Dyed Heritage Kurta with Nehru Jacket',
    subtitle: '100% natural organic cotton with mandarin collar',
    category: 'Ethnic',
    originalPrice: 4299,
    discountedPrice: 1999,
    discountPercent: 53,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.ajio.com/men-indigo-heritage-kurta-jacket/p/460123', 'Ajio'),
    couponCode: 'AJIOMANIA',
    tagline: '🎨 Ajio Indie Handcraft & Heritage Spotlight',
    rating: 4.8,
    reviewsCount: 780,
    rewardSlots: 2,
    isFeatured: true,
    trendingScore: 95,
  },
  {
    id: 'deal_zara_01',
    brand: 'Zara',
    title: 'Oversized Trench Coat with Tortoiseshell Buttons',
    subtitle: 'Water-repellent structured gabardine fabric',
    category: 'Office & Formal',
    originalPrice: 8990,
    discountedPrice: 5990,
    discountPercent: 33,
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.zara.com/in/en/oversized-trench-coat-p012345.html', 'Zara'),
    couponCode: 'ZARALIMITED',
    tagline: '👑 International Runway Must-Have',
    rating: 4.9,
    reviewsCount: 1450,
    rewardSlots: 2,
    isFeatured: false,
    trendingScore: 97,
  },
];

/**
 * Dynamic Trending Fashion Catalog Pool (Auto-Generated Drops)
 */
export const AUTO_ROTATING_DROPS_POOL: FashionOffer[] = [
  {
    id: 'auto_myntra_drop_02',
    brand: 'Myntra',
    title: 'Oversized Vintage Washed Graphic Sweatshirt',
    subtitle: 'Heavyweight 380 GSM loopback cotton fleece in washed sage',
    category: 'Western & Casual',
    originalPrice: 2999,
    discountedPrice: 1199,
    discountPercent: 60,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.myntra.com/sweatshirts/oversized-vintage-graphic', 'Myntra'),
    couponCode: 'WINTER500',
    tagline: '🔥 Myntra Live Trending Streetwear Drop',
    rating: 4.7,
    reviewsCount: 2130,
    rewardSlots: 2,
    isFeatured: true,
    trendingScore: 96,
  },
  {
    id: 'auto_amazon_drop_02',
    brand: 'Amazon Fashion',
    title: 'Polarized Acetate Cat-Eye Sunglasses',
    subtitle: '100% UV400 protection with gold metal temple accent',
    category: 'Accessories',
    originalPrice: 2499,
    discountedPrice: 799,
    discountPercent: 68,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.amazon.in/dp/B09SUNGL01?offer=sunglasses', 'Amazon Fashion'),
    couponCode: 'AMZNEYE15',
    tagline: '🕶️ Amazon Prime Fashion Steal of the Day',
    rating: 4.6,
    reviewsCount: 4210,
    rewardSlots: 2,
    isFeatured: false,
    trendingScore: 93,
  },
  {
    id: 'auto_nykaa_drop_02',
    brand: 'Nykaa Fashion',
    title: 'Embroidered Mirror-Work Chikankari Kurti',
    subtitle: 'Soft georgette with matching modal slip in pastel lavender',
    category: 'Ethnic',
    originalPrice: 3499,
    discountedPrice: 1599,
    discountPercent: 54,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.nykaafashion.com/chikankari-georgette-kurti-lavender', 'Nykaa Fashion'),
    couponCode: 'NYKAAETHNIC',
    tagline: '✨ Nykaa Royal Handcrafted Edition',
    rating: 4.8,
    reviewsCount: 1120,
    rewardSlots: 2,
    isFeatured: true,
    trendingScore: 97,
  },
  {
    id: 'auto_ajio_drop_02',
    brand: 'Ajio',
    title: 'Chelsea Leather Ankle Boots with Lug Sole',
    subtitle: 'Waterproof full-grain burnished leather with elasticated side gusset',
    category: 'Footwear',
    originalPrice: 5999,
    discountedPrice: 2499,
    discountPercent: 58,
    imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80',
    affiliateUrl: buildAffiliateUrl('https://www.ajio.com/footwear-leather-chelsea-boots/p/890456', 'Ajio'),
    couponCode: 'BOOTS20',
    tagline: '🥾 Ajio Premium Footwear Season Pick',
    rating: 4.7,
    reviewsCount: 890,
    rewardSlots: 2,
    isFeatured: false,
    trendingScore: 94,
  },
];

export const FASHION_DEALS_DATA: FashionOffer[] = [...BASE_FASHION_DEALS];

const STORAGE_KEY_CUSTOM_DEALS = 'kloset_custom_fashion_deals';
const STORAGE_KEY_ADMIN_PIN = 'kloset_admin_creator_pin';

export function getStoredAdminPin(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ADMIN_PIN);
  } catch {
    return null;
  }
}

export function saveAdminPin(pin: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_PIN, pin);
  } catch (err) {
    console.error('Failed to save admin PIN:', err);
  }
}

export function clearAdminPin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_PIN);
  } catch (err) {
    console.error('Failed to clear admin PIN:', err);
  }
}

/**
 * Get all active fashion deals (Cloud Firestore + Local Custom Added + Base)
 */
export function getActiveFashionDeals(cloudDeals?: FashionOffer[]): FashionOffer[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_DEALS);
    const customDeals: FashionOffer[] = saved ? JSON.parse(saved) : [];
    
    // Merge cloud deals, local custom deals, and base catalog
    const all = [...(cloudDeals || []), ...customDeals, ...BASE_FASHION_DEALS];
    const seen = new Set<string>();
    return all.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  } catch (err) {
    return cloudDeals && cloudDeals.length > 0 ? cloudDeals : BASE_FASHION_DEALS;
  }
}

/**
 * Add a custom user-defined fashion deal with automated EarnKaro/Amazon affiliate wrapping
 */
export function addCustomFashionDeal(deal: Omit<FashionOffer, 'id' | 'affiliateUrl'> & { rawUrl: string }): FashionOffer {
  const newId = `custom_deal_${Date.now()}`;
  const generatedAffiliateUrl = buildAffiliateUrl(deal.rawUrl, deal.brand);

  const newDeal: FashionOffer = {
    ...deal,
    id: newId,
    affiliateUrl: generatedAffiliateUrl,
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_DEALS);
    const customOnly: FashionOffer[] = saved ? JSON.parse(saved) : [];
    const updated = [newDeal, ...customOnly];
    localStorage.setItem(STORAGE_KEY_CUSTOM_DEALS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom fashion deal locally:', err);
  }

  return newDeal;
}

/**
 * Fetch and merge dynamic daily trending drops automatically
 */
export function fetchFreshAutoTrendingDeals(currentDeals: FashionOffer[]): FashionOffer[] {
  const existingIds = new Set(currentDeals.map((d) => d.id));
  const newDropsToAdd = AUTO_ROTATING_DROPS_POOL.filter((d) => !existingIds.has(d.id));
  return [...newDropsToAdd, ...currentDeals];
}
