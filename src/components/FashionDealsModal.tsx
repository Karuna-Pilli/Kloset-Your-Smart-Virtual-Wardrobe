import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Flame,
  Tag,
  Copy,
  Check,
  Gift,
  Star,
  ShoppingBag,
  Filter,
  Search,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Play,
  Clock,
  ShieldCheck,
  Award,
  DollarSign,
  Info,
  Tv,
  Smartphone,
  CheckCircle,
  RefreshCw,
  Plus,
  Link,
  Image as ImageIcon,
  Key,
  ShieldAlert,
  Trash2,
  Sliders,
} from 'lucide-react';
import { FashionOffer, UserProfile } from '../types';
import {
  getActiveFashionDeals,
  addCustomFashionDeal,
  fetchFreshAutoTrendingDeals,
  DEFAULT_AFFILIATE_CONFIG,
  isUserAdmin,
  getStoredAdminPin,
  saveAdminPin,
  clearAdminPin,
  ADMIN_EMAIL,
  ADMIN_SECRET_PIN,
} from '../data/fashionDealsData';
import {
  ADMOB_CONFIG,
  getActiveAdMobCredentials,
  detectAdMobPlatform,
  triggerAdMobRewardedAd,
  AdMobPlatform,
} from '../services/adMobService';
import { firestoreSyncService } from '../services/firestoreSyncService';
import { User as FirebaseUser } from '../lib/firebase';
import {
  getDailyDealsMetadata,
  getAutomatedDailyDeals,
  DailyDealsMetadata,
} from '../services/dailyDealsEngine';

interface FashionDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  currentUser?: FirebaseUser | null;
  onClaimOfferReward: (offerId: string, bonusSlots: number) => void;
  onOpenStorageModal: () => void;
  totalItemsCount?: number;
}

const BRAND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Myntra': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Nykaa Fashion': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'Tata CLiQ': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Amazon Fashion': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Westside': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  'Flipkart': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Meesho': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
  'Lifestyle': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Ajio': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  'Zara': { bg: 'bg-stone-100', text: 'text-stone-900', border: 'border-stone-300' },
  'H&M': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export const FashionDealsModal: React.FC<FashionDealsModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentUser,
  onClaimOfferReward,
  onOpenStorageModal,
  totalItemsCount = 0,
}) => {
  const [cloudDeals, setCloudDeals] = useState<FashionOffer[]>([]);
  const [deals, setDeals] = useState<FashionOffer[]>(() => getActiveFashionDeals());
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
  const [justClaimedReward, setJustClaimedReward] = useState<{ id: string; slots: number; message?: string } | null>(null);
  const [isFetchingAuto, setIsFetchingAuto] = useState<boolean>(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);

  // Admin Verification State
  const [customPinInput, setCustomPinInput] = useState<string>(() => getStoredAdminPin() || '');
  const [showPinAuthDialog, setShowPinAuthDialog] = useState<boolean>(false);
  const [pinErrorMessage, setPinErrorMessage] = useState<string>('');

  // Check whether current user has Admin privileges (either by Google Auth Email or Verified Creator PIN)
  const isCreatorAdmin = isUserAdmin(currentUser?.email || profile.email, customPinInput);

  // Custom Deal Form State
  const [customBrand, setCustomBrand] = useState<any>('Myntra');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<any>('Western & Casual');
  const [customOrigPrice, setCustomOrigPrice] = useState<string>('2499');
  const [customDiscPrice, setCustomDiscPrice] = useState<string>('999');
  const [customRawUrl, setCustomRawUrl] = useState<string>('');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customCoupon, setCustomCoupon] = useState<string>('');
  const [publishToCloud, setPublishToCloud] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // AdMob State
  const [selectedAdMobPlatform, setSelectedAdMobPlatform] = useState<AdMobPlatform>(() => detectAdMobPlatform());
  const [isWatchingAdMob, setIsWatchingAdMob] = useState<boolean>(false);
  const [adMobCountdown, setAdMobCountdown] = useState<number>(6);
  const [isAdMobFinished, setIsAdMobFinished] = useState<boolean>(false);

  // Dedicated Partner Ad Watcher State
  const [activeWatchingOffer, setActiveWatchingOffer] = useState<FashionOffer | null>(null);
  const [adCountdown, setAdCountdown] = useState<number>(6);
  const [isAdCompleted, setIsAdCompleted] = useState<boolean>(false);

  // Daily Automated Engine State
  const [dailyMeta, setDailyMeta] = useState<DailyDealsMetadata>(() => getDailyDealsMetadata());
  const [countdownSeconds, setCountdownSeconds] = useState<number>(() => getDailyDealsMetadata().timeRemainingSeconds);

  // Subscribe to real-time Cloud Firestore Deals only when modal is active
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = firestoreSyncService.subscribeToGlobalFashionDeals((incomingCloudDeals) => {
      setCloudDeals(incomingCloudDeals);
      const autoDaily = getAutomatedDailyDeals();
      const merged = [...incomingCloudDeals, ...autoDaily, ...getActiveFashionDeals()];
      const seen = new Set<string>();
      const unique = merged.filter((d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      });
      setDeals(unique);
    });
    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  // Sync deals & daily metadata on open
  useEffect(() => {
    const meta = getDailyDealsMetadata();
    setDailyMeta(meta);
    setCountdownSeconds(meta.timeRemainingSeconds);
    const autoDaily = getAutomatedDailyDeals();
    const merged = [...cloudDeals, ...autoDaily, ...getActiveFashionDeals(cloudDeals)];
    const seen = new Set<string>();
    const unique = merged.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
    setDeals(unique);
  }, [isOpen, cloudDeals]);

  // Live midnight countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          const fresh = getDailyDealsMetadata();
          setDailyMeta(fresh);
          return fresh.timeRemainingSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Timer effect for AdMob Rewarded Video
  useEffect(() => {
    let timer: any;
    if (isWatchingAdMob && adMobCountdown > 0) {
      timer = setInterval(() => {
        setAdMobCountdown((prev) => {
          if (prev <= 1) {
            setIsAdMobFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWatchingAdMob, adMobCountdown]);

  // Timer effect for watching the sponsored partner ad showcase
  useEffect(() => {
    let timer: any;
    if (activeWatchingOffer && adCountdown > 0) {
      timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            setIsAdCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeWatchingOffer, adCountdown]);

  if (!isOpen) return null;

  const isFamily = profile.currentMode === 'family';
  const baseLimit = isFamily ? 75 : 35;
  const bonusSlots = profile.bonusItemSlots || 0;
  const currentTotalLimit = baseLimit + bonusSlots;
  const claimedOffers = profile.claimedOfferIds || [];

  const handleStartAdMobVideo = (platform?: AdMobPlatform) => {
    if (platform) setSelectedAdMobPlatform(platform);
    setIsWatchingAdMob(true);
    setAdMobCountdown(6);
    setIsAdMobFinished(false);
  };

  const handleFinishAdMobAndClaim = () => {
    const rewardId = `admob-${Date.now()}`;
    onClaimOfferReward(rewardId, 2);
    triggerAdMobRewardedAd({
      rewardAmount: 2,
      preferredPlatform: selectedAdMobPlatform,
    });
    setJustClaimedReward({ id: rewardId, slots: 2 });
    setTimeout(() => setJustClaimedReward(null), 4000);
    setIsWatchingAdMob(false);
  };

  const handleAutoFetchDrops = () => {
    setIsFetchingAuto(true);
    setTimeout(() => {
      const updated = fetchFreshAutoTrendingDeals(deals);
      setDeals(updated);
      setIsFetchingAuto(false);
      setJustClaimedReward({ id: 'autofetch', slots: 0, message: '✨ Fresh trending drops loaded from Myntra, Nykaa, Ajio & Amazon!' });
      setTimeout(() => setJustClaimedReward(null), 3000);
    }, 600);
  };

  const handleVerifyAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPinInput.trim() === ADMIN_SECRET_PIN) {
      saveAdminPin(customPinInput.trim());
      setShowPinAuthDialog(false);
      setPinErrorMessage('');
      setJustClaimedReward({ id: 'admin_auth', slots: 0, message: '🔓 Creator Mode unlocked! You can now publish deals to all users.' });
      setTimeout(() => setJustClaimedReward(null), 4000);
    } else {
      setPinErrorMessage('Invalid Creator PIN. Please try again.');
    }
  };

  const handleAddCustomDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customRawUrl.trim()) return;

    setIsPublishing(true);
    const orig = parseFloat(customOrigPrice) || 1999;
    const disc = parseFloat(customDiscPrice) || 999;
    const percent = Math.max(5, Math.round(((orig - disc) / orig) * 100));

    const defaultImages: Record<string, string> = {
      'Myntra': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      'Nykaa Fashion': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      'Amazon Fashion': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
      'Ajio': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
      'Flipkart': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    };

    const finalImage = customImageUrl.trim() || defaultImages[customBrand] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80';

    const newDealObj = addCustomFashionDeal({
      brand: customBrand,
      title: customTitle.trim(),
      subtitle: customSubtitle.trim() || `Trending fashion pick on ${customBrand}`,
      category: customCategory,
      originalPrice: orig,
      discountedPrice: disc,
      discountPercent: percent,
      imageUrl: finalImage,
      rawUrl: customRawUrl.trim(),
      couponCode: customCoupon.trim() || undefined,
      tagline: `⭐ Curated Deal from ${customBrand}`,
      rating: 4.8,
      reviewsCount: 120,
      rewardSlots: 2,
      isFeatured: true,
      trendingScore: 99,
    });

    // If publishing to Cloud Firestore (Global for all users)
    if (publishToCloud) {
      try {
        await firestoreSyncService.publishGlobalFashionDeal({
          ...newDealObj,
          id: `cloud_deal_${Date.now()}`,
        });
        setJustClaimedReward({ id: 'cloud_published', slots: 0, message: '🚀 Deal published to Cloud! Visible to all app users in real-time.' });
        setTimeout(() => setJustClaimedReward(null), 4000);
      } catch (err) {
        console.warn('Could not sync to cloud, saved locally:', err);
      }
    }

    setDeals(getActiveFashionDeals(cloudDeals));
    setIsPublishing(false);
    setShowAddCustomModal(false);
    setCustomTitle('');
    setCustomSubtitle('');
    setCustomRawUrl('');
    setCustomImageUrl('');
    setCustomCoupon('');
  };

  const handleDeleteCloudDeal = async (dealId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this deal from the global feed?')) return;
    try {
      await firestoreSyncService.deleteGlobalFashionDeal(dealId);
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (err) {
      console.error('Failed to delete deal:', err);
    }
  };

  const BRANDS = ['All', 'Myntra', 'Nykaa Fashion', 'Tata CLiQ', 'Amazon Fashion', 'Flipkart', 'Westside', 'Meesho', 'Lifestyle', 'Ajio', 'Zara'];
  const CATEGORIES = ['All', 'Trending', 'Ethnic', 'Western & Casual', 'Office & Formal', 'Footwear', 'Accessories'];

  const filteredOffers = deals.filter((offer) => {
    if (selectedBrand !== 'All' && offer.brand !== selectedBrand) return false;
    if (selectedCategory !== 'All' && offer.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = offer.title.toLowerCase().includes(q);
      const matchBrand = offer.brand.toLowerCase().includes(q);
      const matchSubtitle = offer.subtitle?.toLowerCase().includes(q);
      const matchTagline = offer.tagline.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchSubtitle && !matchTagline) return false;
    }
    return true;
  });

  const handleCopyCoupon = (offerId: string, code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCouponId(offerId);
    setTimeout(() => setCopiedCouponId(null), 2500);
  };

  const handleStartWatchAd = (offer: FashionOffer) => {
    setActiveWatchingOffer(offer);
    setAdCountdown(6);
    setIsAdCompleted(false);
  };

  const handleFinishAdAndClaim = (offer: FashionOffer, openPartnerTab: boolean = true) => {
    onClaimOfferReward(offer.id, offer.rewardSlots);
    setJustClaimedReward({ id: offer.id, slots: offer.rewardSlots });
    setTimeout(() => setJustClaimedReward(null), 4000);

    if (openPartnerTab) {
      window.open(offer.affiliateUrl, '_blank', 'noopener,noreferrer');
    }

    setActiveWatchingOffer(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh] relative">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-100 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-lg font-bold tracking-tight text-white font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Daily Fashion Trends & Style Drops
                </h2>
                {isCreatorAdmin && (
                  <span className="inline-flex px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold">
                    👑 Creator Mode Active
                  </span>
                )}
                {!isCreatorAdmin && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-mono">
                    Live Partner Drops
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Auto-synced drops from Myntra, Amazon, Nykaa, Ajio & Flipkart. Exploring deals unlocks wardrobe space.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCreatorAdmin && (
              <button
                type="button"
                onClick={() => setShowPinAuthDialog(true)}
                className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Creator / Admin Login"
              >
                <Key className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Single Unified Scrollable Body Container (Allows smooth scrolling from anywhere on screen) */}
        <div
          className="flex-1 overflow-y-auto bg-stone-50/30 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Capacity & Reward Highlight Bar */}
          <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-950 font-medium">
              <Gift className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                Your Closet Capacity:{' '}
                <strong className="text-amber-900 font-bold">
                  {totalItemsCount} / {currentTotalLimit} pieces
                </strong>{' '}
                ({baseLimit} base limit {bonusSlots > 0 && `+ ${bonusSlots} bonus slots earned`})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoFetchDrops}
                disabled={isFetchingAuto}
                className="px-3 py-1 bg-white hover:bg-amber-100/80 text-amber-950 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer border border-amber-300 shadow-2xs active:scale-95"
                title="Fetch fresh live daily fashion drops from partnered store catalogs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isFetchingAuto ? 'animate-spin' : ''}`} />
                <span>{isFetchingAuto ? 'Fetching Drops...' : 'Auto-Fetch Fresh Deals'}</span>
              </button>

              {/* Admin-Only Add Deal Button */}
              {isCreatorAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(true)}
                  className="px-3 py-1 bg-gradient-to-r from-amber-800 to-stone-900 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:opacity-90 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Deal</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenStorageModal}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200/80 text-amber-900 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-amber-300/80"
              >
                <span>Storage & VIP</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Creator Admin Banner (Visible only to you) */}
          {isCreatorAdmin && (
            <div className="mx-4 sm:mx-6 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Creator Studio Active:</strong> Deals you add will automatically link to EarnKaro (<code>5579960</code>) & Amazon (<code>karu0b-21</code>) and sync globally to all users.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearAdminPin();
                  setCustomPinInput('');
                }}
                className="text-[11px] text-amber-800 underline hover:text-amber-950 font-bold shrink-0 ml-2"
              >
                Exit Creator Mode
              </button>
            </div>
          )}

          {/* Automated Live Daily Deals Spotlight Banner (Zero Manual Effort) */}
          <div className="mx-4 sm:mx-6 mt-3 p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 rounded-2xl text-white border border-amber-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                    {dailyMeta.seasonalTag}
                  </span>
                  <span className="text-xs font-bold text-stone-300">
                    {dailyMeta.dayOfWeek} Drop • Auto-Curated
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">{dailyMeta.themeTitle}</h3>
                <p className="text-xs text-stone-300 line-clamp-1">{dailyMeta.themeSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <div className="text-right">
                <div className="text-[9px] text-stone-400 uppercase font-semibold">Resets In</div>
                <div className="text-xs font-mono font-bold text-amber-300">
                  {formatCountdown(countdownSeconds)}
                </div>
              </div>
            </div>
          </div>

          {/* Premium Rewarded Video Banner Card */}
          <div className="mx-4 sm:mx-6 mt-3 p-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl text-white border border-[#C89452]/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D8957F] to-[#EFAFA0] flex items-center justify-center shrink-0 shadow-sm text-stone-950">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Watch Video to Unlock +2 Slots</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                    100% Free
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  Watch a short sponsor video to immediately earn permanent closet capacity.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStartAdMobVideo()}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#D8957F] via-[#EFAFA0] to-[#D8957F] hover:opacity-95 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border border-[#C89452] shrink-0"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>Watch Short Video (+2 Slots)</span>
            </button>
          </div>

          {/* Reward celebration toast */}
          {justClaimedReward && (
            <div className="mx-4 sm:mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {justClaimedReward.message ||
                    (justClaimedReward.id === 'autofetch'
                      ? '✨ Fresh daily trending fashion drops loaded from Myntra, Nykaa, Ajio & Amazon!'
                      : `🎉 Deal Verified! +${justClaimedReward.slots} extra wardrobe slots added to your closet vault!`)}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                Capacity: {currentTotalLimit} Pieces
              </span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-stone-100 space-y-3 bg-stone-50/50">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search trending styles, brands, kurtas, sneakers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-900 text-white shadow-xs'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
                Stores:
              </span>
              {BRANDS.map((brand) => {
                const styling = BRAND_COLORS[brand] || { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' };
                const isSelected = selectedBrand === brand;
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : `${styling.bg} ${styling.text} ${styling.border} hover:opacity-90`
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="p-4 sm:p-6">
          {filteredOffers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="font-semibold text-stone-700 text-sm">No trending offers match your search</p>
              <p className="text-xs text-stone-400">Try selecting "All Stores" or clearing your search keywords.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('All');
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-2 px-3.5 py-1.5 bg-stone-900 text-white text-xs rounded-xl font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => {
                const brandStyle = BRAND_COLORS[offer.brand] || { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' };
                const isClaimed = claimedOffers.includes(offer.id);
                const isCloudDeal = offer.id.startsWith('cloud_deal_');

                return (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden flex flex-col hover:border-amber-600/40 hover:shadow-md transition-all group relative"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />

                      {/* Store Badge & Sponsored Label */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className={`px-2 py-0.8 rounded-md font-bold text-[10px] border shadow-xs ${brandStyle.bg} ${brandStyle.text} ${brandStyle.border}`}>
                          {offer.brand}
                        </span>
                        {isCloudDeal && (
                          <span className="px-1.5 py-0.5 rounded-md font-bold text-[9px] bg-amber-500 text-stone-950 backdrop-blur-xs shadow-xs uppercase tracking-wider">
                            Curated
                          </span>
                        )}
                      </div>

                      {/* Admin Delete Action for Cloud Deals */}
                      {isCreatorAdmin && isCloudDeal && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCloudDeal(offer.id, e)}
                          className="absolute top-2.5 right-18 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors"
                          title="Delete from global feed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Discount Tag */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.8 bg-rose-600 text-white font-extrabold text-[11px] rounded-md shadow-xs flex items-center gap-0.5">
                          <Percent className="w-3 h-3" />
                          <span>{offer.discountPercent}% OFF</span>
                        </span>
                      </div>

                      {/* Reward Badge Overlay */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="px-2 py-1 bg-stone-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold rounded-lg flex items-center justify-between border border-amber-400/20">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>+{offer.rewardSlots} Slots Upon Exploring</span>
                          </span>
                          {isClaimed && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Claimed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span className="font-semibold text-stone-600">{offer.category}</span>
                          {offer.rating && (
                            <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{offer.rating} ({offer.reviewsCount})</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-stone-900 text-sm leading-snug group-hover:text-amber-900 transition-colors line-clamp-1">
                          {offer.title}
                        </h3>

                        {offer.subtitle && (
                          <p className="text-xs text-stone-500 line-clamp-1 leading-relaxed">
                            {offer.subtitle}
                          </p>
                        )}

                        {/* Price Row */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-base font-extrabold text-stone-950">
                            ₹{offer.discountedPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-stone-400 line-through">
                            ₹{offer.originalPrice.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600">
                            Save ₹{(offer.originalPrice - offer.discountedPrice).toLocaleString()}
                          </span>
                        </div>

                        {/* Coupon Code Pill */}
                        {offer.couponCode && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleCopyCoupon(offer.id, offer.couponCode)}
                              className="w-full px-2.5 py-1 bg-stone-100 hover:bg-amber-100/70 text-stone-700 hover:text-amber-950 rounded-lg text-[11px] font-mono font-semibold flex items-center justify-between transition-colors border border-stone-200/80 cursor-pointer"
                              title="Click to copy coupon code"
                            >
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-amber-700" />
                                <span>Code: <strong>{offer.couponCode}</strong></span>
                              </span>
                              {copiedCouponId === offer.id ? (
                                <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Copied!
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[10px] flex items-center gap-0.5">
                                  <Copy className="w-3 h-3" /> Copy
                                </span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Explore Deal & Shop Button */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartWatchAd(offer)}
                          className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isClaimed ? 'Explore Deal' : 'Explore Deal (+2 Slots)'}</span>
                        </button>

                        <a
                          href={offer.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors shrink-0"
                          title={`Direct link to ${offer.brand}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-2 text-xs text-stone-500">
        {isCreatorAdmin ? (
          <span className="text-[11px] text-stone-400">
            Creator Mode: Routed via EarnKaro (5579960) & Amazon (karu0b-21)
          </span>
        ) : (
          <span className="text-[11px] text-stone-400">
            Curated daily style inspiration & trending drops
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer ml-auto"
        >
          Close
        </button>
      </div>

        {/* Creator PIN Authentication Dialog */}
        {showPinAuthDialog && (
          <div className="absolute inset-0 z-90 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in text-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Creator Access</h3>
                    <span className="text-[11px] text-stone-500">Enter your Admin PIN</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPinAuthDialog(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVerifyAdminPinSubmit} className="space-y-3">
                <p className="text-xs text-stone-600">
                  Enter your 4-digit Creator PIN (Default: <code>1526</code>) to manage fashion drops or sign in with <strong>karunapilli1526@gmail.com</strong>.
                </p>

                <div>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter PIN (e.g. 1526)"
                    value={customPinInput}
                    onChange={(e) => setCustomPinInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-center text-lg tracking-widest font-mono font-bold outline-none focus:border-amber-600"
                    autoFocus
                  />
                </div>

                {pinErrorMessage && (
                  <p className="text-xs text-rose-600 font-medium text-center">{pinErrorMessage}</p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPinAuthDialog(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Unlock Creator Mode
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Custom Deal */}
        {showAddCustomModal && isCreatorAdmin && (
          <div className="absolute inset-0 z-80 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Publish Fashion Deal</h3>
                    <span className="text-[11px] text-stone-500">Auto-routes to EarnKaro ID: 5579960 & Amazon: karu0b-21</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomDealSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Store / Brand</label>
                  <select
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600"
                  >
                    <option value="Myntra">Myntra</option>
                    <option value="Amazon Fashion">Amazon Fashion</option>
                    <option value="Nykaa Fashion">Nykaa Fashion</option>
                    <option value="Ajio">Ajio</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Tata CLiQ">Tata CLiQ</option>
                    <option value="Westside">Westside</option>
                    <option value="Meesho">Meesho</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Zara">Zara</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Slim Fit Linen Casual Shirt"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={customOrigPrice}
                      onChange={(e) => setCustomOrigPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Deal Price (₹)</label>
                    <input
                      type="number"
                      value={customDiscPrice}
                      onChange={(e) => setCustomDiscPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Store Product URL * (Raw Myntra / Amazon / Ajio link)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.myntra.com/shirts/brand/12345"
                    value={customRawUrl}
                    onChange={(e) => setCustomRawUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600 font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Category</label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600"
                    >
                      <option value="Western & Casual">Western & Casual</option>
                      <option value="Ethnic">Ethnic</option>
                      <option value="Office & Formal">Office & Formal</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Trending">Trending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Optional Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SAVE20"
                      value={customCoupon}
                      onChange={(e) => setCustomCoupon(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600 font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Product Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="Leave empty for automatic high-res fashion photo"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600 text-[11px]"
                  />
                </div>

                {/* Cloud Sync Toggle */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <div>
                      <div className="font-bold text-stone-900">Sync Globally to All App Users</div>
                      <div className="text-[10px] text-stone-500">Saves to Firebase Firestore global deals collection</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={publishToCloud}
                    onChange={(e) => setPublishToCloud(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded accent-amber-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomModal(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-5 py-2 bg-gradient-to-r from-amber-800 to-stone-900 text-white rounded-xl font-bold shadow-md hover:opacity-95 cursor-pointer disabled:opacity-50"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Deal & Monetize'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full-Screen Rewarded Video Player Overlay */}
        {isWatchingAdMob && (
          <div className="absolute inset-0 z-70 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in text-white">
            <div className="max-w-lg w-full bg-stone-900 rounded-3xl border-2 border-[#C89452] shadow-2xl overflow-hidden flex flex-col">
              {/* Header inside Ad Player */}
              <div className="px-5 py-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#D8957F] text-white font-extrabold text-[10px] rounded-md uppercase tracking-wider flex items-center gap-1 border border-[#C89452]">
                    <Sparkles className="w-3 h-3 text-[#FFF7F4]" /> Sponsored Video
                  </span>
                  <span className="text-xs font-semibold text-[#F0CAAF]">
                    Rewarded Showcase
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{adMobCountdown > 0 ? `Reward in 0:0${adMobCountdown}s` : 'Reward Unlocked!'}</span>
                </div>
              </div>

              {/* Ad Creative Video Canvas */}
              <div className="relative aspect-16/10 bg-gradient-to-br from-stone-950 via-stone-900 to-[#39402D]/40 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                {/* Visual Ad Animation */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D8957F] via-[#EFAFA0] to-[#C89452] flex items-center justify-center shadow-lg shadow-[#D8957F]/20 mb-3 animate-pulse-subtle">
                  <Tv className="w-8 h-8 text-stone-950" />
                </div>
                <h3
                  className="text-lg font-bold text-white font-serif tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Kloset Atelier • Premium Style Showcase
                </h3>
                <p className="text-xs text-stone-300 max-w-sm mt-1 leading-relaxed">
                  Watching this sponsored broadcast unlocks permanent closet storage and supports AI styling features.
                </p>

                {/* Top progress countdown bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-800">
                  <div
                    className="h-full bg-gradient-to-r from-[#D8957F] via-[#EFAFA0] to-[#C89452] transition-all duration-1000 ease-linear"
                    style={{ width: `${((6 - adMobCountdown) / 6) * 100}%` }}
                  />
                </div>
              </div>

              {/* Ad Footer & Reward Claim Action */}
              <div className="p-5 space-y-4 bg-stone-900">
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-200">
                    <Award className="w-4 h-4 text-[#C89452] shrink-0" />
                    <span>Reward: <strong>+2 Permanent Wardrobe Slots</strong></span>
                  </div>
                  {isAdMobFinished ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Ready to Claim
                    </span>
                  ) : (
                    <span className="text-stone-400 text-[11px] font-mono">
                      Playing ({adMobCountdown}s)...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={!isAdMobFinished}
                    onClick={handleFinishAdMobAndClaim}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isAdMobFinished
                        ? 'bg-gradient-to-r from-[#D8957F] via-[#EFAFA0] to-[#D8957F] hover:opacity-95 text-stone-950 shadow-lg shadow-[#D8957F]/30 active:scale-95 border border-[#C89452]'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    }`}
                  >
                    <span>{isAdMobFinished ? 'Claim +2 Wardrobe Slots Now 🎉' : `Please wait ${adMobCountdown}s to claim reward...`}</span>
                    {isAdMobFinished && <CheckCircle className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                  <span>Sponsored Monetization Network</span>
                  {isAdMobFinished && (
                    <button
                      type="button"
                      onClick={() => setIsWatchingAdMob(false)}
                      className="text-stone-400 hover:text-white underline cursor-pointer"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full-Screen Sponsored Video/Ad Player Overlay */}
        {activeWatchingOffer && (
          <div className="absolute inset-0 z-60 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in text-white">
            <div className="max-w-lg w-full bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col">
              {/* Header inside Ad Player */}
              <div className="px-5 py-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                    Sponsored Drop
                  </span>
                  <span className="text-xs font-semibold text-stone-300">
                    {activeWatchingOffer.brand} Exclusive
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{adCountdown > 0 ? `0:0${adCountdown}s` : 'Reward Ready!'}</span>
                </div>
              </div>

              {/* Ad Creative Showcase Area */}
              <div className="relative aspect-16/10 bg-black overflow-hidden flex items-center justify-center">
                <img
                  src={activeWatchingOffer.imageUrl}
                  alt={activeWatchingOffer.title}
                  className="w-full h-full object-cover opacity-90 scale-105 transition-all duration-1000 animate-pulse-subtle"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex flex-col justify-end p-5">
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
                    {activeWatchingOffer.tagline}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-tight font-serif">
                    {activeWatchingOffer.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-amber-300">
                      ₹{activeWatchingOffer.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      ₹{activeWatchingOffer.originalPrice.toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-md ml-2">
                      {activeWatchingOffer.discountPercent}% OFF
                    </span>
                  </div>
                </div>

                {/* Progress countdown bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-linear"
                    style={{ width: `${((6 - adCountdown) / 6) * 100}%` }}
                  />
                </div>
              </div>

              {/* Ad Footer & Call-To-Action */}
              <div className="p-5 space-y-4 bg-stone-900">
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Reward: <strong>+2 Permanent Items Space</strong></span>
                  </div>
                  {isAdCompleted ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-stone-400 text-[11px]">
                      Viewing drop ({adCountdown}s left)...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    disabled={!isAdCompleted}
                    onClick={() => handleFinishAdAndClaim(activeWatchingOffer, true)}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isAdCompleted
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 active:scale-95'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Claim +2 Slots & Shop on {activeWatchingOffer.brand}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={!isAdCompleted}
                    onClick={() => handleFinishAdAndClaim(activeWatchingOffer, false)}
                    className={`px-4 py-3 rounded-xl font-semibold text-xs transition-colors shrink-0 cursor-pointer ${
                      isAdCompleted
                        ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                        : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    Claim Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
