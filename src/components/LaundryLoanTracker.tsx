import React, { useState } from 'react';
import {
  Waves,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  Phone,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { LaundryRecord, LoanRecord, WardrobeItem } from '../types';

interface LaundryLoanTrackerProps {
  laundryRecords: LaundryRecord[];
  loanRecords: LoanRecord[];
  items: WardrobeItem[];
  onUpdateLaundry: (records: LaundryRecord[]) => void;
  onUpdateLoans: (records: LoanRecord[]) => void;
  onSelectItem: (item: WardrobeItem) => void;
}

export const LaundryLoanTracker: React.FC<LaundryLoanTrackerProps> = ({
  laundryRecords,
  loanRecords,
  items,
  onUpdateLaundry,
  onUpdateLoans,
  onSelectItem,
}) => {
  const [activeTab, setActiveTab] = useState<'laundry' | 'loans'>('laundry');

  // Mark Laundry Returned
  const handleMarkLaundryReturned = (recordId: string) => {
    const updated = laundryRecords.map((r) =>
      r.id === recordId
        ? {
            ...r,
            status: 'returned' as const,
            returnedDate: new Date().toISOString().split('T')[0],
          }
        : r
    );
    onUpdateLaundry(updated);
  };

  // Delete Laundry
  const handleDeleteLaundry = (recordId: string) => {
    onUpdateLaundry(laundryRecords.filter((r) => r.id !== recordId));
  };

  // Mark Loan Returned
  const handleMarkLoanReturned = (recordId: string) => {
    const updated = loanRecords.map((l) =>
      l.id === recordId
        ? {
            ...l,
            status: 'returned' as const,
            actualReturnDate: new Date().toISOString().split('T')[0],
          }
        : l
    );
    onUpdateLoans(updated);
  };

  // Delete Loan
  const handleDeleteLoan = (recordId: string) => {
    onUpdateLoans(loanRecords.filter((l) => l.id !== recordId));
  };

  const activeLaundry = laundryRecords.filter((r) => r.status === 'sent');
  const pastLaundry = laundryRecords.filter((r) => r.status === 'returned');

  const activeLoans = loanRecords.filter((l) => l.status === 'active');
  const pastLoans = loanRecords.filter((l) => l.status === 'returned');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Laundry, Dry Cleaning & Loan Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-200">
              Wardrobe Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep real-time records of clothes sent to dry cleaners or lent out to friends and family.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('laundry')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'laundry'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Waves className="w-4 h-4 text-blue-600" />
            <span>Dry Cleaning & Wash ({activeLaundry.length} Active)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'loans'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-purple-600" />
            <span>Lent / Borrowed Items ({activeLoans.length} Active)</span>
          </button>
        </div>
      </div>

      {activeTab === 'laundry' ? (
        /* LAUNDRY & DRY CLEANING VIEW */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Currently At Dry Cleaners / Wash ({activeLaundry.length})
            </h3>
            <span className="text-xs text-slate-400">
              (To send an item, open its dedicated page and click "Dry Clean / Wash")
            </span>
          </div>

          {activeLaundry.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
              <Waves className="w-8 h-8 text-blue-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No items at dry cleaners</h4>
              <p className="text-xs text-slate-500">
                All your garments are currently in your wardrobe.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLaundry.map((record) => {
                const linkedItem = items.find((i) => i.id === record.itemId);

                return (
                  <div
                    key={record.id}
                    className="p-4 bg-white rounded-2xl border border-blue-100 shadow-2xs hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex gap-3">
                      {record.itemImageUrl && (
                        <img
                          src={record.itemImageUrl}
                          alt="Item"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                          {record.serviceType.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {record.itemName}
                        </h4>
                        {record.cleanerName && (
                          <div className="text-[11px] text-slate-600 truncate">
                            📍 {record.cleanerName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-50/50 rounded-xl text-[11px] text-blue-950 space-y-1">
                      <div className="flex justify-between">
                        <span>Sent on:</span>
                        <strong className="font-mono">{record.sentDate}</strong>
                      </div>
                      {record.expectedReturnDate && (
                        <div className="flex justify-between">
                          <span>Expected return:</span>
                          <strong className="font-mono text-blue-800">{record.expectedReturnDate}</strong>
                        </div>
                      )}
                      {record.cost !== undefined && (
                        <div className="flex justify-between">
                          <span>Estimated Cost:</span>
                          <strong>${record.cost}</strong>
                        </div>
                      )}
                      {record.notes && (
                        <p className="text-[10px] text-slate-600 italic pt-1 border-t border-blue-100">
                          "{record.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {linkedItem && (
                        <button
                          type="button"
                          onClick={() => onSelectItem(linkedItem)}
                          className="text-xs text-amber-900 font-semibold hover:underline"
                        >
                          View Item Page
                        </button>
                      )}

                      <div className="flex gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleMarkLaundryReturned(record.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Received</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLaundry(record.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past laundry history */}
          {pastLaundry.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Completed Dry Cleaning History ({pastLaundry.length})
              </h3>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                {pastLaundry.map((r) => (
                  <div key={r.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {r.itemImageUrl && (
                        <img src={r.itemImageUrl} alt="item" className="w-9 h-9 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{r.itemName}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.serviceType} at {r.cleanerName || 'Cleaners'} • Returned on {r.returnedDate}
                        </div>
                      </div>
                    </div>
                    {r.cost && <span className="font-bold text-slate-700">${r.cost}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LENT / LOANED ITEMS TRACKER */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Garments Currently Lent to Friends / Family ({activeLoans.length})
            </h3>
            <span className="text-xs text-slate-400">
              (To lend an item, open its dedicated page and click "Lend Item")
            </span>
          </div>

          {activeLoans.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
              <HeartHandshake className="w-8 h-8 text-purple-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No items currently lent out</h4>
              <p className="text-xs text-slate-500">
                All wardrobe items are securely in your possession.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLoans.map((loan) => {
                const linkedItem = items.find((i) => i.id === loan.itemId);

                return (
                  <div
                    key={loan.id}
                    className="p-4 bg-white rounded-2xl border border-purple-100 shadow-2xs hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex gap-3">
                      {loan.itemImageUrl && (
                        <img
                          src={loan.itemImageUrl}
                          alt="Item"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-50 text-purple-800 border border-purple-200">
                          Borrowed By: {loan.borrowerName}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {loan.itemName}
                        </h4>
                        {loan.borrowerContact && (
                          <div className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{loan.borrowerContact}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-purple-50/50 rounded-xl text-[11px] text-purple-950 space-y-1">
                      <div className="flex justify-between">
                        <span>Lent on:</span>
                        <strong className="font-mono">{loan.loanDate}</strong>
                      </div>
                      {loan.expectedReturnDate && (
                        <div className="flex justify-between">
                          <span>Expected return:</span>
                          <strong className="font-mono text-purple-800">{loan.expectedReturnDate}</strong>
                        </div>
                      )}
                      {loan.notes && (
                        <p className="text-[10px] text-slate-600 italic pt-1 border-t border-purple-100">
                          "{loan.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {linkedItem && (
                        <button
                          type="button"
                          onClick={() => onSelectItem(linkedItem)}
                          className="text-xs text-amber-900 font-semibold hover:underline"
                        >
                          View Item Page
                        </button>
                      )}

                      <div className="flex gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleMarkLoanReturned(loan.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Returned</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLoan(loan.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past Loan History */}
          {pastLoans.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Loan & Borrowing History ({pastLoans.length})
              </h3>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                {pastLoans.map((l) => (
                  <div key={l.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {l.itemImageUrl && (
                        <img src={l.itemImageUrl} alt="item" className="w-9 h-9 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{l.itemName}</div>
                        <div className="text-[11px] text-slate-500">
                          Borrowed by {l.borrowerName} • Returned on {l.returnedDate || 'Completed'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
