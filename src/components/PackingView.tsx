import React, { useState } from 'react';
import {
  Luggage,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  MapPin,
  Trash2,
  Share2,
  Sparkles,
  Shirt,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Check,
  X,
} from 'lucide-react';
import { PackingList, PackingItem, WardrobeItem } from '../types';

interface PackingViewProps {
  packingLists: PackingList[];
  items: WardrobeItem[];
  onSaveLists: (lists: PackingList[]) => void;
  onSelectItem: (item: WardrobeItem) => void;
}

const TEMPLATES = [
  {
    name: '5-Day Business Conference',
    destination: 'Chicago / London',
    tripDays: 5,
    suggestedItems: [
      { name: 'Navy Wool Blazer', category: 'Outerwear' },
      { name: 'White Crisp Cotton Shirt', category: 'Top' },
      { name: 'Tailored Charcoal Trousers', category: 'Bottom' },
      { name: 'Leather Oxford Shoes', category: 'Footwear' },
      { name: 'Formal Silk Tie & Belt', category: 'Accessory' },
      { name: 'Casual Knit Polo', category: 'Top' },
      { name: 'Smart Chinos', category: 'Bottom' },
    ],
  },
  {
    name: '7-Day Tropical Resort Vacation',
    destination: 'Bali / Goa / Cancun',
    tripDays: 7,
    suggestedItems: [
      { name: 'Linen Vacation Shirts (x3)', category: 'Top' },
      { name: 'Boardshorts / Swimwear (x2)', category: 'Swimwear' },
      { name: 'Breezy Linen Trousers', category: 'Bottom' },
      { name: 'Polarized Sunglasses & Hat', category: 'Accessory' },
      { name: 'Leather Sandals & Espadrilles', category: 'Footwear' },
      { name: 'Evening Floral Dinner Dress', category: 'Dress' },
    ],
  },
  {
    name: '3-Day Traditional Wedding Weekend',
    destination: 'Jaipur / Udaipur',
    tripDays: 3,
    suggestedItems: [
      { name: 'Silk Banarasi Saree / Sherwani (Sangeet)', category: 'Traditional / Ethnic' },
      { name: 'Embroidered Kurta Set (Mehendi)', category: 'Traditional / Ethnic' },
      { name: 'Heavy Festive Lehanga / Tuxedo (Reception)', category: 'Traditional / Ethnic' },
      { name: 'Antique Gold / Kundan Jewelry Box', category: 'Jewelry' },
      { name: 'Embellished Juttis / Heels', category: 'Footwear' },
    ],
  },
];

export const PackingView: React.FC<PackingViewProps> = ({
  packingLists,
  items,
  onSaveLists,
  onSelectItem,
}) => {
  const [selectedListId, setSelectedListId] = useState<string>(
    packingLists[0]?.id || ''
  );
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripDest, setNewTripDest] = useState('');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripEnd, setNewTripEnd] = useState('');
  const [newTripSuitcase, setNewTripSuitcase] = useState('Travel Bag (28")');

  // Item search modal to add wardrobe piece to checklist
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [customItemText, setCustomItemText] = useState('');
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  const activeList = packingLists.find((l) => l.id === selectedListId) || packingLists[0];

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripTitle.trim()) return;

    const newList: PackingList = {
      id: `trip_${Date.now()}`,
      title: newTripTitle.trim(),
      destination: newTripDest.trim() || undefined,
      startDate: newTripStart || undefined,
      endDate: newTripEnd || undefined,
      suitcaseName: newTripSuitcase.trim() || undefined,
      items: [],
      createdAt: new Date().toISOString(),
    };

    onSaveLists([...packingLists, newList]);
    setSelectedListId(newList.id);
    setShowNewTripModal(false);
    setNewTripTitle('');
    setNewTripDest('');
  };

  const handleApplyTemplate = (template: typeof TEMPLATES[0]) => {
    const listItems: PackingItem[] = template.suggestedItems.map((item, idx) => {
      // Try finding a matching piece in wardrobe
      const matched = items.find(
        (i) => i.category === item.category || i.name?.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
      );
      return {
        id: `pack_${Date.now()}_${idx}`,
        itemId: matched?.id,
        customName: item.name,
        category: item.category as any,
        isPacked: false,
        quantity: 1,
      };
    });

    const newList: PackingList = {
      id: `trip_${Date.now()}`,
      title: template.name,
      destination: template.destination,
      suitcaseName: 'Travel Bag (28")',
      items: listItems,
      createdAt: new Date().toISOString(),
    };

    onSaveLists([...packingLists, newList]);
    setSelectedListId(newList.id);
  };

  const handleTogglePacked = (packingItemId: string) => {
    if (!activeList) return;
    const updatedItems = activeList.items.map((i) =>
      i.id === packingItemId ? { ...i, isPacked: !i.isPacked } : i
    );
    const updatedLists = packingLists.map((l) =>
      l.id === activeList.id ? { ...l, items: updatedItems } : l
    );
    onSaveLists(updatedLists);
  };

  const handleDeleteTrip = (listId: string) => {
    const remaining = packingLists.filter((l) => l.id !== listId);
    onSaveLists(remaining);
    setSelectedListId(remaining[0]?.id || '');
    setTripToDelete(null);
  };

  const handleAddWardrobeItemToTrip = (wardrobeItem: WardrobeItem) => {
    if (!activeList) return;
    const newPackingItem: PackingItem = {
      id: `pack_${Date.now()}`,
      itemId: wardrobeItem.id,
      customName: wardrobeItem.name || `${wardrobeItem.category} (${wardrobeItem.color || ''})`,
      category: wardrobeItem.category,
      isPacked: false,
      quantity: 1,
    };

    const updatedLists = packingLists.map((l) =>
      l.id === activeList.id ? { ...l, items: [...l.items, newPackingItem] } : l
    );
    onSaveLists(updatedLists);
    setShowItemPicker(false);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeList || !customItemText.trim()) return;
    const newPackingItem: PackingItem = {
      id: `pack_${Date.now()}`,
      customName: customItemText.trim(),
      isPacked: false,
      quantity: 1,
    };

    const updatedLists = packingLists.map((l) =>
      l.id === activeList.id ? { ...l, items: [...l.items, newPackingItem] } : l
    );
    onSaveLists(updatedLists);
    setCustomItemText('');
  };

  const handleDeletePackingItem = (packItemId: string) => {
    if (!activeList) return;
    const updatedLists = packingLists.map((l) =>
      l.id === activeList.id
        ? { ...l, items: l.items.filter((i) => i.id !== packItemId) }
        : l
    );
    onSaveLists(updatedLists);
  };

  const handleClearPackedItems = () => {
    if (!activeList) return;
    const updatedLists = packingLists.map((l) =>
      l.id === activeList.id
        ? { ...l, items: l.items.filter((i) => !i.isPacked) }
        : l
    );
    onSaveLists(updatedLists);
  };

  // Progress metrics
  const totalItems = activeList?.items.length || 0;
  const packedCount = activeList?.items.filter((i) => i.isPacked).length || 0;
  const progressPct = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Packing Lists & Trip Checklists
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
              <Luggage className="w-3.5 h-3.5" /> Travel & Storage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize outfits and pieces packed for upcoming trips with dynamic checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewTripModal(true)}
          className="px-4 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Trip Checklist</span>
        </button>
      </div>

      {/* Templates Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          ⚡ Quick 1-Click Packing Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-700 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 text-xs">{tmpl.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">📍 {tmpl.destination}</div>
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">
                  Includes {tmpl.suggestedItems.length} curated wardrobe staples
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="mt-3 w-full py-1.5 bg-slate-50 hover:bg-amber-900 hover:text-white text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Packing Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left: Trips list tabs */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            My Packing Checklists ({packingLists.length})
          </h3>

          <div className="space-y-2">
            {packingLists.map((list) => {
              const count = list.items.length;
              const packed = list.items.filter((i) => i.isPacked).length;
              const isSelected = list.id === selectedListId;

              return (
                <div
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold">{list.title}</div>
                    {list.destination && (
                      <div className={`text-[11px] flex items-center gap-1 ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                        <MapPin className="w-3 h-3" /> {list.destination}
                      </div>
                    )}
                    {list.suitcaseName && (
                      <div className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-slate-400'}`}>
                        🧳 {list.suitcaseName}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-200' : 'text-amber-900'}`}>
                      {packed}/{count}
                    </span>
                    <span className={`block text-[10px] ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                      packed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Checklist & Items */}
        <div className="lg:col-span-8 space-y-4">
          {activeList ? (
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-5">
              {/* Trip Header & Progress */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{activeList.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    {activeList.destination && <span>📍 {activeList.destination}</span>}
                    {activeList.suitcaseName && <span>🧳 {activeList.suitcaseName}</span>}
                    {activeList.startDate && (
                      <span>
                        📅 {activeList.startDate} {activeList.endDate ? `to ${activeList.endDate}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowItemPicker(true)}
                    className="px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Wardrobe Piece</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripToDelete(activeList.id)}
                    className="px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-200"
                    title="Delete entire checklist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete Entire List</span>
                  </button>
                </div>
              </div>

              {/* Packing Progress Bar & Bulk Actions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Luggage Packing Progress</span>
                  <div className="flex items-center gap-3">
                    {packedCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearPackedItems}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
                        title="Remove all checked/packed items from this list"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear Packed ({packedCount})</span>
                      </button>
                    )}
                    <span className="text-amber-900">{progressPct}% Packed ({packedCount}/{totalItems})</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-800 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Add custom text item form */}
              <form onSubmit={handleAddCustomItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type quick custom item (e.g. Passport, Travel Charger, Sunglasses...)"
                  value={customItemText}
                  onChange={(e) => setCustomItemText(e.target.value)}
                  className="flex-1 text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-amber-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
                >
                  Add Item
                </button>
              </form>

              {/* Items checklist */}
              {activeList.items.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                  No items added yet. Click <strong>"+ Add Wardrobe Piece"</strong> or type a custom item above.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeList.items.map((packItem) => {
                    const linkedWardrobeItem = items.find((i) => i.id === packItem.itemId);

                    return (
                      <div
                        key={packItem.id}
                        className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                      >
                        <div
                          onClick={() => handleTogglePacked(packItem.id)}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          <button
                            type="button"
                            className={`p-1 rounded-lg transition-colors shrink-0 ${
                              packItem.isPacked
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {packItem.isPacked ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          {linkedWardrobeItem && (
                            <img
                              src={linkedWardrobeItem.images[0]}
                              alt="Piece"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          )}

                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-xs font-semibold block truncate ${
                                packItem.isPacked
                                  ? 'line-through text-slate-400 font-normal'
                                  : 'text-slate-900'
                              }`}
                            >
                              {packItem.customName || linkedWardrobeItem?.name}
                            </span>
                            {linkedWardrobeItem?.location && (
                              <span className="text-[10px] text-slate-400 block truncate">
                                Stored in: {linkedWardrobeItem.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {linkedWardrobeItem && (
                            <button
                              type="button"
                              onClick={() => onSelectItem(linkedWardrobeItem)}
                              className="text-[11px] text-amber-900 hover:underline font-semibold px-2 py-1 bg-amber-50/70 hover:bg-amber-100/80 rounded-lg transition-colors"
                            >
                              View Piece
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePackingItem(packItem.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title={`Delete "${packItem.customName || linkedWardrobeItem?.name || 'item'}" from this checklist`}
                            aria-label={`Delete ${packItem.customName || linkedWardrobeItem?.name || 'item'} from checklist`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <Luggage className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No Packing Checklist Selected</p>
              <p className="text-xs text-slate-500 mt-1">
                Create a new trip or select a template on the left.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW TRIP MODAL */}
      {showNewTripModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create New Packing Checklist</h3>
              <button onClick={() => setShowNewTripModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trip Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Paris Autumn Holiday, Bangalore Tech Summit"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Paris, France"
                  value={newTripDest}
                  onChange={(e) => setNewTripDest(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTripStart}
                    onChange={(e) => setNewTripStart(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newTripEnd}
                    onChange={(e) => setNewTripEnd(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Luggage / Bag</label>
                <input
                  type="text"
                  placeholder='e.g. Travel Bag (28"), Cabin Duffle, Weekend Bag'
                  value={newTripSuitcase}
                  onChange={(e) => setNewTripSuitcase(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTripModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-xl"
                >
                  Create Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WARDROBE ITEM PICKER MODAL */}
      {showItemPicker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Select Wardrobe Item to Pack</h3>
              <button onClick={() => setShowItemPicker(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search wardrobe by name, color, category, location..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs outline-none"
            />

            <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
              {items
                .filter((i) =>
                  pickerSearch.trim()
                    ? (i.name?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                        i.category.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                        i.location?.toLowerCase().includes(pickerSearch.toLowerCase()))
                    : true
                )
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddWardrobeItemToTrip(item)}
                    className="p-2 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 hover:border-amber-700 cursor-pointer transition-all flex flex-col justify-between text-xs"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                      <img src={item.images[0]} alt="Item" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">{item.category}</span>
                      <div className="font-bold text-slate-900 truncate">{item.name || 'Unnamed piece'}</div>
                      <div className="text-[10px] text-slate-400 truncate">📍 {item.location || 'Closet'}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE TRIP MODAL */}
      {tripToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Packing List?</h3>
                <p className="text-xs text-slate-500 font-normal">"{activeList?.title}"</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete this trip packing checklist? Your wardrobe items will remain safely in your closet.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTrip(tripToDelete)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Yes, Delete List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
