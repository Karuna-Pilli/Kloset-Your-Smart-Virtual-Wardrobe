import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Folder,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Tag,
  MapPin,
  Calendar,
  Layers,
  Sparkle,
  Scissors,
  BookmarkCheck,
  Info,
  Palette,
  Search,
  Settings,
} from 'lucide-react';
import {
  WardrobeItem,
  WardrobeSection,
  FamilyMember,
  ItemCategory,
  ItemCondition,
} from '../types';
import { geminiService } from '../services/geminiService';
import {
  FASHION_COLORS,
  COLOR_FAMILIES,
  ColorSwatch,
  searchFashionColors,
} from '../data/fashionColors';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface ItemUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (item: WardrobeItem) => void;
  onSaveBulkItems: (items: WardrobeItem[]) => void;
  sections: WardrobeSection[];
  familyMembers: FamilyMember[];
  activePersonId: string;
  isInitialBulkMode?: boolean;
  editingItem?: WardrobeItem | null;
  customCategories?: string[];
  onOpenManageCategories?: () => void;
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

const CONDITIONS: ItemCondition[] = ['New', 'Good', 'Vintage', 'Needs Repair', 'Old'];

const POPULAR_LOCATIONS = [
  'Master Wardrobe - Main Rail',
  'Master Wardrobe - Top Shelf',
  'Master Wardrobe - Knitwear Shelf',
  'Trouser Rack',
  'Shoe Cabinet',
  'Travel Bag (28")',
  'Carry-On Bag',
  'Storage Box 1',
  'Bed Under-Storage Drawer',
  'Ethnic Garment Sleeve',
];

export const ItemUploadModal: React.FC<ItemUploadModalProps> = ({
  isOpen,
  onClose,
  onSaveItem,
  onSaveBulkItems,
  sections,
  familyMembers,
  activePersonId,
  isInitialBulkMode = false,
  editingItem = null,
  customCategories,
  onOpenManageCategories,
}) => {
  const [isBulkMode, setIsBulkMode] = useState(isInitialBulkMode);
  
  // Single mode state
  const [personId, setPersonId] = useState(editingItem?.personId || (activePersonId === 'all' ? 'self' : activePersonId));
  const [name, setName] = useState(editingItem?.name || '');
  const [images, setImages] = useState<string[]>(editingItem?.images || []);
  const [isStyledRef, setIsStyledRef] = useState(false);
  const [styledCaption, setStyledCaption] = useState('');
  const [styledDate, setStyledDate] = useState('');
  const [styledOccasion, setStyledOccasion] = useState('');
  
  const [category, setCategory] = useState<string>(editingItem?.category || 'Top');
  const [sectionId, setSectionId] = useState(editingItem?.sectionId || '');
  const [subSectionId, setSubSectionId] = useState(editingItem?.subSectionId || '');
  
  const [color, setColor] = useState(editingItem?.color || '');
  const [colorHex, setColorHex] = useState(editingItem?.colorHex || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorSearchQuery, setColorSearchQuery] = useState('');
  const [selectedColorFamily, setSelectedColorFamily] = useState('all');
  const [size, setSize] = useState(editingItem?.size || '');
  const [brand, setBrand] = useState(editingItem?.brand || '');
  const [condition, setCondition] = useState<ItemCondition>(editingItem?.condition || 'Good');
  const [wearCount, setWearCount] = useState<number>(editingItem?.wearCount || 0);
  const [location, setLocation] = useState(editingItem?.location || 'Master Wardrobe - Main Rail');
  const [purchaseDate, setPurchaseDate] = useState(editingItem?.purchaseDate || '');
  const [purchasePrice, setPurchasePrice] = useState<string>(editingItem?.purchasePrice ? String(editingItem.purchasePrice) : '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [tagsInput, setTagsInput] = useState((editingItem?.tags || []).join(', '));
  
  // UI states
  const [autoBgRemoval, setAutoBgRemoval] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Bulk mode state
  const [bulkImages, setBulkImages] = useState<string[]>([]);
  const [bulkPersonId, setBulkPersonId] = useState(activePersonId === 'all' ? 'self' : activePersonId);
  const [bulkDefaultLocation, setBulkDefaultLocation] = useState('Master Wardrobe - Main Rail');

  // Dedicated refs for Files, Gallery, Camera (both Single & Bulk)
  const singleFilesInputRef = useRef<HTMLInputElement>(null);
  const singleGalleryInputRef = useRef<HTMLInputElement>(null);
  const singleCameraInputRef = useRef<HTMLInputElement>(null);

  const bulkFilesInputRef = useRef<HTMLInputElement>(null);
  const bulkGalleryInputRef = useRef<HTMLInputElement>(null);
  const bulkCameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categoriesList = customCategories && customCategories.length > 0 ? customCategories : DEFAULT_CATEGORIES;
  const currentSection = sections.find(s => s.id === sectionId);

  // Handle single / up to 10 image additions with automated compression
  const handleAddImage = async (file: File) => {
    if (images.length >= 10) {
      setErrorMsg('Maximum 10 images allowed per item.');
      return;
    }
    try {
      const optimized = await optimizeImageFile(file, 1280, 1280, 0.82);
      if (optimized) {
        setImages(prev => [...prev.slice(0, 9), optimized]);
        setErrorMsg('');
      }
    } catch (err) {
      // Fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImages(prev => [...prev.slice(0, 9), result]);
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBulkFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    list.forEach(async (file) => {
      try {
        const optimized = await optimizeImageFile(file, 1280, 1280, 0.82);
        if (optimized) {
          setBulkImages(prev => [...prev, optimized]);
        }
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setBulkImages(prev => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveBulkImage = (index: number) => {
    setBulkImages(prev => prev.filter((_, i) => i !== index));
  };

  // AI Auto-detect info
  const handleAIAnalyze = async () => {
    if (images.length === 0) {
      setErrorMsg('Please upload at least one image first to analyze.');
      return;
    }
    setIsAnalyzingAI(true);
    setErrorMsg('');
    try {
      const result = await geminiService.analyzeItem(images[0], name || description);
      setAiSuggestions(result);
      if (!name && result.suggestedName) setName(result.suggestedName);
      if (result.category) setCategory(result.category);
      if (!color && result.color) setColor(result.color);
      if (!description && result.stylingTip) {
        setDescription(`AI Styling Tip: ${result.stylingTip}`);
      }
      // Match section if suggested
      if (result.suggestedSection) {
        const matchedSec = sections.find(s => s.name.toLowerCase().includes(result.suggestedSection.toLowerCase()));
        if (matchedSec) {
          setSectionId(matchedSec.id);
          if (result.suggestedSubSection) {
            const matchedSub = matchedSec.subSections.find(sub => sub.name.toLowerCase().includes(result.suggestedSubSection.toLowerCase()));
            if (matchedSub) setSubSectionId(matchedSub.id);
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Could not run AI analysis, please fill fields manually.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMsg('At least one photo is required to create a dedicated page.');
      return;
    }

    const selectedSec = sections.find(s => s.id === sectionId);
    const selectedSub = selectedSec?.subSections.find(sub => sub.id === subSectionId);

    const styledReferences = editingItem?.styledReferenceImages || [];
    if (isStyledRef && images[0]) {
      styledReferences.push({
        url: images[0],
        caption: styledCaption || 'Styled Outfit Reference',
        date: styledDate || new Date().toISOString().split('T')[0],
        occasion: styledOccasion || 'Special Occasion',
      });
    }

    const item: WardrobeItem = {
      id: editingItem?.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      personId,
      name: name.trim() || undefined,
      images,
      primaryImageIndex: 0,
      styledReferenceImages: styledReferences,
      category,
      sectionId: sectionId || undefined,
      sectionName: selectedSec?.name || undefined,
      subSectionId: subSectionId || undefined,
      subSectionName: selectedSub?.name || undefined,
      color: color.trim() || undefined,
      colorHex: colorHex.trim() || undefined,
      size: size.trim() || undefined,
      brand: brand.trim() || undefined,
      condition,
      wearCount: Number(wearCount) || 0,
      location: location.trim() || 'Master Wardrobe',
      purchaseDate: purchaseDate || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      description: description.trim() || undefined,
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
      wearLogs: editingItem?.wearLogs || [],
      isInLaundry: editingItem?.isInLaundry || false,
      isLoaned: editingItem?.isLoaned || false,
      isFavorite: editingItem?.isFavorite || false,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveItem(item);
    onClose();
  };

  const handleSaveBulk = () => {
    if (bulkImages.length === 0) {
      setErrorMsg('Please select at least one photo for bulk upload.');
      return;
    }

    const newItems: WardrobeItem[] = bulkImages.map((img, idx) => ({
      id: `item_bulk_${Date.now()}_${idx}`,
      personId: bulkPersonId,
      name: undefined, // User can name later on the dedicated page
      images: [img],
      category: 'Top',
      condition: 'Good',
      wearCount: 0,
      location: bulkDefaultLocation,
      description: undefined,
      tags: ['Bulk Uploaded'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    onSaveBulkItems(newItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingItem ? 'Edit Wardrobe Item Page' : isBulkMode ? 'Bulk Image Upload (Auto-Create Pages)' : 'Add New Item / Dress to Wardrobe'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBulkMode
                ? 'Upload multiple photos at once. Each photo automatically creates a new dedicated item page.'
                : 'Upload photos (up to 10) & details. Only image is mandatory — fill only what you want!'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!editingItem && (
              <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIsBulkMode(false)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    !isBulkMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Single Item
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(true)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    isBulkMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulk Upload
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="px-6 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isBulkMode ? (
            /* BULK UPLOAD MODE */
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                <p className="font-semibold mb-1">💡 How Bulk Upload works:</p>
                <p>
                  Drop 5, 10, or 20 pictures from your gallery. We will instantly create a dedicated page for every picture. You can later open any item to segregate under sections, sub-sections, or add details.
                </p>
              </div>

              {/* Family member target */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Wardrobe / Family Folder:
                </label>
                <select
                  value={bulkPersonId}
                  onChange={(e) => setBulkPersonId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-700 outline-none"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relationship})
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Storage Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Initial Location:
                </label>
                <input
                  type="text"
                  value={bulkDefaultLocation}
                  onChange={(e) => setBulkDefaultLocation(e.target.value)}
                  placeholder="e.g. Master Wardrobe, Main Storage, Top Shelf"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-700 outline-none"
                />
              </div>

              {/* 3 Upload Options (Files, Gallery, Camera) */}
              <div className="bg-white border-2 border-dashed border-stone-300 hover:border-[#C89452] rounded-2xl p-6 text-center transition-all">
                <UploadCloud className="w-10 h-10 text-[#C89452] mx-auto mb-2" />
                <p className="text-sm font-bold text-stone-800">
                  Import Multiple Items in Bulk
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  Select 5, 10, or 20+ clothing pictures. Choose your preferred source below:
                </p>

                {/* 3 Unified Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 max-w-lg mx-auto">
                  <button
                    type="button"
                    onClick={() => bulkFilesInputRef.current?.click()}
                    className="p-3 bg-[#FAF7F5] hover:bg-[#F6DFD7] border border-[#ECDACF] hover:border-[#C89452] rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold text-stone-800 shadow-2xs group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white text-[#39402D] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <Folder className="w-4 h-4 text-[#C89452]" />
                    </div>
                    <span>Select from Files</span>
                    <span className="text-[10px] font-normal text-stone-500">Device storage / iCloud</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => bulkGalleryInputRef.current?.click()}
                    className="p-3 bg-[#FAF7F5] hover:bg-[#F6DFD7] border border-[#ECDACF] hover:border-[#C89452] rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold text-stone-800 shadow-2xs group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white text-[#39402D] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-4 h-4 text-[#39402D]" />
                    </div>
                    <span>Choose from Gallery</span>
                    <span className="text-[10px] font-normal text-stone-500">Photo library & albums</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => bulkCameraInputRef.current?.click()}
                    className="p-3 bg-[#FAF7F5] hover:bg-[#F6DFD7] border border-[#ECDACF] hover:border-[#C89452] rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold text-stone-800 shadow-2xs group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white text-[#39402D] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4 text-[#D8957F]" />
                    </div>
                    <span>Open Camera</span>
                    <span className="text-[10px] font-normal text-stone-500">Snap new wardrobe piece</span>
                  </button>
                </div>

                {/* Hidden Multi-Inputs */}
                <input
                  ref={bulkFilesInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/octet-stream"
                  onChange={(e) => e.target.files && handleBulkFiles(e.target.files)}
                  className="hidden"
                />
                <input
                  ref={bulkGalleryInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/heic"
                  onChange={(e) => e.target.files && handleBulkFiles(e.target.files)}
                  className="hidden"
                />
                <input
                  ref={bulkCameraInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => e.target.files && handleBulkFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Selected Bulk Thumbnails */}
              {bulkImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">
                      {bulkImages.length} Item Pages will be created:
                    </span>
                    <button
                      type="button"
                      onClick={() => setBulkImages([])}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {bulkImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                        <img src={img} alt={`Item ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-slate-950/75 text-[10px] text-white rounded font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SINGLE ITEM FORM (MANDATORY PHOTO + OPTIONAL FIELDS) */
            <form onSubmit={handleSaveSingle} className="space-y-5">
              {/* Top Row: Optional Item Name & Family Member */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item Name <span className="text-slate-400 font-normal">(Optional, displayed at top of page)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Emerald Silk Banarasi Saree, Navy Wool Blazer..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-700 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wardrobe Member:
                  </label>
                  <select
                    value={personId}
                    onChange={(e) => setPersonId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-700 outline-none"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photos Section (Mandatory: 1-10 photos) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-900">
                      Photos <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({images.length}/10 images max)
                    </span>
                  </div>

                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAIAnalyze}
                      disabled={isAnalyzingAI}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isAnalyzingAI ? 'Analyzing...' : 'AI Auto-Detect Details'}</span>
                    </button>
                  )}
                </div>

                {/* Images grid & upload dropzone */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        idx === 0 ? 'border-amber-700 ring-2 ring-amber-100' : 'border-slate-200'
                      }`}
                    >
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-amber-900 text-[10px] text-white rounded font-medium">
                          Cover Photo
                        </span>
                      )}
                    </div>
                  ))}

                  {images.length < 10 && (
                    <div className="aspect-square border-2 border-dashed border-stone-300 hover:border-[#C89452] rounded-xl flex flex-col items-center justify-center p-2 text-center bg-[#FAF7F5] hover:bg-[#F6DFD7]/40 transition-colors relative">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Add Photo
                      </span>

                      {/* 3 Upload options for single item */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <button
                          type="button"
                          onClick={() => singleFilesInputRef.current?.click()}
                          className="p-2 bg-white rounded-lg border border-[#ECDACF] hover:bg-[#F6DFD7] hover:border-[#C89452] shadow-2xs text-[#39402D] transition-colors"
                          title="Select from Files / Drive"
                        >
                          <Folder className="w-3.5 h-3.5 text-[#C89452]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => singleGalleryInputRef.current?.click()}
                          className="p-2 bg-white rounded-lg border border-[#ECDACF] hover:bg-[#F6DFD7] hover:border-[#C89452] shadow-2xs text-[#39402D] transition-colors"
                          title="Choose from Gallery / Photos"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#39402D]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => singleCameraInputRef.current?.click()}
                          className="p-2 bg-white rounded-lg border border-[#ECDACF] hover:bg-[#F6DFD7] hover:border-[#C89452] shadow-2xs text-[#39402D] transition-colors"
                          title="Open Camera"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#D8957F]" />
                        </button>
                      </div>

                      <span className="text-[10px] text-stone-500 font-medium leading-tight">
                        Files • Gallery • Camera
                      </span>

                      {/* Hidden single file inputs */}
                      <input
                        ref={singleFilesInputRef}
                        type="file"
                        accept="image/*,application/octet-stream"
                        onChange={(e) => e.target.files?.[0] && handleAddImage(e.target.files[0])}
                        className="hidden"
                      />
                      <input
                        ref={singleGalleryInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/heic"
                        onChange={(e) => e.target.files?.[0] && handleAddImage(e.target.files[0])}
                        className="hidden"
                      />
                      <input
                        ref={singleCameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => e.target.files?.[0] && handleAddImage(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Option for Background Removal Simulation & Styled Reference */}
                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAutoBgRemoval(!autoBgRemoval)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      autoBgRemoval
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Auto Background Isolation {autoBgRemoval && '✓'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsStyledRef(!isStyledRef)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isStyledRef
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Tag as Styled Look Reference {isStyledRef && '✓'}</span>
                  </button>
                </div>

                {/* Styled Reference Details Box */}
                {isStyledRef && (
                  <div className="mt-3 p-3 bg-rose-50/60 rounded-xl border border-rose-200 space-y-2 text-xs">
                    <p className="font-semibold text-rose-950">Styled Look Context (for outfit memory):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Occasion (e.g. Diwali 2023 at Taj Palace)"
                        value={styledOccasion}
                        onChange={(e) => setStyledOccasion(e.target.value)}
                        className="p-2 bg-white border border-rose-200 rounded-lg outline-none"
                      />
                      <input
                        type="date"
                        value={styledDate}
                        onChange={(e) => setStyledDate(e.target.value)}
                        className="p-2 bg-white border border-rose-200 rounded-lg outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Styling notes (e.g. Paired with antique gold temple jewelry and tan loafers)"
                      value={styledCaption}
                      onChange={(e) => setStyledCaption(e.target.value)}
                      className="w-full p-2 bg-white border border-rose-200 rounded-lg outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Sections & Sub-sections sorting */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Layers className="w-4 h-4 text-amber-700" />
                    <span>Wardrobe Section & Sub-Section</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Optional categorization</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Main Section (e.g. Winter Wear, Party Wear):
                    </label>
                    <select
                      value={sectionId}
                      onChange={(e) => {
                        setSectionId(e.target.value);
                        setSubSectionId('');
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-amber-700 outline-none"
                    >
                      <option value="">-- No Section (Uncategorized) --</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Sub-Section (e.g. Sweaters, Shawls, Jeans / Caps):
                    </label>
                    <select
                      value={subSectionId}
                      onChange={(e) => setSubSectionId(e.target.value)}
                      disabled={!currentSection || currentSection.subSections.length === 0}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-amber-700 outline-none disabled:opacity-50"
                    >
                      <option value="">-- Select Sub-Section --</option>
                      {currentSection?.subSections.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Item Attributes (Color, Size, Category, Condition, Location, Wear Count) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Category</label>
                    {onOpenManageCategories && (
                      <button
                        type="button"
                        onClick={onOpenManageCategories}
                        className="text-[10px] font-bold text-[#C89452] hover:text-[#39402D] flex items-center gap-0.5 cursor-pointer"
                        title="Add, Edit or Delete categories"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-700 font-medium"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Colour</label>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="text-[10px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Palette className="w-3 h-3" />
                      <span>{showColorPicker ? 'Close Palette' : 'Palette / Search'}</span>
                    </button>
                  </div>
                  
                  <div className="relative flex items-center">
                    {colorHex && (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs absolute left-2.5 shrink-0 pointer-events-none"
                        style={{ backgroundColor: colorHex }}
                      />
                    )}
                    <input
                      type="text"
                      list="fashion-colors-datalist"
                      value={color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setColor(val);
                        const matched = FASHION_COLORS.find(
                          (c) => c.name.toLowerCase() === val.toLowerCase()
                        );
                        if (matched) setColorHex(matched.hex);
                      }}
                      placeholder="e.g. Mustard, Royal Blue, Purple..."
                      className={`w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-700 ${
                        colorHex ? 'pl-8' : ''
                      }`}
                    />
                    <datalist id="fashion-colors-datalist">
                      {FASHION_COLORS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.familyLabel}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  {/* Popover Color Grid with Search & Family Tabs */}
                  {showColorPicker && (
                    <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-80 mt-1.5 z-40 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl space-y-2.5 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5 text-amber-700" />
                          <span>Select Colour Swatch</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(false)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Search Bar inside popover */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={colorSearchQuery}
                          onChange={(e) => setColorSearchQuery(e.target.value)}
                          placeholder="Search (e.g. Yellow, Purple, Lavender)..."
                          className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none focus:border-amber-700"
                        />
                      </div>

                      {/* Family Filter Chips */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                        {COLOR_FAMILIES.map((fam) => (
                          <button
                            key={fam.id}
                            type="button"
                            onClick={() => setSelectedColorFamily(fam.id)}
                            className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap cursor-pointer ${
                              selectedColorFamily === fam.id
                                ? 'bg-amber-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {fam.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>

                      {/* Swatch Grid */}
                      <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-1">
                        {searchFashionColors(colorSearchQuery, selectedColorFamily).map((swatch) => (
                          <button
                            key={swatch.name}
                            type="button"
                            onClick={() => {
                              setColor(swatch.name);
                              setColorHex(swatch.hex);
                              setShowColorPicker(false);
                            }}
                            className="p-1 rounded-lg border border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/40 flex flex-col items-center gap-1 text-center cursor-pointer transition-all"
                            title={`${swatch.name} (${swatch.hex})`}
                          >
                            <div
                              className="w-6 h-6 rounded-md shadow-2xs border border-slate-900/10"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span className="text-[9px] font-medium text-slate-700 truncate w-full">
                              {swatch.name.split('/')[0].trim()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. M, 38, UK 10"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ItemCondition)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-700"
                  >
                    {CONDITIONS.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Location, Brand, No. of Usages, Date of Purchase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location in Closet / Storage:
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Master Wardrobe Shelf 2, Storage Box 1, Upper Rail"
                    list="locations-list"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-700"
                  />
                  <datalist id="locations-list">
                    {POPULAR_LOCATIONS.map(loc => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Usages (Worn):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={wearCount}
                    onChange={(e) => setWearCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Designer</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Zara, Nalli, Arket"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Purchase</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price Paid ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Unlimited Description Field (Mandated: no limit on words) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Description & Personal Styling Notes (Unlimited Text)
                  </label>
                  <span className="text-[10px] text-slate-400">No word limit</span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fabric composition, fit feel, pairings that look best, memories, care notes..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-700 focus:bg-white resize-y"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (comma separated):
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Festive, Warm, Wool, Wedding, Capsule"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Create Dedicated Item Page'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Bulk mode action button */}
          {isBulkMode && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBulk}
                disabled={bulkImages.length === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Save & Create {bulkImages.length} Item Pages</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
