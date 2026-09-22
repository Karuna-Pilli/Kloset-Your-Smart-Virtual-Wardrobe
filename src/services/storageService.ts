import {
  WardrobeItem,
  WardrobeSection,
  FamilyMember,
  ItemReminder,
  LaundryRecord,
  LoanRecord,
  PackingList,
  UserProfile,
} from '../types';
import {
  INITIAL_PROFILE,
  SAMPLE_FAMILY_MEMBERS,
  SAMPLE_SECTIONS,
  SAMPLE_WARDROBE_ITEMS,
  SAMPLE_REMINDERS,
  SAMPLE_LAUNDRY_RECORDS,
  SAMPLE_LOAN_RECORDS,
  SAMPLE_PACKING_LISTS,
} from '../data/sampleWardrobe';
import { indexedDbService } from './indexedDbService';

const KEYS = {
  PROFILE: 'wardrobe_user_profile_v2',
  MEMBERS: 'wardrobe_family_members_v2',
  SECTIONS: 'wardrobe_sections_v2',
  ITEMS: 'wardrobe_items_v2',
  REMINDERS: 'wardrobe_reminders_v2',
  LAUNDRY: 'wardrobe_laundry_v2',
  LOANS: 'wardrobe_loans_v2',
  PACKING: 'wardrobe_packing_v2',
};

export const storageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : INITIAL_PROFILE;
    } catch (e) {
      console.error(e);
      return INITIAL_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getFamilyMembers(): FamilyMember[] {
    try {
      const data = localStorage.getItem(KEYS.MEMBERS);
      if (!data) return SAMPLE_FAMILY_MEMBERS;
      const parsed: FamilyMember[] = JSON.parse(data);
      // Filter out any legacy dummy sample members if present
      const cleaned = parsed.filter(m => m.id !== 'fam_spouse' && m.id !== 'fam_daughter');
      return cleaned.length > 0 ? cleaned : SAMPLE_FAMILY_MEMBERS;
    } catch (e) {
      return SAMPLE_FAMILY_MEMBERS;
    }
  },

  saveFamilyMembers(members: FamilyMember[]): void {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  },

  getSections(): WardrobeSection[] {
    try {
      const data = localStorage.getItem(KEYS.SECTIONS);
      return data ? JSON.parse(data) : SAMPLE_SECTIONS;
    } catch (e) {
      return SAMPLE_SECTIONS;
    }
  },

  saveSections(sections: WardrobeSection[]): void {
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(sections));
  },

  getItems(): WardrobeItem[] {
    try {
      const data = localStorage.getItem(KEYS.ITEMS);
      return data ? JSON.parse(data) : SAMPLE_WARDROBE_ITEMS;
    } catch (e) {
      return SAMPLE_WARDROBE_ITEMS;
    }
  },

  saveItems(items: WardrobeItem[]): void {
    // 1. Always persist to IndexedDB (massive capacity, no 5MB limit)
    indexedDbService.saveAllItems(items).catch((err) => {
      console.warn('IndexedDB auto-sync note:', err);
    });

    // 2. Persist to localStorage with fallback protection against QuotaExceededError
    try {
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('localStorage quota warning. Storing lightweight item references in localStorage while full data is safe in IndexedDB & Cloud Firestore.');
      try {
        // Store items with primary image only in localStorage to stay lean
        const leanItems = items.map(it => ({
          ...it,
          images: it.images && it.images.length > 0 ? [it.images[0]] : [],
          styledReferenceImages: [],
        }));
        localStorage.setItem(KEYS.ITEMS, JSON.stringify(leanItems));
      } catch (innerErr) {
        console.warn('localStorage full. IndexedDB retains full fidelity.');
      }
    }
  },

  getReminders(): ItemReminder[] {

    try {
      const data = localStorage.getItem(KEYS.REMINDERS);
      return data ? JSON.parse(data) : SAMPLE_REMINDERS;
    } catch (e) {
      return SAMPLE_REMINDERS;
    }
  },

  saveReminders(reminders: ItemReminder[]): void {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  },

  getLaundry(): LaundryRecord[] {
    try {
      const data = localStorage.getItem(KEYS.LAUNDRY);
      return data ? JSON.parse(data) : SAMPLE_LAUNDRY_RECORDS;
    } catch (e) {
      return SAMPLE_LAUNDRY_RECORDS;
    }
  },

  getLaundryRecords(): LaundryRecord[] {
    return this.getLaundry();
  },

  saveLaundry(laundry: LaundryRecord[]): void {
    localStorage.setItem(KEYS.LAUNDRY, JSON.stringify(laundry));
  },

  saveLaundryRecords(laundry: LaundryRecord[]): void {
    this.saveLaundry(laundry);
  },

  getLoans(): LoanRecord[] {
    try {
      const data = localStorage.getItem(KEYS.LOANS);
      return data ? JSON.parse(data) : SAMPLE_LOAN_RECORDS;
    } catch (e) {
      return SAMPLE_LOAN_RECORDS;
    }
  },

  getLoanRecords(): LoanRecord[] {
    return this.getLoans();
  },

  saveLoans(loans: LoanRecord[]): void {
    localStorage.setItem(KEYS.LOANS, JSON.stringify(loans));
  },

  saveLoanRecords(loans: LoanRecord[]): void {
    this.saveLoans(loans);
  },

  getPackingLists(): PackingList[] {
    try {
      const data = localStorage.getItem(KEYS.PACKING);
      return data ? JSON.parse(data) : SAMPLE_PACKING_LISTS;
    } catch (e) {
      return SAMPLE_PACKING_LISTS;
    }
  },

  savePackingLists(lists: PackingList[]): void {
    localStorage.setItem(KEYS.PACKING, JSON.stringify(lists));
  },

  // Export full backup
  exportAllData(): string {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      familyMembers: this.getFamilyMembers(),
      sections: this.getSections(),
      items: this.getItems(),
      reminders: this.getReminders(),
      laundry: this.getLaundry(),
      loans: this.getLoans(),
      packingLists: this.getPackingLists(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import full backup
  importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) this.saveProfile(parsed.profile);
      if (parsed.familyMembers) this.saveFamilyMembers(parsed.familyMembers);
      if (parsed.sections) this.saveSections(parsed.sections);
      if (parsed.items) this.saveItems(parsed.items);
      if (parsed.reminders) this.saveReminders(parsed.reminders);
      if (parsed.laundry) this.saveLaundry(parsed.laundry);
      if (parsed.loans) this.saveLoans(parsed.loans);
      if (parsed.packingLists) this.savePackingLists(parsed.packingLists);
      return true;
    } catch (e) {
      console.error('Failed to import wardrobe data', e);
      return false;
    }
  },

  // Reset to factory sample data
  resetToSample(): void {
    this.saveProfile(INITIAL_PROFILE);
    this.saveFamilyMembers(SAMPLE_FAMILY_MEMBERS);
    this.saveSections(SAMPLE_SECTIONS);
    this.saveItems(SAMPLE_WARDROBE_ITEMS);
    this.saveReminders(SAMPLE_REMINDERS);
    this.saveLaundry(SAMPLE_LAUNDRY_RECORDS);
    this.saveLoans(SAMPLE_LOAN_RECORDS);
    this.savePackingLists(SAMPLE_PACKING_LISTS);
  },
};
