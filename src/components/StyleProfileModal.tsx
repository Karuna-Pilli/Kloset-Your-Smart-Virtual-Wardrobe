import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User,
  Check,
  X,
  Sparkle,
  Shirt,
  Crown,
  Heart,
  Palette,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AppLogo } from './AppLogo';
import { User as FirebaseUser } from '../lib/firebase';

interface StyleProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  currentUser?: FirebaseUser | null;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  isInitialOnboarding?: boolean;
}

export const StyleProfileModal: React.FC<StyleProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentUser,
  onSaveProfile,
  isInitialOnboarding = false,
}) => {
  // Preload name from profile or auth
  const initialName =
    profile.preferredName ||
    profile.name ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    '';

  const [preferredName, setPreferredName] = useState(initialName);
  const [styleType, setStyleType] = useState<'FEMALE' | 'MALE' | 'ALL'>(
    profile.preferredStyleType || 'FEMALE'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultName =
        profile.preferredName ||
        profile.name ||
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        '';
      setPreferredName(defaultName);
      if (profile.preferredStyleType) {
        setStyleType(profile.preferredStyleType);
      }
      setSavedSuccess(false);
    }
  }, [isOpen, profile, currentUser]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = preferredName.trim() || 'My Wardrobe';

    const updatedProfile: UserProfile = {
      ...profile,
      name: finalName,
      preferredName: finalName,
      preferredStyleType: styleType,
      hasCompletedStyleProfile: true,
      isLoggedIn: currentUser ? true : profile.isLoggedIn,
    };

    onSaveProfile(updatedProfile);
    setSavedSuccess(true);

    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF6F0] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-[#ECDACF] relative animate-scale-up">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#39402D] via-[#485339] to-[#39402D] text-[#F0CAAF] p-6 relative">
          {!isInitialOnboarding && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#F0CAAF]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89452] text-white flex items-center gap-1 uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#FFF7F4] animate-pulse-subtle" /> AI Stylist Persona
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {isInitialOnboarding ? 'Welcome to Kloset: Your Virtual Wardrobe' : 'Styling Preferences'}
          </h2>
          <p className="text-xs text-[#ECDACF] mt-1 font-medium leading-relaxed">
            Customize how your wardrobe is organized and how the Gemini AI Stylist curates outfit recommendations for you.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Field 1: Preferred Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#39402D] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C89452]" />
              <span>Preferred Name</span>
            </label>
            <input
              type="text"
              required
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="e.g. Karuna"
              className="w-full px-4 py-3 text-sm bg-white border border-[#ECDACF] rounded-2xl focus:border-[#C89452] focus:ring-2 focus:ring-[#C89452]/20 outline-none transition-all text-stone-800 font-semibold shadow-2xs placeholder:text-stone-400"
            />
            <p className="text-[11px] text-stone-500 font-medium">
              Preloaded from your login. You can edit this anytime.
            </p>
          </div>

          {/* Field 2: Preferred to Style As (Style Type Selection) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#39402D] flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-[#C89452]" />
                <span>Preferred to style as</span>
              </label>
              <span className="text-[10px] font-bold text-[#C89452] bg-[#FAF2EC] px-2 py-0.5 rounded-md border border-[#ECDACF]">
                Tailors AI Recommendations
              </span>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed font-medium bg-[#FAF2EC] p-2.5 rounded-xl border border-[#ECDACF]">
              💡 <em>Note:</em> We do not ask for personal gender. We ask for your preferred fashion styling aesthetic so Gemini AI generates the right cuts, silhouettes, and outfit pairings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: FEMALE */}
              <button
                type="button"
                onClick={() => setStyleType('FEMALE')}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  styleType === 'FEMALE'
                    ? 'bg-gradient-to-br from-[#FBF0EB] to-[#F5DFD6] border-[#C89452] shadow-sm ring-1 ring-[#C89452]'
                    : 'bg-white hover:bg-[#FAF2EC] border-[#ECDACF] text-stone-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#D8957F] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      ♀
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-[#39402D]">FEMALE</div>
                      <div className="text-[10px] text-[#C89452] font-semibold">Women's Styling</div>
                    </div>
                  </div>
                  {styleType === 'FEMALE' && (
                    <div className="w-5 h-5 rounded-full bg-[#39402D] text-[#F0CAAF] flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 mt-2 font-medium leading-tight">
                  Dresses, blouses, ethnic sarees & lehengas, jewelry, heels, handbags & feminine silhouettes.
                </p>
              </button>

              {/* Option 2: MALE */}
              <button
                type="button"
                onClick={() => setStyleType('MALE')}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  styleType === 'MALE'
                    ? 'bg-gradient-to-br from-[#FBF0EB] to-[#F5DFD6] border-[#C89452] shadow-sm ring-1 ring-[#C89452]'
                    : 'bg-white hover:bg-[#FAF2EC] border-[#ECDACF] text-stone-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#39402D] text-[#F0CAAF] flex items-center justify-center font-bold text-xs shadow-2xs">
                      ♂
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-[#39402D]">MALE</div>
                      <div className="text-[10px] text-[#C89452] font-semibold">Men's Styling</div>
                    </div>
                  </div>
                  {styleType === 'MALE' && (
                    <div className="w-5 h-5 rounded-full bg-[#39402D] text-[#F0CAAF] flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 mt-2 font-medium leading-tight">
                  Tailored shirts, blazers, suits, trousers, outerwear, sneakers, loafers & masculine silhouettes.
                </p>
              </button>
            </div>

            {/* Option 3: ALL / CAPSULE */}
            <button
              type="button"
              onClick={() => setStyleType('ALL')}
              className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                styleType === 'ALL'
                  ? 'bg-[#ECEFEA] border-[#39402D] text-[#39402D]'
                  : 'bg-white hover:bg-[#FAF2EC] border-[#ECDACF] text-stone-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#C89452]" />
                <div>
                  <span className="text-xs font-bold text-[#39402D]">Versatile / All Styles</span>
                  <span className="text-[10px] text-stone-500 ml-1.5 font-medium">
                    (Capsule, unisex & multi-member curation)
                  </span>
                </div>
              </div>
              {styleType === 'ALL' && <Check className="w-3.5 h-3.5 text-[#39402D]" />}
            </button>
          </div>

          {/* Success / Status Message */}
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Preferences saved! AI Stylist is now configured for your styling type.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {!isInitialOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-[#FAF2EC] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#39402D] hover:bg-[#485339] text-[#F0CAAF] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-[#C89452] cursor-pointer"
            >
              <span>Save & Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C89452]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
