import {
  db,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch,
  getDocs,
} from '../lib/firebase';
import {
  WardrobeItem,
  WardrobeSection,
  FamilyMember,
  PackingList,
  LaundryRecord,
  LoanRecord,
  ItemReminder,
  UserProfile,
  FashionOffer,
} from '../types';

// Safe snapshot error logger that distinguishes expected offline states from fatal errors
const handleSnapshotNotice = (label: string, err: { code?: string; message: string }) => {
  if (err.code === 'unavailable' || err.message?.toLowerCase().includes('offline') || err.message?.toLowerCase().includes('backend')) {
    // Firestore operates in offline mode when network drops or backend is reconnecting
    console.info(`[Offline Sync] ${label} is currently serving from local persistent cache.`);
  } else {
    console.warn(`${label} snapshot notice:`, err.message);
  }
};

// Safe operation error logger
const handleSyncNotice = (action: string, error: unknown) => {
  const msg = error instanceof Error ? error.message : String(error);
  console.warn(`[Firestore Sync] ${action}:`, msg);
};

export const firestoreSyncService = {
  // Sync listeners subscriber
  subscribeToUserData(
    uid: string,
    callbacks: {
      onProfile?: (profile: UserProfile) => void;
      onItems?: (items: WardrobeItem[]) => void;
      onSections?: (sections: WardrobeSection[]) => void;
      onFamilyMembers?: (members: FamilyMember[]) => void;
      onPackingLists?: (lists: PackingList[]) => void;
      onLaundry?: (records: LaundryRecord[]) => void;
      onLoans?: (records: LoanRecord[]) => void;
      onReminders?: (reminders: ItemReminder[]) => void;
    }
  ) {
    const unsubs: (() => void)[] = [];

    // Profile listener
    const profileDocRef = doc(db, 'users', uid);
    unsubs.push(
      onSnapshot(
        profileDocRef,
        (snap) => {
          if (snap.exists() && callbacks.onProfile) {
            callbacks.onProfile(snap.data() as UserProfile);
          }
        },
        (err) => handleSnapshotNotice('Profile', err)
      )
    );

    // Wardrobe items listener
    const itemsColRef = collection(db, 'users', uid, 'items');
    unsubs.push(
      onSnapshot(
        itemsColRef,
        (snap) => {
          if (callbacks.onItems) {
            const itemsList: WardrobeItem[] = [];
            snap.forEach((docSnap) => {
              itemsList.push(docSnap.data() as WardrobeItem);
            });
            callbacks.onItems(itemsList);
          }
        },
        (err) => handleSnapshotNotice('Items', err)
      )
    );

    // Sections listener
    const sectionsColRef = collection(db, 'users', uid, 'sections');
    unsubs.push(
      onSnapshot(
        sectionsColRef,
        (snap) => {
          if (callbacks.onSections) {
            const sectionsList: WardrobeSection[] = [];
            snap.forEach((docSnap) => {
              sectionsList.push(docSnap.data() as WardrobeSection);
            });
            callbacks.onSections(sectionsList);
          }
        },
        (err) => handleSnapshotNotice('Sections', err)
      )
    );

    // Family members listener
    const membersColRef = collection(db, 'users', uid, 'familyMembers');
    unsubs.push(
      onSnapshot(
        membersColRef,
        (snap) => {
          if (callbacks.onFamilyMembers) {
            const membersList: FamilyMember[] = [];
            snap.forEach((docSnap) => {
              membersList.push(docSnap.data() as FamilyMember);
            });
            callbacks.onFamilyMembers(membersList);
          }
        },
        (err) => handleSnapshotNotice('Family', err)
      )
    );

    // Packing lists listener
    const packingColRef = collection(db, 'users', uid, 'packingLists');
    unsubs.push(
      onSnapshot(
        packingColRef,
        (snap) => {
          if (callbacks.onPackingLists) {
            const packingList: PackingList[] = [];
            snap.forEach((docSnap) => {
              packingList.push(docSnap.data() as PackingList);
            });
            callbacks.onPackingLists(packingList);
          }
        },
        (err) => handleSnapshotNotice('Packing', err)
      )
    );

    // Laundry records listener
    const laundryColRef = collection(db, 'users', uid, 'laundryRecords');
    unsubs.push(
      onSnapshot(
        laundryColRef,
        (snap) => {
          if (callbacks.onLaundry) {
            const laundryList: LaundryRecord[] = [];
            snap.forEach((docSnap) => {
              laundryList.push(docSnap.data() as LaundryRecord);
            });
            callbacks.onLaundry(laundryList);
          }
        },
        (err) => handleSnapshotNotice('Laundry', err)
      )
    );

    // Loan records listener
    const loansColRef = collection(db, 'users', uid, 'loanRecords');
    unsubs.push(
      onSnapshot(
        loansColRef,
        (snap) => {
          if (callbacks.onLoans) {
            const loansList: LoanRecord[] = [];
            snap.forEach((docSnap) => {
              loansList.push(docSnap.data() as LoanRecord);
            });
            callbacks.onLoans(loansList);
          }
        },
        (err) => handleSnapshotNotice('Loans', err)
      )
    );

    // Reminders listener
    const remindersColRef = collection(db, 'users', uid, 'reminders');
    unsubs.push(
      onSnapshot(
        remindersColRef,
        (snap) => {
          if (callbacks.onReminders) {
            const remindersList: ItemReminder[] = [];
            snap.forEach((docSnap) => {
              remindersList.push(docSnap.data() as ItemReminder);
            });
            callbacks.onReminders(remindersList);
          }
        },
        (err) => handleSnapshotNotice('Reminders', err)
      )
    );

    // Return cleanup function
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  },

  // First-time migration of local data to user's Firestore cloud storage
  async checkAndSeedLocalDataToCloud(
    uid: string,
    initialData: {
      profile: UserProfile;
      items: WardrobeItem[];
      sections: WardrobeSection[];
      familyMembers: FamilyMember[];
      packingLists: PackingList[];
      laundryRecords: LaundryRecord[];
      loanRecords: LoanRecord[];
      reminders: ItemReminder[];
    }
  ) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.info('Client is currently offline; initial cloud seeding will wait for network connection.');
      return;
    }

    try {
      const itemsColRef = collection(db, 'users', uid, 'items');
      const existingItemsSnap = await getDocs(itemsColRef);

      if (existingItemsSnap.empty && initialData.items.length > 0) {
        console.log('Seeding initial local wardrobe data to cloud for new user...', uid);
        const batch = writeBatch(db);

        // Seed profile
        const userDoc = doc(db, 'users', uid);
        batch.set(userDoc, initialData.profile, { merge: true });

        // Seed items
        initialData.items.forEach((item) => {
          const itemDoc = doc(db, 'users', uid, 'items', item.id);
          batch.set(itemDoc, item);
        });

        // Seed sections
        initialData.sections.forEach((sec) => {
          const secDoc = doc(db, 'users', uid, 'sections', sec.id);
          batch.set(secDoc, sec);
        });

        // Seed family members
        initialData.familyMembers.forEach((member) => {
          const memDoc = doc(db, 'users', uid, 'familyMembers', member.id);
          batch.set(memDoc, member);
        });

        // Seed packing lists
        initialData.packingLists.forEach((list) => {
          const listDoc = doc(db, 'users', uid, 'packingLists', list.id);
          batch.set(listDoc, list);
        });

        // Seed laundry
        initialData.laundryRecords.forEach((l) => {
          const lDoc = doc(db, 'users', uid, 'laundryRecords', l.id);
          batch.set(lDoc, l);
        });

        // Seed loans
        initialData.loanRecords.forEach((loan) => {
          const loanDoc = doc(db, 'users', uid, 'loanRecords', loan.id);
          batch.set(loanDoc, loan);
        });

        // Seed reminders
        initialData.reminders.forEach((r) => {
          const rDoc = doc(db, 'users', uid, 'reminders', r.id);
          batch.set(rDoc, r);
        });

        await batch.commit();
        console.log('Successfully synced local data to cloud.');
      }
    } catch (e: any) {
      if (e?.code === 'unavailable' || e?.message?.toLowerCase().includes('offline')) {
        console.info('Initial cloud sync deferred: Firestore operating in offline cache mode.');
      } else {
        console.warn('Initial cloud migration notice:', e);
      }
    }
  },

  // Save/Update operations
  async saveItem(uid: string, item: WardrobeItem) {
    try {
      const itemRef = doc(db, 'users', uid, 'items', item.id);
      await setDoc(itemRef, item, { merge: true });
    } catch (e) {
      handleSyncNotice('Save item', e);
    }
  },

  async deleteItem(uid: string, itemId: string) {
    try {
      const itemRef = doc(db, 'users', uid, 'items', itemId);
      await deleteDoc(itemRef);
    } catch (e) {
      handleSyncNotice('Delete item', e);
    }
  },

  async saveBulkItems(uid: string, items: WardrobeItem[]) {
    try {
      const batch = writeBatch(db);
      items.forEach((item) => {
        const itemRef = doc(db, 'users', uid, 'items', item.id);
        batch.set(itemRef, item, { merge: true });
      });
      await batch.commit();
    } catch (e) {
      handleSyncNotice('Bulk save items', e);
    }
  },

  async saveSections(uid: string, sections: WardrobeSection[]) {
    try {
      const batch = writeBatch(db);
      sections.forEach((sec) => {
        const secRef = doc(db, 'users', uid, 'sections', sec.id);
        batch.set(secRef, sec, { merge: true });
      });
      await batch.commit();
    } catch (e) {
      handleSyncNotice('Save sections', e);
    }
  },

  async deleteSection(uid: string, sectionId: string) {
    try {
      const secRef = doc(db, 'users', uid, 'sections', sectionId);
      await deleteDoc(secRef);
    } catch (e) {
      handleSyncNotice('Delete section', e);
    }
  },

  async saveFamilyMembers(uid: string, members: FamilyMember[]) {
    try {
      const batch = writeBatch(db);
      members.forEach((mem) => {
        const memRef = doc(db, 'users', uid, 'familyMembers', mem.id);
        batch.set(memRef, mem, { merge: true });
      });
      await batch.commit();
    } catch (e) {
      handleSyncNotice('Save family members', e);
    }
  },

  async deleteFamilyMember(uid: string, memberId: string) {
    try {
      const memRef = doc(db, 'users', uid, 'familyMembers', memberId);
      await deleteDoc(memRef);
    } catch (e) {
      handleSyncNotice('Delete family member', e);
    }
  },

  async savePackingList(uid: string, list: PackingList) {
    try {
      const listRef = doc(db, 'users', uid, 'packingLists', list.id);
      await setDoc(listRef, list, { merge: true });
    } catch (e) {
      handleSyncNotice('Save packing list', e);
    }
  },

  async deletePackingList(uid: string, listId: string) {
    try {
      const listRef = doc(db, 'users', uid, 'packingLists', listId);
      await deleteDoc(listRef);
    } catch (e) {
      handleSyncNotice('Delete packing list', e);
    }
  },

  async saveLaundryRecord(uid: string, record: LaundryRecord) {
    try {
      const recRef = doc(db, 'users', uid, 'laundryRecords', record.id);
      await setDoc(recRef, record, { merge: true });
    } catch (e) {
      handleSyncNotice('Save laundry record', e);
    }
  },

  async deleteLaundryRecord(uid: string, recordId: string) {
    try {
      const recRef = doc(db, 'users', uid, 'laundryRecords', recordId);
      await deleteDoc(recRef);
    } catch (e) {
      handleSyncNotice('Delete laundry record', e);
    }
  },

  async saveLoanRecord(uid: string, record: LoanRecord) {
    try {
      const recRef = doc(db, 'users', uid, 'loanRecords', record.id);
      await setDoc(recRef, record, { merge: true });
    } catch (e) {
      handleSyncNotice('Save loan record', e);
    }
  },

  async deleteLoanRecord(uid: string, recordId: string) {
    try {
      const recRef = doc(db, 'users', uid, 'loanRecords', recordId);
      await deleteDoc(recRef);
    } catch (e) {
      handleSyncNotice('Delete loan record', e);
    }
  },

  async saveReminder(uid: string, reminder: ItemReminder) {
    try {
      const remRef = doc(db, 'users', uid, 'reminders', reminder.id);
      await setDoc(remRef, reminder, { merge: true });
    } catch (e) {
      handleSyncNotice('Save reminder', e);
    }
  },

  async deleteReminder(uid: string, reminderId: string) {
    try {
      const remRef = doc(db, 'users', uid, 'reminders', reminderId);
      await deleteDoc(remRef);
    } catch (e) {
      handleSyncNotice('Delete reminder', e);
    }
  },

  async saveProfile(uid: string, profile: UserProfile) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, profile, { merge: true });
    } catch (e) {
      handleSyncNotice('Save profile', e);
    }
  },

  // Global Fashion Deals Firestore Operations
  subscribeToGlobalFashionDeals(onDeals: (deals: FashionOffer[]) => void) {
    try {
      const dealsColRef = collection(db, 'fashion_deals');
      return onSnapshot(
        dealsColRef,
        (snap) => {
          const list: FashionOffer[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as FashionOffer);
          });
          onDeals(list);
        },
        (err) => {
          console.warn('Global fashion deals snapshot notification:', err.message);
        }
      );
    } catch (err) {
      console.warn('Could not attach global fashion deals listener:', err);
      return () => {};
    }
  },

  async publishGlobalFashionDeal(deal: FashionOffer) {
    try {
      const dealRef = doc(db, 'fashion_deals', deal.id);
      await setDoc(dealRef, deal, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to publish global fashion deal to Firestore:', err);
      throw err;
    }
  },

  async deleteGlobalFashionDeal(dealId: string) {
    try {
      const dealRef = doc(db, 'fashion_deals', dealId);
      await deleteDoc(dealRef);
      return true;
    } catch (err) {
      console.error('Failed to delete global fashion deal from Firestore:', err);
      throw err;
    }
  },
};
