import React, { useState } from 'react';
import {
  Users,
  User,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ShieldCheck,
  Sparkle,
  Layers,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { FamilyMember, WardrobeItem } from '../types';

interface FamilyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  items?: WardrobeItem[];
  activePersonId: string;
  onSelectPerson: (id: string) => void;
  onAddMember: (name: string, relationship: string) => void;
  onUpdateMember?: (updatedMembers: FamilyMember[]) => void;
  onUpdateMembers?: (updatedMembers: FamilyMember[]) => void;
  onDeleteMember: (memberId: string) => void;
  userProfileName?: string;
}

const RELATIONSHIPS = [
  'None',
  'Spouse',
  'Son',
  'Daughter',
  'Mother',
  'Father',
  'Sister',
  'Brother',
  'Partner',
  'Friend / Roommate',
  'Family Member',
  'Other',
];

export const FamilyMembersModal: React.FC<FamilyMembersModalProps> = ({
  isOpen,
  onClose,
  familyMembers,
  items = [],
  activePersonId,
  onSelectPerson,
  onAddMember,
  onUpdateMember,
  onUpdateMembers,
  onDeleteMember,
  userProfileName,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('None');
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalRel = relationship === 'None' ? '' : relationship;
    onAddMember(name.trim(), finalRel);
    setName('');
    setRelationship('None');
    setIsAdding(false);
  };

  const handleEditSubmit = (e: React.FormEvent, member: FamilyMember) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalRel = relationship === 'None' ? '' : relationship;
    const updated = familyMembers.map((m) =>
      m.id === member.id ? { ...m, name: name.trim(), relationship: finalRel } : m
    );
    if (onUpdateMembers) {
      onUpdateMembers(updated);
    } else if (onUpdateMember) {
      onUpdateMember(updated);
    }
    setEditingMemberId(null);
    setName('');
    setRelationship('None');
  };

  const startEdit = (m: FamilyMember) => {
    setEditingMemberId(m.id);
    setName(m.name);
    setRelationship(m.relationship || 'None');
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (!memberToDelete) return;
    onDeleteMember(memberToDelete.id);
    setMemberToDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF6F0] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-2 border-[#ECDACF] relative animate-scale-up">
        {/* Header */}
        <div className="bg-[#39402D] text-[#F0CAAF] p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#F0CAAF]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89452] text-white flex items-center gap-1 uppercase tracking-wider shadow-2xs">
              <Users className="w-3 h-3 text-[#FFF7F4]" /> Family Wardrobe Hub
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-extrabold text-white font-serif"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Family Members & Member Folders
          </h2>
          <p className="text-xs text-[#ECDACF] mt-1 font-medium leading-relaxed">
            Manage individual family member folders. Each member gets their own private catalog and clothing inventory.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-[#FAF2EC] rounded-2xl border border-[#ECDACF] text-stone-700 text-xs space-y-1">
            <div className="font-bold text-[#39402D] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C89452]" />
              <span>How Member Folders Work:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-600">
              When you select a member from the top bar or sidebar, the app displays <strong>exclusively that person's clothes and outfits</strong>. Selecting "All Folders" aggregates the entire family collection.
            </p>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#39402D] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C89452]" />
                <span>Active Members ({familyMembers.length})</span>
              </h3>

              {!isAdding && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(true);
                    setEditingMemberId(null);
                    setName('');
                    setRelationship(RELATIONSHIPS[0]);
                  }}
                  className="px-3 py-1.5 bg-[#39402D] hover:bg-[#485339] text-[#F0CAAF] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs border border-[#C89452] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C89452]" />
                  <span>Add Member</span>
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {isAdding && (
              <form
                onSubmit={handleAddSubmit}
                className="p-4 bg-white rounded-2xl border-2 border-[#C89452] shadow-sm space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#39402D]">Add New Family Member</span>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Member Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya, Rahul, Mom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 bg-[#FAF6F0] border border-[#ECDACF] rounded-xl outline-none focus:border-[#C89452] font-semibold text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full p-2 bg-[#FAF6F0] border border-[#ECDACF] rounded-xl outline-none focus:border-[#C89452] font-semibold text-stone-800"
                    >
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-stone-500 hover:text-stone-800 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#39402D] text-[#F0CAAF] text-xs font-bold rounded-xl shadow-xs hover:bg-[#485339] cursor-pointer"
                  >
                    Create Member Folder
                  </button>
                </div>
              </form>
            )}

            {/* Member Cards */}
            <div className="space-y-2.5">
              {familyMembers.length === 0 && (
                <div className="p-6 text-center bg-white/70 rounded-2xl border-2 border-dashed border-[#ECDACF] space-y-2">
                  <Users className="w-8 h-8 text-[#C89452] mx-auto opacity-70" />
                  <p className="text-xs font-bold text-stone-700">No member folders created yet</p>
                  <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                    You can create custom folders for family members, roommates, or clients to manage their wardrobes separately.
                  </p>
                  {!isAdding && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(true);
                        setName('');
                        setRelationship('None');
                      }}
                      className="mt-2 px-3.5 py-1.5 bg-[#39402D] text-[#F0CAAF] rounded-xl text-xs font-bold shadow-xs hover:bg-[#485339] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C89452]" />
                      <span>Add Your First Member Folder</span>
                    </button>
                  )}
                </div>
              )}

              {familyMembers.map((member) => {
                const memberItemCount = items.filter((i) => i.personId === member.id).length;
                const isSelf = member.id === 'self' || member.relationship === 'Self';
                const isEditing = editingMemberId === member.id;

                if (isEditing) {
                  return (
                    <form
                      key={member.id}
                      onSubmit={(e) => handleEditSubmit(e, member)}
                      className="p-3.5 bg-white rounded-2xl border-2 border-[#C89452] space-y-3 animate-fade-in"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Member Name"
                          className="w-full p-2 bg-[#FAF6F0] border border-[#ECDACF] rounded-xl outline-none focus:border-[#C89452] font-semibold"
                        />
                        <select
                          value={relationship}
                          onChange={(e) => setRelationship(e.target.value)}
                          className="w-full p-2 bg-[#FAF6F0] border border-[#ECDACF] rounded-xl outline-none focus:border-[#C89452] font-semibold"
                        >
                          {RELATIONSHIPS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMemberId(null)}
                          className="px-3 py-1 text-xs text-stone-500 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-[#39402D] text-[#F0CAAF] text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={member.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      activePersonId === member.id
                        ? 'bg-white border-[#C89452] shadow-xs ring-1 ring-[#C89452]/40'
                        : 'bg-white/80 hover:bg-white border-[#ECDACF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-2xs ${
                          isSelf ? 'bg-[#39402D]' : 'bg-[#D8957F]'
                        }`}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-stone-800">{member.name}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF2EC] text-[#39402D] border border-[#ECDACF]">
                            {member.relationship && member.relationship !== 'None'
                              ? member.relationship
                              : 'Member Folder'}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-medium mt-0.5 flex items-center gap-2">
                          <span>{memberItemCount} {memberItemCount === 1 ? 'item' : 'items'}</span>
                          {activePersonId === member.id && (
                            <span className="text-[#C89452] font-bold text-[10px]">• Currently Active</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPerson(member.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#39402D] bg-[#FAF2EC] hover:bg-[#F5DFD6] rounded-lg border border-[#ECDACF] transition-colors cursor-pointer"
                      >
                        Switch To
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(member)}
                        className="p-1.5 text-stone-400 hover:text-[#39402D] hover:bg-[#FAF2EC] rounded-lg transition-colors cursor-pointer"
                        title="Edit member name / relationship"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setMemberToDelete(member)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete this member folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {memberToDelete && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-stone-200 shadow-2xl text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">
                  Delete "{memberToDelete.name}"'s Folder?
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  This will remove the folder for {memberToDelete.name}. Any items inside will remain in the primary wardrobe.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
