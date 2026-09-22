import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Tag,
  Layers,
  ArrowLeft,
  Eye,
  Heart,
  Palette,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Smartphone,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { WardrobeItem, WardrobeSection } from '../types';
import { AppLogo } from './AppLogo';

interface PublicLookbookViewProps {
  sectionId?: string;
  creatorName?: string;
  items: WardrobeItem[];
  sections: WardrobeSection[];
  onExitToApp?: () => void;
  onOpenAuth?: () => void;
}

export const PublicLookbookView: React.FC<PublicLookbookViewProps> = ({
  sectionId = 'all',
  creatorName = 'Kloset Curated',
  items,
  sections,
  onExitToApp,
  onOpenAuth,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>(sectionId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItemForModal, setSelectedItemForModal] = useState<WardrobeItem | null>(null);
  const [activeModalPhotoIndex, setActiveModalPhotoIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (sectionId) {
      setSelectedSection(sectionId);
    }
  }, [sectionId]);

  // Filter items for the lookbook
  const filteredItems = items.filter((item) => {
    if (selectedSection !== 'all') {
      if (item.sectionId !== selectedSection && item.category !== selectedSection) {
        return false;
      }
    }
    if (selectedCategory !== 'all') {
      if (item.category !== selectedCategory) {
        return false;
      }
    }
    return true;
  });

  const handleCopyLookbookUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleLike = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const activeSectionObj = sections.find((s) => s.id === selectedSection);
  const activeSectionTitle =
    selectedSection === 'all'
      ? 'Complete Lookbook Collection'
      : activeSectionObj?.name || selectedSection;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 pb-16 sm:pb-0">
      {/* Top Floating Public Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {onExitToApp && (
              <button
                type="button"
                onClick={onExitToApp}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#39402D] hover:bg-[#485339] text-[#F0CAAF] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border border-[#C89452] cursor-pointer"
                title="Return to your personal wardrobe"
              >
                <ArrowLeft className="w-4 h-4 text-[#C89452]" />
                <span className="font-bold">Back</span>
              </button>
            )}
            <AppLogo />
            <div className="hidden md:block pl-3 border-l border-stone-200">
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Lookbook Preview
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleCopyLookbookUrl}
              className="px-2.5 sm:px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-stone-200"
              title="Share Lookbook Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            {onExitToApp ? (
              <button
                type="button"
                onClick={onExitToApp}
                className="hidden sm:flex px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Return to Closet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : onOpenAuth ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Sign In</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile Floating Return Button */}
      {onExitToApp && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 sm:hidden">
          <button
            type="button"
            onClick={onExitToApp}
            className="px-5 py-2.5 bg-[#39402D] text-[#F0CAAF] border-2 border-[#C89452] rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#C89452]" />
            <span>Return to Kloset App</span>
          </button>
        </div>
      )}

      {/* Hero Showcase Header */}
      <section className="relative bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white py-12 px-4 sm:px-6 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Curated Style Lookbook</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-serif text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {creatorName}&apos;s Wardrobe Gallery
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
            Browse styled outfits, seasonal palettes, and curated closet pieces. Tap any garment to view high-resolution photos and styling details.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{filteredItems.length} Featured Pieces</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Lookbook</span>
            </span>
          </div>
        </div>
      </section>

      {/* Section Filter Navigation Tabs */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedSection('all');
              setSelectedCategory('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSection === 'all' && selectedCategory === 'all'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Pieces ({items.length})
          </button>

          {sections.map((sec) => {
            const count = items.filter((i) => i.sectionId === sec.id).length;
            if (count === 0) return null;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setSelectedSection(sec.id);
                  setSelectedCategory('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedSection === sec.id
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {sec.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lookbook Items Grid Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              {activeSectionTitle}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing {filteredItems.length} items curated by {creatorName}
            </p>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            {likedItemIds.size > 0 && (
              <span className="text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                ❤️ {likedItemIds.size} Liked
              </span>
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8 shadow-2xs">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-800">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">No items found in this section</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try selecting &ldquo;All Pieces&rdquo; to view the complete public lookbook collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSection('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold transition-all hover:bg-amber-800 cursor-pointer"
            >
              Show All Pieces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const primaryImg = item.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80';
              const isLiked = likedItemIds.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItemForModal(item);
                    setActiveModalPhotoIndex(0);
                  }}
                  className="group relative bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:border-amber-400 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-4/5 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={primaryImg}
                      alt={item.name || item.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Category pill */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-stone-900 shadow-xs backdrop-blur-xs border border-white/40">
                        {item.category}
                      </span>
                    </div>

                    {/* Multi-angle indicator */}
                    {item.images && item.images.length > 1 && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                          📷 {item.images.length} Photos
                        </span>
                      </div>
                    )}

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(item.id, e)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all cursor-pointer backdrop-blur-xs ${
                        isLiked
                          ? 'bg-rose-500 text-white shadow-sm scale-110'
                          : 'bg-white/80 text-stone-600 hover:text-rose-500 hover:bg-white'
                      }`}
                      title={isLiked ? 'Unlike' : 'Like look'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5 bg-white">
                    <div>
                      <h3 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-amber-900 transition-colors">
                        {item.name || `${item.color || ''} ${item.category}`.trim()}
                      </h3>
                      {item.brand && (
                        <p className="text-[10px] font-medium text-stone-500 line-clamp-1">
                          {item.brand}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] text-stone-500">
                      {item.colorHex ? (
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span className="line-clamp-1">{item.color || 'Custom'}</span>
                        </div>
                      ) : (
                        <span>{item.color || item.sectionName || 'Curated'}</span>
                      )}

                      <span className="text-amber-800 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>View</span>
                        <Eye className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Full-Screen Interactive Lookbook Item Details Modal */}
      {selectedItemForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedItemForModal(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemForModal(null)}
              className="absolute top-3 right-3 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Image Carousel */}
            <div className="md:w-1/2 bg-stone-900 relative flex flex-col items-center justify-center min-h-[300px] md:min-h-[460px]">
              {selectedItemForModal.images && selectedItemForModal.images.length > 0 ? (
                <img
                  src={selectedItemForModal.images[activeModalPhotoIndex] || selectedItemForModal.images[0]}
                  alt={selectedItemForModal.name || 'Garment preview'}
                  className="w-full h-full max-h-[460px] object-contain"
                />
              ) : (
                <div className="text-stone-400 text-xs">No image available</div>
              )}

              {/* Multi-angle Arrows */}
              {selectedItemForModal.images && selectedItemForModal.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveModalPhotoIndex((prev) =>
                        prev === 0 ? selectedItemForModal.images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveModalPhotoIndex((prev) =>
                        prev === selectedItemForModal.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-3 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full">
                    {selectedItemForModal.images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveModalPhotoIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeModalPhotoIndex === idx ? 'bg-amber-400 w-4' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right Information Panel */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    {selectedItemForModal.category}
                  </span>
                  {selectedItemForModal.sectionName && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                      {selectedItemForModal.sectionName}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-stone-900 font-serif">
                    {selectedItemForModal.name || `${selectedItemForModal.color || ''} ${selectedItemForModal.category}`.trim()}
                  </h3>
                  {selectedItemForModal.brand && (
                    <p className="text-xs font-semibold text-stone-500 mt-0.5">
                      Brand: {selectedItemForModal.brand}
                    </p>
                  )}
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  {selectedItemForModal.color && (
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Color</span>
                      <div className="flex items-center gap-1.5 font-semibold text-stone-800 mt-0.5">
                        {selectedItemForModal.colorHex && (
                          <span
                            className="w-3 h-3 rounded-full border border-black/20"
                            style={{ backgroundColor: selectedItemForModal.colorHex }}
                          />
                        )}
                        <span>{selectedItemForModal.color}</span>
                      </div>
                    </div>
                  )}

                  {selectedItemForModal.size && (
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Size</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">
                        {selectedItemForModal.size}
                      </span>
                    </div>
                  )}

                  {selectedItemForModal.condition && (
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Condition</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">
                        {selectedItemForModal.condition}
                      </span>
                    </div>
                  )}

                  {selectedItemForModal.location && (
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Location</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">
                        {selectedItemForModal.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description & Styling Notes */}
                {selectedItemForModal.description && (
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      Stylist Notes & Details
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                      {selectedItemForModal.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {selectedItemForModal.tags && selectedItemForModal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedItemForModal.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer CTA */}
              <div className="pt-3 border-t border-stone-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(selectedItemForModal.id, e)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    likedItemIds.has(selectedItemForModal.id)
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedItemIds.has(selectedItemForModal.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{likedItemIds.has(selectedItemForModal.id) ? 'Liked Outfit' : 'Like This Piece'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItemForModal(null)}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Public Footer & Call-To-Action */}
      <footer className="bg-stone-900 text-white py-12 px-4 sm:px-6 border-t border-stone-800 mt-auto">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-block p-3 rounded-2xl bg-white/10 border border-white/20">
            <AppLogo />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
            Build Your Own Digital Wardrobe with Kloset: Your Virtual Wardrobe with Smart AI
          </h3>

          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
            Digitize your clothes, create lookbooks, track laundry & loans, and get AI outfit suggestions.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onExitToApp && (
              <button
                type="button"
                onClick={onExitToApp}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
              >
                Launch Kloset Studio
              </button>
            )}
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-6 py-3 bg-white text-stone-900 hover:bg-stone-100 font-extrabold rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
              >
                Sign Up for Free
              </button>
            )}
          </div>

          <p className="text-[11px] text-stone-500 pt-4">
            Kloset: Your Virtual Wardrobe with Smart AI &copy; 2026 &bull; Secure Digital Wardrobe Catalog &amp; Personal Styling Engine
          </p>
        </div>
      </footer>
    </div>
  );
};
