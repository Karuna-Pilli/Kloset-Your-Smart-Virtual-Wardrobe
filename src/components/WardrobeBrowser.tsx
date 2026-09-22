import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  LayoutGrid,
  List,
  MapPin,
  Tag,
  Star,
  Plus,
  ArrowUpDown,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Waves,
  HeartHandshake,
  Clock,
  Sparkle,
  Trash2,
  FolderMinus,
  Settings2,
  X,
  Palette,
  Flame,
  Gift,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import {
  WardrobeItem,
  WardrobeSection,
  ItemCategory,
  ItemCondition,
  FamilyMember,
} from '../types';
import {
  FASHION_COLORS,
  COLOR_FAMILIES,
  ColorSwatch,
  searchFashionColors,
} from '../data/fashionColors';

const DEFAULT_LOCATIONS = [
  'Master Closet - Main Rail',
  'Walk-in Wardrobe',
  'Top Shelf / Upper Storage',
  'Dresser 1st Drawer',
  'Dresser 2nd Drawer',
  'Shoe Rack / Bottom Shelf',
  'Coat Closet / Entryway',
  'Storage Box / Vacuum Bag',
  'Luggage / Travel Suitcase',
  'Laundry Hamper',
  'Everyday Hooks',
];

interface WardrobeBrowserProps {
  items: WardrobeItem[];
  sections: WardrobeSection[];
  familyMembers: FamilyMember[];
  activePersonId: string;
  onSelectItem: (item: WardrobeItem) => void;
  onOpenUpload: (bulk?: boolean) => void;
  onOpenStylist: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
  selectedSectionId?: string;
  setSelectedSectionId?: (secId: string) => void;
  onDeleteSection?: (id: string) => void;
  onManageSections?: () => void;
  onOpenFashionDeals?: () => void;
  onOpenColorContrast?: () => void;
  customCategories?: string[];
  onOpenManageCategories?: () => void;
  onToggleArchive?: (itemId: string, isArchived: boolean) => void;
  archiveTab?: 'active' | 'archived' | 'all';
  setArchiveTab?: (tab: 'active' | 'archived' | 'all') => void;
}

const DEFAULT_CATEGORIES: string[] = [
  'Top',
  'Bottom',
  'Dress',
  'Outerwear',
  'Footwear',
  'Bag',
  'Accessory',
  'Jewelry',
  'Traditional / Ethnic',
  'Swimwear',
  'Activewear',
  'Sleepwear',
  'Other',
];

const COLORS = [
  'All Colors',
  'Brown',
  'Rust / Rust Orange',
  'Maroon / Burgundy',
  'Red / Crimson',
  'Orange / Terracotta',
  'Yellow / Mustard',
  'Green / Olive / Emerald',
  'Blue / Navy / Teal',
  'Purple / Lavender / Violet',
  'Pink / Fuchsia / Rose',
  'Black',
  'Grey / Charcoal',
  'White / Cream / Beige',
  'Gold / Metallic',
];

export const WardrobeBrowser: React.FC<WardrobeBrowserProps> = ({
  items,
  sections,
  familyMembers,
  activePersonId,
  onSelectItem,
  onOpenUpload,
  onOpenStylist,
  searchQuery,
  setSearchQuery,
  selectedCategory: controlledCategory,
  setSelectedCategory: setControlledCategory,
  selectedSectionId: controlledSectionId,
  setSelectedSectionId: setControlledSectionId,
  onDeleteSection,
  onManageSections,
  onOpenFashionDeals,
  onOpenColorContrast,
  customCategories,
  onOpenManageCategories,
  onToggleArchive,
  archiveTab: controlledArchiveTab,
  setArchiveTab: setControlledArchiveTab,
}) => {
  const [internalCategory, setInternalCategory] = useState<string>('All');
  const [internalSectionId, setInternalSectionId] = useState<string>('All');

  const selectedCategory = controlledCategory !== undefined ? controlledCategory : internalCategory;
  const setSelectedCategory = setControlledCategory || setInternalCategory;

  const selectedSectionId = controlledSectionId !== undefined ? controlledSectionId : internalSectionId;
  const setSelectedSectionId = setControlledSectionId || setInternalSectionId;

  const [internalArchiveTab, setInternalArchiveTab] = useState<'active' | 'archived' | 'all'>('active');
  const archiveTab = controlledArchiveTab !== undefined ? controlledArchiveTab : internalArchiveTab;
  const setArchiveTab = setControlledArchiveTab || setInternalArchiveTab;

  const [selectedColor, setSelectedColor] = useState<string>('All Colors');
  const [isColorFilterOpen, setIsColorFilterOpen] = useState(false);
  const [colorFilterSearch, setColorFilterSearch] = useState('');
  const [colorFilterFamily, setColorFilterFamily] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedUsageFilter, setSelectedUsageFilter] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'wears_desc' | 'wears_asc' | 'name'>('recent');
  const [viewDensity, setViewDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('kloset_view_mode') as 'grid' | 'list') || 'grid';
    }
    return 'grid';
  });

  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kloset_view_mode', mode);
      } catch {}
    }
  };

  const [sectionToDelete, setSectionToDelete] = useState<WardrobeSection | null>(null);

  const activeSectionObj = useMemo(() => {
    if (selectedSectionId && selectedSectionId !== 'All' && selectedSectionId !== 'none') {
      return sections.find((s) => s.id === selectedSectionId) || null;
    }
    return null;
  }, [sections, selectedSectionId]);

  const personItems = useMemo(() => {
    return items.filter((i) => activePersonId === 'all' || i.personId === activePersonId);
  }, [items, activePersonId]);

  const activeItemsCount = useMemo(() => {
    return personItems.filter((i) => !i.isArchived).length;
  }, [personItems]);

  const archivedItemsCount = useMemo(() => {
    return personItems.filter((i) => i.isArchived).length;
  }, [personItems]);

  // Extract distinct locations (curated presets + custom user-entered locations)
  const locations = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.location && i.location.trim()) set.add(i.location.trim());
    });
    DEFAULT_LOCATIONS.forEach((loc) => set.add(loc));
    return Array.from(set);
  }, [items]);

  // Total matches across the whole wardrobe for current search query
  const totalSearchMatches = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase().trim();
    const queryTerms = q.split(/\s+/).filter(Boolean);

    return items.filter((item) => {
      if (activePersonId !== 'all' && item.personId !== activePersonId) {
        return false;
      }
      const searchableFields = [
        item.name,
        item.category,
        item.description,
        item.brand,
        item.color,
        item.colorHex,
        item.location,
        item.sectionName,
        item.subSectionName,
        item.fabric,
        item.material,
        item.occasion,
        item.season,
        item.notes,
        item.size,
        item.condition,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return queryTerms.every((term) => searchableFields.includes(term));
    }).length;
  }, [items, searchQuery, activePersonId]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Person filter
      if (activePersonId !== 'all' && item.personId !== activePersonId) {
        return false;
      }

      // Archive tab filter
      if (archiveTab === 'active' && item.isArchived) {
        return false;
      }
      if (archiveTab === 'archived' && !item.isArchived) {
        return false;
      }

      // Comprehensive search query matching across all item properties
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const queryTerms = q.split(/\s+/).filter(Boolean);

        const searchableFields = [
          item.name,
          item.category,
          item.description,
          item.brand,
          item.color,
          item.colorHex,
          item.location,
          item.sectionName,
          item.subSectionName,
          item.fabric,
          item.material,
          item.occasion,
          item.season,
          item.notes,
          item.size,
          item.condition,
          ...(item.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesTerms = queryTerms.every((term) => searchableFields.includes(term));
        if (!matchesTerms) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Section filter
      if (selectedSectionId !== 'All') {
        if (selectedSectionId === 'none' && item.sectionId) return false;
        if (selectedSectionId !== 'none' && item.sectionId !== selectedSectionId) return false;
      }

      // Color filter
      if (selectedColor !== 'All Colors') {
        const colLower = selectedColor.toLowerCase().trim();
        const itemCol = (item.color || '').toLowerCase().trim();
        const itemHex = (item.colorHex || '').toLowerCase().trim();

        // Match by family
        const matchedFamily = COLOR_FAMILIES.find(
          (f) => f.label.toLowerCase() === colLower || f.id === colLower
        );
        if (matchedFamily && matchedFamily.id !== 'all') {
          const familyColors = FASHION_COLORS.filter((c) => c.family === matchedFamily.id);
          const isFamilyMatch = familyColors.some(
            (c) =>
              itemCol.includes(c.name.toLowerCase()) ||
              c.keywords.some((k) => itemCol.includes(k.toLowerCase())) ||
              (itemHex && itemHex === c.hex.toLowerCase())
          );
          if (!isFamilyMatch && !itemCol.includes(matchedFamily.id)) {
            return false;
          }
        } else {
          // Match by specific color swatch name or keywords
          const matchedSwatch = FASHION_COLORS.find(
            (c) => c.name.toLowerCase() === colLower || c.hex.toLowerCase() === colLower
          );
          const matchesSwatch = matchedSwatch
            ? itemCol.includes(matchedSwatch.name.toLowerCase()) ||
              matchedSwatch.keywords.some((k) => itemCol.includes(k.toLowerCase())) ||
              (itemHex && itemHex === matchedSwatch.hex.toLowerCase())
            : false;

          const baseColorWords = colLower.split(/[\/\s,&]+/).filter((w) => w.length > 2);
          const matchesKeywords = baseColorWords.some((w) => itemCol.includes(w));

          if (!itemCol.includes(colLower) && !matchesSwatch && !matchesKeywords) {
            return false;
          }
        }
      }

      // Location filter
      if (selectedLocation !== 'All' && item.location !== selectedLocation) {
        return false;
      }

      // Usage filter
      if (selectedUsageFilter === 'unworn' && item.wearCount > 0) return false;
      if (selectedUsageFilter === 'frequent' && item.wearCount < 5) return false;
      if (selectedUsageFilter === 'moderate' && (item.wearCount < 1 || item.wearCount >= 5)) return false;

      // Condition filter
      if (selectedCondition !== 'All' && item.condition !== selectedCondition) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'wears_desc') {
        return b.wearCount - a.wearCount;
      }
      if (sortBy === 'wears_asc') {
        return a.wearCount - b.wearCount;
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [
    items,
    activePersonId,
    searchQuery,
    selectedCategory,
    selectedSectionId,
    selectedColor,
    selectedLocation,
    selectedUsageFilter,
    selectedCondition,
    archiveTab,
    sortBy,
  ]);

  const activePersonObj = familyMembers.find((m) => m.id === activePersonId);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSectionId('All');
    setSelectedColor('All Colors');
    setSelectedLocation('All');
    setSelectedUsageFilter('All');
    setSelectedCondition('All');
    setArchiveTab('active');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSectionId !== 'All' ||
    selectedColor !== 'All Colors' ||
    selectedLocation !== 'All' ||
    selectedUsageFilter !== 'All' ||
    selectedCondition !== 'All' ||
    archiveTab !== 'active' ||
    searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Immediate Search Feedback card right at top when searching */}
      {searchQuery.trim() !== '' && (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-4 sm:p-5 bg-amber-50/95 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    &ldquo;{searchQuery}&rdquo; does not exist in your wardrobe records
                  </h3>
                  <p className="text-xs text-amber-800/90 mt-0.5">
                    No items match &ldquo;{searchQuery}&rdquo; in name, brand, color, category, tags, or location. You can add it now.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  Clear Search
                </button>
                <button
                  type="button"
                  onClick={() => onOpenUpload(false)}
                  className="px-3.5 py-1.5 bg-[#39402D] hover:bg-black text-[#F0CAAF] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 border border-[#C89452]"
                >
                  + Add &ldquo;{searchQuery}&rdquo; to Closet
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#FAF2EC] border border-[#ECDACF] rounded-2xl flex items-center justify-between text-xs text-[#39402D] animate-fade-in">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#C89452]" />
                <span>
                  Found <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'item' : 'items'} matching &ldquo;{searchQuery}&rdquo;
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-[#C89452] hover:text-[#39402D] font-bold underline cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hero Action Banner: Ultra-compact on mobile to save vertical space, hidden during search */}
      {!searchQuery.trim() && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FAF0EB] via-[#F6DFD7] to-[#EFAFA0]/40 text-[#5B6E48] shadow-xs sm:shadow-md border border-[#E8A892]/70 sm:border-2 p-2.5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 sm:gap-6 card-hover-luxury">
          {/* Subtle Decorative Background Geometry */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#DFA995]/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#C89452]/25 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#D8957F]/20 blur-3xl pointer-events-none" />

          <div className="space-y-1 sm:space-y-2 z-10 max-w-xl">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="px-2 sm:px-3 py-0.5 rounded-full bg-[#D8957F] text-[#FFF7F4] border border-[#C89452] text-[9px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FFF7F4] fill-[#FFF7F4]" />
                <span>Smart Virtual Wardrobe</span>
              </span>
              {activePersonObj && activePersonId !== 'all' && (
                <span className="text-[10px] sm:text-[11px] text-[#5B6E48] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF]/90 border border-[#DFA995] shadow-2xs">
                  {activePersonObj.name}
                </span>
              )}
            </div>
            <h2
              className="text-base sm:text-2xl md:text-3xl font-serif font-extrabold text-[#4F603D] tracking-tight leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Never wonder what to wear again.
            </h2>
            <p className="hidden sm:block text-xs sm:text-sm text-[#5B6E48] leading-relaxed font-medium max-w-lg">
              Browse through your high-resolution virtual closet records without digging through racks, drawers, or laundry bins.
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 z-10 w-full md:w-auto overflow-x-auto pb-0.5 no-scrollbar">
            <button
              type="button"
              onClick={onOpenStylist}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-[#C89452] hover:bg-[#B88342] text-white font-bold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 border border-[#C89452]/80 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse-subtle" />
              <span>AI Stylist</span>
            </button>

            {onOpenColorContrast && (
              <button
                type="button"
                onClick={onOpenColorContrast}
                className="hidden sm:flex px-3 sm:px-3.5 py-1.5 sm:py-2.5 bg-[#FFFFFF] hover:bg-[#F9ECE6] text-[#5B6E48] font-bold text-xs rounded-xl sm:rounded-2xl border-2 border-[#DFA995] transition-all items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                title="Compare outfit color combinations & contrast ratios"
              >
                <Palette className="w-3.5 h-3.5 text-[#C89452]" />
                <span>Color Studio</span>
              </button>
            )}

            {onOpenFashionDeals && (
              <button
                type="button"
                onClick={onOpenFashionDeals}
                className="px-2 sm:px-3.5 py-1.5 sm:py-2.5 bg-[#F6DFD7] hover:bg-[#F0CFC4] text-[#4F603D] font-bold text-[10px] sm:text-xs rounded-xl sm:rounded-2xl border border-[#D8957F] sm:border-2 transition-all flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                title="Explore trending drops on Myntra, Nykaa, Amazon & earn +2 free wardrobe slots"
              >
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C89452]" />
                <span>Trends</span>
                <span className="px-1 py-0.2 bg-[#D8957F] text-white text-[9px] font-bold rounded">
                  +2
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenUpload(false)}
              className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-[#5B6E48] hover:bg-[#4F603D] text-[#FAF4F0] font-bold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl border border-[#C89452] sm:border-2 shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 ml-auto md:ml-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F0CAAF]" />
              <span>Add Piece</span>
            </button>
          </div>
        </div>
      )}

      {/* Multi-Filter & Search Bar */}
      <div className="bg-[#FAF4F0] p-3 sm:p-4 rounded-2xl border-2 border-[#E8C8BC] shadow-xs space-y-3">
        {/* Active vs Seasonal Archive View Pills */}
        <div className="flex items-center gap-2 pb-1 border-b border-[#ECDACF]/80">
          <button
            type="button"
            onClick={() => setArchiveTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              archiveTab === 'active'
                ? 'bg-[#39402D] text-[#F0CAAF] shadow-xs border border-[#C89452]'
                : 'bg-[#FAF2EC] text-[#39402D] hover:bg-[#F5DFD6] border border-[#ECDACF]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C89452]" />
            <span>Active Wardrobe</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-white/20">
              {activeItemsCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setArchiveTab('archived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              archiveTab === 'archived'
                ? 'bg-[#39402D] text-[#F0CAAF] shadow-xs border border-[#C89452]'
                : 'bg-[#FAF2EC] text-[#39402D] hover:bg-[#F5DFD6] border border-[#ECDACF]'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-[#C89452]" />
            <span>Seasonal Archive</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-[#C89452] text-white font-bold">
              {archivedItemsCount} Free
            </span>
          </button>
          {archiveTab === 'archived' && (
            <span className="text-[11px] text-[#5B6E48] font-medium hidden sm:inline">
              ✨ Out-of-season items consume 0 active closet slots.
            </span>
          )}
        </div>
        {/* Row 0: Prominent In-Page Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#C89452] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="catalog-search-input"
            type="text"
            placeholder="Search wardrobe by item name, brand, color, occasion, fabric, tags, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
            className="w-full pl-10 pr-24 py-2.5 bg-white text-xs text-stone-800 rounded-xl border border-[#ECDACF] focus:border-[#C89452] focus:ring-2 focus:ring-[#C89452]/20 outline-none transition-all placeholder:text-stone-400 font-medium shadow-2xs"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-2 py-1 bg-[#FAF2EC] hover:bg-[#F5DFD6] text-[#39402D] rounded-lg text-[11px] font-bold flex items-center gap-1 border border-[#ECDACF] transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3 h-3 text-[#C89452]" />
                <span>Clear</span>
              </button>
            ) : (
              <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                {filteredItems.length} matching
              </span>
            )}
          </div>
        </div>

        {/* Row 1: Primary Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#D8957F] text-white border border-[#C89452] shadow-xs'
                : 'bg-[#F6DFD7] text-[#5B6E48] hover:bg-[#EFAFA0]/60 border border-[#E8C8BC]'
            }`}
          >
            All Items ({items.length})
          </button>

          {(customCategories && customCategories.length > 0 ? customCategories : DEFAULT_CATEGORIES).map((cat) => {
            const count = items.filter(
              (i) => i.category === cat && (activePersonId === 'all' || i.personId === activePersonId)
            ).length;
            if (count === 0 && selectedCategory !== cat) return null;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#D8957F] text-white border border-[#C89452] shadow-xs font-bold'
                    : 'bg-[#F6DFD7] text-[#5B6E48] hover:bg-[#EFAFA0]/60 border border-[#E8C8BC]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}

          {onOpenManageCategories && (
            <button
              type="button"
              onClick={onOpenManageCategories}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap text-[#C89452] hover:text-[#39402D] hover:bg-[#F6DFD7] border border-dashed border-[#C89452]/50 transition-all flex items-center gap-1 cursor-pointer"
              title="Add, Edit, or Delete Categories"
            >
              <span>+ Edit Categories</span>
            </button>
          )}
        </div>

        {/* Row 2: Secondary Dropdown Filters (Section, Location, Color, Usage, Sort) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-[#ECDACF] text-xs">
          {/* Section Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full p-2 bg-white border border-[#ECDACF] rounded-xl outline-none text-stone-800 focus:border-[#C89452]"
            >
              <option value="All">All Sections</option>
              <option value="none">Uncategorized</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Location / Storage</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 bg-white border border-[#ECDACF] rounded-xl outline-none text-stone-800 focus:border-[#C89452] font-medium"
            >
              <option value="All">All Locations ({items.length})</option>
              {locations.map((loc) => {
                const count = items.filter(
                  (i) => i.location?.trim().toLowerCase() === loc.trim().toLowerCase()
                ).length;
                return (
                  <option key={loc} value={loc}>
                    {loc} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Color Filter */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Color Palette</label>
            <button
              type="button"
              onClick={() => setIsColorFilterOpen(!isColorFilterOpen)}
              className="w-full p-2 bg-white border border-[#ECDACF] hover:border-[#C89452] rounded-xl text-stone-800 flex items-center justify-between gap-1 transition-colors cursor-pointer text-left font-medium"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {selectedColor !== 'All Colors' ? (
                  <>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs shrink-0"
                      style={{
                        backgroundColor:
                          FASHION_COLORS.find(
                            (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
                          )?.hex || '#D4AF37',
                      }}
                    />
                    <span className="truncate text-xs font-semibold">{selectedColor}</span>
                  </>
                ) : (
                  <>
                    <Palette className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-xs text-stone-600">All Colors</span>
                  </>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>

            {/* Popover Color Search Menu with Backdrop */}
            {isColorFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsColorFilterOpen(false)}
                />
                <div className="absolute top-full left-0 sm:left-auto sm:right-0 sm:w-80 mt-1.5 z-50 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xl space-y-2.5 animate-fade-in max-w-[92vw]">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#C89452]" />
                      <span>Filter by Color Swatch</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedColor('All Colors');
                        setIsColorFilterOpen(false);
                      }}
                      className="text-[11px] font-bold text-[#C89452] hover:text-[#39402D] underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={colorFilterSearch}
                      onChange={(e) => setColorFilterSearch(e.target.value)}
                      placeholder="Search color (Yellow, Mustard, Gold, Navy...)"
                      className="w-full pl-8 pr-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-[11px] outline-none focus:border-[#C89452]"
                      autoFocus
                    />
                    {colorFilterSearch && (
                      <button
                        type="button"
                        onClick={() => setColorFilterSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Family category chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                    {COLOR_FAMILIES.map((fam) => (
                      <button
                        key={fam.id}
                        type="button"
                        onClick={() => setColorFilterFamily(fam.id)}
                        className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap cursor-pointer transition-all ${
                          colorFilterFamily === fam.id
                            ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs font-bold'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {fam.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Swatches List */}
                  <div className="max-h-52 overflow-y-auto pr-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedColor('All Colors');
                        setIsColorFilterOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedColor === 'All Colors'
                          ? 'bg-[#F6DFD7] text-[#4F603D] font-bold border border-[#E8C8BC]'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span>All Colors (Show Everything)</span>
                      {selectedColor === 'All Colors' && <CheckCircle2 className="w-3.5 h-3.5 text-[#C89452]" />}
                    </button>

                    {searchFashionColors(colorFilterSearch, colorFilterFamily).map((swatch) => {
                      const isSelected = selectedColor.toLowerCase() === swatch.name.toLowerCase();
                      return (
                        <button
                          key={swatch.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(swatch.name);
                            setIsColorFilterOpen(false);
                          }}
                          className={`w-full px-2 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#FAF0EB] text-[#39402D] font-bold border border-[#C89452]'
                              : 'hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-md border border-stone-300 shadow-2xs shrink-0"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span className="truncate">{swatch.name}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">{swatch.familyLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Usage Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Wear Frequency</label>
            <select
              value={selectedUsageFilter}
              onChange={(e) => setSelectedUsageFilter(e.target.value)}
              className="w-full p-2 bg-white border border-[#ECDACF] rounded-xl outline-none text-stone-800 focus:border-[#C89452]"
            >
              <option value="All">All Usage Levels</option>
              <option value="unworn">Unworn (0 Wears)</option>
              <option value="moderate">1 to 4 Wears</option>
              <option value="frequent">5+ Frequent Wears</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Sort By</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full p-2 bg-white border border-[#ECDACF] rounded-xl outline-none font-medium text-stone-800 focus:border-[#C89452]"
            >
              <option value="recent">Recently Added</option>
              <option value="wears_desc">Most Worn First</option>
              <option value="wears_asc">Least Worn First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {/* Density & Reset */}
          <div className="flex items-end gap-1">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="w-full p-2 text-[#4F603D] bg-[#F6DFD7] hover:bg-[#EFAFA0] border border-[#E8C8BC] rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Section Banner with Delete / Manage controls */}
      {activeSectionObj && (
        <div className="bg-gradient-to-r from-[#FAF0EB] to-[#F6DFD7] border-2 border-[#E8C8BC] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D8957F] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#C89452]">
              {activeSectionObj.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-[#5B6E48] uppercase">Active Section Folder</span>
                <span className="text-[10px] bg-[#FFFFFF]/80 text-[#5B6E48] font-bold px-2.5 py-0.5 rounded-full border border-[#E8C8BC]">
                  {filteredItems.length} {filteredItems.length === 1 ? 'piece' : 'pieces'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900">{activeSectionObj.name}</h3>
              {activeSectionObj.description && (
                <p className="text-xs text-stone-600">{activeSectionObj.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onManageSections && (
              <button
                type="button"
                onClick={onManageSections}
                className="px-3 py-1.5 bg-white hover:bg-[#FAF4F0] text-stone-700 border border-[#E8C8BC] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Manage Section & Sub-Sections"
              >
                <Settings2 className="w-3.5 h-3.5 text-[#C89452]" />
                <span>Manage</span>
              </button>
            )}

            {onDeleteSection && (
              <button
                type="button"
                onClick={() => setSectionToDelete(activeSectionObj)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title={`Delete section "${activeSectionObj.name}"`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Section</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedSectionId('All')}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="Close section view (Show Overall Collection)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Smart Search Match in other categories / folders */}
      {searchQuery.trim() && filteredItems.length === 0 && totalSearchMatches > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fade-in text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Found <strong>{totalSearchMatches}</strong> matching pieces in other categories or folders.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedSectionId('All');
            }}
            className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            Show All Matching Pieces
          </button>
        </div>
      )}

      {/* Catalog Results Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-[#4F603D] font-serif">
            {filteredItems.length} {filteredItems.length === 1 ? 'Piece' : 'Pieces'} Found
          </h3>
          {searchQuery.trim() && (
            <span className="text-xs text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-medium flex items-center gap-1.5">
              <span>Matching &ldquo;{searchQuery.trim()}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:text-amber-950 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {hasActiveFilters && (
            <span className="text-xs text-[#D8957F] bg-[#FDF2ED] px-2.5 py-0.5 rounded-full border border-[#E8C8BC] font-bold">
              Filtered View
            </span>
          )}
        </div>

        {/* View Mode Controls: Grid vs List */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#5B6E48]/80 font-medium hidden md:inline">
            Tap piece to view details
          </span>

          <div className="flex items-center bg-[#FAF2EC] p-0.5 rounded-xl border border-[#ECDACF]">
            <button
              type="button"
              onClick={() => handleSetViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#39402D] shadow-xs border border-[#ECDACF]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Grid View (Photo Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#C89452]" />
              <span className="text-[11px]">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode('list')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#39402D] shadow-xs border border-[#ECDACF]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="List View (Compact Rows)"
            >
              <List className="w-3.5 h-3.5 text-[#C89452]" />
              <span className="text-[11px]">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List of Dedicated Item Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-[#FAF4F0] rounded-3xl border border-dashed border-[#E8C8BC] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F6DFD7] text-[#C89452] flex items-center justify-center mx-auto border border-[#E8C8BC]">
            {archiveTab === 'archived' ? <Archive className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {archiveTab === 'archived'
              ? 'No items currently in Seasonal Archive'
              : searchQuery.trim()
              ? `"${searchQuery}" does not exist in your wardrobe records`
              : 'No wardrobe items matched the selected filters'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {archiveTab === 'archived'
              ? 'Store off-season garments (e.g. heavy winter parkas in summer, or beachwear in winter) in the Seasonal Archive for free. Archived items use 0 active wardrobe space!'
              : searchQuery.trim()
              ? `We searched your wardrobe records for "${searchQuery}" across names, colors, brands, categories, tags, and storage locations, but no item with this name was found. You can add it directly to your closet now.`
              : 'Try adjusting your section or category filters, or add new items to your wardrobe.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {archiveTab === 'archived' && (
              <button
                type="button"
                onClick={() => setArchiveTab('active')}
                className="px-4 py-2 bg-[#39402D] hover:bg-black text-[#F0CAAF] rounded-xl text-xs font-bold cursor-pointer shadow-xs border border-[#C89452]"
              >
                View Active Wardrobe ({activeItemsCount})
              </button>
            )}
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Clear &ldquo;{searchQuery}&rdquo;
              </button>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-[#F6DFD7] hover:bg-[#EFAFA0] text-[#5B6E48] rounded-xl text-xs font-bold cursor-pointer border border-[#E8C8BC]"
              >
                Reset All Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenUpload(false)}
              className="px-4 py-2 bg-[#5B6E48] hover:bg-[#4F603D] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs border border-[#C89452]"
            >
              {searchQuery.trim() ? `+ Add "${searchQuery}" to Closet` : '+ Add Item Photo'}
            </button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white rounded-2xl border-2 border-[#E8C8BC]/80 hover:border-[#D8957F] p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img
                    src={item.images[0]}
                    alt={item.name || 'Item'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.images.length > 1 && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/75 text-[9px] font-mono text-[#F0CAAF] rounded-md backdrop-blur-xs">
                      +{item.images.length - 1}
                    </span>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-[#D8957F] uppercase tracking-wider bg-[#FDF2ED] px-2 py-0.5 rounded-md border border-[#E8C8BC]">
                      {item.category}
                    </span>
                    {item.sectionName && (
                      <span className="text-[11px] text-stone-600 font-medium truncate max-w-[140px] sm:max-w-none">
                        📁 {item.sectionName}
                      </span>
                    )}
                    {item.size && (
                      <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                        Size: {item.size}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#D8957F] truncate transition-colors">
                    {item.name || 'Unnamed Wardrobe Piece'}
                  </h4>

                  <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap">
                    {item.color && (
                      <span className="flex items-center gap-1.5 text-[#5B6E48] font-medium">
                        {item.colorHex && (
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: item.colorHex }}
                          />
                        )}
                        <span className="truncate">{item.color}</span>
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1 text-stone-500 truncate">
                        <MapPin className="w-3 h-3 text-[#C89452] shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Badges & Arrow */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#5B6E48] bg-[#F6DFD7] px-2 py-0.5 rounded-md border border-[#E8C8BC]">
                    {item.wearCount} {item.wearCount === 1 ? 'wear' : 'wears'}
                  </span>
                  {item.isInLaundry && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Waves className="w-2.5 h-2.5 text-emerald-600" />
                      <span className="hidden xs:inline">Cleaners</span>
                    </span>
                  )}
                  {item.isLoaned && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <HeartHandshake className="w-2.5 h-2.5 text-amber-600" />
                      <span className="hidden xs:inline">Loaned</span>
                    </span>
                  )}
                  {item.isArchived && (
                    <span className="text-[10px] font-bold text-[#39402D] bg-[#F5DFD6] px-1.5 py-0.5 rounded border border-[#C89452]/40 flex items-center gap-1">
                      <Archive className="w-2.5 h-2.5 text-[#C89452]" />
                      <span className="hidden xs:inline">Archived</span>
                    </span>
                  )}
                </div>
                {onToggleArchive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(item.id, !item.isArchived);
                    }}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      item.isArchived
                        ? 'bg-[#39402D] text-[#F0CAAF] hover:bg-black border border-[#C89452]'
                        : 'text-stone-400 hover:text-[#39402D] hover:bg-stone-100'
                    }`}
                    title={item.isArchived ? 'Restore to Active Closet' : 'Move to Seasonal Archive (Free up closet capacity)'}
                  >
                    {item.isArchived ? (
                      <ArchiveRestore className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                )}
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#D8957F] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white rounded-2xl border-2 border-[#E8C8BC]/80 hover:border-[#D8957F] overflow-hidden shadow-2xs card-hover-luxury cursor-pointer group flex flex-col justify-between transition-all"
            >
              {/* Photo & Overlay Badges */}
              <div className="relative aspect-4/5 bg-stone-100 overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.name || 'Wardrobe piece'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Subtle gradient vignette at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Multiple Photos Count Indicator */}
                {item.images.length > 1 && (
                  <span className="absolute top-2.5 right-10 px-1.5 py-0.5 bg-[#2E2827]/85 text-[10px] font-mono font-medium text-[#F0CAAF] rounded-md backdrop-blur-xs shadow-2xs border border-white/10">
                    📷 {item.images.length}
                  </span>
                )}

                {/* 1-Click Quick Archive / Restore Button */}
                {onToggleArchive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(item.id, !item.isArchived);
                    }}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer z-20 ${
                      item.isArchived
                        ? 'bg-[#39402D] text-[#F0CAAF] hover:bg-black border border-[#C89452]'
                        : 'bg-black/60 hover:bg-[#39402D] text-white opacity-0 group-hover:opacity-100 backdrop-blur-xs'
                    }`}
                    title={item.isArchived ? 'Restore to Active Closet' : 'Move to Seasonal Archive (Frees up closet capacity)'}
                  >
                    {item.isArchived ? (
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {/* Styled Reference Badge */}
                {item.styledReferenceImages && item.styledReferenceImages.length > 0 && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#D8957F]/95 text-[10px] font-bold text-white rounded-md backdrop-blur-xs flex items-center gap-1 border border-[#C89452]/40 shadow-2xs">
                    <Sparkle className="w-2.5 h-2.5 text-[#FFF7F4]" /> Styled Look
                  </span>
                )}

                {/* Status Badges: Laundry / Loan */}
                <div className="absolute bottom-2.5 left-2.5 flex flex-col gap-1 z-10">
                  {item.isInLaundry && (
                    <span className="px-2 py-0.5 bg-[#5B6E48]/95 text-[#FFF7F4] text-[10px] font-bold rounded-md backdrop-blur-xs flex items-center gap-1 border border-[#C89452]/40 shadow-2xs">
                      <Waves className="w-2.5 h-2.5 text-[#F0CAAF]" /> At Cleaners
                    </span>
                  )}
                  {item.isLoaned && (
                    <span className="px-2 py-0.5 bg-[#D8957F]/95 text-white text-[10px] font-bold rounded-md backdrop-blur-xs flex items-center gap-1 border border-[#C89452]/40 shadow-2xs">
                      <HeartHandshake className="w-2.5 h-2.5 text-[#FFF7F4]" /> Loaned Out
                    </span>
                  )}
                  {item.isArchived && (
                    <span className="px-2 py-0.5 bg-[#39402D]/95 text-[#F0CAAF] text-[10px] font-bold rounded-md backdrop-blur-xs flex items-center gap-1 border border-[#C89452]/40 shadow-2xs">
                      <Archive className="w-2.5 h-2.5 text-[#C89452]" /> Seasonal Archive
                    </span>
                  )}
                </div>

                {/* Wear count pill */}
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-white/95 text-[#5B6E48] text-[10px] font-bold rounded-full shadow-xs border border-[#E8C8BC] z-10">
                  {item.wearCount} {item.wearCount === 1 ? 'wear' : 'wears'}
                </span>
              </div>

              {/* Bottom Card Content: Displays only filled info */}
              <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#D8957F] uppercase tracking-wider">
                    <span>{item.category}</span>
                    {item.size && <span className="text-stone-400 font-medium">{item.size}</span>}
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-[#D8957F] transition-colors mt-0.5 font-display">
                    {item.name || 'Unnamed Wardrobe Piece'}
                  </h4>

                  {item.color && (
                    <div className="text-[11px] text-[#5B6E48] truncate font-medium">
                      {item.color}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#FAF0EB] flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#C89452] shrink-0" />
                    <span className="truncate">{item.location || 'Closet'}</span>
                  </div>
                  {item.condition && (
                    <span className="text-[9px] text-[#5B6E48] uppercase font-bold px-1.5 py-0.5 rounded bg-[#F6DFD7] border border-[#E8C8BC]">
                      {item.condition}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRM DELETE SECTION MODAL */}
      {sectionToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Section Folder?</h3>
                <p className="text-xs text-slate-500 font-normal">"{sectionToDelete.name}"</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete this section folder? Clothes inside will remain in your overall wardrobe collection as uncategorized.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSectionToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const secId = sectionToDelete.id;
                  setSectionToDelete(null);
                  if (onDeleteSection) onDeleteSection(secId);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Yes, Delete Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
