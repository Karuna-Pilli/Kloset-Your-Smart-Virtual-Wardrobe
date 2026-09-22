import React, { useState } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Trash2,
  Tag,
  AlertTriangle,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react';
import { ItemReminder, WardrobeItem } from '../types';

interface RemindersViewProps {
  reminders: ItemReminder[];
  items: WardrobeItem[];
  onSaveReminders: (reminders: ItemReminder[]) => void;
  onSelectItem: (item: WardrobeItem) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  items,
  onSaveReminders,
  onSelectItem,
}) => {
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [showAddModal, setShowAddModal] = useState(false);

  // New reminder form
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<ItemReminder['type']>('laundry');

  const handleToggleCompleted = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    );
    onSaveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    onSaveReminders(reminders.filter((r) => r.id !== id));
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const linkedItem = items.find((i) => i.id === selectedItemId);

    const newReminder: ItemReminder = {
      id: `rem_${Date.now()}`,
      itemId: selectedItemId || undefined,
      itemName: linkedItem?.name || (selectedItemId ? 'Wardrobe Item' : undefined),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      type,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    onSaveReminders([...reminders, newReminder]);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'pending') return !r.isCompleted;
    if (filter === 'completed') return r.isCompleted;
    return true;
  });

  const pendingCount = reminders.filter((r) => !r.isCompleted).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Item Activity & Care Reminders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200 flex items-center gap-1">
              <Bell className="w-3 h-3 text-rose-700" />
              <span>{pendingCount} Pending Tasks</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Custom reminders for laundry, dry cleaning, alterations, button fixes, or seasonal closet rotations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Set New Reminder</span>
          </button>
        </div>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">No {filter} reminders</h4>
          <p className="text-xs text-slate-500">
            Keep your wardrobe in top condition by setting care, washing, or repair reminders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((rem) => {
            const linkedItem = items.find((i) => i.id === rem.itemId);

            return (
              <div
                key={rem.id}
                className={`p-4 bg-white rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  rem.isCompleted ? 'border-slate-200 opacity-60' : 'border-rose-100 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        rem.type === 'laundry'
                          ? 'bg-blue-50 text-blue-800'
                          : rem.type === 'repair'
                          ? 'bg-amber-50 text-amber-900'
                          : rem.type === 'upcoming_event'
                          ? 'bg-purple-50 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rem.type.replace('_', ' ')}
                    </span>

                    <span className="text-[11px] font-mono font-semibold text-rose-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: {rem.dueDate}
                    </span>
                  </div>

                  <h3
                    className={`text-xs font-bold mt-2 ${
                      rem.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {rem.title}
                  </h3>

                  {rem.description && (
                    <p className="text-[11px] text-slate-600 mt-1 whitespace-pre-line">
                      {rem.description}
                    </p>
                  )}

                  {linkedItem && (
                    <div
                      onClick={() => onSelectItem(linkedItem)}
                      className="mt-3 p-2 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-slate-200 cursor-pointer flex items-center gap-2 transition-colors"
                    >
                      <img
                        src={linkedItem.images[0]}
                        alt="piece"
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1 text-[11px]">
                        <span className="font-semibold text-slate-900 truncate block">
                          {linkedItem.name || 'Unnamed piece'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          📍 {linkedItem.location || 'Closet'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(rem.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      rem.isCompleted
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs'
                    }`}
                  >
                    {rem.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed (Undo)</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE REMINDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Set Activity / Care Reminder</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Wardrobe Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                >
                  <option value="">-- General Wardrobe Reminder --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name || `${i.category} (${i.color || 'Item'})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reminder Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Dry clean silk saree before Diwali"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="laundry">Dry Cleaning / Wash</option>
                    <option value="repair">Alteration / Tailor Fix</option>
                    <option value="upcoming_event">Event Styling</option>
                    <option value="return_loan">Retrieve Loaned Item</option>
                    <option value="general">General Care</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional timing or care specifics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-xl"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
