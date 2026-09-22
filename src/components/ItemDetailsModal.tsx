import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Tag,
  Clock,
  Sparkles,
  Waves,
  HeartHandshake,
  Bell,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Share2,
  CheckCircle2,
  MessageSquare,
  Sparkle,
  Luggage,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import {
  WardrobeItem,
  WearLog,
  ItemReminder,
  LaundryRecord,
  LoanRecord,
  FamilyMember,
} from '../types';
import { FASHION_COLORS } from '../data/fashionColors';

interface ItemDetailsModalProps {
  item: WardrobeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: WardrobeItem) => void;
  onDelete: (id: string) => void;
  onLogWear: (itemId: string, log: WearLog) => void;
  onSendToLaundry: (record: LaundryRecord) => void;
  onLoanItem: (record: LoanRecord) => void;
  onAddReminder: (reminder: ItemReminder) => void;
  onRequestOutfitIdeas: (item: WardrobeItem) => void;
  familyMembers: FamilyMember[];
  reminders: ItemReminder[];
  onToggleArchive?: (itemId: string, isArchived: boolean) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onLogWear,
  onSendToLaundry,
  onLoanItem,
  onAddReminder,
  onRequestOutfitIdeas,
  familyMembers,
  reminders,
  onToggleArchive,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLogWearForm, setShowLogWearForm] = useState(false);
  const [showLaundryForm, setShowLaundryForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Forms state
  const [wearDate, setWearDate] = useState(new Date().toISOString().split('T')[0]);
  const [wearOccasion, setWearOccasion] = useState('');
  const [wearLocation, setWearLocation] = useState('');
  const [wearNotes, setWearNotes] = useState('');
  const [wearRating, setWearRating] = useState(5);

  const [laundryService, setLaundryService] = useState<'dry_clean' | 'laundry' | 'alteration' | 'ironing'>('dry_clean');
  const [laundryCleaner, setLaundryCleaner] = useState('');
  const [laundryReturnDate, setLaundryReturnDate] = useState('');
  const [laundryCost, setLaundryCost] = useState('');
  const [laundryNotes, setLaundryNotes] = useState('');

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [loanReturnDate, setLoanReturnDate] = useState('');
  const [loanNotes, setLoanNotes] = useState('');

  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDesc, setReminderDesc] = useState('');
  const [reminderDueDate, setReminderDueDate] = useState('');
  const [reminderType, setReminderType] = useState<ItemReminder['type']>('laundry');

  if (!isOpen || !item) return null;

  const itemReminders = reminders.filter((r) => r.itemId === item.id);
  const person = familyMembers.find((m) => m.id === item.personId);

  // Submit handlers
  const handleSaveWearLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WearLog = {
      id: `log_${Date.now()}`,
      date: wearDate,
      occasion: wearOccasion.trim() || 'Day Out / Event',
      locationOrEvent: wearLocation.trim() || undefined,
      notes: wearNotes.trim() || undefined,
      rating: wearRating,
    };
    onLogWear(item.id, newLog);
    setShowLogWearForm(false);
    setWearOccasion('');
    setWearLocation('');
    setWearNotes('');
  };

  const handleSaveLaundry = (e: React.FormEvent) => {
    e.preventDefault();
    const record: LaundryRecord = {
      id: `lnd_${Date.now()}`,
      itemId: item.id,
      itemName: item.name || 'Unnamed Item',
      itemImageUrl: item.images[0],
      serviceType: laundryService,
      cleanerName: laundryCleaner.trim() || undefined,
      sentDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: laundryReturnDate || undefined,
      cost: laundryCost ? parseFloat(laundryCost) : undefined,
      notes: laundryNotes.trim() || undefined,
      status: 'sent',
    };
    onSendToLaundry(record);
    setShowLaundryForm(false);
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) return;
    const record: LoanRecord = {
      id: `loan_${Date.now()}`,
      itemId: item.id,
      itemName: item.name || 'Unnamed Item',
      itemImageUrl: item.images[0],
      borrowerName: borrowerName.trim(),
      borrowerContact: borrowerContact.trim() || undefined,
      loanDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: loanReturnDate || undefined,
      notes: loanNotes.trim() || undefined,
      status: 'active',
    };
    onLoanItem(record);
    setShowLoanForm(false);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    const reminder: ItemReminder = {
      id: `rem_${Date.now()}`,
      itemId: item.id,
      itemName: item.name || 'Wardrobe Item',
      title: reminderTitle.trim(),
      description: reminderDesc.trim(),
      dueDate: reminderDueDate || new Date().toISOString().split('T')[0],
      type: reminderType,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    onAddReminder(reminder);
    setShowReminderForm(false);
    setReminderTitle('');
    setReminderDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* TOP DEDICATED HEADER: ITEM NAME AT THE VERY TOP */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {item.category}
              </span>
              {person && (
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  Folder: <strong className="text-slate-700">{person.name}</strong>
                </span>
              )}
              {item.isInLaundry && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  🧺 At Cleaners
                </span>
              )}
              {item.isLoaned && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  🤝 Loaned Out
                </span>
              )}
              {item.isArchived && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#39402D] text-[#F0CAAF] border border-[#C89452] flex items-center gap-1">
                  <Archive className="w-3 h-3 text-[#C89452]" />
                  Seasonal Archive (0 Closet Slots Used)
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-slate-900 leading-tight">
              {item.name || 'Unnamed Wardrobe Piece'}
            </h1>
          </div>

          {/* Quick Item Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onRequestOutfitIdeas(item)}
              className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              title="Get AI Outfit Suggestions with this piece"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">AI Style Ideas</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors"
              title="Edit Item Details"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY: IMAGE GALLERY & USER DETAILS */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Image Carousel / Gallery (up to 10 photos) */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center group">
                <img
                  src={item.images[activeImageIndex] || item.images[0]}
                  alt={item.name || 'Wardrobe Item'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />

                {item.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? item.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-950/60 hover:bg-slate-950/80 text-white rounded-full transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === item.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-950/60 hover:bg-slate-950/80 text-white rounded-full transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-950/70 text-[11px] font-medium text-white rounded-full">
                      {activeImageIndex + 1} / {item.images.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {item.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-amber-800 ring-2 ring-amber-100'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Wear Counter Action */}
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-950">Total Usages (Wear Count)</div>
                  <div className="text-xl font-bold text-amber-900">{item.wearCount} times</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogWearForm(true)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Wear Date</span>
                </button>
              </div>
            </div>

            {/* Right Column: Only User-Filled Details (Zero Clutter) */}
            <div className="md:col-span-7 space-y-5">
              {/* Primary Filled Details Grid */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                  Item Specifications & Storage
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {item.sectionName && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Section</span>
                      <span className="font-semibold text-slate-900">{item.sectionName}</span>
                      {item.subSectionName && (
                        <span className="text-amber-800 block text-[11px] font-medium">↳ {item.subSectionName}</span>
                      )}
                    </div>
                  )}

                  {item.location && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location / Storage</span>
                      <span className="font-semibold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        {item.location}
                      </span>
                    </div>
                  )}

                  {item.color && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Colour</span>
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                          style={{
                            backgroundColor:
                              item.colorHex ||
                              FASHION_COLORS.find(
                                (c) => c.name.toLowerCase() === item.color?.toLowerCase()
                              )?.hex ||
                              '#C19A6B',
                          }}
                        />
                        <span>{item.color}</span>
                      </span>
                    </div>
                  )}

                  {item.size && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Size</span>
                      <span className="font-semibold text-slate-900">{item.size}</span>
                    </div>
                  )}

                  {item.condition && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Condition</span>
                      <span className="font-semibold text-slate-900">{item.condition}</span>
                    </div>
                  )}

                  {item.brand && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Brand / Designer</span>
                      <span className="font-semibold text-slate-900">{item.brand}</span>
                    </div>
                  )}

                  {item.purchaseDate && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purchase Date</span>
                      <span className="font-semibold text-slate-900">{item.purchaseDate}</span>
                    </div>
                  )}

                  {item.purchasePrice !== undefined && item.purchasePrice > 0 && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purchase Price / CPW</span>
                      <span className="font-semibold text-slate-900">
                        ${item.purchasePrice} {item.wearCount > 0 && `(~$${(item.purchasePrice / item.wearCount).toFixed(1)}/wear)`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Unlimited Description (No limit on text) */}
              {item.description && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                    Description & Notes
                  </h3>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Styled Look Reference Photos / Memories */}
              {item.styledReferenceImages && item.styledReferenceImages.length > 0 && (
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200/80 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950 uppercase tracking-wider">
                    <Sparkle className="w-4 h-4 text-rose-700" />
                    <span>Styled Look References (Past Outfits)</span>
                  </div>

                  <div className="space-y-2">
                    {item.styledReferenceImages.map((ref, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white rounded-xl border border-rose-100 flex gap-3 items-start text-xs shadow-2xs"
                      >
                        <img
                          src={ref.url}
                          alt="Styled look"
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">{ref.occasion || 'Styled Outfit'}</div>
                          {ref.caption && <p className="text-slate-600 text-[11px]">{ref.caption}</p>}
                          {ref.date && (
                            <span className="text-[10px] text-slate-400 block">Worn on: {ref.date}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Free Seasonal Archive Action Card */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  item.isArchived
                    ? 'bg-[#39402D] text-[#FAF4F0] border-[#C89452] shadow-sm'
                    : 'bg-[#FAF2EC] text-[#39402D] border-[#ECDACF]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {item.isArchived ? (
                        <>
                          <Archive className="w-4 h-4 text-[#F0CAAF]" />
                          <span className="text-[#F0CAAF]">Stored in Seasonal Archive (Free Slot Active)</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4 text-[#C89452]" />
                          <span>Seasonal Archive (Save Closet Capacity)</span>
                        </>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#C89452]/20 text-[#C89452] border border-[#C89452]/40">
                        100% Free
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${item.isArchived ? 'text-white/80' : 'text-stone-600'}`}>
                      {item.isArchived
                        ? 'This piece is archived for off-season storage. It remains saved with all photos and wear history, but consumes 0 active wardrobe slots.'
                        : 'Move out-of-season garments (e.g. heavy winter jackets during summer, or festive occasionwear) to the archive to immediately free up active closet slots for free.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleArchive) {
                        onToggleArchive(item.id, !item.isArchived);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                      item.isArchived
                        ? 'bg-[#C89452] hover:bg-[#B88342] text-white border border-[#C89452]'
                        : 'bg-[#39402D] hover:bg-black text-[#F0CAAF] border border-[#39402D]'
                    }`}
                  >
                    {item.isArchived ? (
                      <>
                        <ArchiveRestore className="w-3.5 h-3.5" />
                        <span>Restore to Active Closet</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5" />
                        <span>Move to Seasonal Archive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Hub for this Item */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogWearForm(true)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all"
                >
                  <Calendar className="w-4 h-4 text-amber-800" />
                  <span>Log Wear</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLaundryForm(true)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all"
                >
                  <Waves className="w-4 h-4 text-blue-700" />
                  <span>Dry Clean / Wash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLoanForm(true)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all"
                >
                  <HeartHandshake className="w-4 h-4 text-purple-700" />
                  <span>Lend Item</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReminderForm(true)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all"
                >
                  <Bell className="w-4 h-4 text-rose-700" />
                  <span>Set Reminder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onToggleArchive) {
                      onToggleArchive(item.id, !item.isArchived);
                    }
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all"
                >
                  {item.isArchived ? (
                    <>
                      <ArchiveRestore className="w-4 h-4 text-[#C89452]" />
                      <span>Unarchive</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 text-[#5B6E48]" />
                      <span>Archive</span>
                    </>
                  )}
                </button>
              </div>

              {/* Active Reminders on this item */}
              {itemReminders.length > 0 && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1.5 text-xs">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-800" />
                    <span>Scheduled Reminders for this item:</span>
                  </div>
                  {itemReminders.map((rem) => (
                    <div key={rem.id} className="p-2 bg-white rounded-lg border border-amber-200 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-900">{rem.title}</span>
                        {rem.description && <p className="text-[11px] text-slate-600">{rem.description}</p>}
                      </div>
                      <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-mono">
                        Due: {rem.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Wear History Log Timeline */}
              {item.wearLogs && item.wearLogs.length > 0 && (
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-800" />
                    <span>Outfit & Event Wear History ({item.wearLogs.length})</span>
                  </h3>

                  <div className="space-y-2">
                    {item.wearLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{log.occasion}</span>
                          <span className="text-[10px] font-mono text-slate-400">{log.date}</span>
                        </div>
                        {log.locationOrEvent && (
                          <div className="text-slate-600 text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {log.locationOrEvent}
                          </div>
                        )}
                        {log.notes && <p className="text-slate-700 italic">"{log.notes}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FORMS: LOG WEAR */}
        {showLogWearForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Log Wear Date & Memory</h3>
                <button onClick={() => setShowLogWearForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveWearLog} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wear Date</label>
                  <input
                    type="date"
                    value={wearDate}
                    onChange={(e) => setWearDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Occasion / Event</label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali Party, Team Lunch, Wedding Reception"
                    value={wearOccasion}
                    onChange={(e) => setWearOccasion(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Place / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Taj Hotel, Mumbai"
                    value={wearLocation}
                    onChange={(e) => setWearLocation(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Styling / Review Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Paired with pearl earrings, felt super comfortable..."
                    value={wearNotes}
                    onChange={(e) => setWearNotes(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogWearForm(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-xl"
                  >
                    Save Wear & Increment Count
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL FORMS: LAUNDRY / DRY CLEAN */}
        {showLaundryForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Send to Laundry / Dry Clean</h3>
                <button onClick={() => setShowLaundryForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveLaundry} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={laundryService}
                    onChange={(e: any) => setLaundryService(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="dry_clean">Professional Dry Cleaning</option>
                    <option value="laundry">Standard Wash & Fold</option>
                    <option value="ironing">Steam Press / Ironing</option>
                    <option value="alteration">Tailoring / Alteration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cleaner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prestige Steam Cleaners"
                    value={laundryCleaner}
                    onChange={(e) => setLaundryCleaner(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={laundryReturnDate}
                    onChange={(e) => setLaundryReturnDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 18"
                    value={laundryCost}
                    onChange={(e) => setLaundryCost(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Special Care Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Spot clean right collar, no harsh bleaches"
                    value={laundryNotes}
                    onChange={(e) => setLaundryNotes(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLaundryForm(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl"
                  >
                    Mark as Sent to Laundry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL FORMS: LOAN ITEM */}
        {showLoanForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Lend Item to Friend / Family</h3>
                <button onClick={() => setShowLoanForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveLoan} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Borrower's Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Meera (Sister), Priya (Friend)"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Borrower's Phone / Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={borrowerContact}
                    onChange={(e) => setBorrowerContact(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={loanReturnDate}
                    onChange={(e) => setLoanReturnDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Borrowed for Chicago conference"
                    value={loanNotes}
                    onChange={(e) => setLoanNotes(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLoanForm(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl"
                  >
                    Record Loan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL FORMS: SET REMINDER */}
        {showReminderForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Set Activity / Care Reminder</h3>
                <button onClick={() => setShowReminderForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveReminder} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reminder Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dry clean before sister's wedding"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={reminderDueDate}
                    onChange={(e) => setReminderDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={reminderType}
                    onChange={(e: any) => setReminderType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="laundry">Laundry / Dry Cleaning</option>
                    <option value="repair">Alteration / Button Fix</option>
                    <option value="upcoming_event">Upcoming Event Styling</option>
                    <option value="return_loan">Retrieve Loaned Item</option>
                    <option value="general">General Care / Seasonal Swap</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description / Details</label>
                  <textarea
                    rows={2}
                    placeholder="Custom details & timings..."
                    value={reminderDesc}
                    onChange={(e) => setReminderDesc(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReminderForm(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-xl"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* IN-APP CONFIRM DELETE ITEM DIALOG */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Delete Item?</h3>
                  <p className="text-xs text-slate-500 font-normal truncate max-w-[200px]">{item.name || 'Unnamed piece'}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                Are you sure you want to permanently delete this clothing item from your wardrobe?
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDelete(item.id);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
                >
                  Yes, Delete Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
