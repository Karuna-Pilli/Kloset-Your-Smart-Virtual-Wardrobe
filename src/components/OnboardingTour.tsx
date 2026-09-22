import React, { useState } from 'react';
import {
  Sparkles,
  FolderTree,
  UploadCloud,
  CheckCircle2,
  CalendarCheck,
  Luggage,
  Sparkle,
  ShieldCheck,
  Users,
  User,
  ArrowRight,
  HelpCircle,
  Search,
  Palette,
  MapPin,
  Flame,
  LayoutGrid,
  List,
  Layers,
  HardDrive,
  Shirt,
  X,
  ChevronRight,
  Tv,
  Gift,
  Cloud,
} from 'lucide-react';
import { WardrobeMode } from '../types';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode?: (mode: WardrobeMode) => void;
  onComplete?: () => void;
  currentMode?: WardrobeMode;
  isFamilyMode?: boolean;
  totalItemsCount?: number;
  sectionsCount?: number;
  subSectionsCount?: number;
  baseLimit?: number;
  bonusSlots?: number;
  currentTotalLimit?: number;
  familyMembersCount?: number;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  onComplete,
  currentMode,
  isFamilyMode,
  totalItemsCount = 0,
  sectionsCount = 0,
  subSectionsCount = 0,
  baseLimit = 35,
  bonusSlots = 0,
  currentTotalLimit = 35,
  familyMembersCount = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const initialMode = currentMode || (isFamilyMode ? 'family' : 'individual');
  const [chosenMode, setChosenMode] = useState<WardrobeMode>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setChosenMode(currentMode || (isFamilyMode ? 'family' : 'individual'));
      setCurrentStep(0);
    }
  }, [isOpen, currentMode, isFamilyMode]);

  if (!isOpen) return null;

  const isFamily = chosenMode === 'family';
  const effectiveBaseLimit = isFamily ? 75 : 35;
  const effectiveTotalLimit = effectiveBaseLimit + bonusSlots;
  const slotsRemaining = Math.max(0, effectiveTotalLimit - totalItemsCount);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Kloset Tour & Vault Architecture',
      subtitle: 'Your modern virtual closet, memory bank & precision styling system',
      icon: Sparkles,
      color: 'bg-[#F6DFD7] text-[#D8957F] border-[#E8C8BC]',
      content: (
        <div className="space-y-4 text-stone-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Remembering everything you own across wardrobes, dressers, and storage boxes is overwhelming. <strong>Kloset</strong> replaces physical rummaging with an instant, photo-backed virtual library and AI styling assistant.
          </p>

          {/* Live Capacity Card */}
          <div className="p-4 bg-gradient-to-br from-[#FAF0EB] via-[#F6DFD7]/50 to-[#FAF0EB] rounded-2xl border-2 border-[#E8C8BC] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#39402D] text-[#F0CAAF] rounded-xl shadow-2xs">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#39402D]">Live Wardrobe Vault Capacity</h4>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {isFamily ? 'Family Plan' : 'Self / Individual Closet'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#39402D]">
                  {totalItemsCount} / {effectiveTotalLimit} Slots
                </span>
                <span className="block text-[10px] text-emerald-700 font-bold">
                  {slotsRemaining} slots available
                </span>
              </div>
            </div>

            {/* Progress meter */}
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#D8957F] to-[#39402D] transition-all"
                style={{
                  width: `${Math.min(100, Math.max(8, (totalItemsCount / effectiveTotalLimit) * 100))}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
              <div className="p-2 bg-white rounded-xl border border-[#ECDACF]">
                <span className="text-stone-400 block font-medium">Base Slots</span>
                <span className="font-bold text-stone-800 text-xs">{effectiveBaseLimit}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#ECDACF]">
                <span className="text-stone-400 block font-medium">Daily Bonus</span>
                <span className="font-bold text-[#D8957F] text-xs">+{bonusSlots}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#ECDACF]">
                <span className="text-stone-400 block font-medium">Total Vault</span>
                <span className="font-bold text-[#39402D] text-xs">{effectiveTotalLimit}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#ECEFEA] rounded-xl border border-[#D1D9CB] text-xs text-[#39402D] flex gap-2.5 items-start">
            <Flame className="w-4 h-4 text-[#C89452] shrink-0 mt-0.5" />
            <span>
              <strong>Earn +2 Free Bonus Slots every day:</strong> Browse Daily Fashion Trends or watch a sponsor video in the top bar to expand your capacity anytime for free!
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'structure',
      title: 'Step 1: Choose Closet Structure & Slots',
      subtitle: 'Select between Individual Self Closet (35 slots) or Family Mode (75 slots)',
      icon: Users,
      color: 'bg-[#ECEFEA] text-[#39402D] border-[#D1D9CB]',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-stone-600">
            Choose how you want to structure your virtual records. You can switch modes or add family members anytime from the top bar!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setChosenMode('individual')}
              className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between cursor-pointer ${
                chosenMode === 'individual'
                  ? 'border-[#C89452] bg-[#FAF0EB] shadow-md ring-1 ring-[#C89452]/40'
                  : 'border-[#ECDACF] hover:border-[#C89452]/50 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-[#ECEFEA] text-[#39402D] rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                {chosenMode === 'individual' && <CheckCircle2 className="w-5 h-5 text-[#C89452]" />}
              </div>
              <div>
                <div className="font-bold text-stone-900 text-sm">Self / Individual Closet</div>
                <div className="text-[11px] text-stone-600 mt-1 font-medium">
                  <strong>35 Base Slots</strong> for personal clothing & accessories.
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  Includes unlimited sections, sub-sections, AI stylist & storage location filters.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setChosenMode('family')}
              className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between cursor-pointer ${
                chosenMode === 'family'
                  ? 'border-[#C89452] bg-[#FAF0EB] shadow-md ring-1 ring-[#C89452]/40'
                  : 'border-[#ECDACF] hover:border-[#C89452]/50 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-[#F6DFD7] text-[#D8957F] rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                {chosenMode === 'family' && <CheckCircle2 className="w-5 h-5 text-[#C89452]" />}
              </div>
              <div>
                <div className="font-bold text-stone-900 text-sm">Family Closet Hub</div>
                <div className="text-[11px] text-stone-600 mt-1 font-medium">
                  <strong>75 Base Slots</strong> across all family member folders.
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  Dedicated member tabs for Dad, Mom, Kids with individual filters & styling.
                </div>
              </div>
            </button>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-[11px]">
            ✨ <strong>Need unlimited capacity?</strong> You can unlock permanent Unlimited VIP storage from the <em>Vault & Capacity Plans</em> modal.
          </div>
        </div>
      ),
    },
    {
      id: 'sections',
      title: 'Step 2: Sections, Sub-Sections & View Switcher',
      subtitle: 'Organize by usage with Grid & List views, and AI section builder',
      icon: FolderTree,
      color: 'bg-[#F6DFD7] text-[#D8957F] border-[#E8C8BC]',
      content: (
        <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
          <p>
            Create unlimited sections (e.g. <strong>Winter Wear, Party Wear, Office Wear, Travel, Traditional</strong>) and nest multiple sub-sections (e.g. <em>Sweaters, Shawls, Jackets, Caps, Formal Shirts</em>).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 bg-white rounded-xl border border-[#ECDACF] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#39402D]">
                <LayoutGrid className="w-3.5 h-3.5 text-[#C89452]" />
                <span>Grid & List Views</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Switch effortlessly between 3-column visual cards and structured high-density list rows.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#ECDACF] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#39402D]">
                <Sparkles className="w-3.5 h-3.5 text-[#D8957F]" />
                <span>AI Section Builder</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Prompt AI with e.g. <em>"Capsule wardrobe for European Winter"</em> to generate full sections instantly.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#FAF0EB] rounded-xl border border-[#E8C8BC] text-[11px] text-stone-700 flex items-center justify-between">
            <span>Currently Active in Your Closet:</span>
            <span className="font-bold text-[#39402D]">
              {sectionsCount} Sections • {subSectionsCount} Sub-sections
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'search_colors_location',
      title: 'Step 3: Instant Search, 80+ Colors & Storage Zones',
      subtitle: 'Fast filtering right next to the logo, exact location tracking, and color swatches',
      icon: Search,
      color: 'bg-[#ECEFEA] text-[#39402D] border-[#D1D9CB]',
      content: (
        <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
          <ul className="space-y-2.5">
            <li className="p-3 bg-white rounded-xl border border-[#ECDACF] flex items-start gap-2.5">
              <Search className="w-4 h-4 text-[#C89452] shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Instant Top Search Bar:</strong>
                <span className="text-stone-600 text-[11px]">
                  Placed prominently next to the Kloset logo. Instantly filters by title, brand, color, fabric, occasion, and custom tags in real-time.
                </span>
              </div>
            </li>

            <li className="p-3 bg-white rounded-xl border border-[#ECDACF] flex items-start gap-2.5">
              <Palette className="w-4 h-4 text-[#D8957F] shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">80+ Fashion Color Swatches (10 Families):</strong>
                <span className="text-stone-600 text-[11px]">
                  Filter by exact shades (Mustard, Sage Green, Royal Navy, Champagne, Burgundy, Coral, Terracotta) with the interactive Color Swatch popover and Color Palette Studio.
                </span>
              </div>
            </li>

            <li className="p-3 bg-white rounded-xl border border-[#ECDACF] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#39402D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Storage Zones & Physical Closet Map:</strong>
                <span className="text-stone-600 text-[11px]">
                  Filter items by physical location: <em>Master Closet Main Rail, Walk-in Wardrobe, Top Shelf, Dresser Drawers, Shoe Rack, Coat Closet, Vacuum Bags, Luggage</em> with item count counters.
                </span>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'item_pages',
      title: 'Step 4: Dedicated Item Pages & Bulk Gallery Upload',
      subtitle: 'Upload single items with 10 photos, or bulk import 20 photos at once',
      icon: UploadCloud,
      color: 'bg-[#F6DFD7] text-[#D8957F] border-[#E8C8BC]',
      content: (
        <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
          <p>
            Every uploaded garment or accessory automatically generates its own <strong>dedicated, clean item page</strong>.
          </p>

          <div className="space-y-2">
            <div className="p-2.5 bg-white rounded-xl border border-[#ECDACF]">
              <span className="font-bold text-[#39402D]">• Dedicated Item Profile:</span>
              <p className="text-stone-600 text-[11px] mt-0.5">
                Item name at top, up to 10 high-resolution photos (front, back, fabric close-up), styled reference photos, size, purchase date, price, and unlimited memory notes.
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#ECDACF]">
              <span className="font-bold text-[#39402D]">• Bulk Gallery Import:</span>
              <p className="text-stone-600 text-[11px] mt-0.5">
                Drop multiple pictures from your phone gallery at once. Each photo instantly creates an individual item page ready to be tagged and filed.
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#ECDACF]">
              <span className="font-bold text-[#39402D]">• Zero Clutter Philosophy:</span>
              <p className="text-stone-600 text-[11px] mt-0.5">
                Only the fields you choose to fill in are rendered on the item page. No empty placeholder boxes!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'smart_assistants',
      title: 'Step 5: Smart Stylist, Packing, Laundry & Cloud Sync',
      subtitle: 'Complete suite of wardrobe management and styling assistants',
      icon: CalendarCheck,
      color: 'bg-[#ECEFEA] text-[#39402D] border-[#D1D9CB]',
      content: (
        <div className="space-y-2.5 text-xs text-stone-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 bg-white rounded-xl border border-[#ECDACF]">
              <div className="font-bold text-[#39402D] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C89452]" />
                <span>AI Stylist & Outfits</span>
              </div>
              <p className="text-stone-500 text-[11px] mt-1">
                "What to wear today" matching weather, occasion, and your styling persona (Female / Male / All Styles).
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#ECDACF]">
              <div className="font-bold text-[#39402D] flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-[#D8957F]" />
                <span>Trip Packing Lists</span>
              </div>
              <p className="text-stone-500 text-[11px] mt-1">
                Curate outfits for upcoming travels with real-time packed percentage meters.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#ECDACF]">
              <div className="font-bold text-[#39402D] flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-[#C89452]" />
                <span>Laundry & Loans</span>
              </div>
              <p className="text-stone-500 text-[11px] mt-1">
                Track pieces currently at dry cleaners or borrowed by family and friends.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#ECDACF]">
              <div className="font-bold text-[#39402D] flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-[#39402D]" />
                <span>Google Cloud Sync</span>
              </div>
              <p className="text-stone-500 text-[11px] mt-1">
                Sign in with Google to sync your closet seamlessly across phone, tablet, and PC.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep === 1 && onSelectMode) {
      onSelectMode(chosenMode);
    }
    if (isLast) {
      if (onComplete) {
        onComplete();
      }
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#ECDACF] flex flex-col my-auto max-h-[92vh]">
        {/* Header with progress */}
        <div className="px-6 pt-5 pb-4 border-b border-[#ECDACF] flex items-center justify-between bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${step.color} shadow-2xs`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-[#C89452] tracking-wider uppercase">
                Interactive Guide ({currentStep + 1} of {steps.length})
              </div>
              <h2
                className="text-base font-bold text-[#39402D] font-serif"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {step.title}
              </h2>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-stone-400 hover:text-stone-700 font-medium px-2 py-1 cursor-pointer transition-colors"
          >
            Skip Tour
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs font-semibold text-[#D8957F]">{step.subtitle}</p>
          {step.content}
        </div>

        {/* Footer with Step Indicator and "Got it / Ok" Buttons */}
        <div className="px-6 py-4 bg-[#FAF6F0] border-t border-[#ECDACF] flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentStep ? 'w-6 bg-[#39402D]' : 'w-2 bg-[#ECDACF] hover:bg-[#C89452]'
                }`}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-[#ECDACF]/50 rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 text-xs font-bold text-[#F0CAAF] bg-[#39402D] hover:bg-[#2C3223] rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border border-[#C89452]"
            >
              <span>
                {isLast
                  ? 'Got it! Start Organizing'
                  : currentStep === 1
                  ? 'Save Mode & Continue'
                  : 'Next'}
              </span>
              {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

