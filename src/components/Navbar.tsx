import React from 'react';
import {
  Sparkles,
  FolderTree,
  UploadCloud,
  Layers,
  Calendar,
  Luggage,
  Users,
  User,
  Plus,
  Search,
  HelpCircle,
  Shirt,
  Sparkle,
  Share2,
  Store,
  Clock,
  Waves,
  HeartHandshake,
  Menu,
  Cloud,
  LogIn,
  Flame,
  Gift,
  X,
} from 'lucide-react';
import { WardrobeMode, FamilyMember, UserProfile } from '../types';
import { AppLogo } from './AppLogo';
import { User as FirebaseUser } from '../lib/firebase';

interface NavbarProps {
  activeTab: 'catalog' | 'sections' | 'stylist' | 'packing' | 'laundry_loans' | 'reminders';
  setActiveTab: (tab: 'catalog' | 'sections' | 'stylist' | 'packing' | 'laundry_loans' | 'reminders') => void;
  profile: UserProfile;
  currentUser?: FirebaseUser | null;
  onOpenAuth?: () => void;
  onOpenStyleProfile?: () => void;
  onOpenFamilyModal?: () => void;
  onModeChange?: (mode: WardrobeMode) => void;
  familyMembers: FamilyMember[];
  activePersonId: string;
  onSelectPerson: (id: string) => void;
  onAddFamilyMember?: (name: string, relationship: string) => void;
  onUpdateFamilyMembers?: (members: FamilyMember[]) => void;
  onOpenUpload?: (bulk?: boolean) => void;
  onOpenUploadModal?: (bulk?: boolean) => void;
  onOpenProfile?: () => void;
  onOpenTour?: () => void;
  onStartTour?: () => void;
  onOpenShare?: () => void;
  onOpenBoutiqueModal?: () => void;
  onOpenFashionDeals?: () => void;
  pendingRemindersCount: number;
  activeLaundryCount: number;
  activeLoansCount?: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  currentUser,
  onOpenAuth,
  onOpenStyleProfile,
  onOpenFamilyModal,
  onModeChange,
  familyMembers,
  activePersonId,
  onSelectPerson,
  onAddFamilyMember,
  onUpdateFamilyMembers,
  onOpenUpload,
  onOpenUploadModal,
  onOpenProfile,
  onOpenTour,
  onStartTour,
  onOpenShare,
  onOpenBoutiqueModal,
  onOpenFashionDeals,
  pendingRemindersCount,
  activeLaundryCount,
  activeLoansCount = 0,
  searchQuery,
  setSearchQuery,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const isFamily = profile.currentMode === 'family';
  const [showAddMember, setShowAddMember] = React.useState(false);
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberRel, setNewMemberRel] = React.useState('Family Member');

  const triggerUpload = (bulk?: boolean) => {
    if (onOpenUpload) onOpenUpload(bulk);
    else if (onOpenUploadModal) onOpenUploadModal(bulk);
  };

  const triggerTour = () => {
    if (onOpenTour) onOpenTour();
    else if (onStartTour) onStartTour();
  };

  const triggerShare = () => {
    if (onOpenShare) onOpenShare();
    else if (onOpenBoutiqueModal) onOpenBoutiqueModal();
    else if (onOpenProfile) onOpenProfile();
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    if (onAddFamilyMember) {
      onAddFamilyMember(newMemberName.trim(), newMemberRel);
    }
    setNewMemberName('');
    setShowAddMember(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-xl border-b border-[#ECDACF] shadow-[0_2px_16px_rgba(200,148,82,0.06)] pt-[env(safe-area-inset-top,0px)]">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left Menu Toggle & AppLogo */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-stone-700 hover:text-[#1A1817] hover:bg-[#FBF0EB] transition-colors border border-[#ECDACF] shadow-2xs cursor-pointer"
                title={isSidebarOpen ? 'Close Menu' : 'Open Navigation & Categories Menu'}
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Cool Geometric Logo & App Title */}
            <AppLogo
              variant="full"
              size="md"
              onClick={() => setActiveTab('catalog')}
            />
          </div>

          {/* Luxury Search bar next to logo */}
          <div className="flex items-center flex-1 min-w-[100px] sm:min-w-[180px] max-w-full sm:max-w-xs md:max-w-sm mx-1 sm:mx-3 relative group z-10">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C89452] group-focus-within:text-[#39402D] transition-colors absolute left-2.5 sm:left-3 pointer-events-none" />
            <input
              id="navbar-search-input"
              name="navbar-search"
              type="text"
              placeholder="Search items, colors..."
              value={searchQuery || ''}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().length > 0 && activeTab !== 'catalog') {
                  setActiveTab('catalog');
                }
              }}
              autoComplete="off"
              spellCheck="false"
              className="w-full pl-7 sm:pl-9 pr-6 sm:pr-8 py-1.5 sm:py-2 text-[11px] sm:text-xs bg-white hover:bg-[#FAF2EC]/50 focus:bg-white rounded-xl border border-[#ECDACF] focus:border-[#C89452] focus:ring-2 focus:ring-[#C89452]/20 outline-none transition-all placeholder:text-stone-400 font-medium text-stone-800 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 sm:right-2.5 p-0.5 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5 text-[#C89452]" />
              </button>
            )}
          </div>

          {/* Action Buttons: Add Item & Profile (Sleek and responsive without horizontal scrolling) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Single Clear Add Piece Button */}
            <button
              type="button"
              onClick={() => triggerUpload(false)}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#39402D] hover:bg-[#485339] text-[#F0CAAF] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 border border-[#C89452] cursor-pointer"
              title="Add clothing or accessory pieces"
            >
              <Plus className="w-3.5 h-3.5 text-[#C89452]" />
              <span className="hidden sm:inline">Add Piece</span>
            </button>

            {/* Daily Trends & Ads (+2 Slots) - Desktop only (available in drawer on mobile) */}
            {onOpenFashionDeals && (
              <button
                type="button"
                onClick={onOpenFashionDeals}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#FBF0EB] via-[#FAF2EC] to-[#FBF0EB] hover:from-[#F5DFD6] hover:to-[#F0CAAF]/50 text-[#39402D] rounded-xl text-xs font-bold border border-[#ECDACF] transition-all shadow-2xs cursor-pointer group"
                title="Browse trending drops & partner ads on Myntra, Nykaa, Amazon to earn +2 free wardrobe slots!"
              >
                <Flame className="w-3.5 h-3.5 text-[#C89452] group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline">Daily Trends</span>
                <span className="px-1.5 py-0.2 bg-[#39402D] text-[#F0CAAF] text-[10px] rounded-md font-extrabold shadow-2xs">
                  +2 Space
                </span>
              </button>
            )}

            {/* Share Lookbook - Desktop only (available in drawer on mobile) */}
            <button
              type="button"
              onClick={triggerShare}
              className="hidden sm:flex p-2 text-stone-600 hover:text-[#39402D] hover:bg-[#FBF0EB] rounded-xl transition-colors border border-transparent hover:border-[#ECDACF] cursor-pointer"
              title="Share Wardrobe Lookbook & Vault Capacity"
            >
              <Share2 className="w-4 h-4 text-stone-600 hover:text-[#39402D]" />
            </button>

            {/* Interactive Tour Helper - Desktop only (available in drawer on mobile) */}
            <button
              type="button"
              onClick={triggerTour}
              className="hidden sm:flex p-2 text-[#39402D] hover:text-[#1A1817] hover:bg-[#FBF0EB] rounded-xl transition-colors border border-transparent hover:border-[#ECDACF] cursor-pointer"
              title="Restart Interactive Feature Tour"
            >
              <HelpCircle className="w-4 h-4 text-[#C89452]" />
            </button>

            {/* Google Sign In / Sync Indicator on desktop */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#ECEFEA] hover:bg-[#E2E8DE] text-[#39402D] rounded-xl text-xs font-semibold border border-[#D1D9CB] transition-colors shadow-2xs cursor-pointer"
                title={`Signed in as ${currentUser.displayName || currentUser.email} — Syncing Live`}
              >
                <Cloud className="w-3.5 h-3.5 text-[#39402D] animate-pulse-subtle" />
                <span className="text-[11px] hidden md:inline">Synced</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-[#FBF0EB] text-stone-800 rounded-xl text-xs font-bold border border-[#ECDACF] shadow-2xs hover:border-[#C89452]/50 transition-all cursor-pointer"
                title="Sign in with Google to sync across your phone, tablet, and PC"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-xs">Sign In</span>
              </button>
            )}

            {/* Styling Persona Trigger Badge */}
            {onOpenStyleProfile && (
              <button
                type="button"
                onClick={onOpenStyleProfile}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FBF0EB] text-[#39402D] rounded-xl text-xs font-bold border border-[#ECDACF] shadow-2xs hover:border-[#C89452] transition-all cursor-pointer"
                title="Your fashion styling preference (Tailors AI Stylist recommendations)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C89452]" />
                <span className="text-[11px] font-extrabold text-[#C89452]">
                  {profile.preferredStyleType === 'FEMALE'
                    ? '♀ FEMALE'
                    : profile.preferredStyleType === 'MALE'
                    ? '♂ MALE'
                    : '⚲ ALL'}
                </span>
              </button>
            )}

            {/* User Profile / Account Button - Only shows photo if user signed in with real profile photo, else neutral icon */}
            <button
              type="button"
              onClick={onOpenAuth || onOpenStyleProfile || triggerShare}
              className="flex items-center gap-1.5 p-1 sm:p-1.5 hover:bg-[#FBF0EB] rounded-xl transition-all border border-[#ECDACF] shadow-2xs hover:border-[#C89452]/50 cursor-pointer shrink-0"
              title={currentUser ? `Signed in as ${currentUser.email || currentUser.displayName}` : "Account & Sign In"}
            >
              {currentUser?.photoURL && currentUser.photoURL.trim() !== '' ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User Profile'}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#C89452]/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#FAF0EB] text-[#39402D] flex items-center justify-center border border-[#ECDACF]">
                  <User className="w-3.5 h-3.5 text-[#39402D]" />
                </div>
              )}
              <span className="text-xs font-semibold text-stone-800 hidden lg:inline max-w-[85px] truncate">
                {currentUser?.displayName || (profile.isLoggedIn ? profile.preferredName || profile.name : 'Sign In')}
              </span>
            </button>
          </div>
        </div>

        {/* Second Row: Mode & Family Member Bar + Feature Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pb-2.5 gap-2 border-t border-[#ECDACF] pt-2">
          {/* Family Member or Individual Mode Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {/* Toggle Mode Button */}
            {onModeChange && (
              <button
                type="button"
                onClick={() => onModeChange(isFamily ? 'individual' : 'family')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 border shadow-2xs cursor-pointer ${
                  isFamily
                    ? 'bg-[#FBF0EB] text-[#39402D] border-[#ECDACF] hover:bg-[#F5DFD6]'
                    : 'bg-[#ECEFEA] text-[#39402D] border-[#D1D9CB] hover:bg-[#E2E8DE]'
                }`}
                title={`Click to switch to ${isFamily ? 'Individual Self Mode' : 'Family Mode'}`}
              >
                {isFamily ? <Users className="w-3.5 h-3.5 text-[#DFA995]" /> : <User className="w-3.5 h-3.5 text-[#39402D]" />}
                <span className="font-bold">{isFamily ? 'Family Mode' : 'Self Closet'}</span>
                <span className="text-[10px] text-stone-400 font-normal">↺</span>
              </button>
            )}

            {isFamily ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectPerson('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activePersonId === 'all'
                      ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-xs'
                      : 'bg-[#F0CAAF]/50 text-[#39402D] hover:bg-[#DFA995]/40 border border-[#ECDACF]'
                  }`}
                >
                  All Folders
                </button>
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => onSelectPerson(member.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      activePersonId === member.id
                        ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-xs'
                        : 'bg-[#F0CAAF]/50 text-[#39402D] hover:bg-[#DFA995]/40 border border-[#ECDACF]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#C89452]" />
                    {member.name}
                    {member.relationship === 'Self'
                      ? ' (You)'
                      : member.relationship && member.relationship !== 'None'
                      ? ` (${member.relationship})`
                      : ''}
                  </button>
                ))}

                {onOpenFamilyModal ? (
                  <button
                    type="button"
                    onClick={onOpenFamilyModal}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DFA995]/30 hover:bg-[#DFA995]/60 text-[#39402D] border border-[#DFA995] flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    title="Manage family members, add or delete folders"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C89452]" />
                    <span>Members & Folders</span>
                  </button>
                ) : onAddFamilyMember ? (
                  <button
                    type="button"
                    onClick={() => setShowAddMember(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DFA995]/30 hover:bg-[#DFA995]/60 text-[#39402D] border border-[#DFA995] flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    title="Add a new family member"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C89452]" />
                    <span>Member</span>
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="text-[11px] text-[#39402D]/70 font-semibold hidden sm:block">
                Curated wardrobe atelier
              </div>
            )}
          </div>

          {/* Primary View Navigation Tabs - Desktop (flex row) */}
          <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-xs'
                  : 'text-[#39402D] bg-[#FAF2EC] hover:bg-[#DFA995]/30 border border-[#ECDACF]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#C89452]" />
              <span>Wardrobe</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-xs'
                  : 'text-[#39402D] bg-[#FAF2EC] hover:bg-[#DFA995]/30 border border-[#ECDACF]'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5 text-[#DFA995]" />
              <span>Sections</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stylist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'stylist'
                  ? 'bg-[#C89452] text-white shadow-xs border border-[#C89452]'
                  : 'text-[#39402D] bg-[#DFA995]/30 hover:bg-[#DFA995]/50 border border-[#DFA995]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C89452] animate-pulse-subtle" />
              <span>AI Outfit Stylist</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('packing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'packing'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-xs'
                  : 'text-[#39402D] bg-[#FAF2EC] hover:bg-[#DFA995]/30 border border-[#ECDACF]'
              }`}
            >
              <Luggage className="w-3.5 h-3.5 text-[#C89452]" />
              <span>Packing Lists</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('laundry_loans')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap relative cursor-pointer ${
                activeTab === 'laundry_loans'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-xs'
                  : 'text-[#39402D] bg-[#FAF2EC] hover:bg-[#DFA995]/30 border border-[#ECDACF]'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-[#39402D]" />
              <span>Laundry & Loans</span>
              {(activeLaundryCount > 0 || activeLoansCount > 0) && (
                <span className="w-2 h-2 rounded-full bg-[#C89452] ring-2 ring-[#F0CAAF]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reminders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap relative cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-xs'
                  : 'text-[#39402D] bg-[#FAF2EC] hover:bg-[#DFA995]/30 border border-[#ECDACF]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#DFA995]" />
              <span>Reminders</span>
              {pendingRemindersCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#39402D] text-[#F0CAAF] text-[10px] font-bold rounded-full border border-[#C89452]">
                  {pendingRemindersCount}
                </span>
              )}
            </button>
          </nav>

          {/* Primary View Navigation Tabs - Mobile (Fits 100% within screen space without horizontal scroll) */}
          <nav className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 md:hidden w-full pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-2xs'
                  : 'text-[#39402D] bg-[#FAF2EC] border border-[#ECDACF]'
              }`}
            >
              <Layers className="w-3 h-3 text-[#C89452] shrink-0" />
              <span className="truncate">Wardrobe</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sections')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-2xs'
                  : 'text-[#39402D] bg-[#FAF2EC] border border-[#ECDACF]'
              }`}
            >
              <FolderTree className="w-3 h-3 text-[#DFA995] shrink-0" />
              <span className="truncate">Sections</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stylist')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'stylist'
                  ? 'bg-[#C89452] text-white shadow-2xs border border-[#C89452]'
                  : 'text-[#39402D] bg-[#DFA995]/30 border border-[#DFA995]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#C89452] shrink-0" />
              <span className="truncate">AI Stylist</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('packing')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'packing'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-2xs'
                  : 'text-[#39402D] bg-[#FAF2EC] border border-[#ECDACF]'
              }`}
            >
              <Luggage className="w-3 h-3 text-[#C89452] shrink-0" />
              <span className="truncate">Packing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('laundry_loans')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all relative cursor-pointer ${
                activeTab === 'laundry_loans'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-2xs'
                  : 'text-[#39402D] bg-[#FAF2EC] border border-[#ECDACF]'
              }`}
            >
              <Waves className="w-3 h-3 text-[#39402D] shrink-0" />
              <span className="truncate">Laundry</span>
              {(activeLaundryCount > 0 || activeLoansCount > 0) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C89452]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reminders')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all relative cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452] shadow-2xs'
                  : 'text-[#39402D] bg-[#FAF2EC] border border-[#ECDACF]'
              }`}
            >
              <Clock className="w-3 h-3 text-[#DFA995] shrink-0" />
              <span className="truncate">Reminders</span>
              {pendingRemindersCount > 0 && (
                <span className="px-1 py-0.1 bg-[#39402D] text-[#F0CAAF] text-[9px] font-bold rounded-full">
                  {pendingRemindersCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Add Family Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-800" />
                <span>Add Family Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Person's Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mom, Liam, Sarah"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                <select
                  value={newMemberRel}
                  onChange={(e) => setNewMemberRel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="Self">Self</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-xl shadow-xs"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
