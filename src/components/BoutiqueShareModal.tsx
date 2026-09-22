import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Shield,
  X,
  Layers,
  HardDrive,
  Infinity,
  ArrowUpRight,
  Archive,
  Zap,
  Flame,
  Crown,
  Gift,
  AlertCircle,
  Tv,
  Smartphone,
} from 'lucide-react';
import { WardrobeSection, UserProfile } from '../types';
import { ADMOB_CONFIG } from '../services/adMobService';

interface BoutiqueShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: WardrobeSection[];
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  totalItemsCount?: number;
  onOpenFashionDeals?: () => void;
  onPreviewLookbook?: (sectionId: string) => void;
  onOpenArchive?: () => void;
}

export const BoutiqueShareModal: React.FC<BoutiqueShareModalProps> = ({
  isOpen,
  onClose,
  sections,
  profile,
  onUpdateProfile,
  totalItemsCount = 0,
  onOpenFashionDeals,
  onPreviewLookbook,
  onOpenArchive,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedSectionToShare, setSelectedSectionToShare] = useState<string>('all');
  const [selectedPlanTab, setSelectedPlanTab] = useState<'share' | 'storage'>('share');
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  if (!isOpen) return null;

  const isFamily = profile.currentMode === 'family';
  const baseLimit = isFamily ? 75 : 35;
  const bonusSlots = profile.bonusItemSlots || 0;
  const currentTotalLimit = baseLimit + bonusSlots;
  const usagePercentage = Math.min(100, Math.round((totalItemsCount / currentTotalLimit) * 100));

  const shareUrl = `${window.location.origin}/?lookbook=${encodeURIComponent(selectedSectionToShare)}&user=${encodeURIComponent(
    profile.name || 'User'
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateUpgrade = (tier: string, extraSlots?: number) => {
    if (extraSlots) {
      const updated = {
        ...profile,
        bonusItemSlots: (profile.bonusItemSlots || 0) + extraSlots,
      };
      onUpdateProfile(updated);
      setUpgradeMessage(`+${extraSlots} Extra item capacity slots added! Total capacity is now ${baseLimit + updated.bonusItemSlots} pieces.`);
    } else {
      const updated = {
        ...profile,
        bonusItemSlots: (profile.bonusItemSlots || 0) + 9999,
        planTier: 'lifetime' as const,
      };
      onUpdateProfile(updated);
      setUpgradeMessage(`🎉 Unlimited Kloset Vault unlocked! Enjoy infinite items, unlimited photos, and priority AI styling.`);
    }

    setShowUpgradeSuccess(true);
    setTimeout(() => {
      setShowUpgradeSuccess(false);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h2
              className="text-lg font-bold text-stone-900 font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Kloset Lookbook & Vault Capacity
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Share your curated style or manage your Kloset storage limits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 p-1.5 gap-1.5 mx-6 mt-4 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedPlanTab('share')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedPlanTab === 'share'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Lookbook</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlanTab('storage')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedPlanTab === 'storage'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-800" />
            <span>Storage & Extra Space</span>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto text-xs flex-1">
          {selectedPlanTab === 'share' ? (
            /* SHARE LOOKBOOK TAB */
            <div className="space-y-4">
              <div className="space-y-3 p-4 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                  <Share2 className="w-4 h-4 text-amber-800" />
                  <span>View-Only Lookbook Link</span>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Generate an interactive, view-only lookbook link for friends, family, or personal archives to browse without editing access.
                </p>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1.5">
                    Select Section / Folder to Share:
                  </label>
                  <select
                    value={selectedSectionToShare}
                    onChange={(e) => setSelectedSectionToShare(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300/80 rounded-xl outline-none text-xs font-medium text-stone-800"
                  >
                    <option value="all">Entire Wardrobe (All Folders & Pieces)</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        Folder: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 p-2.5 bg-white border border-amber-200 rounded-xl font-mono text-[11px] text-stone-700 outline-none"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer text-xs"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    {onPreviewLookbook && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onPreviewLookbook(selectedSectionToShare);
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>Preview Lookbook</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold">
                  <Shield className="w-4 h-4 text-amber-800" />
                  <span>Privacy & Security</span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Shared lookbook links only expose view permissions. Your notes, purchase prices, and edit controls remain strictly private to your authenticated account.
                </p>
              </div>
            </div>
          ) : (
            /* STORAGE & EXTRA SPACE TAB */
            <div className="space-y-5">
              {showUpgradeSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in shadow-2xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{upgradeMessage || 'Extra space unlocked! Your wardrobe capacity has been expanded.'}</span>
                </div>
              )}

              {/* Current Usage Progress Card */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-stone-800 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-800" />
                    <span>Current Plan Usage ({isFamily ? 'Family Mode' : 'Self Closet'})</span>
                  </div>
                  <span className="font-bold text-stone-900">
                    {totalItemsCount} / {currentTotalLimit} pieces ({usagePercentage}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      usagePercentage > 85
                        ? 'bg-rose-500'
                        : usagePercentage > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.max(5, usagePercentage)}%` }}
                  />
                </div>

                <div className="text-[11px] text-stone-500 leading-relaxed space-y-1">
                  <p>
                    {isFamily
                      ? `Family plan includes a base limit of 75 items across all profiles.`
                      : `Individual closet includes a base limit of 35 single clothing pieces.`}
                    {bonusSlots > 0 && (
                      <strong className="text-amber-900 font-semibold block">
                        ✨ You have earned {bonusSlots} extra bonus slots from partner trends & expansion packs!
                      </strong>
                    )}
                  </p>
                </div>
              </div>

              {/* 1-Garment Integrity Policy */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-stone-700">
                <AlertCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>1 Garment Per Item Policy:</strong> Each item record is designed for one distinct clothing piece. You can add angle photos (front, back, fabric close-up) and styling reference photos for that garment.
                </p>
              </div>

              {/* Extra Space Expansion Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Ways to Expand Your Wardrobe Space
                  </h3>
                </div>

                {/* Free Rewarded Video Option (+2 Slots each) */}
                <div className="p-4 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 rounded-2xl border border-[#C89452]/50 text-white space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-gradient-to-tr from-[#D8957F] to-[#EFAFA0] text-stone-950 rounded-xl">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-white">Watch Short Video</h4>
                          <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-full border border-emerald-500/30">
                            100% Free
                          </span>
                        </div>
                        <span className="text-[11px] text-[#F0CAAF] font-semibold">Earn +2 Permanent Free Slots</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Watch a short sponsor video to immediately expand your wardrobe storage capacity by <strong>+2 slots</strong>.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenFashionDeals) onOpenFashionDeals();
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-[#D8957F] via-[#EFAFA0] to-[#D8957F] hover:opacity-95 text-stone-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer border border-[#C89452]"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Watch Short Video & Earn +2 Slots</span>
                  </button>
                </div>

                {/* Option 1: Lifetime VIP Unlimited Access */}
                <div className="p-4 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white rounded-2xl border border-amber-700/50 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-400 text-stone-950 rounded-lg">
                        <Crown className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-amber-50">Lifetime VIP Unlimited Pass</h4>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-400 text-stone-950 rounded-full">
                            One-Time
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-medium">One payment • Forever access</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-amber-400">$69.99</span>
                      <span className="text-[10px] text-stone-400 block font-normal">/ ₹5,999 once</span>
                    </div>
                  </div>

                  <ul className="text-[11px] text-stone-300 space-y-1 pl-1">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Infinite clothing items for you & all family members</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Up to 10 high-resolution photos per item</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Unlimited AI Stylist outfit recommendations & color palette checks</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Zero ads & VIP concierge support forever</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleSimulateUpgrade('lifetime')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-extrabold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-stone-950" />
                    <span>Get Lifetime Unlimited Pass ($69.99 / ₹5,999)</span>
                  </button>
                </div>

                {/* Option 2: Annual VIP Subscription (Most Popular) */}
                <div className="p-4 bg-gradient-to-br from-[#FAF0EB] to-[#F6DFD7] rounded-2xl border-2 border-[#D8957F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-stone-900 text-xs sm:text-sm">Annual VIP Member</h5>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-extrabold">
                        Save 45% • Best Value
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5B6E48] font-medium leading-tight">
                      Unlimited items, unlimited AI stylist & packing assistant for 1 full year ($24.99 / ₹1,999/yr)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSimulateUpgrade('annual')}
                    className="px-4 py-2.5 bg-[#5B6E48] hover:bg-[#4F603D] text-[#FAF4F0] font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-xs border border-[#C89452]"
                  >
                    Subscribe ₹1,999/yr
                  </button>
                </div>

                {/* Option 3: Monthly VIP Subscription (Flexible) */}
                <div className="p-3.5 bg-white rounded-2xl border-2 border-[#E8C8BC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#C89452] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-stone-900 text-xs">Monthly VIP Pass</h5>
                      <span className="text-[10px] text-[#C89452] bg-[#FAF0EB] border border-[#E8C8BC] px-2 py-0.5 rounded-md font-bold">
                        Cancel Anytime
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Full VIP access & unlimited closet slots renewed monthly ($1.99 / ₹149/mo)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSimulateUpgrade('monthly')}
                    className="px-4 py-2 bg-[#D8957F] hover:bg-[#C87D78] text-white font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-2xs"
                  >
                    Subscribe ₹149/mo
                  </button>
                </div>

                {/* Option 4: Add-On Capacity Pack */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-stone-900 text-xs">+15 Items Expansion Pack</h5>
                    <p className="text-[11px] text-stone-500">Add 15 extra item slots permanently ($0.99 / ₹79 one-time)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSimulateUpgrade('pack', 15)}
                    className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Add +15 (₹79)
                  </button>
                </div>

                {/* Option 4: Seasonal Archive */}
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 text-stone-600 text-[11px] leading-relaxed">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 block">Free Seasonal Archiving</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                          100% Free
                        </span>
                      </div>
                      <p>
                        Archive off-season clothes (e.g. winter coats during summer, or festive wear) to immediately free up active wardrobe capacity. Archived items use 0 closet slots!
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium pt-0.5">
                        💡 How to archive: Open any wardrobe piece details and click <strong className="text-stone-800">&ldquo;Move to Seasonal Archive&rdquo;</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenArchive) {
                        onOpenArchive();
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    View Seasonal Archive
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
