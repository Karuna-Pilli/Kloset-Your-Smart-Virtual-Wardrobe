import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Sparkles,
  Trash2,
  Edit,
  ChevronRight,
  LayoutGrid,
  List,
  Shirt,
  Snowflake,
  Sparkle,
  Briefcase,
  Luggage,
  Gem,
  Check,
  X,
  Layers,
  ArrowLeft,
  FolderPlus,
  AlertCircle,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import { WardrobeSection, SubSection, WardrobeItem, UserProfile, FamilyMember } from '../types';
import { geminiService } from '../services/geminiService';

interface SectionsManagerProps {
  sections: WardrobeSection[];
  items: WardrobeItem[];
  profile: UserProfile;
  activePersonId: string;
  familyMembers: FamilyMember[];
  onSaveSections: (sections: WardrobeSection[]) => void;
  onSelectItem: (item: WardrobeItem) => void;
  onAddSubSection: (sectionId: string, name: string, description?: string) => void;
  onOpenUploadWithSection?: (sectionId: string, subSectionId?: string) => void;
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

export const SectionsManager: React.FC<SectionsManagerProps> = ({
  sections,
  items,
  profile,
  activePersonId,
  familyMembers,
  onSaveSections,
  onSelectItem,
  onAddSubSection,
  onOpenUploadWithSection,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubSectionId, setSelectedSubSectionId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Add/Edit Section state
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<WardrobeSection | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDesc, setNewSectionDesc] = useState('');
  const [newSectionIcon, setNewSectionIcon] = useState('Shirt');

  // Sub-section modal
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');

  // In-app interactive delete confirmation modals
  const [sectionToDelete, setSectionToDelete] = useState<WardrobeSection | null>(null);
  const [subSectionToDelete, setSubSectionToDelete] = useState<{ sectionId: string; sub: SubSection } | null>(null);

  // AI Section Generator state
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedSections, setAiGeneratedSections] = useState<any[]>([]);

  const isFamily = profile.currentMode === 'family';
  const maxLimit = isFamily ? 100 : 50;

  // Filter sections by active person
  const activeSections = sections.filter((s) => {
    if (activePersonId === 'all') return true;
    return s.personId === activePersonId || (!s.personId && activePersonId === 'self');
  });

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Extract storage locations for sections
  const sectionLocations = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.location && i.location.trim()) set.add(i.location.trim());
    });
    [
      'Master Closet - Main Rail',
      'Walk-in Wardrobe',
      'Top Shelf / Upper Storage',
      'Dresser 1st Drawer',
      'Dresser 2nd Drawer',
      'Shoe Rack / Bottom Shelf',
      'Coat Closet / Entryway',
      'Storage Box / Vacuum Bag',
      'Luggage / Travel Suitcase',
    ].forEach((loc) => set.add(loc));
    return Array.from(set);
  }, [items]);

  // Section items
  const sectionItems = items.filter((i) => {
    if (selectedSectionId && i.sectionId !== selectedSectionId) return false;
    if (selectedSubSectionId && i.subSectionId !== selectedSubSectionId) return false;
    if (activePersonId !== 'all' && i.personId !== activePersonId) return false;
    if (selectedLocation !== 'All' && i.location?.trim().toLowerCase() !== selectedLocation.trim().toLowerCase()) return false;
    if (selectedColor !== 'All' && i.color?.trim().toLowerCase() !== selectedColor.trim().toLowerCase()) return false;
    return true;
  });

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    if (sections.length >= maxLimit) {
      alert(`Limit reached! You can create up to ${maxLimit} sections in ${isFamily ? 'Family' : 'Individual'} mode.`);
      return;
    }

    if (editingSection) {
      const updated = sections.map((s) =>
        s.id === editingSection.id
          ? {
              ...s,
              name: newSectionName.trim(),
              description: newSectionDesc.trim(),
              iconName: newSectionIcon,
            }
          : s
      );
      onSaveSections(updated);
      setEditingSection(null);
    } else {
      const newSec: WardrobeSection = {
        id: `sec_${Date.now()}`,
        personId: activePersonId === 'all' ? 'self' : activePersonId,
        name: newSectionName.trim(),
        description: newSectionDesc.trim(),
        iconName: newSectionIcon,
        subSections: [],
        createdAt: new Date().toISOString(),
      };
      onSaveSections([...sections, newSec]);
    }

    setShowAddSectionModal(false);
    setNewSectionName('');
    setNewSectionDesc('');
  };

  const confirmDeleteSection = () => {
    if (!sectionToDelete) return;
    const secId = sectionToDelete.id;
    onSaveSections(sections.filter((s) => s.id !== secId));
    if (selectedSectionId === secId) {
      setSelectedSectionId(null);
      setSelectedSubSectionId(null);
    }
    setSectionToDelete(null);
  };

  const confirmDeleteSubSection = () => {
    if (!subSectionToDelete) return;
    const { sectionId, sub } = subSectionToDelete;
    const updated = sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          subSections: s.subSections.filter((item) => item.id !== sub.id),
        };
      }
      return s;
    });
    onSaveSections(updated);
    if (selectedSubSectionId === sub.id) {
      setSelectedSubSectionId(null);
    }
    setSubSectionToDelete(null);
  };

  const handleCreateSubSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !newSubName.trim()) return;
    onAddSubSection(selectedSectionId, newSubName.trim(), newSubDesc.trim());
    setShowAddSubModal(false);
    setNewSubName('');
    setNewSubDesc('');
  };

  const handleDeleteSubSection = (secId: string, subId: string) => {
    const updated = sections.map((s) => {
      if (s.id === secId) {
        return {
          ...s,
          subSections: s.subSections.filter((sub) => sub.id !== subId),
        };
      }
      return s;
    });
    onSaveSections(updated);
    if (selectedSubSectionId === subId) {
      setSelectedSubSectionId(null);
    }
  };

  // AI Prompt generation
  const handleGenerateSectionsAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    try {
      const res = await geminiService.generateSections(aiPrompt, isFamily);
      if (res.sections && Array.isArray(res.sections)) {
        setAiGeneratedSections(res.sections);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAISections = () => {
    const newSecs: WardrobeSection[] = aiGeneratedSections.map((s, idx) => ({
      id: `sec_ai_${Date.now()}_${idx}`,
      personId: activePersonId === 'all' ? 'self' : activePersonId,
      name: s.name,
      description: s.description,
      iconName: s.iconName || 'Shirt',
      subSections: (s.subSections || []).map((sub: string, subIdx: number) => ({
        id: `sub_ai_${Date.now()}_${idx}_${subIdx}`,
        name: sub,
        description: `Sub-category for ${sub}`,
      })),
      createdAt: new Date().toISOString(),
    }));

    if (sections.length + newSecs.length > maxLimit) {
      alert(`Cannot add all sections: limit of ${maxLimit} would be exceeded.`);
      return;
    }

    onSaveSections([...sections, ...newSecs]);
    setShowAIGenerator(false);
    setAiGeneratedSections([]);
    setAiPrompt('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Header & Limit Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C8BC]">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-xl font-extrabold text-[#4F603D] font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Custom Wardrobe Sections & Sub-Sections
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#D8957F] text-white border border-[#C89452] shadow-xs">
              {sections.length}/{maxLimit} Sections Used ({isFamily ? 'Family Mode' : 'Individual Mode'})
            </span>
          </div>
          <p className="text-xs text-[#5B6E48] mt-0.5 font-medium">
            Organize clothes by usage (e.g. Winter Wear, Workwear, Travel Storage) with custom sub-sections.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Generator Button */}
          <button
            type="button"
            onClick={() => setShowAIGenerator(true)}
            className="px-3.5 py-2 bg-[#C89452] hover:bg-[#B88342] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 border border-[#C89452]/80 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>AI Auto-Create Sections</span>
          </button>

          {/* Add Section */}
          <button
            type="button"
            onClick={() => {
              setEditingSection(null);
              setNewSectionName('');
              setNewSectionDesc('');
              setShowAddSectionModal(true);
            }}
            disabled={sections.length >= maxLimit}
            className="px-3.5 py-2 bg-[#5B6E48] hover:bg-[#4F603D] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all border border-[#C89452] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F0CAAF]" />
            <span>New Section</span>
          </button>

          {/* Grid vs List view toggle */}
          <div className="flex bg-[#F6DFD7] p-1 rounded-xl border border-[#E8C8BC]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#5B6E48]' : 'text-[#5B6E48]/70 hover:text-[#5B6E48]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-xs text-[#5B6E48]' : 'text-[#5B6E48]/70 hover:text-[#5B6E48]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View: If a section is selected, show Drilldown into Sub-sections & Items */}
      {selectedSection ? (
        <div className="space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedSectionId(null);
                  setSelectedSubSectionId(null);
                }}
                className="p-2 hover:bg-white rounded-xl text-slate-600 transition-colors border border-slate-200/60"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Section:</span>
                  <h2 className="text-base font-bold text-slate-900">{selectedSection.name}</h2>
                </div>
                {selectedSection.description && (
                  <p className="text-xs text-slate-500">{selectedSection.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingSection(selectedSection);
                  setNewSectionName(selectedSection.name);
                  setNewSectionDesc(selectedSection.description || '');
                  setNewSectionIcon(selectedSection.iconName || 'Shirt');
                  setShowAddSectionModal(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Edit Section"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setSectionToDelete(selectedSection)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Delete Section"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddSubModal(true)}
                className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sub-Section</span>
              </button>
            </div>
          </div>

          {/* Sub-sections tabs / pill filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Sub-Sections ({selectedSection.subSections.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Click any sub-section to filter items
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubSectionId(null)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedSubSectionId === null
                    ? 'bg-[#39402D] text-[#F0CAAF] border-[#C89452] shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold">All Items in Section</div>
                <div className={`text-[10px] mt-1 ${selectedSubSectionId === null ? 'text-amber-200' : 'text-slate-500'}`}>
                  {items.filter(i => i.sectionId === selectedSection.id).length} items total
                </div>
              </button>

              {selectedSection.subSections.map((sub) => {
                const subItemCount = items.filter(
                  (i) => i.sectionId === selectedSection.id && i.subSectionId === sub.id
                ).length;
                const isSelected = selectedSubSectionId === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubSectionId(isSelected ? null : sub.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#D8957F] text-white border-[#C89452] shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-[#D8957F]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold truncate">{sub.name}</div>
                      {sub.description && (
                        <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                          {sub.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/30">
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                        {subItemCount} items
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubSectionToDelete({ sectionId: selectedSection.id, sub });
                        }}
                        className={`p-1 rounded transition-colors ${
                          isSelected ? 'text-white hover:bg-black/20' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={`Delete Sub-Section "${sub.name}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location / Storage Filter Bar within Section */}
          <div className="bg-[#FAF4F0] p-3.5 rounded-2xl border border-[#E8C8BC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#C89452]" />
                <span>Storage Location:</span>
              </span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#ECDACF] rounded-xl outline-none font-medium text-stone-800 focus:border-[#C89452]"
              >
                <option value="All">All Locations ({items.filter(i => i.sectionId === selectedSection.id).length})</option>
                {sectionLocations.map((loc) => {
                  const locCount = items.filter(
                    (i) => i.sectionId === selectedSection.id && i.location?.trim().toLowerCase() === loc.trim().toLowerCase()
                  ).length;
                  return (
                    <option key={loc} value={loc}>
                      {loc} {locCount > 0 ? `(${locCount})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedLocation !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedLocation('All')}
                className="text-[11px] font-bold text-[#C89452] hover:text-[#39402D] underline cursor-pointer self-start sm:self-auto"
              >
                Reset Location Filter
              </button>
            )}
          </div>

          {/* Items sorted under this section / subsection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Sorted Clothes & Accessories ({sectionItems.length})
              </h3>
            </div>

            {sectionItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Shirt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No items match your filter criteria</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try selecting "All Items" or resetting the storage location filter.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sectionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="relative aspect-4/5 bg-slate-100 overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.name || 'Item'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.subSectionName && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/75 text-[10px] font-medium text-white rounded-md backdrop-blur-xs">
                          {item.subSectionName}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/90 text-[10px] font-bold text-slate-900 rounded-full shadow-2xs">
                        {item.wearCount} wears
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name || 'Unnamed Piece'}
                        </h4>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.location || 'Closet'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {sectionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.images[0]}
                        alt={item.name || 'Item'}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.name || 'Unnamed Piece'}
                        </h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{item.category}</span>
                          {item.subSectionName && <span>• {item.subSectionName}</span>}
                          {item.location && <span>• {item.location}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-900">{item.wearCount} wears</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ALL SECTIONS OVERVIEW GRID / LIST */
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSections.map((sec) => {
                const IconComponent = ICON_MAP[sec.iconName || 'Shirt'] || Shirt;
                const count = items.filter((i) => i.sectionId === sec.id).length;

                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className="p-5 bg-white rounded-3xl border-2 border-[#E8C8BC] hover:border-[#D8957F] shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-2xl bg-[#F6DFD7] text-[#D8957F] border border-[#E8C8BC] group-hover:bg-[#D8957F] group-hover:text-white transition-colors shadow-2xs">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSection(sec);
                              setNewSectionName(sec.name);
                              setNewSectionDesc(sec.description || '');
                              setNewSectionIcon(sec.iconName || 'Shirt');
                              setShowAddSectionModal(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-[#FAF4F0] rounded-xl transition-colors"
                            title="Edit Section"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#C89452]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSectionToDelete(sec);
                            }}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-[#4F603D] group-hover:text-[#D8957F] transition-colors">
                        {sec.name}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {sec.description || 'Custom wardrobe categorization section.'}
                      </p>

                      {/* Sub-sections preview */}
                      {sec.subSections.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {sec.subSections.slice(0, 4).map((sub) => (
                            <span
                              key={sub.id}
                              className="px-2.5 py-0.5 bg-[#FAF4F0] text-[#5B6E48] border border-[#E8C8BC] rounded-lg text-[10px] font-bold"
                            >
                              {sub.name}
                            </span>
                          ))}
                          {sec.subSections.length > 4 && (
                            <span className="text-[10px] text-stone-400 self-center">
                              +{sec.subSections.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#FAF0EB] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#D8957F]">{count} items inside</span>
                      <span className="text-[#5B6E48] group-hover:text-[#D8957F] flex items-center gap-1 font-bold">
                        Open Sub-sections <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-[#E8C8BC] divide-y divide-[#FAF0EB] overflow-hidden shadow-xs">
              {activeSections.map((sec) => {
                const IconComponent = ICON_MAP[sec.iconName || 'Shirt'] || Shirt;
                const count = items.filter((i) => i.sectionId === sec.id).length;

                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className="p-4 sm:p-5 hover:bg-[#FAF4F0] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="p-3 rounded-2xl bg-[#F6DFD7] text-[#D8957F] border border-[#E8C8BC] group-hover:bg-[#D8957F] group-hover:text-white transition-colors shadow-2xs shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#4F603D] group-hover:text-[#D8957F] transition-colors truncate">
                            {sec.name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#5B6E48] border border-[#E8C8BC] text-[10px] font-bold">
                            {count} items
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                          {sec.description || 'Custom wardrobe categorization section.'}
                        </p>
                        {sec.subSections.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-stone-400 font-semibold">Sub-sections:</span>
                            {sec.subSections.map((sub) => (
                              <span
                                key={sub.id}
                                className="px-2 py-0.5 bg-white text-[#5B6E48] border border-[#E8C8BC] rounded-md text-[10px] font-medium"
                              >
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSection(sec);
                            setNewSectionName(sec.name);
                            setNewSectionDesc(sec.description || '');
                            setNewSectionIcon(sec.iconName || 'Shirt');
                            setShowAddSectionModal(true);
                          }}
                          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-[#FAF4F0] rounded-xl transition-colors"
                          title="Edit Section"
                        >
                          <Edit className="w-4 h-4 text-[#C89452]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSectionToDelete(sec);
                          }}
                          className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 bg-[#FAF0EB] group-hover:bg-[#D8957F] text-[#5B6E48] group-hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-[#E8C8BC]"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT SECTION MODAL */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingSection ? 'Edit Section' : 'Create New Wardrobe Section'}
              </h3>
              <button onClick={() => setShowAddSectionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Section Name (e.g. Winter Wear, Party Wear, Workwear) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Winter Wear"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Heavy knits, wool cardigans, shawls, thermal items"
                  value={newSectionDesc}
                  onChange={(e) => setNewSectionDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Icon Style</label>
                <div className="flex gap-2">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const Icon = ICON_MAP[iconKey];
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setNewSectionIcon(iconKey)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          newSectionIcon === iconKey
                            ? 'bg-amber-900 text-white border-amber-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                {editingSection ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDel = editingSection;
                      setShowAddSectionModal(false);
                      setSectionToDelete(toDel);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Delete Section</span>
                  </button>
                ) : <div />}
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSectionModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-xl"
                  >
                    {editingSection ? 'Save Changes' : 'Create Section'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUB-SECTION MODAL */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add Sub-Section to "{selectedSection?.name}"</h3>
              <button onClick={() => setShowAddSubModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sub-Section Name (e.g. Sweaters, Shawls, Jeans / Caps) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sweaters & Pullovers"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Knitted pullovers, cashmere turtlenecks"
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-xl"
                >
                  Add Sub-Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI SECTION GENERATOR MODAL */}
      {showAIGenerator && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Section & Sub-section Generator</h3>
                  <p className="text-[11px] text-slate-500">
                    Prompt AI to design structured closet folders and sub-categories
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAIGenerator(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateSectionsAI} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Describe what kind of wardrobe you want to organize:
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 'A comprehensive Indian family wardrobe with festival sarees, sherwanis, daily kurtis, gym clothes, and travel bags' or 'Minimalist capsule wardrobe for modern executive'"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  className="px-4 py-2 bg-amber-900 hover:bg-amber-950 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Sparkle className="w-3.5 h-3.5" />
                  <span>{isGeneratingAI ? 'Generating AI Sections...' : 'Generate Sections'}</span>
                </button>
              </div>
            </form>

            {/* AI Generated Sections Preview */}
            {aiGeneratedSections.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">
                  Generated {aiGeneratedSections.length} Sections:
                </h4>
                <div className="max-h-52 overflow-y-auto space-y-2 text-xs">
                  {aiGeneratedSections.map((sec, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                      <div className="font-bold text-slate-900">{sec.name}</div>
                      <p className="text-slate-600 text-[11px]">{sec.description}</p>
                      {sec.subSections && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {sec.subSections.map((sub: string, subIdx: number) => (
                            <span key={subIdx} className="px-1.5 py-0.5 bg-white text-slate-700 rounded text-[10px] border border-amber-200">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAiGeneratedSections([])}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAISections}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply All to Wardrobe</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
                onClick={confirmDeleteSection}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Yes, Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE SUB-SECTION DIALOG */}
      {subSectionToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Sub-Section?</h3>
                <p className="text-xs text-slate-500 font-normal">"{subSectionToDelete.sub.name}"</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete this sub-section? Clothes under it will remain in this section.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSubSectionToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSubSection}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Yes, Delete Sub-Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
