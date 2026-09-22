import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Tag,
  AlertTriangle,
  FolderPlus,
  HelpCircle,
} from 'lucide-react';
import { WardrobeItem } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  items: WardrobeItem[];
  onSaveCategories: (categories: string[]) => void;
  onRenameCategoryInItems?: (oldCategory: string, newCategory: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  items,
  onSaveCategories,
  onRenameCategoryInItems,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`Category "${trimmed}" already exists.`);
      return;
    }

    const updated = [...categories, trimmed];
    onSaveCategories(updated);
    setNewCatName('');
    setErrorMessage('');
  };

  const handleStartEdit = (cat: string) => {
    setEditingCat(cat);
    setEditValue(cat);
    setErrorMessage('');
  };

  const handleSaveEdit = (oldCat: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldCat) {
      setEditingCat(null);
      return;
    }

    if (
      categories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase() && c.toLowerCase() !== oldCat.toLowerCase()
      )
    ) {
      setErrorMessage(`Category "${trimmed}" already exists.`);
      return;
    }

    const updated = categories.map((c) => (c === oldCat ? trimmed : c));
    onSaveCategories(updated);

    if (onRenameCategoryInItems) {
      onRenameCategoryInItems(oldCat, trimmed);
    }

    setEditingCat(null);
    setErrorMessage('');
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    const cat = categoryToDelete;
    const updated = categories.filter((c) => c !== cat);
    onSaveCategories(updated);

    // If items had this category, reassign them to 'Other'
    if (onRenameCategoryInItems) {
      onRenameCategoryInItems(cat, 'Other');
    }

    setCategoryToDelete(null);
    setErrorMessage('');
  };

  const getItemCount = (cat: string) => {
    return items.filter((i) => i.category === cat).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F5] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#ECDACF] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#ECDACF] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F6DFD7] text-[#D8957F] flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Manage Categories</h2>
              <p className="text-xs text-stone-500">
                Add, rename, or delete wardrobe categories.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Add Category Input */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Create new category (e.g. Athleisure, Vintage, Hats)..."
                className="w-full pl-3.5 pr-3 py-2 text-xs bg-white rounded-xl border border-[#ECDACF] focus:border-[#C89452] focus:ring-2 focus:ring-[#C89452]/20 outline-none transition-all font-medium text-stone-800"
              />
            </div>
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-4 py-2 bg-[#39402D] hover:bg-[#485339] disabled:opacity-50 text-[#F0CAAF] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </form>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* List of Categories */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 px-1">
              <span>Current Categories ({categories.length})</span>
              <span>Attached Items</span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = getItemCount(cat);
                const isEditing = editingCat === cat;

                return (
                  <div
                    key={cat}
                    className="p-2.5 bg-white rounded-xl border border-[#ECDACF] hover:border-[#C89452]/50 flex items-center justify-between gap-2 transition-all shadow-2xs group"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(cat);
                            if (e.key === 'Escape') setEditingCat(null);
                          }}
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FAF7F5] border border-[#C89452] rounded-lg outline-none font-semibold text-stone-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat)}
                          className="p-1.5 bg-[#39402D] text-[#F0CAAF] rounded-lg hover:bg-[#485339] transition-colors"
                          title="Save Changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCat(null)}
                          className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Tag className="w-3.5 h-3.5 text-[#C89452] shrink-0" />
                          <span className="text-xs font-bold text-stone-800 truncate">
                            {cat}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F5] text-stone-600 border border-[#ECDACF]">
                            {count} {count === 1 ? 'item' : 'items'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title={`Rename "${cat}"`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(cat)}
                            disabled={categories.length <= 1}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={`Delete category "${cat}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ECDACF] bg-white flex items-center justify-between">
          <p className="text-[11px] text-stone-500">
            Deleting a category moves its items into <strong>Other</strong>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#ECDACF] text-stone-800 rounded-xl text-xs font-bold border border-[#ECDACF] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Delete Confirmation Alert Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-rose-200 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Delete "{categoryToDelete}" Category?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {getItemCount(categoryToDelete) > 0
                  ? `There are ${getItemCount(categoryToDelete)} item(s) in this category. They will automatically be safely moved to "Other".`
                  : 'This category will be permanently removed from your catalog filters.'}
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Yes, Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
