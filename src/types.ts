export type WardrobeMode = 'individual' | 'family';

export type ItemCondition = 'New' | 'Good' | 'Vintage' | 'Needs Repair' | 'Old';

export type ItemCategory =
  | 'Top'
  | 'Bottom'
  | 'Dress'
  | 'Outerwear'
  | 'Footwear'
  | 'Bag'
  | 'Accessory'
  | 'Jewelry'
  | 'Traditional / Ethnic'
  | 'Swimwear'
  | 'Activewear'
  | 'Sleepwear'
  | 'Other'
  | string;

export interface WearLog {
  id: string;
  date: string; // YYYY-MM-DD
  occasion: string;
  locationOrEvent?: string;
  notes?: string;
  rating?: number; // 1-5
  styledPhotoUrl?: string;
}

export interface ItemReminder {
  id: string;
  itemId: string;
  itemName: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD or datetime
  type: 'laundry' | 'dry_clean' | 'repair' | 'upcoming_event' | 'return_loan' | 'general';
  isCompleted: boolean;
  createdAt: string;
}

export interface LaundryRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemImageUrl?: string;
  serviceType: 'laundry' | 'dry_clean' | 'ironing' | 'alteration';
  cleanerName?: string;
  sentDate: string;
  expectedReturnDate?: string;
  returnedDate?: string;
  cost?: number;
  notes?: string;
  status: 'sent' | 'ready' | 'returned';
}

export interface LoanRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemImageUrl?: string;
  borrowerName: string;
  borrowerContact?: string;
  loanDate: string;
  expectedReturnDate?: string;
  returnedDate?: string;
  notes?: string;
  status: 'active' | 'returned';
}

export interface WardrobeItem {
  id: string;
  personId: string; // for family mode or 'self'
  name?: string; // Optional on upload, shown at top of page
  images: string[]; // up to 10 images (mandatory: at least 1)
  primaryImageIndex?: number;
  styledReferenceImages?: { url: string; caption?: string; date?: string; occasion?: string }[];
  category: ItemCategory;
  sectionId?: string;
  sectionName?: string;
  subSectionId?: string;
  subSectionName?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  brand?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  condition: ItemCondition;
  wearCount: number;
  lastWornDate?: string;
  location: string; // e.g. "Main Wardrobe - Top Rack", "Storage Box 1", "Bed Drawer", "Travel Bag"
  description?: string; // Unlimited text
  careInstructions?: string;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  
  // Usage history
  wearLogs?: WearLog[];
  
  // Status tracking
  isInLaundry?: boolean;
  isLoaned?: boolean;
  currentLoanId?: string;
  
  // Small business / boutique extension
  sku?: string;
  inventoryQuantity?: number;
  rentalPricePerDay?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface SubSection {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
}

export interface WardrobeSection {
  id: string;
  personId: string; // 'self' or specific family member id
  name: string;
  description?: string;
  iconName?: string; // Lucide icon name
  colorBadge?: string;
  subSections: SubSection[];
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string; // 'Self', 'Spouse', 'Son', 'Daughter', 'Mother', 'Father', etc.
  avatarUrl?: string;
  avatarColor?: string;
  colorTheme?: string;
  notes?: string;
}

export interface PackingItem {
  id: string;
  itemId?: string;
  wardrobeItemId?: string;
  customName?: string;
  category?: string;
  imageUrl?: string;
  isPacked: boolean;
  quantity?: number;
}

export interface PackingList {
  id: string;
  personId?: string;
  title: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  suitcaseName?: string;
  weather?: string;
  tripType?: 'Vacation' | 'Business' | 'Wedding / Festival' | 'Weekend Getaway' | 'Other';
  items: PackingItem[];
  isTemplate?: boolean;
  notes?: string;
  createdAt: string;
}

export interface OutfitSuggestion {
  id: string;
  title?: string;
  outfitTitle?: string;
  vibe?: string;
  description?: string;
  selectedItemIds?: string[];
  items?: WardrobeItem[];
  whyItWorks?: string;
  stylingTips?: string;
  colorHarmony?: string;
  occasion?: string;
  weather?: string;
  styleType?: 'FEMALE' | 'MALE' | 'ALL';
  dateCreated?: string;
}

export interface VoiceNoteRecord {
  id: string;
  itemId?: string;
  audioBlobUrl?: string;
  transcript: string;
  extractedTitle?: string;
  createdAt: string;
}

export interface FashionOffer {
  id: string;
  brand: 'Myntra' | 'Flipkart' | 'Nykaa Fashion' | 'Amazon Fashion' | 'Meesho' | 'Lifestyle' | 'Tata CLiQ' | 'Westside' | 'Ajio' | 'Zara' | 'H&M';
  brandLogo?: string;
  title: string;
  subtitle?: string;
  category: 'Trending' | 'Ethnic' | 'Western & Casual' | 'Footwear' | 'Accessories' | 'Office & Formal' | 'Clearance';
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  imageUrl: string;
  affiliateUrl: string;
  couponCode?: string;
  tagline: string;
  rating?: number;
  reviewsCount?: number;
  rewardSlots: number; // e.g. 2 bonus slots
  isFeatured?: boolean;
  trendingScore?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  preferredName?: string;
  email: string;
  isLoggedIn: boolean;
  authProvider?: 'email' | 'google' | 'apple' | 'guest';
  avatarUrl?: string;
  currentMode: WardrobeMode;
  activePersonId: string; // 'self' or family member ID
  isBoutiqueMode: boolean;
  boutiqueName?: string;
  currency?: string;
  hasCompletedTour: boolean;
  hasCompletedStyleProfile?: boolean;
  preferredStyleType?: 'FEMALE' | 'MALE' | 'ALL';
  defaultLocation?: string;
  bonusItemSlots?: number; // extra slots earned from ads, offers or packs
  claimedOfferIds?: string[]; // IDs of offers clicked to earn +2 slots
  planTier?: 'free' | 'expansion' | 'annual' | 'lifetime';
  customCategories?: string[];
  preferredSizes?: {
    tops?: string;
    bottoms?: string;
    shoes?: string;
    dress?: string;
  };
}
