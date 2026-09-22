import React, { useState } from 'react';
import {
  Home,
  FolderTree,
  Sparkles,
  Luggage,
  Waves,
  Clock,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Shirt,
  Snowflake,
  Sparkle,
  Briefcase,
  Gem,
  Layers,
  Tag,
  X,
  Filter,
  Check,
  Package,
  Palette,
  Flame,
  HardDrive,
  Share2,
  HelpCircle,
  User,
} from 'lucide-react';
import { WardrobeItem, WardrobeSection, ItemCategory, FamilyMember } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  activeTab: 'catalog' | 'sections' | 'stylist' | 'packing' | 'laundry_loans' | 'reminders';
  setActiveTab: (tab: 'catalog' | 'sections' | 'stylist' | 'packing' | 'laundry_loans' | 'reminders') => void;
  items: WardrobeItem[];
  sections: WardrobeSection[];
  activePersonId: string;
  familyMembers: FamilyMember[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSectionId: string;
  setSelectedSectionId: (sectionId: string) => void;
  onGoToHome: () => void;
  onOpenAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onOpenFashionDeals?: () => void;
  onOpenColorContrast?: () => void;
  onOpenBoutiqueModal?: () => void;
  onOpenTour?: () => void;
  onOpenAuth?: () => void;
  customCategories?: string[];
  onOpenManageCategories?: () => void;
}

const ICON_MAP: Record<string, any> = {
  Snowflake,
  Sparkles,
  Briefcase,
  Shirt,
  Luggage,
  Gem,
  Layers,
};

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

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  items,
  sections,
  activePersonId,
  familyMembers,
  selectedCategory,
  setSelectedCategory,
  selectedSectionId,
  setSelectedSectionId,
  onGoToHome,
  onOpenAddSection,
  onDeleteSection,
  onOpenFashionDeals,
  onOpenColorContrast,
  onOpenBoutiqueModal,
  onOpenTour,
  onOpenAuth,
  customCategories,
  onOpenManageCategories,
}) => {
  const [sectionsExpanded, setSectionsExpanded] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});
  const [sectionToDelete, setSectionToDelete] = useState<WardrobeSection | null>(null);

  // Filter items by active person
  const personItems = items.filter((i) => {
    if (activePersonId === 'all') return true;
    return i.personId === activePersonId;
  });

  const toggleSectionTree = (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSectionIds((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const handleSelectSection = (secId: string) => {
    setActiveTab('catalog');
    setSelectedSectionId(secId);
    setSelectedCategory('All');
    if (onClose && window.innerWidth < 1024) onClose();
  };

  const handleSelectCategory = (cat: string) => {
    setActiveTab('catalog');
    setSelectedCategory(cat);
    setSelectedSectionId('All');
    if (onClose && window.innerWidth < 1024) onClose();
  };

  const handleHomeClick = () => {
    onGoToHome();
    if (onClose && window.innerWidth < 1024) onClose();
  };

  const confirmDelete = () => {
    if (sectionToDelete) {
      onDeleteSection(sectionToDelete.id);
      if (selectedSectionId === sectionToDelete.id) {
        setSelectedSectionId('All');
      }
      setSectionToDelete(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Full height on mobile without top gap */}
      <aside
        id="app-left-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 xs:w-80 max-w-[85vw] bg-[#FAF6F0] border-r border-[#ECDACF] flex flex-col transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-30 pt-[env(safe-area-inset-top,0px)] ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header (Close button & App branding) */}
        <div className="p-3.5 border-b border-[#ECDACF] flex items-center justify-between lg:hidden bg-[#FBF0EB]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#C89452]" />
            <span className="text-xs font-bold text-stone-800 tracking-tight">Navigation & Folders</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-[#F5DFD6] transition-colors cursor-pointer border border-[#ECDACF]"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
          {/* HOME / OVERALL COLLECTION OPTION */}
          <div className="space-y-1">
            <button
              id="sidebar-home-overall-btn"
              type="button"
              onClick={handleHomeClick}
              className={`w-full p-2.5 rounded-2xl text-left font-bold text-xs transition-all flex items-center justify-between group cursor-pointer ${
                activeTab === 'catalog' && selectedCategory === 'All' && selectedSectionId === 'All'
                  ? 'bg-gradient-to-r from-[#D8957F] to-[#EFAFA0] text-white border-2 border-[#C89452] shadow-sm'
                  : 'bg-[#FDF3EE] hover:bg-[#F6DFD7] text-[#5B6E48] border-2 border-[#E8C8BC]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    activeTab === 'catalog' && selectedCategory === 'All' && selectedSectionId === 'All'
                      ? 'bg-white text-[#D8957F]'
                      : 'bg-[#F6DFD7] text-[#5B6E48] group-hover:bg-[#DFA995] group-hover:text-white'
                  }`}
                >
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Home (Overall Collection)</div>
                  <div
                    className={`text-[10px] font-medium ${
                      activeTab === 'catalog' && selectedCategory === 'All' && selectedSectionId === 'All'
                        ? 'text-white/90'
                        : 'text-stone-500'
                    }`}
                  >
                    View all verified items
                  </div>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  activeTab === 'catalog' && selectedCategory === 'All' && selectedSectionId === 'All'
                    ? 'bg-white text-[#D8957F]'
                    : 'bg-[#F6DFD7] text-[#5B6E48] border border-[#E8C8BC]'
                }`}
              >
                {personItems.length}
              </span>
            </button>
          </div>

          {/* QUICK APP NAVIGATION (All 6 core modules) */}
          <div className="space-y-1 pt-1 pb-2 border-b border-[#ECDACF]">
            <div className="px-1 text-[11px] font-bold text-[#39402D] uppercase tracking-wider">
              Wardrobe Views
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('catalog');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs'
                    : 'bg-[#FAF2EC] text-[#39402D] hover:bg-[#F5DFD6]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#C89452] shrink-0" />
                <span className="truncate">Wardrobe</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('sections');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'sections'
                    ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs'
                    : 'bg-[#FAF2EC] text-[#39402D] hover:bg-[#F5DFD6]'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5 text-[#DFA995] shrink-0" />
                <span className="truncate">Sections</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('stylist');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'stylist'
                    ? 'bg-[#C89452] text-white shadow-2xs'
                    : 'bg-[#FAF2EC] text-[#39402D] hover:bg-[#F5DFD6]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C89452] shrink-0" />
                <span className="truncate">AI Stylist</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('packing');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'packing'
                    ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs'
                    : 'bg-[#FAF2EC] text-[#39402D] hover:bg-[#F5DFD6]'
                }`}
              >
                <Luggage className="w-3.5 h-3.5 text-[#C89452] shrink-0" />
                <span className="truncate">Packing</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('laundry_loans');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'laundry_loans'
                    ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs'
                    : 'bg-[#FAF2EC] text-[#39402D] hover:bg-[#F5DFD6]'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-[#39402D] shrink-0" />
                <span className="truncate">Laundry</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('reminders');
                  if (onClose && window.innerWidth < 1024) onClose();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'reminders'
                    ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs'
                    : 'bg-[#FAF2EC] text-[#39402D] hover:bg-[#F5DFD6]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#DFA995] shrink-0" />
                <span className="truncate">Reminders</span>
              </button>
            </div>
          </div>

          {/* SECTIONS & FOLDERS GROUP */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setSectionsExpanded(!sectionsExpanded)}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                {sectionsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span>Sections & Folders</span>
                <span className="text-[10px] font-bold text-[#D8957F]">({sections.length})</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenAddSection}
                  className="p-1 rounded-lg text-[#5B6E48] hover:bg-[#F6DFD7] transition-colors text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Create New Section"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C89452]" />
                  <span className="text-[10px]">Add</span>
                </button>
              </div>
            </div>

            {sectionsExpanded && (
              <div className="space-y-1 pl-1">
                {sections.length === 0 ? (
                  <div className="p-3 text-center bg-[#FDF3EE] rounded-xl border border-dashed border-[#E8C8BC]">
                    <p className="text-[11px] text-stone-400">No sections created yet</p>
                    <button
                      type="button"
                      onClick={onOpenAddSection}
                      className="mt-1 text-[11px] font-bold text-[#D8957F] hover:underline cursor-pointer"
                    >
                      + Create First Section
                    </button>
                  </div>
                ) : (
                  sections.map((sec) => {
                    const IconComp = ICON_MAP[sec.iconName || 'Shirt'] || Shirt;
                    const secItemCount = personItems.filter((i) => i.sectionId === sec.id).length;
                    const isSelected = activeTab === 'catalog' && selectedSectionId === sec.id;
                    const isTreeExpanded = expandedSectionIds[sec.id] ?? false;

                    return (
                      <div key={sec.id} className="space-y-0.5">
                        <div
                          onClick={() => handleSelectSection(sec.id)}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? 'bg-[#D8957F] text-white border border-[#C89452] font-bold shadow-xs'
                              : 'text-[#5B6E48] hover:bg-[#F6DFD7] font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {sec.subSections && sec.subSections.length > 0 ? (
                              <button
                                type="button"
                                onClick={(e) => toggleSectionTree(sec.id, e)}
                                className={`p-0.5 rounded hover:bg-stone-200/50 cursor-pointer ${
                                  isSelected ? 'text-white' : 'text-stone-400'
                                }`}
                              >
                                {isTreeExpanded ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                            ) : (
                              <span className="w-3 h-3 flex items-center justify-center text-[#C89452]">•</span>
                            )}

                            <IconComp
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? 'text-white' : 'text-[#C89452]'
                              }`}
                            />
                            <span className="truncate">{sec.name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                                isSelected ? 'bg-white text-[#D8957F]' : 'text-[#5B6E48] bg-[#F6DFD7]'
                              }`}
                            >
                              {secItemCount}
                            </span>

                            {/* Always visible delete button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSectionToDelete(sec);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isSelected
                                  ? 'text-white/80 hover:text-white hover:bg-[#C89452]'
                                  : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={`Delete Section "${sec.name}"`}
                              aria-label={`Delete section ${sec.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Nested Sub-sections tree */}
                        {isTreeExpanded && sec.subSections && sec.subSections.length > 0 && (
                          <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-[#E8C8BC] ml-3">
                            {sec.subSections.map((sub) => {
                              const subCount = personItems.filter(
                                (i) => i.sectionId === sec.id && i.subSectionId === sub.id
                              ).length;
                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => handleSelectSection(sec.id)}
                                  className="px-2 py-1 rounded-lg text-[11px] text-stone-600 hover:text-[#5B6E48] hover:bg-[#F6DFD7] flex items-center justify-between cursor-pointer transition-colors"
                                >
                                  <span className="truncate">{sub.name}</span>
                                  <span className="text-[9px] text-stone-400">{subCount}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Manage Sections link */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sections');
                    if (onClose && window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full mt-1.5 py-1.5 px-2 rounded-xl text-left text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'sections'
                      ? 'bg-[#F6DFD7] text-[#D8957F] border border-[#E8C8BC]'
                      : 'text-[#5B6E48] hover:bg-[#F6DFD7]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-[#D8957F]" />
                    <span>Manage All Sections</span>
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* CATEGORIES GROUP */}
          <div className="space-y-1.5 pt-1 border-t border-[#E8C8BC]">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                {categoriesExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span>Categories</span>
              </button>
              <div className="flex items-center gap-1.5">
                {onOpenManageCategories && (
                  <button
                    type="button"
                    onClick={onOpenManageCategories}
                    className="p-1 rounded-lg text-[#5B6E48] hover:bg-[#F6DFD7] transition-colors text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                    title="Edit / Delete Categories"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C89452]" />
                    <span className="text-[10px]">Edit</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('All')}
                  className="text-[10px] text-[#D8957F] hover:underline font-bold cursor-pointer"
                >
                  All
                </button>
              </div>
            </div>

            {categoriesExpanded && (
              <div className="space-y-0.5 pl-1">
                {(customCategories && customCategories.length > 0 ? customCategories : DEFAULT_CATEGORIES).map((cat) => {
                  const count = personItems.filter((i) => i.category === cat).length;
                  const isSelected = activeTab === 'catalog' && selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#D8957F] text-white border border-[#C89452] font-bold shadow-xs'
                          : 'text-[#5B6E48] hover:bg-[#F6DFD7] font-semibold'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-white text-[#D8957F]' : 'text-[#5B6E48] bg-[#F6DFD7]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* WORKSPACE & FEATURE TOOLS */}
          <div className="space-y-1 pt-2 border-t border-[#E8C8BC]">
            <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#D8957F] mb-1">
              Smart Atelier Tools
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('stylist');
                if (onClose && window.innerWidth < 1024) onClose();
              }}
              className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'stylist'
                  ? 'bg-gradient-to-r from-[#D8957F] to-[#EFAFA0] text-white shadow-xs border border-[#C89452]'
                  : 'text-[#5B6E48] hover:bg-[#F6DFD7]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#C89452]" />
              <span>AI Outfit Stylist</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('packing');
                if (onClose && window.innerWidth < 1024) onClose();
              }}
              className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'packing'
                  ? 'bg-[#5B6E48] text-white shadow-xs border border-[#C89452]'
                  : 'text-[#5B6E48] hover:bg-[#F6DFD7]'
              }`}
            >
              <Luggage className="w-4 h-4 text-[#C89452]" />
              <span>Packing & Travel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('laundry_loans');
                if (onClose && window.innerWidth < 1024) onClose();
              }}
              className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'laundry_loans'
                  ? 'bg-[#5B6E48] text-white shadow-xs border border-[#C89452]'
                  : 'text-[#5B6E48] hover:bg-[#F6DFD7]'
              }`}
            >
              <Waves className="w-4 h-4 text-[#C89452]" />
              <span>Laundry & Loans</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('reminders');
                if (onClose && window.innerWidth < 1024) onClose();
              }}
              className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-[#5B6E48] text-white shadow-xs border border-[#C89452]'
                  : 'text-[#5B6E48] hover:bg-[#F6DFD7]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#D8957F]" />
              <span>Care Reminders</span>
            </button>

            {onOpenColorContrast && (
              <button
                type="button"
                onClick={() => {
                  if (onClose && window.innerWidth < 1024) onClose();
                  onOpenColorContrast();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all text-[#5B6E48] hover:bg-[#F6DFD7] cursor-pointer"
              >
                <Palette className="w-4 h-4 text-[#C89452]" />
                <span>Color Palette Studio</span>
              </button>
            )}

            {onOpenFashionDeals && (
              <button
                type="button"
                onClick={() => {
                  if (onClose && window.innerWidth < 1024) onClose();
                  onOpenFashionDeals();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all bg-gradient-to-r from-[#FAF0EB] via-[#F6DFD7] to-[#FAF0EB] text-[#4F603D] hover:bg-[#EFAFA0]/40 border-2 border-[#E8C8BC] shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#C89452]" />
                  <span>Daily Fashion Trends</span>
                </div>
                <span className="px-1.5 py-0.2 bg-[#D8957F] text-white text-[10px] rounded-md font-bold shadow-2xs">
                  +2 Slots
                </span>
              </button>
            )}

            {onOpenBoutiqueModal && (
              <button
                type="button"
                onClick={() => {
                  if (onClose && window.innerWidth < 1024) onClose();
                  onOpenBoutiqueModal();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all text-[#5B6E48] hover:bg-[#F6DFD7] cursor-pointer"
              >
                <HardDrive className="w-4 h-4 text-[#C89452]" />
                <span>Vault & Capacity Plans</span>
              </button>
            )}

            {onOpenTour && (
              <button
                type="button"
                onClick={() => {
                  if (onClose && window.innerWidth < 1024) onClose();
                  onOpenTour();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all text-[#5B6E48] hover:bg-[#F6DFD7] cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#C89452]" />
                <span>Interactive Vault Tour</span>
              </button>
            )}

            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  if (onClose && window.innerWidth < 1024) onClose();
                  onOpenAuth();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all text-[#5B6E48] hover:bg-[#F6DFD7] cursor-pointer border-t border-[#ECDACF] pt-2.5 mt-1"
              >
                <User className="w-4 h-4 text-[#39402D]" />
                <span>Account & Cloud Sync</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* CONFIRM DELETE SECTION DIALOG */}
      {sectionToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Section?</h3>
                <p className="text-xs text-slate-500 font-normal">"{sectionToDelete.name}"</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete this folder/section? Any clothes assigned to it will remain safe in your overall wardrobe collection.
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
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Yes, Delete Section
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
