import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { WardrobeBrowser } from './components/WardrobeBrowser';
import { SectionsManager } from './components/SectionsManager';
import { StylistView } from './components/StylistView';
import { PackingView } from './components/PackingView';
import { LaundryLoanTracker } from './components/LaundryLoanTracker';
import { RemindersView } from './components/RemindersView';
import { ItemUploadModal } from './components/ItemUploadModal';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { OnboardingTour } from './components/OnboardingTour';
import { BoutiqueShareModal } from './components/BoutiqueShareModal';
import { FashionDealsModal } from './components/FashionDealsModal';
import { ColorPaletteModal } from './components/ColorPaletteModal';
import { AuthModal } from './components/AuthModal';
import { StyleProfileModal } from './components/StyleProfileModal';
import { FamilyMembersModal } from './components/FamilyMembersModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { PublicLookbookView } from './components/PublicLookbookView';
import { storageService } from './services/storageService';
import { firestoreSyncService } from './services/firestoreSyncService';
import { categoriesService } from './services/categoriesService';
import { auth, onAuthStateChanged, User } from './lib/firebase';
import {
  WardrobeItem,
  WardrobeSection,
  UserProfile,
  FamilyMember,
  PackingList,
  LaundryRecord,
  LoanRecord,
  ItemReminder,
  WearLog,
} from './types';

export default function App() {
  // Authentication & Cloud Sync
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<
    'catalog' | 'sections' | 'stylist' | 'packing' | 'laundry_loans' | 'reminders'
  >('catalog');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('All');

  // Core Persistent State
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [sections, setSections] = useState<WardrobeSection[]>([]);
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());
  const [categories, setCategories] = useState<string[]>(categoriesService.getCategories());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [activePersonId, setActivePersonId] = useState<string>('all');
  const [packingLists, setPackingLists] = useState<PackingList[]>([]);
  const [laundryRecords, setLaundryRecords] = useState<LaundryRecord[]>([]);
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>([]);
  const [reminders, setReminders] = useState<ItemReminder[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Public Lookbook View State
  const [publicLookbookState, setPublicLookbookState] = useState<{
    isActive: boolean;
    sectionId: string;
    creatorName: string;
  }>(() => {
    if (typeof window === 'undefined') return { isActive: false, sectionId: 'all', creatorName: 'Kloset Curated' };
    const pathname = window.location.pathname;
    const search = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    if (pathname.startsWith('/lookbook') || search.has('lookbook') || hash.includes('lookbook')) {
      let sec = 'all';
      if (pathname.startsWith('/lookbook/')) {
        sec = decodeURIComponent(pathname.replace('/lookbook/', '').split('?')[0]) || 'all';
      } else if (search.get('lookbook')) {
        sec = search.get('lookbook') || 'all';
      }
      const user = search.get('user') || 'Kloset Curated';
      return { isActive: true, sectionId: sec, creatorName: user };
    }
    return { isActive: false, sectionId: 'all', creatorName: 'Kloset Curated' };
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);

  const [selectedItemForDetails, setSelectedItemForDetails] = useState<WardrobeItem | null>(null);
  const [stylistAnchorItem, setStylistAnchorItem] = useState<WardrobeItem | null>(null);

  const [showTour, setShowTour] = useState(false);
  const [showBoutiqueShare, setShowBoutiqueShare] = useState(false);
  const [showFashionDeals, setShowFashionDeals] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showStyleProfileModal, setShowStyleProfileModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [wardrobeArchiveTab, setWardrobeArchiveTab] = useState<'active' | 'archived' | 'all'>('active');

  const baseLimit = profile.currentMode === 'family' ? 75 : 35;
  const bonusSlots = profile.bonusItemSlots || 0;
  const currentTotalLimit = baseLimit + bonusSlots;

  const handleClaimOfferReward = (offerId: string, bonusAmount: number) => {
    const currentClaimed = profile.claimedOfferIds || [];
    if (!currentClaimed.includes(offerId)) {
      const updated: UserProfile = {
        ...profile,
        bonusItemSlots: (profile.bonusItemSlots || 0) + bonusAmount,
        claimedOfferIds: [...currentClaimed, offerId],
      };
      setProfile(updated);
      storageService.saveProfile(updated);
      if (currentUser) {
        firestoreSyncService.saveProfile(currentUser.uid, updated);
      }
    }
  };

  const handleOpenUploadWithLimitCheck = (bulk = false) => {
    // Seasonal archive items do not consume active closet limit
    const activeItemsCount = items.filter((i) => !i.isArchived).length;
    if (activeItemsCount >= currentTotalLimit) {
      setShowBoutiqueShare(true);
      return;
    }
    setEditingItem(null);
    setIsBulkUpload(bulk);
    setShowUploadModal(true);
  };

  // Initialize storage
  useEffect(() => {
    const loadedItems = storageService.getItems();
    const loadedSections = storageService.getSections();
    const loadedProfile = storageService.getProfile();
    const loadedFamily = storageService.getFamilyMembers();
    const loadedPacking = storageService.getPackingLists();
    const loadedLaundry = storageService.getLaundryRecords();
    const loadedLoans = storageService.getLoanRecords();
    const loadedReminders = storageService.getReminders();

    setItems(loadedItems);
    setSections(loadedSections);
    setProfile(loadedProfile);
    setFamilyMembers(loadedFamily);
    setPackingLists(loadedPacking);
    setLaundryRecords(loadedLaundry);
    setLoanRecords(loadedLoans);
    setReminders(loadedReminders);

    // If first-time user, trigger onboarding tour
    if (!loadedProfile.hasCompletedTour) {
      setShowTour(true);
    }
  }, []);

  // Firebase Auth & Cloud Real-Time Listener
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        // Sync local cache to Firestore if new cloud user
        firestoreSyncService.checkAndSeedLocalDataToCloud(user.uid, {
          profile: storageService.getProfile(),
          items: storageService.getItems(),
          sections: storageService.getSections(),
          familyMembers: storageService.getFamilyMembers(),
          packingLists: storageService.getPackingLists(),
          laundryRecords: storageService.getLaundryRecords(),
          loanRecords: storageService.getLoanRecords(),
          reminders: storageService.getReminders(),
        });

        // Setup real-time listeners across all devices
        unsubscribeFirestore = firestoreSyncService.subscribeToUserData(user.uid, {
          onProfile: (p) => {
            if (p) {
              setProfile((prev) => ({ ...prev, ...p }));
              storageService.saveProfile(p);
            }
          },
          onItems: (cloudItems) => {
            if (cloudItems && cloudItems.length > 0) {
              setItems(cloudItems);
              storageService.saveItems(cloudItems);
            }
          },
          onSections: (cloudSections) => {
            if (cloudSections && cloudSections.length > 0) {
              setSections(cloudSections);
              storageService.saveSections(cloudSections);
            }
          },
          onFamilyMembers: (cloudMembers) => {
            if (cloudMembers && cloudMembers.length > 0) {
              setFamilyMembers(cloudMembers);
              storageService.saveFamilyMembers(cloudMembers);
            }
          },
          onPackingLists: (cloudPacking) => {
            if (cloudPacking) {
              setPackingLists(cloudPacking);
              storageService.savePackingLists(cloudPacking);
            }
          },
          onLaundry: (cloudLaundry) => {
            if (cloudLaundry) {
              setLaundryRecords(cloudLaundry);
              storageService.saveLaundryRecords(cloudLaundry);
            }
          },
          onLoans: (cloudLoans) => {
            if (cloudLoans) {
              setLoanRecords(cloudLoans);
              storageService.saveLoanRecords(cloudLoans);
            }
          },
          onReminders: (cloudReminders) => {
            if (cloudReminders) {
              setReminders(cloudReminders);
              storageService.saveReminders(cloudReminders);
            }
          },
        });
      } else {
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Sync state helpers
  const handleSaveItem = (item: WardrobeItem) => {
    const exists = items.some((i) => i.id === item.id);
    let updated: WardrobeItem[];
    if (exists) {
      updated = items.map((i) => (i.id === item.id ? item : i));
    } else {
      updated = [item, ...items];
    }
    setItems(updated);
    storageService.saveItems(updated);

    if (currentUser) {
      firestoreSyncService.saveItem(currentUser.uid, item);
    }

    // If currently viewing in details modal, update it
    if (selectedItemForDetails?.id === item.id) {
      setSelectedItemForDetails(item);
    }
  };

  const handleSaveBulkItems = (newItems: WardrobeItem[]) => {
    const updated = [...newItems, ...items];
    setItems(updated);
    storageService.saveItems(updated);

    if (currentUser) {
      firestoreSyncService.saveBulkItems(currentUser.uid, newItems);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    storageService.saveItems(updated);

    if (currentUser) {
      firestoreSyncService.deleteItem(currentUser.uid, itemId);
    }

    setSelectedItemForDetails(null);
  };

  const handleToggleArchive = (itemId: string, isArchived: boolean) => {
    const updated = items.map((i) =>
      i.id === itemId ? { ...i, isArchived, updatedAt: new Date().toISOString() } : i
    );
    setItems(updated);
    storageService.saveItems(updated);

    const changedItem = updated.find((i) => i.id === itemId);
    if (changedItem && currentUser) {
      firestoreSyncService.saveItem(currentUser.uid, changedItem);
    }

    if (selectedItemForDetails?.id === itemId && changedItem) {
      setSelectedItemForDetails(changedItem);
    }
  };

  const handleSaveSections = (newSections: WardrobeSection[]) => {
    setSections(newSections);
    storageService.saveSections(newSections);

    if (currentUser) {
      firestoreSyncService.saveSections(currentUser.uid, newSections);
    }
  };

  const handleSaveCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    categoriesService.saveCategories(newCategories);
    const updatedProfile = { ...profile, customCategories: newCategories };
    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
    if (currentUser) {
      firestoreSyncService.saveProfile(currentUser.uid, updatedProfile);
    }
  };

  const handleRenameCategoryInItems = (oldCat: string, newCat: string) => {
    const updated = items.map((i) => (i.category === oldCat ? { ...i, category: newCat } : i));
    setItems(updated);
    storageService.saveItems(updated);
    if (currentUser) {
      firestoreSyncService.saveBulkItems(currentUser.uid, updated);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    setSections(updated);
    storageService.saveSections(updated);

    if (currentUser) {
      firestoreSyncService.deleteSection(currentUser.uid, sectionId);
    }

    if (selectedSectionId === sectionId) {
      setSelectedSectionId('All');
    }
  };

  const handleGoToHome = () => {
    setActiveTab('catalog');
    setSelectedCategory('All');
    setSelectedSectionId('All');
    setSearchQuery('');
  };

  const handleAddSubSection = (sectionId: string, name: string, description?: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        const newSub = {
          id: `sub_${Date.now()}`,
          name,
          description,
        };
        return {
          ...sec,
          subSections: [...sec.subSections, newSub],
        };
      }
      return sec;
    });
    setSections(updated);
    storageService.saveSections(updated);

    if (currentUser) {
      firestoreSyncService.saveSections(currentUser.uid, updated);
    }
  };

  const handleModeChange = (mode: 'individual' | 'family') => {
    const updated = { ...profile, currentMode: mode };
    setProfile(updated);
    storageService.saveProfile(updated);

    if (currentUser) {
      firestoreSyncService.saveProfile(currentUser.uid, updated);
    }
  };

  const handleAddFamilyMember = (name: string, relationship: string) => {
    const newMember: FamilyMember = {
      id: `fam_${Date.now()}`,
      name,
      relationship,
      avatarColor: 'bg-amber-800',
    };
    const updated = [...familyMembers, newMember];
    setFamilyMembers(updated);
    storageService.saveFamilyMembers(updated);
    setActivePersonId(newMember.id);

    if (currentUser) {
      firestoreSyncService.saveFamilyMembers(currentUser.uid, updated);
    }
  };

  const handleUpdateFamilyMembers = (updated: FamilyMember[]) => {
    setFamilyMembers(updated);
    storageService.saveFamilyMembers(updated);

    if (currentUser) {
      firestoreSyncService.saveFamilyMembers(currentUser.uid, updated);
    }
  };

  const handleDeleteFamilyMember = (memberId: string) => {
    const updated = familyMembers.filter((m) => m.id !== memberId);
    setFamilyMembers(updated);
    storageService.saveFamilyMembers(updated);

    if (activePersonId === memberId) {
      if (updated.length > 0) {
        setActivePersonId(updated[0].id);
      } else {
        setActivePersonId('all');
      }
    }

    if (currentUser) {
      firestoreSyncService.saveFamilyMembers(currentUser.uid, updated);
    }
  };

  const handleSaveStyleProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);

    // Sync the primary 'self' family member's display name to match preferred name
    const updatedMembers = familyMembers.map((m) =>
      m.id === 'self' || m.relationship === 'Self'
        ? { ...m, name: updatedProfile.preferredName || updatedProfile.name || 'Self' }
        : m
    );
    setFamilyMembers(updatedMembers);
    storageService.saveFamilyMembers(updatedMembers);

    if (currentUser) {
      firestoreSyncService.saveProfile(currentUser.uid, updatedProfile);
      firestoreSyncService.saveFamilyMembers(currentUser.uid, updatedMembers);
    }
  };

  const handleLogWear = (itemId: string, log: WearLog) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          wearCount: (item.wearCount || 0) + 1,
          wearLogs: [log, ...(item.wearLogs || [])],
        };
      }
      return item;
    });
    setItems(updated);
    storageService.saveItems(updated);
    const updatedItem = updated.find((i) => i.id === itemId);
    if (updatedItem) setSelectedItemForDetails(updatedItem);
  };

  const handleSendToLaundry = (record: LaundryRecord) => {
    const updatedLaundry = [record, ...laundryRecords];
    setLaundryRecords(updatedLaundry);
    storageService.saveLaundryRecords(updatedLaundry);

    // Mark item as isInLaundry
    const updatedItems = items.map((i) =>
      i.id === record.itemId ? { ...i, isInLaundry: true } : i
    );
    setItems(updatedItems);
    storageService.saveItems(updatedItems);

    if (currentUser) {
      firestoreSyncService.saveLaundryRecord(currentUser.uid, record);
      const updatedItem = updatedItems.find((i) => i.id === record.itemId);
      if (updatedItem) {
        firestoreSyncService.saveItem(currentUser.uid, updatedItem);
      }
    }
  };

  const handleLoanItem = (record: LoanRecord) => {
    const updatedLoans = [record, ...loanRecords];
    setLoanRecords(updatedLoans);
    storageService.saveLoanRecords(updatedLoans);

    // Mark item as isLoaned
    const updatedItems = items.map((i) =>
      i.id === record.itemId ? { ...i, isLoaned: true } : i
    );
    setItems(updatedItems);
    storageService.saveItems(updatedItems);

    if (currentUser) {
      firestoreSyncService.saveLoanRecord(currentUser.uid, record);
      const updatedItem = updatedItems.find((i) => i.id === record.itemId);
      if (updatedItem) {
        firestoreSyncService.saveItem(currentUser.uid, updatedItem);
      }
    }
  };

  const handleAddReminder = (reminder: ItemReminder) => {
    const updated = [reminder, ...reminders];
    setReminders(updated);
    storageService.saveReminders(updated);

    if (currentUser) {
      firestoreSyncService.saveReminder(currentUser.uid, reminder);
    }
  };

  const handleOpenStylistForPiece = (item: WardrobeItem) => {
    setStylistAnchorItem(item);
    setSelectedItemForDetails(null);
    setActiveTab('stylist');
  };

  const handleCompleteTour = () => {
    const updated = { ...profile, hasCompletedTour: true };
    setProfile(updated);
    storageService.saveProfile(updated);
    if (currentUser) {
      firestoreSyncService.saveProfile(currentUser.uid, updated);
    }
    setShowTour(false);
  };

  // If visitor is browsing a shared public lookbook
  if (publicLookbookState.isActive) {
    return (
      <PublicLookbookView
        sectionId={publicLookbookState.sectionId}
        creatorName={publicLookbookState.creatorName}
        items={items}
        sections={sections}
        onExitToApp={() => {
          setPublicLookbookState({ isActive: false, sectionId: 'all', creatorName: 'Kloset Curated' });
          if (typeof window !== 'undefined' && window.history) {
            try {
              window.history.pushState({}, '', window.location.pathname.replace(/\/lookbook.*/, '/'));
            } catch {}
          }
        }}
        onOpenAuth={() => {
          setPublicLookbookState({ isActive: false, sectionId: 'all', creatorName: 'Kloset Curated' });
          setShowAuthModal(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-stone-800 flex flex-col font-sans selection:bg-[#C87D78] selection:text-white">
      {/* Top Application Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenStyleProfile={() => setShowStyleProfileModal(true)}
        onOpenFamilyModal={() => setShowFamilyModal(true)}
        onModeChange={handleModeChange}
        familyMembers={familyMembers}
        activePersonId={activePersonId}
        onSelectPerson={setActivePersonId}
        onAddFamilyMember={handleAddFamilyMember}
        onUpdateFamilyMembers={handleUpdateFamilyMembers}
        onOpenUploadModal={(bulk) => handleOpenUploadWithLimitCheck(bulk || false)}
        onStartTour={() => setShowTour(true)}
        onOpenBoutiqueModal={() => setShowBoutiqueShare(true)}
        onOpenFashionDeals={() => setShowFashionDeals(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        pendingRemindersCount={reminders.filter((r) => !r.isCompleted).length}
        activeLaundryCount={laundryRecords.filter((r) => r.status === 'sent').length}
        activeLoansCount={loanRecords.filter((l) => l.status === 'active').length}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Workspace Layout with Left Sidebar Menu */}
      <div className="flex-1 flex w-full relative">
        {/* Left Menu for Categories & Sections & Home */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          items={items}
          sections={sections}
          activePersonId={activePersonId}
          familyMembers={familyMembers}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          onGoToHome={handleGoToHome}
          onOpenAddSection={() => setActiveTab('sections')}
          onDeleteSection={handleDeleteSection}
          onOpenFashionDeals={() => setShowFashionDeals(true)}
          onOpenColorContrast={() => setShowColorPalette(true)}
          onOpenBoutiqueModal={() => setShowBoutiqueShare(true)}
          onOpenTour={() => setShowTour(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          customCategories={categories}
          onOpenManageCategories={() => setShowCategoryModal(true)}
        />

        {/* Main View Workspace */}
        <main className="flex-1 min-w-0 pb-16 transition-all">
          {activeTab === 'catalog' && (
            <WardrobeBrowser
              items={items}
              sections={sections}
              familyMembers={familyMembers}
              activePersonId={activePersonId}
              onSelectItem={(item) => setSelectedItemForDetails(item)}
              onOpenUpload={(bulk) => handleOpenUploadWithLimitCheck(bulk || false)}
              onOpenStylist={() => {
                setStylistAnchorItem(null);
                setActiveTab('stylist');
              }}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSectionId={selectedSectionId}
              setSelectedSectionId={setSelectedSectionId}
              onDeleteSection={handleDeleteSection}
              onManageSections={() => setActiveTab('sections')}
              onOpenFashionDeals={() => setShowFashionDeals(true)}
              onOpenColorContrast={() => setShowColorPalette(true)}
              customCategories={categories}
              onOpenManageCategories={() => setShowCategoryModal(true)}
              onToggleArchive={handleToggleArchive}
              archiveTab={wardrobeArchiveTab}
              setArchiveTab={setWardrobeArchiveTab}
            />
          )}

        {activeTab === 'sections' && (
          <SectionsManager
            sections={sections}
            items={items}
            profile={profile}
            activePersonId={activePersonId}
            familyMembers={familyMembers}
            onSaveSections={handleSaveSections}
            onSelectItem={(item) => setSelectedItemForDetails(item)}
            onAddSubSection={handleAddSubSection}
            onOpenUploadWithSection={(secId, subSecId) => {
              handleOpenUploadWithLimitCheck(false);
            }}
          />
        )}

        {activeTab === 'stylist' && (
          <StylistView
            items={items}
            sections={sections}
            familyMembers={familyMembers}
            activePersonId={activePersonId}
            profile={profile}
            onOpenStyleProfile={() => setShowStyleProfileModal(true)}
            onSelectItem={(item) => setSelectedItemForDetails(item)}
            preselectedItem={stylistAnchorItem}
            onOpenFashionDeals={() => setShowFashionDeals(true)}
          />
        )}

        {activeTab === 'packing' && (
          <PackingView
            packingLists={packingLists}
            items={items}
            onSaveLists={(lists) => {
              setPackingLists(lists);
              storageService.savePackingLists(lists);
              if (currentUser) {
                lists.forEach((l) => firestoreSyncService.savePackingList(currentUser.uid, l));
              }
            }}
            onSelectItem={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {activeTab === 'laundry_loans' && (
          <LaundryLoanTracker
            laundryRecords={laundryRecords}
            loanRecords={loanRecords}
            items={items}
            onUpdateLaundry={(records) => {
              setLaundryRecords(records);
              storageService.saveLaundryRecords(records);
              if (currentUser) {
                records.forEach((r) => firestoreSyncService.saveLaundryRecord(currentUser.uid, r));
              }
            }}
            onUpdateLoans={(records) => {
              setLoanRecords(records);
              storageService.saveLoanRecords(records);
              if (currentUser) {
                records.forEach((l) => firestoreSyncService.saveLoanRecord(currentUser.uid, l));
              }
            }}
            onSelectItem={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            items={items}
            onSaveReminders={(rems) => {
              setReminders(rems);
              storageService.saveReminders(rems);
              if (currentUser) {
                rems.forEach((r) => firestoreSyncService.saveReminder(currentUser.uid, r));
              }
            }}
            onSelectItem={(item) => setSelectedItemForDetails(item)}
          />
        )}
        </main>
      </div>

      {/* MODALS */}

      {/* 0. Cloud Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onOpenStyleProfile={() => setShowStyleProfileModal(true)}
        onAuthSuccess={(user) => {
          // If first time sign-in or incomplete style profile, prompt the user smoothly
          const savedProf = storageService.getProfile();
          if (!savedProf.hasCompletedStyleProfile) {
            setShowStyleProfileModal(true);
          }
        }}
      />

      {/* 0.1 Preferred Styling Persona & Name Profile Modal */}
      <StyleProfileModal
        isOpen={showStyleProfileModal}
        onClose={() => setShowStyleProfileModal(false)}
        profile={profile}
        onSaveProfile={handleSaveStyleProfile}
      />

      {/* 0.2 Family Members & Exclusive Folders Manager */}
      <FamilyMembersModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        familyMembers={familyMembers}
        items={items}
        activePersonId={activePersonId}
        onSelectPerson={setActivePersonId}
        onAddMember={handleAddFamilyMember}
        onUpdateMembers={handleUpdateFamilyMembers}
        onDeleteMember={handleDeleteFamilyMember}
        userProfileName={profile.preferredName || profile.name}
      />

      {/* 1. Item Upload Modal (Single & Bulk) */}
      <ItemUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingItem(null);
        }}
        onSaveItem={handleSaveItem}
        onSaveBulkItems={handleSaveBulkItems}
        sections={sections}
        familyMembers={familyMembers}
        activePersonId={activePersonId}
        isInitialBulkMode={isBulkUpload}
        editingItem={editingItem}
        customCategories={categories}
        onOpenManageCategories={() => setShowCategoryModal(true)}
      />

      {/* 1.1 Category Manager Modal (Add, Edit, Delete categories) */}
      <CategoryManagerModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        items={items}
        onSaveCategories={handleSaveCategories}
        onRenameCategoryInItems={handleRenameCategoryInItems}
      />

      {/* 2. Dedicated Item Page Modal (Name at top, Photo, only user filled fields, unlimited description, wear memory, reminders) */}
      <ItemDetailsModal
        item={selectedItemForDetails}
        isOpen={!!selectedItemForDetails}
        onClose={() => setSelectedItemForDetails(null)}
        onEdit={(item) => {
          setSelectedItemForDetails(null);
          setEditingItem(item);
          setIsBulkUpload(false);
          setShowUploadModal(true);
        }}
        onDelete={handleDeleteItem}
        onLogWear={handleLogWear}
        onSendToLaundry={handleSendToLaundry}
        onLoanItem={handleLoanItem}
        onAddReminder={handleAddReminder}
        onRequestOutfitIdeas={handleOpenStylistForPiece}
        familyMembers={familyMembers}
        reminders={reminders}
        onToggleArchive={handleToggleArchive}
      />

      {/* 3. Onboarding Tour Modal */}
      <OnboardingTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onSelectMode={handleModeChange}
        onComplete={handleCompleteTour}
        currentMode={profile.currentMode}
        isFamilyMode={profile.currentMode === 'family'}
        totalItemsCount={items.length}
        sectionsCount={sections.length}
        subSectionsCount={sections.reduce((acc, s) => acc + (s.subSections?.length || 0), 0)}
        baseLimit={baseLimit}
        bonusSlots={bonusSlots}
        currentTotalLimit={currentTotalLimit}
        familyMembersCount={familyMembers.length}
      />

      {/* 4. Lookbook Share & Extra Space Storage Modal */}
      <BoutiqueShareModal
        isOpen={showBoutiqueShare}
        onClose={() => setShowBoutiqueShare(false)}
        sections={sections}
        profile={profile}
        totalItemsCount={items.filter((i) => !i.isArchived).length}
        onOpenFashionDeals={() => {
          setShowBoutiqueShare(false);
          setShowFashionDeals(true);
        }}
        onPreviewLookbook={(secId) => {
          setPublicLookbookState({
            isActive: true,
            sectionId: secId,
            creatorName: profile.name || 'User',
          });
        }}
        onOpenArchive={() => {
          setShowBoutiqueShare(false);
          setActiveTab('catalog');
          setWardrobeArchiveTab('archived');
        }}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          storageService.saveProfile(updated);
          if (currentUser) {
            firestoreSyncService.saveProfile(currentUser.uid, updated);
          }
        }}
      />

      {/* 5. Daily Fashion Trends, Ads & Expansion Rewards Modal */}
      <FashionDealsModal
        isOpen={showFashionDeals}
        onClose={() => setShowFashionDeals(false)}
        profile={profile}
        currentUser={currentUser}
        onClaimOfferReward={handleClaimOfferReward}
        onOpenStorageModal={() => {
          setShowFashionDeals(false);
          setShowBoutiqueShare(true);
        }}
        totalItemsCount={items.length}
      />

      {/* 6. Color Palette & Contrast Styling Studio */}
      <ColorPaletteModal
        isOpen={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        items={items}
      />
    </div>
  );
}
