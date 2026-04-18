import { useEffect, useState } from 'react';
import { getCurrentUser } from '../auth/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const RELATIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'];

const formatDOB = (dob) => {
  if (!dob) return '—';
  return new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calcAge = (dob) => {
  if (!dob) return '';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};

const FamilyPass = () => {
  const [activeTab, setActiveTab] = useState(null); // null until data loads, then 'buy' or 'history'

  // Buy flow state
  const [members, setMembers] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedPassType, setSelectedPassType] = useState('');
  const [fareData, setFareData] = useState(null);
  const [fareLoading, setFareLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [step, setStep] = useState(1);

  // History state
  const [passes, setPasses] = useState([]);
  const [passesLoading, setPassesLoading] = useState(true);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', dateOfBirth: '', relation: '' });
  const [formErrors, setFormErrors] = useState({});

  const getAuthHeaders = () => {
    const u = getCurrentUser();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${u?.token}`,
    };
  };

  const fetchBusStops = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/bus-pass/stops`);
      const data = await res.json();
      if (data.success) setBusStops(data.data);
    } catch (err) {
      console.error('Error fetching bus stops:', err);
    }
  };

  const fetchFare = async (src, dest) => {
    if (!src || !dest || src === dest) {
      setFareData(null);
      return;
    }
    setFareLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/bus-pass/fare?source=${encodeURIComponent(src)}&destination=${encodeURIComponent(dest)}`);
      const data = await res.json();
      if (data.success) setFareData(data.data);
    } catch (err) {
      console.error('Error fetching fare:', err);
    } finally {
      setFareLoading(false);
    }
  };

  const fetchPasses = async (isInitial = false) => {
    setPassesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/bus-pass/my-passes`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setPasses(data.data);
        // On initial load, default to history tab if family passes exist
        if (isInitial) {
          const hasFamilyPasses = data.data.some((p) => p.memberName);
          setActiveTab(hasFamilyPasses ? 'history' : 'buy');
        }
      }
    } catch (err) {
      console.error('Error fetching passes:', err);
      if (isInitial) setActiveTab('buy');
    } finally {
      setPassesLoading(false);
    }
  };

  useEffect(() => {
    fetchBusStops();
    fetchPasses(true);
  }, []);

  useEffect(() => {
    fetchFare(source, destination);
  }, [source, destination]);

  // Only family member passes (has memberName)
  const familyPasses = passes.filter((p) => p.memberName);

  // Extract unique previous family members for quick re-add
  const previousMembers = (() => {
    const seen = new Set();
    return familyPasses
      .filter((p) => {
        const key = `${p.memberName}-${p.memberRelation}-${p.memberEmail || p.memberDOB}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((p) => ({ name: p.memberName, email: p.memberEmail || '', dateOfBirth: p.memberDOB, relation: p.memberRelation }));
  })();

  const addPreviousMember = (prev) => {
    const alreadyAdded = members.some(
      (m) => m.name === prev.name && m.relation === prev.relation && m.email === prev.email
    );
    if (!alreadyAdded) {
      setMembers([...members, { ...prev }]);
    }
  };

  // Member form handlers
  const openAddDialog = () => {
    setEditIndex(null);
    setMemberForm({ name: '', email: '', dateOfBirth: '', relation: '' });
    setFormErrors({});
    setShowDialog(true);
  };

  const openEditDialog = (index) => {
    setEditIndex(index);
    setMemberForm({ ...members[index] });
    setFormErrors({});
    setShowDialog(true);
  };

  const validateMember = () => {
    const errors = {};
    if (!memberForm.name.trim() || memberForm.name.trim().length < 2) errors.name = 'Name is required (min 2 characters)';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!memberForm.email.trim() || !emailRegex.test(memberForm.email.trim())) errors.email = 'A valid email is required';
    if (!memberForm.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(memberForm.dateOfBirth);
      if (isNaN(dob.getTime()) || dob >= new Date()) {
        errors.dateOfBirth = 'Please enter a valid past date';
      }
    }
    if (!memberForm.relation) errors.relation = 'Please select a relation';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveMember = () => {
    if (!validateMember()) return;
    const member = {
      name: memberForm.name.trim(),
      email: memberForm.email.trim().toLowerCase(),
      dateOfBirth: memberForm.dateOfBirth,
      relation: memberForm.relation,
    };
    if (editIndex !== null) {
      const updated = [...members];
      updated[editIndex] = member;
      setMembers(updated);
    } else {
      setMembers([...members, member]);
    }
    setShowDialog(false);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const swapRoute = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const getPassOptions = () => {
    if (fareData) {
      return [
        { type: 'monthly', label: 'Monthly', price: fareData.fares.monthly.price, days: fareData.fares.monthly.days },
        { type: 'quarterly', label: 'Quarterly', price: fareData.fares.quarterly.price, days: fareData.fares.quarterly.days },
        { type: 'half-yearly', label: 'Half-Yearly', price: fareData.fares['half-yearly'].price, days: fareData.fares['half-yearly'].days },
        { type: 'yearly', label: 'Yearly', price: fareData.fares.yearly.price, days: fareData.fares.yearly.days },
      ];
    }
    return [
      { type: 'monthly', label: 'Monthly', price: '—', days: 30 },
      { type: 'quarterly', label: 'Quarterly', price: '—', days: 90 },
      { type: 'half-yearly', label: 'Half-Yearly', price: '—', days: 180 },
      { type: 'yearly', label: 'Yearly', price: '—', days: 365 },
    ];
  };

  const selectedFare = fareData && selectedPassType
    ? fareData.fares[selectedPassType]?.price
    : null;

  const totalPrice = selectedFare ? selectedFare * members.length : 0;

  const canProceedToStep2 = members.length > 0;
  const canProceedToStep3 = canProceedToStep2 && source && destination && source !== destination && selectedPassType && fareData;

  const handleBuyFamilyPass = async () => {
    if (!canProceedToStep3) return;
    setBuying(true);
    try {
      const res = await fetch(`${API_URL}/api/user/bus-pass/buy-family`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          passType: selectedPassType,
          source,
          destination,
          members: members.map((m) => ({ name: m.name, email: m.email, dateOfBirth: m.dateOfBirth, relation: m.relation })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to buy family pass');
      alert(`${members.length} family pass(es) purchased successfully! Total: ₹${totalPrice}.\n\nAwaiting admin approval.\n\nFamily members can login with their email and use "Forgot Password" to set their password.`);
      setMembers([]);
      setSource('');
      setDestination('');
      setSelectedPassType('');
      setFareData(null);
      setStep(1);
      fetchPasses();
      setActiveTab('history');
    } catch (err) {
      console.error('Buy family pass error:', err);
      alert(err.message || 'Failed to buy family pass');
    } finally {
      setBuying(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: 'schedule', label: 'Pending' },
      active: { bg: 'bg-green-100 text-green-800', icon: 'check_circle', label: 'Active' },
      rejected: { bg: 'bg-red-100 text-red-800', icon: 'cancel', label: 'Rejected' },
      expired: { bg: 'bg-gray-100 text-gray-800', icon: 'timer_off', label: 'Expired' },
    };
    const s = map[status] || { bg: 'bg-gray-100 text-gray-600', icon: 'help', label: status };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg}`}>
        <span className="material-symbols-outlined text-xs">{s.icon}</span>
        {s.label}
      </span>
    );
  };

  if (!activeTab) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">hourglass_empty</span>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-2xl">group</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Family Bus Pass</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                activeTab === 'buy'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
              Buy Passes
            </button>
            <button
              onClick={() => { setActiveTab('history'); fetchPasses(false); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-lg">history</span>
              Pass History
              {familyPasses.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {familyPasses.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ==================== BUY TAB ==================== */}
        {activeTab === 'buy' && (
          <>
            {/* Steps indicator */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (s === 1) setStep(1);
                        else if (s === 2 && canProceedToStep2) setStep(2);
                        else if (s === 3 && canProceedToStep3) setStep(3);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        step === s
                          ? 'bg-primary text-white'
                          : step > s
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step > s ? (
                        <span className="material-symbols-outlined text-sm">check</span>
                      ) : s}
                    </button>
                    <span className={`text-xs font-medium hidden sm:inline ${step === s ? 'text-primary' : 'text-slate-500'}`}>
                      {s === 1 ? 'Add Members' : s === 2 ? 'Route & Pass' : 'Review'}
                    </span>
                    {s < 3 && <span className="border-t border-slate-300 w-6 sm:w-12"></span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Add Family Members */}
            {step === 1 && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person_add</span>
                    Family Members ({members.length})
                  </h3>
                  <button
                    onClick={openAddDialog}
                    disabled={members.length >= 10}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Member
                  </button>
                </div>

                {/* Quick add from previous passes */}
                {previousMembers.length > 0 && members.length === 0 && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-lg">history</span>
                      Quick add from previous passes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {previousMembers.map((prev, i) => (
                        <button
                          key={i}
                          onClick={() => addPreviousMember(prev)}
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm hover:bg-blue-100 hover:border-blue-300 transition-colors"
                        >
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 font-bold text-xs">{prev.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-slate-800 text-sm leading-tight">{prev.name}</p>
                            <p className="text-xs text-slate-500">{prev.relation}</p>
                          </div>
                          <span className="material-symbols-outlined text-blue-500 text-lg">add_circle</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick add when some members are already added */}
                {previousMembers.length > 0 && members.length > 0 && previousMembers.some(
                  (prev) => !members.some((m) => m.name === prev.name && m.relation === prev.relation && m.dateOfBirth === prev.dateOfBirth)
                ) && (
                  <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 mb-2">Add more from previous:</p>
                    <div className="flex flex-wrap gap-2">
                      {previousMembers
                        .filter((prev) => !members.some((m) => m.name === prev.name && m.relation === prev.relation && m.dateOfBirth === prev.dateOfBirth))
                        .map((prev, i) => (
                          <button
                            key={i}
                            onClick={() => addPreviousMember(prev)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs hover:bg-blue-50 hover:border-blue-200 transition-colors"
                          >
                            <span className="font-medium text-slate-700">{prev.name}</span>
                            <span className="text-slate-400">({prev.relation})</span>
                            <span className="material-symbols-outlined text-blue-400 text-sm">add</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {members.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3 block">group_add</span>
                    <p className="text-base font-medium">No family members added yet</p>
                    <p className="text-sm mt-1">{previousMembers.length > 0 ? 'Use quick add above or click "Add Member" to get started' : 'Click "Add Member" to get started'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member, index) => (
                      <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-base sm:text-lg">{member.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">{member.name}</p>
                          <p className="text-xs text-slate-500 truncate">{member.email}</p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            {member.relation} &middot; DOB: {formatDOB(member.dateOfBirth)} ({calcAge(member.dateOfBirth)} yrs)
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => openEditDialog(index)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => removeMember(index)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Remove"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Select Route
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Route & Pass Type */}
            {step === 2 && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">route</span>
                  Select Route
                </h3>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Source (From)</label>
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                      >
                        <option value="">-- Select source --</option>
                        {busStops.map((stop) => (
                          <option key={stop} value={stop} disabled={stop === destination}>{stop}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={swapRoute}
                      disabled={!source && !destination}
                      className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-30"
                      title="Swap route"
                    >
                      <span className="material-symbols-outlined">swap_horiz</span>
                    </button>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Destination (To)</label>
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                      >
                        <option value="">-- Select destination --</option>
                        {busStops.map((stop) => (
                          <option key={stop} value={stop} disabled={stop === source}>{stop}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {source && destination && source !== destination && fareData && (
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
                        <span className="font-semibold text-primary text-sm">{source}</span>
                        <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
                        <span className="font-semibold text-primary text-sm">{destination}</span>
                      </div>
                      <p className="text-center text-xs text-slate-500 mt-2">
                        Approx. distance: <strong>{fareData.distanceKm} km</strong>
                      </p>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">confirmation_number</span>
                  Select Pass Type
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {getPassOptions().map((opt) => (
                    <div
                      key={opt.type}
                      className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
                        selectedPassType === opt.type
                          ? 'border-primary ring-2 ring-primary/20 shadow-md bg-primary/5'
                          : 'border-slate-200 hover:border-primary hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPassType(opt.type)}
                    >
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{opt.label}</h4>
                      <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                        {fareLoading ? (
                          <span className="text-sm text-slate-400">...</span>
                        ) : (
                          typeof opt.price === 'number' ? `₹${opt.price}` : opt.price
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{opt.days} days &middot; per person</p>
                    </div>
                  ))}
                </div>

                {selectedFare && members.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm text-green-800">
                        ₹{selectedFare} &times; {members.length} member{members.length > 1 ? 's' : ''}
                      </p>
                      <div className="text-right">
                        <p className="text-xs text-green-600 font-medium uppercase">Total Price</p>
                        <p className="text-2xl font-bold text-green-700">₹{totalPrice}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canProceedToStep3}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review & Confirm
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary">route</span>
                    Route
                  </h3>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3 justify-center flex-wrap">
                    <span className="font-bold text-primary">{source}</span>
                    <span className="material-symbols-outlined text-primary">arrow_forward</span>
                    <span className="font-bold text-primary">{destination}</span>
                  </div>
                  {fareData && (
                    <p className="text-center text-xs text-slate-500 mt-2">Distance: {fareData.distanceKm} km</p>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary">confirmation_number</span>
                    Pass Type
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 capitalize">{selectedPassType} Pass</span>
                    <span className="font-bold text-primary text-lg">₹{selectedFare} / person</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary">group</span>
                    Family Members ({members.length})
                  </h3>
                  <div className="space-y-2">
                    {members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">{member.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                            <p className="text-xs text-slate-500">{member.relation} &middot; {formatDOB(member.dateOfBirth)}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">₹{selectedFare}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Total Amount</p>
                      <p className="text-xs text-green-600">
                        {members.length} member{members.length > 1 ? 's' : ''} &times; ₹{selectedFare}
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-green-700">₹{totalPrice}</p>
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back
                  </button>
                  <button
                    onClick={handleBuyFamilyPass}
                    disabled={buying}
                    className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buying ? (
                      <>
                        <span className="material-symbols-outlined text-lg animate-spin">hourglass_empty</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">shopping_cart</span>
                        Confirm & Buy — ₹{totalPrice}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== HISTORY TAB ==================== */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">history</span>
              Family Pass History
            </h3>

            {passesLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">hourglass_empty</span>
              </div>
            ) : familyPasses.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-3 block">inbox</span>
                <p className="text-base font-medium">No family passes found</p>
                <p className="text-sm mt-1">Purchase family passes from the "Buy Passes" tab</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Member</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Relation</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">DOB</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Route</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Type</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Price</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Valid Till</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Requested</th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyPasses.map((pass) => (
                        <tr key={pass._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-purple-700 font-bold text-xs">{pass.memberName.charAt(0).toUpperCase()}</span>
                              </div>
                              {pass.memberName}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{pass.memberRelation}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{formatDOB(pass.memberDOB)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              {pass.source}
                              <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward</span>
                              {pass.destination}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 capitalize">{pass.passType}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-medium">₹{pass.price}</td>
                          <td className="px-4 py-3 text-sm">{statusBadge(pass.status)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {pass.validTill ? new Date(pass.validTill).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">{new Date(pass.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {familyPasses.map((pass) => (
                    <div key={pass._id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-700 font-bold text-xs">{pass.memberName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{pass.memberName}</p>
                            <p className="text-xs text-slate-500">{pass.memberRelation} &middot; {formatDOB(pass.memberDOB)}</p>
                          </div>
                        </div>
                        {statusBadge(pass.status)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2 bg-slate-50 rounded px-2 py-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                        <span>{pass.source}</span>
                        <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward</span>
                        <span>{pass.destination}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">Type: </span>
                          <span className="font-medium capitalize">{pass.passType}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Price: </span>
                          <span className="font-medium">₹{pass.price}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Valid Till: </span>
                          <span className="font-medium">{pass.validTill ? new Date(pass.validTill).toLocaleDateString() : '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Requested: </span>
                          <span className="font-medium">{new Date(pass.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {pass.status === 'active' && pass.qrImage && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                          <img src={pass.qrImage} alt="QR" className="w-16 h-16 rounded border border-slate-200" />
                          <div className="flex-1 min-w-0">
                            {pass.code16 && (
                              <div>
                                <p className="text-xs text-slate-400">Verification Code</p>
                                <p className="font-mono text-xs tracking-wider text-slate-700 select-all break-all">{pass.code16}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Member Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {editIndex !== null ? 'Edit Member' : 'Add Family Member'}
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="Enter member's full name"
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                    formErrors.name ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  placeholder="Enter member's email (for login access)"
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                    formErrors.email ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                <p className="text-xs text-slate-400 mt-1">Member can login with this email to view their pass</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={memberForm.dateOfBirth}
                  onChange={(e) => setMemberForm({ ...memberForm, dateOfBirth: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                    formErrors.dateOfBirth ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {memberForm.dateOfBirth && !formErrors.dateOfBirth && (
                  <p className="text-xs text-slate-500 mt-1">Age: {calcAge(memberForm.dateOfBirth)} years</p>
                )}
                {formErrors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{formErrors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Relation</label>
                <select
                  value={memberForm.relation}
                  onChange={(e) => setMemberForm({ ...memberForm, relation: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none ${
                    formErrors.relation ? 'border-red-400' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Select relation --</option>
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {formErrors.relation && <p className="text-xs text-red-500 mt-1">{formErrors.relation}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveMember}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {editIndex !== null ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyPass;
