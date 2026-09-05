import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, DollarSign, Check, X, Copy, Plus, Trash2, 
  Flame, CheckCircle2, UserCheck, MapPin, ChevronLeft, ChevronRight,
  Share2, CreditCard, LayoutGrid, CalendarDays, Sparkles, MessageCircle,
  AlertCircle, ShieldCheck, Wallet, Edit3, RotateCcw, FastForward, CheckSquare,
  UserX, UserCog, Cloud, RefreshCw, Database
} from 'lucide-react';

// Fixed Venue constant
const FIXED_VENUE = 'Centre sportif du Bois-des-Frères';

// Weekdays (Monday to Friday)
const DAYS = [
  { id: 'mon', label: 'Monday (Mon)' },
  { id: 'tue', label: 'Tuesday (Tue)' },
  { id: 'wed', label: 'Wednesday (Wed)' },
  { id: 'thu', label: 'Thursday (Thu)' },
  { id: 'fri', label: 'Friday (Fri)' },
];

// Evening 1-hour timeslots
const TIME_SLOTS = [
  { id: '19_20', label: '7:00 PM - 8:00 PM', short: '7-8 PM', hours: 1 },
  { id: '20_21', label: '8:00 PM - 9:00 PM', short: '8-9 PM', hours: 1 },
  { id: '21_22', label: '9:00 PM - 10:00 PM', short: '9-10 PM', hours: 1 },
];

// Default members list
const DEFAULT_MEMBERS = ['Alan (Captain)', 'Kelvin', 'Wing', 'Chris', 'Sarah', 'Jason', 'Chloe', 'Sam'];

// Helper to format short date string "Sep 7"
const formatShortDate = (date) => {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

// Generator function to dynamically build a week object
const createWeekFromMonday = (mondayDate, weekNumber) => {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dates = [];
  
  for (let i = 0; i < 5; i++) {
    const current = new Date(mondayDate);
    current.setDate(mondayDate.getDate() + i);
    const m = current.toLocaleDateString('en-US', { month: 'short' });
    const d = current.getDate();
    dates.push(`${m} ${d} (${dayNames[i]})`);
  }

  const friday = new Date(mondayDate);
  friday.setDate(mondayDate.getDate() + 4);

  const startStr = formatShortDate(mondayDate);
  const endStr = formatShortDate(friday);
  const id = `w_${mondayDate.getFullYear()}_${mondayDate.getMonth() + 1}_${mondayDate.getDate()}`;

  return {
    id,
    weekNumber,
    mondayDate: new Date(mondayDate),
    label: `Week ${weekNumber} (${startStr} - ${endStr})`,
    short: `${startStr} - ${endStr}`,
    dates,
  };
};

// Initial 4 weeks setup
const INITIAL_WEEKS = [
  createWeekFromMonday(new Date(2026, 8, 7), 1),  // Sep 7 - 11
  createWeekFromMonday(new Date(2026, 8, 14), 2), // Sep 14 - 18
  createWeekFromMonday(new Date(2026, 8, 21), 3), // Sep 21 - 25
  createWeekFromMonday(new Date(2026, 8, 28), 4), // Sep 28 - Oct 2
];

// Initial multi-week sample availability
const INITIAL_AVAILABILITY = {
  [INITIAL_WEEKS[0].id]: {
    'Alan (Captain)': ['mon_20_21', 'mon_21_22', 'wed_20_21', 'wed_21_22', 'fri_20_21', 'fri_21_22'],
    'Kelvin': ['mon_19_20', 'mon_20_21', 'wed_20_21', 'wed_21_22', 'fri_20_21'],
    'Wing': ['tue_20_21', 'wed_20_21', 'wed_21_22', 'fri_20_21'],
    'Chris': ['mon_20_21', 'wed_20_21', 'wed_21_22', 'fri_19_20', 'fri_20_21', 'fri_21_22'],
    'Sarah': ['mon_19_20', 'mon_20_21', 'fri_20_21', 'fri_21_22'],
    'Jason': ['wed_19_20', 'wed_20_21', 'wed_21_22'],
    'Chloe': ['mon_20_21', 'wed_20_21', 'fri_20_21'],
    'Sam': ['fri_19_20', 'fri_20_21', 'fri_21_22']
  },
  [INITIAL_WEEKS[1].id]: {
    'Alan (Captain)': ['tue_20_21', 'thu_20_21', 'fri_20_21', 'fri_21_22'],
    'Kelvin': ['tue_20_21', 'thu_20_21', 'fri_20_21', 'fri_21_22'],
    'Wing': ['tue_20_21', 'thu_20_21', 'fri_20_21'],
    'Chris': ['tue_20_21', 'thu_20_21', 'fri_20_21', 'fri_21_22'],
  },
  [INITIAL_WEEKS[2].id]: {
    'Alan (Captain)': ['wed_20_21', 'wed_21_22'],
    'Wing': ['wed_20_21', 'wed_21_22'],
  },
  [INITIAL_WEEKS[3].id]: {}
};

// Initial Confirmed Bookings
const INITIAL_BOOKINGS = [
  {
    id: 'book-1',
    weekId: INITIAL_WEEKS[0].id,
    dayId: 'wed',
    dayLabel: 'Wednesday (Sep 9)',
    slotLabel: '8:00 PM - 10:00 PM (2-Hour Block)',
    venue: FIXED_VENUE,
    courtNo: 'Court 3',
    totalCost: 140,
    shuttleCost: 20,
    booker: 'Alan (Captain)',
    paymentInfo: 'Wise: 12345678 (Alan C.) / TWINT: 0791234567',
    confirmedPlayers: ['Alan (Captain)', 'Kelvin', 'Wing', 'Chris', 'Jason', 'Chloe'],
    notes: 'Please bring non-marking indoor shoes and arrive 10 mins early!'
  }
];

export default function App() {
  const [weeks, setWeeks] = useState(INITIAL_WEEKS);
  const [nextWeekNumber, setNextWeekNumber] = useState(5);
  const [selectedWeekId, setSelectedWeekId] = useState(INITIAL_WEEKS[0].id);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week_detail'
  const [weekTab, setWeekTab] = useState('vote'); // 'vote' | 'summary' | 'booked'

  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [selectedUser, setSelectedUser] = useState('Alan (Captain)');
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  // Google Sheets Backend Integration State
  const [googleScriptUrl, setGoogleScriptUrl] = useState('https://script.google.com/macros/s/AKfycbzWhdSAagejYdlKZeMV-na1KQSyuZ1_Z1mKiOFvSMcxbPqhybBmUuu5j2_DzC-LLHnY/exec');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);

  // UI state
  const [toastMsg, setToastMsg] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const [inspectSlot, setInspectSlot] = useState(null);
  const [bookingModalSlot, setBookingModalSlot] = useState(null);
  const [isDirectBookingModalOpen, setIsDirectBookingModalOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState(null);

  // Direct Booking Form State
  const [directBookingForm, setDirectBookingForm] = useState({
    dayId: 'wed',
    slotLabel: '8:00 PM - 10:00 PM',
    courtNo: 'Court 1',
    totalCost: 140,
    shuttleCost: 20,
    paymentInfo: 'Wise: 12345678 (Alan)',
    notes: 'Non-marking shoes required. Please be on time!',
    confirmedPlayers: [DEFAULT_MEMBERS[0], DEFAULT_MEMBERS[1], DEFAULT_MEMBERS[2], DEFAULT_MEMBERS[3]]
  });

  // Slot-initiated booking Form State
  const [bookingForm, setBookingForm] = useState({
    courtNo: 'Court 1',
    totalCost: 140,
    shuttleCost: 20,
    paymentInfo: 'Wise: 12345678 (Alan)',
    notes: '',
    confirmedPlayers: []
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  };

  const copyText = (text, successMsg = 'Copied to clipboard!') => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(`✅ ${successMsg}`);
    } catch {
      showToast('❌ Copy failed, please copy manually');
    }
    document.body.removeChild(textArea);
  };

  // Sync to Google Sheet if Google Script URL is configured
  const syncToBackend = async (payload) => {
    if (!googleScriptUrl) return;
    setIsSyncing(true);
    try {
      await fetch(googleScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('☁️ Synced to Google Sheet!');
    } catch (err) {
      console.error('Backend sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch initial data from Google Sheet
  const fetchFromBackend = async () => {
    if (!googleScriptUrl) return;
    setIsSyncing(true);
    try {
      const res = await fetch(googleScriptUrl);
      const data = await res.json();
      if (data.members && Array.isArray(data.members)) setMembers(data.members);
      if (data.availability) setAvailability(data.availability);
      if (data.bookings && Array.isArray(data.bookings)) setBookings(data.bookings);
      showToast('✅ Loaded latest data from Google Sheet!');
      setShowBackendModal(false);
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('❌ Could not fetch data. Check your Web App URL permissions (Anyone).');
    } finally {
      setIsSyncing(false);
    }
  };

  const currentWeek = weeks.find(w => w.id === selectedWeekId) || weeks[0];
  const currentWeekAvail = availability[selectedWeekId] || {};
  const currentUserSlots = currentWeekAvail[selectedUser] || [];
  const hasUserVotedThisWeek = currentUserSlots.length > 0;

  // Retrieve players available for a specific timeslot
  const getSlotMembers = (weekId, dayId, slotId) => {
    const weekData = availability[weekId] || {};
    const key = `${dayId}_${slotId}`;
    return members.filter(m => (weekData[m] || []).includes(key));
  };

  // Toggle slot availability
  const toggleSlot = (dayId, slotId) => {
    if (!selectedUser) return;
    const key = `${dayId}_${slotId}`;
    const userSlots = currentWeekAvail[selectedUser] || [];
    const isSelected = userSlots.includes(key);

    const updated = isSelected 
      ? userSlots.filter(k => k !== key) 
      : [...userSlots, key];

    const nextAvail = {
      ...availability,
      [selectedWeekId]: {
        ...currentWeekAvail,
        [selectedUser]: updated
      }
    };
    setAvailability(nextAvail);
    syncToBackend({ action: 'SAVE_AVAILABILITY', availability: nextAvail });
  };

  // Select/Deselect all slots for a given day
  const selectAllDay = (dayId) => {
    if (!selectedUser) return;
    const userSlots = currentWeekAvail[selectedUser] || [];
    const daySlotKeys = TIME_SLOTS.map(t => `${dayId}_${t.id}`);
    const isAll = daySlotKeys.every(k => userSlots.includes(k));

    let updated;
    if (isAll) {
      updated = userSlots.filter(k => !daySlotKeys.includes(k));
    } else {
      updated = Array.from(new Set([...userSlots, ...daySlotKeys]));
    }

    const nextAvail = {
      ...availability,
      [selectedWeekId]: {
        ...currentWeekAvail,
        [selectedUser]: updated
      }
    };
    setAvailability(nextAvail);
    syncToBackend({ action: 'SAVE_AVAILABILITY', availability: nextAvail });
  };

  // Clear all slots for the current user in this week
  const handleClearMySlots = () => {
    const nextAvail = {
      ...availability,
      [selectedWeekId]: {
        ...currentWeekAvail,
        [selectedUser]: []
      }
    };
    setAvailability(nextAvail);
    syncToBackend({ action: 'SAVE_AVAILABILITY', availability: nextAvail });
    showToast(`Cleared all voted slots for ${selectedUser}`);
  };

  // Calculate timeslot squad stats
  const getWeekStats = (weekId) => {
    const stats = [];
    DAYS.forEach((d) => {
      TIME_SLOTS.forEach(t => {
        const ppl = getSlotMembers(weekId, d.id, t.id);
        stats.push({
          dayId: d.id,
          dayLabel: d.label,
          slotId: t.id,
          slotLabel: t.label,
          count: ppl.length,
          members: ppl
        });
      });
    });
    return stats;
  };

  // Core Rolling Week Function
  const handleCompleteAndDeleteWeek = (targetWeek) => {
    if (!targetWeek) return;

    const lastWeek = weeks[weeks.length - 1];
    const nextMonday = new Date(lastWeek.mondayDate);
    nextMonday.setDate(nextMonday.getDate() + 7);

    const newWeek = createWeekFromMonday(nextMonday, nextWeekNumber);
    const updatedWeeks = weeks.filter(w => w.id !== targetWeek.id).concat(newWeek);

    setWeeks(updatedWeeks);
    setNextWeekNumber(prev => prev + 1);

    if (selectedWeekId === targetWeek.id) {
      setSelectedWeekId(updatedWeeks[0].id);
    }

    setWeekToDelete(null);
    showToast(`🗑️ ${targetWeek.label} removed. Generated ${newWeek.label}!`);
  };

  // Add Member handler
  const handleAddPlayer = (nameToAdd) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (members.includes(trimmed)) {
      showToast(`⚠️ "${trimmed}" is already in the roster!`);
      return;
    }
    const nextMembers = [...members, trimmed];
    setMembers(nextMembers);
    setSelectedUser(trimmed);
    setNewMemberName('');
    setShowAddMember(false);
    syncToBackend({ action: 'SAVE_MEMBERS', members: nextMembers });
    showToast(`✅ Added "${trimmed}" to CERN Badminton roster!`);
  };

  // Rename / Edit Member handler
  const handleRenamePlayer = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (trimmed === oldName) {
      setEditingMember(null);
      return;
    }
    if (members.includes(trimmed)) {
      showToast(`⚠️ Name "${trimmed}" already exists!`);
      return;
    }

    const nextMembers = members.map(m => m === oldName ? trimmed : m);
    setMembers(nextMembers);

    if (selectedUser === oldName) {
      setSelectedUser(trimmed);
    }

    const updatedAvail = { ...availability };
    Object.keys(updatedAvail).forEach(wId => {
      if (updatedAvail[wId] && updatedAvail[wId][oldName]) {
        updatedAvail[wId] = {
          ...updatedAvail[wId],
          [trimmed]: updatedAvail[wId][oldName]
        };
        delete updatedAvail[wId][oldName];
      }
    });
    setAvailability(updatedAvail);

    const nextBookings = bookings.map(b => ({
      ...b,
      booker: b.booker === oldName ? trimmed : b.booker,
      confirmedPlayers: b.confirmedPlayers.map(p => p === oldName ? trimmed : p)
    }));
    setBookings(nextBookings);

    setEditingMember(null);
    syncToBackend({ action: 'SAVE_ALL', members: nextMembers, availability: updatedAvail, bookings: nextBookings });
    showToast(`✏️ Renamed "${oldName}" to "${trimmed}"!`);
  };

  // Delete / Omit Member handler
  const handleDeletePlayer = (targetName) => {
    if (members.length <= 1) {
      showToast('⚠️ At least one player must remain in the roster.');
      setMemberToDelete(null);
      return;
    }

    const remaining = members.filter(m => m !== targetName);
    setMembers(remaining);

    if (selectedUser === targetName) {
      setSelectedUser(remaining[0]);
    }

    const updatedAvail = { ...availability };
    Object.keys(updatedAvail).forEach(wId => {
      if (updatedAvail[wId] && updatedAvail[wId][targetName]) {
        const copy = { ...updatedAvail[wId] };
        delete copy[targetName];
        updatedAvail[wId] = copy;
      }
    });
    setAvailability(updatedAvail);

    const nextBookings = bookings.map(b => ({
      ...b,
      confirmedPlayers: b.confirmedPlayers.filter(p => p !== targetName)
    }));
    setBookings(nextBookings);

    setMemberToDelete(null);
    syncToBackend({ action: 'SAVE_ALL', members: remaining, availability: updatedAvail, bookings: nextBookings });
    showToast(`🗑️ Removed "${targetName}" from CERN roster.`);
  };

  // Open booking confirmation modal from squad slot
  const openBookingModal = (slot) => {
    const initialPlayers = slot.members.length > 0 ? [...slot.members] : [selectedUser];
    setBookingForm({
      courtNo: 'Court 1',
      totalCost: 140,
      shuttleCost: 20,
      paymentInfo: `Wise: 12345678 (${selectedUser})`,
      notes: 'Non-marking shoes required. Please be on time!',
      confirmedPlayers: initialPlayers
    });
    setBookingModalSlot(slot);
  };

  // Handle direct court booking (created directly in Tab 3)
  const handleCreateDirectBooking = (e) => {
    e.preventDefault();
    if (!directBookingForm.courtNo) {
      showToast('⚠️ Please enter court number');
      return;
    }

    const matchedDay = DAYS.find(d => d.id === directBookingForm.dayId);
    const dayIndex = DAYS.findIndex(d => d.id === directBookingForm.dayId);
    const dateLabel = currentWeek.dates[dayIndex] || matchedDay?.label || 'Selected Day';

    const newBooking = {
      id: 'book-' + Date.now(),
      weekId: selectedWeekId,
      dayId: directBookingForm.dayId,
      dayLabel: dateLabel,
      slotLabel: directBookingForm.slotLabel,
      venue: FIXED_VENUE,
      courtNo: directBookingForm.courtNo,
      totalCost: Number(directBookingForm.totalCost) || 0,
      shuttleCost: Number(directBookingForm.shuttleCost) || 0,
      booker: selectedUser,
      paymentInfo: directBookingForm.paymentInfo,
      confirmedPlayers: directBookingForm.confirmedPlayers.length > 0 ? directBookingForm.confirmedPlayers : [selectedUser],
      notes: directBookingForm.notes
    };

    const nextBookings = [newBooking, ...bookings];
    setBookings(nextBookings);
    setIsDirectBookingModalOpen(false);
    syncToBackend({ action: 'SAVE_BOOKINGS', bookings: nextBookings });
    showToast('🎉 Court successfully recorded! Split bill ready.');
  };

  // Confirm and submit court booking from heatmap
  const handleConfirmSlotBooking = (e) => {
    e.preventDefault();
    if (!bookingForm.courtNo) {
      showToast('⚠️ Please enter court number');
      return;
    }

    const newBooking = {
      id: 'book-' + Date.now(),
      weekId: selectedWeekId,
      dayId: bookingModalSlot.dayId,
      dayLabel: bookingModalSlot.dayLabel,
      slotLabel: bookingModalSlot.slotLabel,
      venue: FIXED_VENUE,
      courtNo: bookingForm.courtNo,
      totalCost: Number(bookingForm.totalCost) || 0,
      shuttleCost: Number(bookingForm.shuttleCost) || 0,
      booker: selectedUser,
      paymentInfo: bookingForm.paymentInfo,
      confirmedPlayers: bookingForm.confirmedPlayers.length > 0 ? bookingForm.confirmedPlayers : [selectedUser],
      notes: bookingForm.notes
    };

    const nextBookings = [newBooking, ...bookings];
    setBookings(nextBookings);
    setBookingModalSlot(null);
    setWeekTab('booked');
    syncToBackend({ action: 'SAVE_BOOKINGS', bookings: nextBookings });
    showToast('🎉 Court successfully booked & split bill calculated!');
  };

  // Remove booking record
  const handleDeleteBooking = (id) => {
    const nextBookings = bookings.filter(b => b.id !== id);
    setBookings(nextBookings);
    syncToBackend({ action: 'SAVE_BOOKINGS', bookings: nextBookings });
    showToast('Booking removed');
  };

  // Generate WhatsApp summary text for court booking
  const generateBookingWhatsApp = (book) => {
    const grandTotal = book.totalCost + (book.shuttleCost || 0);
    const count = book.confirmedPlayers.length || 1;
    const perPerson = (grandTotal / count).toFixed(1);

    return `🏸【CERN Badminton Court Confirmed & Split Bill】🏸
📅 Date & Time: ${book.dayLabel} (${book.slotLabel})
📍 Venue: ${book.venue} (${book.courtNo})
👑 Booked By: ${book.booker}
━━━━━━━━━━━━━━━━━━━━
💰【Split Bill Breakdown】:
• Total Cost (Court $${book.totalCost} + Shuttles $${book.shuttleCost || 0}): $${grandTotal}
• Total Players: ${count}
👉 Each player pays: $${perPerson}

👥【Confirmed Squad (${count})】:
${book.confirmedPlayers.map((p, i) => `${i + 1}. ${p}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━
💳 Refund / Reimbursement To Booker:
${book.paymentInfo || 'Wise / TWINT / Cash on court'}

💡 Notes: ${book.notes || 'Please be on time and bring non-marking shoes!'}

See everyone on the court! 🔥`;
  };

  const currentWeekBookings = bookings.filter(b => b.weekId === selectedWeekId);
  const currentWeekStats = getWeekStats(selectedWeekId);
  const topSlots = [...currentWeekStats].sort((a, b) => b.count - a.count).filter(s => s.count >= 4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-24">
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
              🏸
            </div>
            <div>
              <h1 className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                CERN Badminton Scheduler
              </h1>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="font-semibold text-emerald-300">{FIXED_VENUE}</span>
                <span>· Rolling 4-Week Auto-Schedule</span>
              </div>
            </div>
          </div>

          {/* Right Action: Google Sheets backend sync & month toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBackendModal(true)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                googleScriptUrl 
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Connect to Google Sheet Backend"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : googleScriptUrl ? (
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {googleScriptUrl ? 'Sheets Connected' : 'Connect Sheet'}
              </span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'month' ? 'week_detail' : 'month')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'month'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{viewMode === 'month' ? '📅 1-Month View' : '🔍 Back to Overview'}</span>
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">

        {/* Member Selector & Management Bar */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-300 font-bold">I am:</span>
            
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            >
              {members.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Quick Status Tag for Current User */}
            {viewMode === 'week_detail' && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                hasUserVotedThisWeek 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {hasUserVotedThisWeek ? `✓ ${currentUserSlots.length} slots voted` : 'Not voted yet'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showAddMember ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Player name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddPlayer(newMemberName);
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 w-32"
                  autoFocus
                />
                <button
                  onClick={() => handleAddPlayer(newMemberName)}
                  className="px-2.5 py-1 bg-emerald-600 rounded-lg text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Add
                </button>
                <button onClick={() => setShowAddMember(false)} className="text-slate-400 p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowAddMember(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-emerald-400 font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Player</span>
                </button>

                {/* Manage Roster (Rename & Omit) Button */}
                <button
                  onClick={() => setShowManageMembersModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition-colors"
                  title="Manage, rename or remove player names"
                >
                  <UserCog className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manage Roster</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 1. Month Zoom-Out Overview View */}
        {viewMode === 'month' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-400" />
                  <span>Next 4-Week Schedule @ {FIXED_VENUE}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Played a match? Delete that week to automatically generate the 4th week ahead!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {weeks.map((w) => {
                const weekAvail = availability[w.id] || {};
                const answeredUsers = Object.keys(weekAvail).filter(u => (weekAvail[u] || []).length > 0);
                const userWeekSlots = weekAvail[selectedUser] || [];
                const userVotedInThisWeek = userWeekSlots.length > 0;
                const weekBooks = bookings.filter(b => b.weekId === w.id);
                const stats = getWeekStats(w.id);
                const hotSlotsCount = stats.filter(s => s.count >= 4).length;

                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      setSelectedWeekId(w.id);
                      setViewMode('week_detail');
                      setWeekTab(userVotedInThisWeek ? 'summary' : 'vote');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:border-emerald-400 ${
                      selectedWeekId === w.id
                        ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          WEEK {w.weekNumber}
                        </span>
                        <h3 className="font-extrabold text-base text-white mt-1 group-hover:text-emerald-400 transition-colors">
                          {w.label}
                        </h3>
                      </div>
                      
                      {/* Action buttons on card: Delete (Roll Forward) & Enter */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWeekToDelete(w);
                          }}
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-colors"
                          title="Finish Match & Delete Week (Auto-roll +1 week)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="p-2 rounded-xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-950/50 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Week Status Tags */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                      {weekBooks.length > 0 ? (
                        <span className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 px-2 py-0.8 rounded-lg font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{weekBooks.length} Court(s) Booked</span>
                        </span>
                      ) : (
                        <span className="bg-slate-800/60 text-slate-400 px-2 py-0.8 rounded-lg">
                          No bookings yet
                        </span>
                      )}

                      {hotSlotsCount > 0 && (
                        <span className="bg-amber-950/50 border border-amber-500/40 text-amber-300 px-2 py-0.8 rounded-lg font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          <span>{hotSlotsCount} Squad Slots</span>
                        </span>
                      )}

                      {/* User's personal status tag for this week */}
                      <span className={`px-2 py-0.8 rounded-lg font-bold flex items-center gap-1 ml-auto text-[11px] ${
                        userVotedInThisWeek 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'text-slate-400'
                      }`}>
                        {userVotedInThisWeek ? `You: ${userWeekSlots.length} slots` : `${answeredUsers.length} voted`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 2. Single Week Detail View */}
        {viewMode === 'week_detail' && (
          <section className="space-y-4">
            
            {/* Week Selector Bar with Match Finished/Delete Option */}
            <div className="flex flex-wrap items-center justify-between bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 gap-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                {weeks.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWeekId(w.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                      selectedWeekId === w.id
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {w.short}
                  </button>
                ))}
              </div>

              {/* Match Played & Roll Forward Button */}
              <button
                onClick={() => setWeekToDelete(currentWeek)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ml-auto"
                title="Finish this week's match and generate a new week 4 weeks ahead"
              >
                <FastForward className="w-3.5 h-3.5 text-rose-400" />
                <span>Match Played? Delete & Roll Forward</span>
              </button>
            </div>

            {/* Sub-Tabs: Vote / Heatmap & Book / Bookings */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setWeekTab('vote')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  weekTab === 'vote' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{hasUserVotedThisWeek ? '1. Modify My Vote' : '1. Vote My Slots'}</span>
              </button>
              <button
                onClick={() => setWeekTab('summary')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  weekTab === 'summary' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400'
                }`}
              >
                <span>2. Squad Heatmap</span>
                {topSlots.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
              </button>
              <button
                onClick={() => setWeekTab('booked')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  weekTab === 'booked' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400'
                }`}
              >
                <span>3. Confirmed Courts</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  {currentWeekBookings.length}
                </span>
              </button>
            </div>

            {/* TAB 1: Vote Available Timeslots */}
            {weekTab === 'vote' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">
                        {hasUserVotedThisWeek ? 'Modify Your Voted Timeslots' : 'Vote Available Slots'} · 【{currentWeek.label}】
                      </h3>
                      {hasUserVotedThisWeek ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                          ✓ Already Voted
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                          New Ballot
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Voting as <strong className="text-emerald-400">{selectedUser}</strong> @ {FIXED_VENUE}. Tap slots to toggle availability.
                    </p>
                  </div>

                  {hasUserVotedThisWeek && (
                    <button
                      type="button"
                      onClick={handleClearMySlots}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Clear all selections for this week"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear All Slots</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {DAYS.map((day, idx) => {
                    const userSlots = currentWeekAvail[selectedUser] || [];
                    const daySlotKeys = TIME_SLOTS.map(t => `${day.id}_${t.id}`);
                    const isAll = daySlotKeys.every(k => userSlots.includes(k));

                    return (
                      <div key={day.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center justify-between sm:w-48">
                          <div>
                            <div className="font-bold text-sm text-slate-200">{day.label}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{currentWeek.dates[idx]}</div>
                          </div>
                          <button
                            onClick={() => selectAllDay(day.id)}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                              isAll 
                                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {isAll ? 'All Day ✓' : 'All Day +'}
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 flex-1">
                          {TIME_SLOTS.map(slot => {
                            const isSelected = userSlots.includes(`${day.id}_${slot.id}`);
                            const ppl = getSlotMembers(selectedWeekId, day.id, slot.id);

                            return (
                              <button
                                key={slot.id}
                                onClick={() => toggleSlot(day.id, slot.id)}
                                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                                  isSelected
                                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-600/30'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-1 text-xs font-bold">
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  <span>{slot.short}</span>
                                </div>
                                <span className={`text-[10px] font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                                  {ppl.length} players OK
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Currently selected: <strong className="text-emerald-400">{currentUserSlots.length}</strong> timeslot(s)
                  </span>

                  <button
                    onClick={() => {
                      showToast(`✅ Votes updated successfully for ${selectedUser}!`);
                      setWeekTab('summary');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save & View Squad Matches 🏸</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Squad Heatmap & Book Court */}
            {weekTab === 'summary' && (
              <div className="space-y-4">
                
                {/* Personal Voting Status & "Modify My Vote" Action Bar */}
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Your Vote: <strong className="text-emerald-400">{selectedUser}</strong></span>
                        {hasUserVotedThisWeek ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded font-mono">
                            {currentUserSlots.length} slots chosen
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded">
                            Not voted yet
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {hasUserVotedThisWeek 
                          ? 'Plans changed? You can update or change your available hours anytime.' 
                          : 'Vote your availability to help the squad find matching doubles times!'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setWeekTab('vote')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{hasUserVotedThisWeek ? 'Modify My Vote' : 'Vote My Slots Now'}</span>
                  </button>
                </div>

                {/* Squad Ready Recommendations */}
                <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                        <Flame className="w-4 h-4 fill-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">🔥 Doubles Ready Slots (4+ Players)</h3>
                        <p className="text-[11px] text-slate-400">Venue fixed at {FIXED_VENUE}. Booked a court? Click below to calculate auto-split!</p>
                      </div>
                    </div>
                  </div>

                  {topSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                      No slots reached 4 players yet this week. Invite more players to vote, or manually add a court in "3. Confirmed Courts"!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topSlots.map((slot) => (
                        <div
                          key={`${slot.dayId}_${slot.slotId}`}
                          className="bg-slate-900/90 border border-emerald-500/40 p-3.5 rounded-xl flex flex-col justify-between gap-3 relative"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-white text-sm">{slot.dayLabel}</span>
                              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-xs">
                                {slot.count} Players Ready
                              </span>
                            </div>
                            <div className="text-xs text-slate-300 font-mono">{slot.slotLabel}</div>
                            <div className="text-[11px] text-slate-400 mt-1.5 truncate">
                              Squad: {slot.members.join(', ')}
                            </div>
                          </div>

                          <button
                            onClick={() => openBookingModal(slot)}
                            className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-black rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>I Booked This Court (Register & Split Bill)</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Heatmap Grid */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <h3 className="text-sm font-black text-white mb-3 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-emerald-400" />
                    <span>Weekly Availability Heatmap ({FIXED_VENUE})</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-bold">
                          <th className="pb-2.5 pl-2">Time Slot</th>
                          {DAYS.map(d => (
                            <th key={d.id} className="pb-2.5 px-2 text-center">{d.label.split(' ')[0]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {TIME_SLOTS.map(slot => (
                          <tr key={slot.id}>
                            <td className="py-2.5 pl-2 text-xs font-bold text-slate-300 font-mono">
                              {slot.short}
                            </td>
                            {DAYS.map(day => {
                              const ppl = getSlotMembers(selectedWeekId, day.id, slot.id);
                              const count = ppl.length;
                              const isSuccess = count >= 4;
                              const isUserVotedHere = (currentWeekAvail[selectedUser] || []).includes(`${day.id}_${slot.id}`);

                              return (
                                <td key={day.id} className="p-1.5">
                                  <button
                                    onClick={() => setInspectSlot({
                                      dayLabel: day.label,
                                      slotLabel: slot.label,
                                      dayId: day.id,
                                      slotId: slot.id,
                                      count: count,
                                      members: ppl
                                    })}
                                    className={`w-full py-2 px-1 rounded-xl border text-center transition-all relative ${
                                      isSuccess 
                                        ? 'bg-emerald-600 text-white font-black border-emerald-400 shadow-sm'
                                        : (count >= 2 ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' : 'bg-slate-900 text-slate-500 border-slate-800')
                                    }`}
                                  >
                                    {isUserVotedHere && (
                                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" title="You are available here"></span>
                                    )}
                                    <div className="text-xs font-bold">{count} Players</div>
                                    <div className="text-[9px] opacity-80">{isSuccess ? '🔥 Ready' : 'Need more'}</div>
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: Confirmed Court Bookings & Auto Split Bill */}
            {weekTab === 'booked' && (
              <div className="space-y-4">
                
                {/* Header bar with Direct Court Booking Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Confirmed Court Bookings ({currentWeekBookings.length} session(s))</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Any player who booked a court can create a booking here, specify reimbursement info (e.g., Wise, TWINT), and share to WhatsApp.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDirectBookingForm({
                        dayId: 'wed',
                        slotLabel: '8:00 PM - 10:00 PM',
                        courtNo: 'Court 1',
                        totalCost: 140,
                        shuttleCost: 20,
                        paymentInfo: `Wise: 12345678 (${selectedUser})`,
                        notes: 'Please bring indoor court shoes.',
                        confirmedPlayers: [selectedUser]
                      });
                      setIsDirectBookingModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Book Court Directly</span>
                  </button>
                </div>

                {currentWeekBookings.length === 0 ? (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                    <p className="text-slate-400 text-xs">No court bookings recorded yet for {currentWeek.label}.</p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setIsDirectBookingModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                      >
                        + Book Court for this Week
                      </button>
                      <button
                        onClick={() => setWeekTab('summary')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        View Squad Heatmap
                      </button>
                    </div>
                  </div>
                ) : (
                  currentWeekBookings.map((book) => {
                    const grandTotal = book.totalCost + (book.shuttleCost || 0);
                    const count = book.confirmedPlayers.length || 1;
                    const perPerson = (grandTotal / count).toFixed(1);

                    return (
                      <div
                        key={book.id}
                        className="bg-slate-900 border border-emerald-500/50 rounded-2xl overflow-hidden shadow-2xl"
                      >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-emerald-950 to-slate-900 border-b border-slate-800 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                                ✅ Confirmed Court
                              </span>
                              <span className="text-xs text-slate-400">
                                Booked by <strong className="text-emerald-300">{book.booker}</strong>
                              </span>
                            </div>
                            <h4 className="text-base font-black text-white mt-1.5 flex items-center gap-1.5">
                              <span>{book.venue}</span>
                              <span className="text-emerald-400">· {book.courtNo}</span>
                            </h4>
                            <p className="text-xs text-slate-300 font-mono mt-0.5">
                              {book.dayLabel} ({book.slotLabel})
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => copyText(generateBookingWhatsApp(book), 'WhatsApp announcement copied!')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                              title="Copy announcement for WhatsApp"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(book.id)}
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                              title="Delete booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Split Bill Calculator Dashboard */}
                        <div className="p-4 bg-slate-950/70 border-b border-slate-800/80">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-xs text-slate-400 flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                                <span>Auto Split Bill (Court ${book.totalCost} + Shuttles ${book.shuttleCost || 0} = ${grandTotal})</span>
                              </div>
                              <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-3xl font-black text-amber-400">${perPerson}</span>
                                <span className="text-xs text-slate-400">/ player (Split equally among {count} players)</span>
                              </div>
                            </div>

                            {/* Refund & Reimbursement Account Box */}
                            {book.paymentInfo && (
                              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 p-2 rounded-xl">
                                <Wallet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <div className="text-left">
                                  <div className="text-[10px] text-slate-400 font-medium">Reimburse / Refund Booker:</div>
                                  <div className="text-xs font-bold text-white font-mono">{book.paymentInfo}</div>
                                </div>
                                <button
                                  onClick={() => copyText(book.paymentInfo, 'Reimbursement details copied!')}
                                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors ml-1"
                                  title="Copy payment details"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Confirmed Players List */}
                        <div className="p-4 space-y-2 text-xs">
                          <div className="font-bold text-slate-300">
                            Confirmed Lineup ({count} players):
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {book.confirmedPlayers.map((p, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-emerald-300 font-bold flex items-center gap-1"
                              >
                                <span className="text-slate-500 font-normal">{idx + 1}.</span>
                                <span>{p}</span>
                                {p === book.booker && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded ml-0.5">Booker</span>
                                )}
                              </span>
                            ))}
                          </div>

                          {book.notes && (
                            <div className="mt-2 text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              💡 Notes: {book.notes}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}

              </div>
            )}

          </section>
        )}

      </main>

      {/* Google Sheets Backend Connection Modal */}
      {showBackendModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Google Sheet Cloud Backend</h3>
              </div>
              <button onClick={() => setShowBackendModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Connect your Google Sheet Web App URL so all club players see the same live votes, roster, and bookings on any device.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={googleScriptUrl}
                  onChange={(e) => setGoogleScriptUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={fetchFromBackend}
                  disabled={!googleScriptUrl || isSyncing}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Fetch & Sync Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGoogleScriptUrl('');
                    showToast('Disconnected from Google Sheet (reverted to local mode)');
                    setShowBackendModal(false);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-bold"
                >
                  Disconnect
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-200">How to get your Web App URL:</div>
                <p>1. Open your created Google Sheet.</p>
                <p>2. Go to <strong>Extensions &gt; Apps Script</strong>.</p>
                <p>3. Paste the Apps Script code, then click <strong>Deploy &gt; New deployment</strong>.</p>
                <p>4. Choose <strong>Web app</strong>, set "Who has access" to <strong>Anyone</strong>, and paste the URL above.</p>
              </div>
            </div>

            <button
              onClick={() => setShowBackendModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Roster & Member Management Modal (Add, Rename, Omit) */}
      {showManageMembersModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">CERN Badminton Roster</h3>
              </div>
              <button onClick={() => setShowManageMembersModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Manage your players: click <span className="text-emerald-400 font-bold">Rename</span> to correct misspellings (e.g., Kan → Ken), or <span className="text-rose-400 font-bold">Omit</span> to delete a player.
            </p>

            {/* Member List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {members.map(member => (
                <div 
                  key={member}
                  className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl gap-2"
                >
                  {editingMember?.oldName === member ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingMember.newName}
                        onChange={(e) => setEditingMember({ ...editingMember, newName: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenamePlayer(editingMember.oldName, editingMember.newName);
                        }}
                        className="flex-1 bg-slate-900 border border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenamePlayer(editingMember.oldName, editingMember.newName)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMember(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-xs font-bold text-white">{member}</span>
                        {member === selectedUser && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingMember({ oldName: member, newName: member })}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Rename/fix spelling"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={() => setMemberToDelete(member)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Omit / Remove player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add Player Input inside Modal */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Add New Player to Roster:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Ken / David"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddPlayer(newMemberName);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleAddPlayer(newMemberName)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Add Player
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowManageMembersModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <UserX className="w-5 h-5" />
                <h3 className="text-base font-black text-white">Omit Player</h3>
              </div>
              <button onClick={() => setMemberToDelete(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to omit <strong className="text-white font-bold">"{memberToDelete}"</strong> from the CERN Badminton roster?
            </p>
            <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              💡 Their availability and booking inclusions will be cleanly removed.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlayer(memberToDelete)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Yes, Omit Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Finished Week & Roll to Next Week */}
      {weekToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <FastForward className="w-5 h-5" />
                <h3 className="text-base font-black text-white">Finish Match & Roll Forward</h3>
              </div>
              <button onClick={() => setWeekToDelete(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>
                Have you completed all matches for <strong className="text-white font-bold">{weekToDelete.label}</strong>?
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>What happens next:</span>
                </div>
                <p>1. <strong className="text-slate-200">{weekToDelete.label}</strong> will be archived/removed.</p>
                <p>2. A new week (<strong className="text-slate-200">Week {nextWeekNumber}</strong>, 4 weeks ahead) will be automatically generated.</p>
                <p>3. Your calendar continuously maintains a clean 4-week future view!</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWeekToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteAndDeleteWeek(weekToDelete)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/30 active:scale-95"
              >
                Yes, Finish & Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Court Booking Modal (Triggered directly from Tab 3) */}
      {isDirectBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl my-8 space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {currentWeek.label}
                </span>
                <h3 className="text-base font-black text-white">Create Confirmed Court Booking 🏸</h3>
              </div>
              <button onClick={() => setIsDirectBookingModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectBooking} className="space-y-3 text-xs">
              
              {/* Venue & Court */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Venue (Fixed)</label>
                  <div className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl p-2.5 text-emerald-400 font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{FIXED_VENUE}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Court No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Court 2 / Court 4"
                    value={directBookingForm.courtNo}
                    onChange={(e) => setDirectBookingForm({ ...directBookingForm, courtNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Day & Time slot */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Day of the Week</label>
                  <select
                    value={directBookingForm.dayId}
                    onChange={(e) => setDirectBookingForm({ ...directBookingForm, dayId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {DAYS.map((d, i) => (
                      <option key={d.id} value={d.id}>
                        {d.label} ({currentWeek.dates[i] || ''})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time Slot / Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8:00 PM - 10:00 PM"
                    value={directBookingForm.slotLabel}
                    onChange={(e) => setDirectBookingForm({ ...directBookingForm, slotLabel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Cost Inputs */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Court Fee ($)</label>
                  <input
                    type="number"
                    value={directBookingForm.totalCost}
                    onChange={(e) => setDirectBookingForm({ ...directBookingForm, totalCost: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shuttlecock Fee ($)</label>
                  <input
                    type="number"
                    value={directBookingForm.shuttleCost}
                    onChange={(e) => setDirectBookingForm({ ...directBookingForm, shuttleCost: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-center">
                <span className="text-slate-300">
                  Total ${(Number(directBookingForm.totalCost) || 0) + (Number(directBookingForm.shuttleCost) || 0)} ÷ {directBookingForm.confirmedPlayers.length || 1} players =
                </span>
                <span className="text-base font-black text-amber-400 ml-1.5">
                  ${(((Number(directBookingForm.totalCost) || 0) + (Number(directBookingForm.shuttleCost) || 0)) / (directBookingForm.confirmedPlayers.length || 1)).toFixed(1)} / player
                </span>
              </div>

              {/* Specific Refund / Reimbursement info */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Refund / Reimbursement Info (for players to pay you)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">e.g. Wise, TWINT</span>
                </label>
                <input
                  type="text"
                  required
                  value={directBookingForm.paymentInfo}
                  onChange={(e) => setDirectBookingForm({ ...directBookingForm, paymentInfo: e.target.value })}
                  placeholder="e.g. Wise: 12345678 / TWINT: 0791234567 (Alan)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Confirmed Lineup Selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Confirmed Players Lineup ({directBookingForm.confirmedPlayers.length} selected):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                  {members.map(m => {
                    const isChecked = directBookingForm.confirmedPlayers.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => {
                          const next = isChecked
                            ? directBookingForm.confirmedPlayers.filter(p => p !== m)
                            : [...directBookingForm.confirmedPlayers, m];
                          setDirectBookingForm({ ...directBookingForm, confirmedPlayers: next });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}{m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={directBookingForm.notes}
                  onChange={(e) => setDirectBookingForm({ ...directBookingForm, notes: e.target.value })}
                  placeholder="e.g. Meet at court 5 mins before start"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDirectBookingModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30"
                >
                  Create Booking ✅
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Book Court Confirmation Modal (From Squad Heatmap) */}
      {bookingModalSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl my-8 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {currentWeek.short} · {bookingModalSlot.dayLabel}
                </span>
                <h3 className="text-base font-black text-white">Register Court Booking 🏸</h3>
              </div>
              <button onClick={() => setBookingModalSlot(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSlotBooking} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Venue (Fixed)</label>
                  <div className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl p-2.5 text-emerald-400 font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{FIXED_VENUE}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Court No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Court 3"
                    value={bookingForm.courtNo}
                    onChange={(e) => setBookingForm({ ...bookingForm, courtNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Cost Inputs */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Court Fee ($)</label>
                  <input
                    type="number"
                    value={bookingForm.totalCost}
                    onChange={(e) => setBookingForm({ ...bookingForm, totalCost: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shuttlecock Fee ($)</label>
                  <input
                    type="number"
                    value={bookingForm.shuttleCost}
                    onChange={(e) => setBookingForm({ ...bookingForm, shuttleCost: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-center">
                <span className="text-slate-300">
                  Total ${(Number(bookingForm.totalCost) || 0) + (Number(bookingForm.shuttleCost) || 0)} ÷ {bookingForm.confirmedPlayers.length || 1} players =
                </span>
                <span className="text-base font-black text-amber-400 ml-1.5">
                  ${(((Number(bookingForm.totalCost) || 0) + (Number(bookingForm.shuttleCost) || 0)) / (bookingForm.confirmedPlayers.length || 1)).toFixed(1)} / player
                </span>
              </div>

              {/* Specific Refund / Reimbursement info */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Refund / Reimbursement Info</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">e.g. Wise, TWINT</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookingForm.paymentInfo}
                  onChange={(e) => setBookingForm({ ...bookingForm, paymentInfo: e.target.value })}
                  placeholder="e.g. Wise: 12345678 / TWINT: 0791234567 (Alan)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Select Confirmed Attendees */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Confirmed Lineup ({bookingForm.confirmedPlayers.length} players):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {members.map(m => {
                    const isChecked = bookingForm.confirmedPlayers.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => {
                          const next = isChecked
                            ? bookingForm.confirmedPlayers.filter(p => p !== m)
                            : [...bookingForm.confirmedPlayers, m];
                          setBookingForm({ ...bookingForm, confirmedPlayers: next });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}{m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="e.g. Bring your own racket, non-marking shoes"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingModalSlot(null)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30"
                >
                  Confirm Court Booking ✅
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Inspect Slot Modal */}
      {inspectSlot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-emerald-400 font-mono">{inspectSlot.dayLabel}</span>
                <h3 className="text-base font-black text-white">{inspectSlot.slotLabel}</h3>
                <span className="text-[11px] text-slate-400 font-medium">@ {FIXED_VENUE}</span>
              </div>
              <button onClick={() => setInspectSlot(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Available Players ({inspectSlot.count})</span>
                {inspectSlot.count >= 4 && (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-amber-400" /> Doubles Ready
                  </span>
                )}
              </div>

              {inspectSlot.members.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-3 text-center">No players available yet</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {inspectSlot.members.map((name) => (
                    <div
                      key={name}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setInspectSlot(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const slotToBook = inspectSlot;
                  setInspectSlot(null);
                  openBookingModal(slotToBook);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black"
              >
                Book Court Now 🏸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800/95 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold shadow-2xl shadow-black/80 flex items-center gap-2 backdrop-blur-md">
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
