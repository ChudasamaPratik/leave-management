import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  User,
  FileText,
  Download,
  Upload,
  RotateCcw,
  Search,
  CalendarDays,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  X,
  Info
} from 'lucide-react';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100 opacity-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <div className="flex justify-center space-x-3">
            <button
                onClick={onCancel}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
                onClick={onConfirm}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
  );
};

const LoginModal = ({ handleLogin, loading }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error('Please enter both email and name');
      return;
    }
    await handleLogin(email, name);
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Leave Tracker</h2>
            <p className="text-gray-600">Please login to access your leave management system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required
              />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
  );
};

const ClaimDaysModal = ({ onClaim, onCancel, availableExtraDays }) => {
  const [selectedDays, setSelectedDays] = useState([]);

  const handleToggleDay = (dayId) => {
    setSelectedDays(prev =>
        prev.includes(dayId)
            ? prev.filter(id => id !== dayId)
            : [...prev, dayId]
    );
  };

  const handleClaim = () => {
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day to claim.');
      return;
    }
    onClaim(selectedDays);
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Claim Extra Days</h3>
                <p className="text-gray-500 text-sm">Select earned extra days to claim them.</p>
              </div>
            </div>
            <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
              <X className="text-gray-500" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto -mx-4 px-4 space-y-3 mb-6">
            {availableExtraDays.length > 0 ? availableExtraDays.map(day => (
                <label key={day.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedDays.includes(day.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                      type="checkbox"
                      checked={selectedDays.includes(day.id)}
                      onChange={() => handleToggleDay(day.id)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div className="ml-4">
                    <p className="font-medium text-gray-800">{day.title}</p>
                    <p className="text-sm text-gray-500">Earned on {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </label>
            )) : (
                <div className="text-center py-10">
                  <Award size={40} className="text-gray-300 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg text-gray-700">No Extra Days Available</h4>
                  <p className="text-gray-500 text-sm">You have no available extra days to claim.</p>
                </div>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onCancel} className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Cancel
            </button>
            <button type="button" onClick={handleClaim} disabled={selectedDays.length === 0} className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
              Claim {selectedDays.length > 0 ? `${selectedDays.length} Day(s)` : ''}
            </button>
          </div>
        </div>
      </div>
  );
};

const LeaveBreakdownModal = ({ title, icon, tabs, onCancel }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.title || '');
  const Icon = icon || Info;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              </div>
            </div>
            <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
              <X className="text-gray-500" />
            </button>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              {tabs.map(tab => (
                  <button
                      key={tab.title}
                      onClick={() => setActiveTab(tab.title)}
                      className={`${activeTab === tab.title
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    {tab.title} ({tab.days.length})
                  </button>
              ))}
            </nav>
          </div>

          <div className="flex-grow overflow-y-auto py-6">
            {tabs.map(tab => (
                activeTab === tab.title && (
                    <div key={tab.title} className="space-y-3">
                      {tab.days.length > 0 ? tab.days.map(day => (
                          <div key={day.id} className="p-4 border rounded-xl bg-gray-50">
                            <p className="font-medium text-gray-800">{day.title}</p>
                            <p className="text-sm text-gray-500">
                              {tab.title === 'Used' ? 'Taken on' : 'Earned on'} {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            {tab.title === 'Used' && day.consumedLeaveDetails && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Against: <span className="font-medium">{day.consumedLeaveDetails.type === 'extraDay' ? 'Extra Day' : 'Casual Leave'}</span>
                                  <span className="text-xs"> (Earned: {new Date(day.consumedLeaveDetails.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</span>
                                </p>
                            )}
                          </div>
                      )) : (
                          <div className="text-center py-10">
                            <h4 className="font-semibold text-lg text-gray-700">Nothing to show</h4>
                            <p className="text-gray-500 text-sm">There are no days in this category.</p>
                          </div>
                      )}
                    </div>
                )
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button type="button" onClick={onCancel} className="justify-center flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
  );
};

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [publicHolidays, setPublicHolidays] = useState([]);

  // User state and mandatory login
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [breakdownModal, setBreakdownModal] = useState({ isOpen: false });

  const API_BASE_URL = 'https://leave-api.knowledgenest.blog/api.php';

  // Database sync (works silently in background)
  const syncToDatabase = async (type, data) => {
    if (!currentUser) return;
    try {
      let response;
      if (type === 'create_event') {
        response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.id,
            event_date: data.dateKey,
            title: data.title,
            description: data.description,
            type: data.type,
            leave_type: data.leaveType,
            consumed_leave_id: data.consumedLeaveId
          })
        });
      } else if (type === 'update_event') {
        response = await fetch(`${API_BASE_URL}/events/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            type: data.type,
            leave_type: data.leaveType,
            consumed_leave_id: data.consumedLeaveId
          })
        });
      } else if (type === 'delete_event') {
        response = await fetch(`${API_BASE_URL}/events/${data.id}`, {
          method: 'DELETE'
        });
      }

      if (response && response.ok) {
        await loadUserData(currentUser.id);
      } else if (response) {
        console.error(`Database sync failed for ${type}:`, await response.text());
      } else {
        console.error(`Database sync failed: No response for ${type}`);
      }
    } catch (error) {
      console.error('Database sync failed:', error);
    }
  };

  // Load user data from database
  const loadUserData = async (userId) => {
    try {
      const [eventsResponse, leaveBalanceResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/events?user_id=${userId}`),
        fetch(`${API_BASE_URL}/leave-balance?user_id=${userId}`)
      ]);

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const groupedEvents = {};

        eventsData.forEach(event => {
          const dateKey = event.event_date;
          if (!groupedEvents[dateKey]) {
            groupedEvents[dateKey] = [];
          }
          groupedEvents[dateKey].push({
            id: event.id,
            title: event.title,
            description: event.description,
            type: event.type,
            leaveType: event.leave_type,
            consumedLeaveId: event.consumed_leave_id !== null ? Number(event.consumed_leave_id) : null,
            isMonthClaim: event.is_month_claim == 1,
            date: dateKey
          });
        });
        setEvents(groupedEvents);
      } else {
        console.error('Failed to load events:', await eventsResponse.text());
      }

      if (leaveBalanceResponse.ok) {
        const balanceData = await leaveBalanceResponse.json();
        setLeaveBalance({
          casualLeave: balanceData.casual_leave,
          extraDays: balanceData.extra_days
        });
      } else {
        setLeaveBalance({ casualLeave: 12, extraDays: 0 });
        console.warn('Failed to load leave balance, using defaults:', await leaveBalanceResponse.text());
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  // Login function
  const handleLogin = async (email, name) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const result = await response.json();

      if (response.ok && result.success) {
        const user = { id: result.user_id, email, name };
        setCurrentUser(user);
        setShowLogin(false);
        localStorage.setItem('currentUser', JSON.stringify(user));
        await loadUserData(result.user_id);
        toast.success('Login successful!');
      } else {
        toast.error(result.error || 'Invalid email or name. Please check your credentials.');
      }
    } catch (error) {
      toast.error('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    setConfirmMessage('Are you sure you want to logout?');
    setConfirmAction(() => () => {
      setCurrentUser(null);
      setShowLogin(true);
      setEvents({});
      setLeaveBalance({});
      setSelectedDate(null);
      setGlobalSearchTerm('');
      setSearchTerm('');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('leaveTrackerEvents');
      localStorage.removeItem('leaveTrackerBalance');
      toast.success('Logged out successfully!');
    });
    setShowConfirmModal(true);
  };

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setShowLogin(false);
        loadUserData(user.id);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const [fetchedYears, setFetchedYears] = useState([]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    if (currentUser && !fetchedYears.includes(year)) {
      fetchPublicHolidays(year);
    }
  }, [currentDate, fetchedYears, currentUser]);

  const fetchPublicHolidays = async (year) => {
    try {
      const apiKey = 'tWb4ZoZmAV1LxmH7XLK3F82L7U5BAhOq';
      const response = await fetch(`https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=IN&year=${year}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (data.response && data.response.holidays) {
        const holidays = data.response.holidays.map(holiday => ({
          date: holiday.date.iso.substring(0, 10),
          name: holiday.name
        }));
        setPublicHolidays(prevHolidays => {
          const newHolidays = holidays.filter(h => !prevHolidays.some(ph => ph.date === h.date));
          return [...prevHolidays, ...newHolidays];
        });
        setFetchedYears(prevYears => [...prevYears, year]);
      }
    } catch (error) {
      console.error('Error fetching public holidays:', error);
    }
  };

  // Calculate leave statistics
  const getLeaveStats = () => {
    const allEvents = Object.values(events).flat();
    const leaveEvents = allEvents.filter(event => event.type === 'leave');
    const consumedLeaveIds = new Set(leaveEvents.map(event => event.consumedLeaveId));

    const earnedCasualLeaveEvents = [];
    const earnedExtraDayEvents = [];

    for (const date in events) {
      events[date].forEach(event => {
        if (event.type === 'addCasualLeave') {
          earnedCasualLeaveEvents.push(event);
        } else if (event.type === 'extraDay') {
          earnedExtraDayEvents.push(event);
        }
      });
    }

    const allLeaveTakenEvents = leaveEvents.map(event => {
      if (event.consumedLeaveId) {
        const consumedLeave = allEvents.find(e => e.id === event.consumedLeaveId);
        return { ...event, consumedLeaveDetails: consumedLeave };
      }
      return event;
    });

    const usedCasualLeaves = allLeaveTakenEvents.filter(e => e.leaveType === 'casual');
    const usedExtraDays = allLeaveTakenEvents.filter(e => e.leaveType === 'extra');

    const availableCasualLeaveEvents = earnedCasualLeaveEvents.filter(event => !consumedLeaveIds.has(event.id));
    const casualRemaining = availableCasualLeaveEvents.length;

    const claimedDaysEvents = earnedExtraDayEvents.filter(event => event.isMonthClaim);
    const claimedDaysCount = claimedDaysEvents.length;

    const availableExtraDaysEvents = earnedExtraDayEvents.filter(event => !consumedLeaveIds.has(event.id) && !event.isMonthClaim);
    const extraRemaining = availableExtraDaysEvents.length;

    const availableLeaveDays = [ ...availableExtraDaysEvents, ...availableCasualLeaveEvents ];

    return {
      // Counts
      casualLeaveEarned: earnedCasualLeaveEvents.length,
      casualUsed: usedCasualLeaves.length,
      casualRemaining: casualRemaining,
      extraDaysEarned: earnedExtraDayEvents.length,
      extraUsed: usedExtraDays.length,
      extraRemaining: extraRemaining,
      claimedDaysCount: claimedDaysCount,
      totalUsed: allLeaveTakenEvents.length,

      // Event Lists
      earnedCasualLeaveEvents,
      availableCasualLeaveEvents,
      usedCasualLeaves,
      earnedExtraDayEvents,
      availableExtraDaysEvents,
      usedExtraDays,
      claimedDaysEvents,
      allLeaveTakenEvents,
      availableLeaveDays
    };
  };

  const openBreakdownModal = (type) => {
    const stats = getLeaveStats();
    if (type === 'Casual Leave') {
      setBreakdownModal({
        isOpen: true,
        title: 'Casual Leave Breakdown',
        icon: Calendar,
        tabs: [
          { title: 'Available', days: stats.availableCasualLeaveEvents },
          { title: 'Used', days: stats.usedCasualLeaves },
        ]
      });
    } else if (type === 'Extra Days') {
      setBreakdownModal({
        isOpen: true,
        title: 'Extra Day Breakdown',
        icon: Award,
        tabs: [
          { title: 'Available', days: stats.availableExtraDaysEvents },
          { title: 'Used', days: stats.usedExtraDays },
          { title: 'Claimed', days: stats.claimedDaysEvents },
        ]
      });
    } else if (type === 'Total Used') {
      setBreakdownModal({
        isOpen: true,
        title: 'Total Leave Used',
        icon: FileText,
        tabs: [
          { title: 'All Used', days: stats.allLeaveTakenEvents },
        ]
      });
    } else if (type === 'Claimed Days') {
      setBreakdownModal({
        isOpen: true,
        title: 'Claimed Days',
        icon: CheckCircle,
        tabs: [
          { title: 'Claimed', days: stats.claimedDaysEvents },
        ]
      });
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      setIsAnimating(false);
    }, 150);
  };

  const goToNextMonth = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      setIsAnimating(false);
    }, 150);
  };

  const goToToday = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const today = new Date();
      setCurrentDate(today);
      setSelectedDate(formatDate(today));
      setIsAnimating(false);
    }, 150);
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(formatDate(date));
    }
  };

  const addEvent = async (eventData) => {
    const dateKey = selectedDate || formatDate(new Date());

    if (eventData.type === 'addCasualLeave') {
      const monthYear = dateKey.substring(0, 7);
      for (const date in events) {
        if (date.startsWith(monthYear)) {
          if (events[date].some(event => event.type === 'addCasualLeave')) {
            toast.error('You can only add one casual leave per month.');
            return;
          }
        }
      }
    }

    const newEvent = {
      id: Date.now(),
      date: dateKey,
      ...eventData
    };

    if (eventData.type === 'leave') {
      if (eventData.leaveType === 'paid') {
        newEvent.leaveType = 'paid';
      } else {
        newEvent.consumedLeaveId = Number(eventData.leaveType);
        newEvent.leaveType = leaveStats.availableLeaveDays.find(day => day.id.toString() === eventData.leaveType)?.type === 'extraDay' ? 'extra' : 'casual';
      }
    }

    setEvents(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvent]
    }));

    await syncToDatabase('create_event', {
      dateKey,
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
      leaveType: newEvent.leaveType,
      consumedLeaveId: newEvent.consumedLeaveId
    });

    setShowModal(false);
    setEditingEvent(null);
  };

  const updateEvent = async (eventData) => {
    const dateKey = editingEvent.date;

    const eventsForDate = events[dateKey] || [];
    const eventToUpdate = eventsForDate.find(event => event.id === editingEvent.id);

    if (!eventToUpdate) {
      console.error("Event to update not found");
      return;
    }

    const updatedEvent = { ...eventToUpdate, ...eventData };

    if (updatedEvent.type === 'leave') {
      if (eventData.leaveType === 'paid') {
        updatedEvent.leaveType = 'paid';
        updatedEvent.consumedLeaveId = null;
      } else {
        updatedEvent.consumedLeaveId = Number(eventData.leaveType);
        const leaveStats = getLeaveStats();
        updatedEvent.leaveType = leaveStats.availableLeaveDays.find(day => day.id.toString() === eventData.leaveType)?.type === 'extraDay' ? 'extra' : 'casual';
      }
    }

    setEvents(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(event =>
          event.id === editingEvent.id ? updatedEvent : event
      )
    }));

    await syncToDatabase('update_event', {
      id: editingEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      type: updatedEvent.type,
      leaveType: updatedEvent.leaveType,
      consumedLeaveId: updatedEvent.consumedLeaveId
    });

    setShowModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = async (eventToDelete) => {
    const { id, date: dateKey } = eventToDelete;

    setEvents(prev => {
      const updatedEventsForDate = (prev[dateKey] || []).filter(event => event.id !== id);

      if (updatedEventsForDate.length > 0) {
        return {
          ...prev,
          [dateKey]: updatedEventsForDate
        };
      } else {
        const newEvents = { ...prev };
        delete newEvents[dateKey];
        return newEvents;
      }
    });

    await syncToDatabase('delete_event', { id });
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ events, leaveBalance }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `leave-tracker-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setEvents(importedData.events || {});
          setLeaveBalance(importedData.leaveBalance || { casualLeave: 12, extraDays: 0 });
          toast.success('Data imported successfully!');
        } catch (error) {
          toast.error('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClaimDays = async (eventIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/claim-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_ids: eventIds })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Days claimed successfully!');
        setShowClaimModal(false);
        await loadUserData(currentUser.id); // Reload data
      } else {
        toast.error(result.error || 'Failed to claim days.');
      }
    } catch (error) {
      toast.error('An error occurred while claiming days.');
    }
  };

  const clearAllData = () => {
    setConfirmMessage('Are you sure you want to clear all data? This cannot be undone.');
    setConfirmAction(() => async () => {
      if (!currentUser) {
        toast.error('No user logged in to clear data for.');
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/clear-data`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUser.id })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setEvents({});
          setSelectedDate(null);
          setLeaveBalance({ casualLeave: 12, extraDays: 0 });
          toast.success('All data cleared successfully!');
        } else {
          toast.error(`Failed to clear data: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error('Error clearing data. Please check your connection.');
      }
    });
    setShowConfirmModal(true);
  };

  const getFilteredEvents = () => {
    if (globalSearchTerm) {
      const allEvents = Object.values(events).flat();
      const allHolidays = publicHolidays.map(h => ({
        id: `ph-${h.date}`,
        type: 'holiday',
        title: h.name,
        date: h.date,
        description: ''
      }));
      const searchableEvents = [...allEvents, ...allHolidays];
      return searchableEvents.filter(event =>
          event.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(globalSearchTerm.toLowerCase()))
      );
    }

    if (!selectedDate) return [];

    const dayEvents = events[selectedDate] || [];
    const holiday = publicHolidays.find(h => h.date === selectedDate);

    let allDayEvents = [...dayEvents];
    if (holiday) {
      allDayEvents.push({ id: `ph-${selectedDate}`, type: 'holiday', title: holiday.name });
    }

    return allDayEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ).map(event => {
      if (event.type === 'leave' && event.consumedLeaveId) {
        const consumedLeave = Object.values(events).flat().find(e => e.id === event.consumedLeaveId);
        return { ...event, consumedLeaveDetails: consumedLeave };
      }
      return event;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return formatDate(date) === selectedDate;
  };

  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateKey = formatDate(date);
    const dayEvents = events[dateKey] || [];
    const holiday = publicHolidays.find(h => h.date === dateKey);
    if (holiday) {
      return [...dayEvents, { id: `ph-${dateKey}`, type: 'holiday', title: holiday.name }];
    }
    return dayEvents;
  };

  const leaveStats = getLeaveStats();
  const filteredEvents = getFilteredEvents();

  // If not logged in, show login modal
  if (showLogin) {
    return <LoginModal handleLogin={handleLogin} loading={loading} />;
  }

  return (
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="max-w-screen-2xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="flex items-center gap-4 mb-6 lg:mb-0">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <CalendarDays className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Tracker</h1>
                  <p className="text-gray-600">Welcome back, {currentUser?.name}!</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="relative order-first w-full sm:w-auto sm:order-none">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Global Search..."
                      value={globalSearchTerm}
                      onChange={(e) => setGlobalSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button onClick={() => setShowClaimModal(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium">
                  <Award size={16} />
                  <span className="hidden sm:inline">Claim Days</span>
                </button>
                <button onClick={goToToday} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  <Clock size={16} />
                  <span className="hidden sm:inline">Today</span>
                </button>
                <button onClick={exportData} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <label className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer">
                  <Upload size={16} />
                  <span className="hidden sm:inline">Import</span>
                  <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                  />
                </label>
                <button onClick={clearAllData} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
                  <RotateCcw size={16} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Leave Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-6">
            <div onClick={() => openBreakdownModal('Casual Leave')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 cursor-pointer hover:border-blue-400 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <span className="text-gray-600 font-medium text-sm sm:text-base">Casual Leave</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                <span>{leaveStats.casualRemaining}</span>/
                <span>{leaveStats.casualLeaveEarned}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 flex justify-between items-center">
                <span>Remaining/Total</span>
                <span>Used: <span className="font-semibold text-gray-700">{leaveStats.casualUsed}</span></span>
              </div>
            </div>

            <div onClick={() => openBreakdownModal('Extra Days')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 cursor-pointer hover:border-green-400 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award size={20} className="text-green-600" />
                </div>
                <span className="text-gray-600 font-medium text-sm sm:text-base">Extra Days</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                <span>{leaveStats.extraRemaining}</span>/
                <span>{leaveStats.extraDaysEarned}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 flex justify-between items-center">
                <span>Available/Earned</span>
                <div className="flex gap-x-2">
                  <span>Used: <span className="font-semibold text-gray-700">{leaveStats.extraUsed}</span></span>
                  <span>Claimed: <span className="font-semibold text-gray-700">{leaveStats.claimedDaysCount}</span></span>
                </div>
              </div>
            </div>

            <div onClick={() => openBreakdownModal('Claimed Days')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 cursor-pointer hover:border-purple-400 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-600 font-medium text-sm sm:text-base">Claimed Days</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {leaveStats.claimedDaysCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Total Claimed</div>
            </div>

            <div onClick={() => openBreakdownModal('Total Used')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 cursor-pointer hover:border-red-400 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText size={20} className="text-red-600" />
                </div>
                <span className="text-gray-600 font-medium text-sm sm:text-base">Total Used</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {leaveStats.totalUsed}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 flex justify-between items-center">
                <span>CL: <span className="font-semibold text-gray-700">{leaveStats.casualUsed}</span></span>
                <span>Extra: <span className="font-semibold text-gray-700">{leaveStats.extraUsed}</span></span>
              </div>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-center items-center gap-4 sm:gap-8">
              <button onClick={goToPreviousMonth} className="p-2 sm:p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <div className={`text-center transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">Click on any date to manage events</p>
              </div>
              <button onClick={goToNextMonth} className="p-2 sm:p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <ChevronRight size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-4 lg:p-6">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-semibold text-gray-600 p-1 sm:p-2 text-xs sm:text-sm">
                        <span className="hidden sm:block">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                      </div>
                  ))}

                  {/* Calendar days */}
                  {getDaysInMonth(currentDate).map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    const leaveEvent = dayEvents.find(event => event.type === 'leave');
                    const holidayEvent = dayEvents.find(event => event.type === 'holiday');

                    return (
                        <div
                            key={index}
                            className={`
                                                relative flex flex-col items-center justify-start
                                                cursor-pointer transition-all duration-200 rounded-md sm:rounded-lg 
                                                p-1 sm:p-2 
                                                h-12 sm:h-16 md:h-20 lg:h-24
                                                ${!date ? 'pointer-events-none' : ''}
                                                ${isToday(date)
                                ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                                : isSelected(date)
                                    ? 'bg-blue-50 border-2 border-blue-300 text-blue-800'
                                    : leaveEvent
                                        ? 'bg-red-50 border border-red-200 hover:bg-red-100'
                                        : holidayEvent
                                            ? 'bg-orange-50 border border-orange-200 hover:bg-orange-100'
                                            : isWeekend(date)
                                                ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }
                                            `}
                            onClick={() => handleDateClick(date)}
                        >
                          {date && (
                              <>
                                {/* Date number */}
                                <div className="text-xs sm:text-sm lg:text-base font-medium mb-0.5 flex-shrink-0">
                                  {date.getDate()}
                                </div>

                                {/* Leave indicator */}
                                {leaveEvent && (
                                    <div className={`
                                                            text-[8px] sm:text-[10px] lg:text-xs px-1 py-0.5 rounded text-white font-medium
                                                            leading-none min-w-[14px] sm:min-w-[16px] text-center flex-shrink-0
                                                            ${leaveEvent.leaveType === 'casual' ? 'bg-blue-500' :
                                        leaveEvent.leaveType === 'extra' ? 'bg-green-500' :
                                            leaveEvent.leaveType === 'paid' ? 'bg-purple-500' : 'bg-gray-500'}
                                                        `}>
                                      {leaveEvent.leaveType === 'casual' ? 'CL' :
                                          leaveEvent.leaveType === 'extra' ? 'EX' :
                                              leaveEvent.leaveType === 'paid' ? 'PL' : 'SL'}
                                    </div>
                                )}

                                {/* Holiday indicator */}
                                {holidayEvent && !leaveEvent && (
                                    <div className="text-[8px] sm:text-[10px] lg:text-xs bg-orange-500 text-white px-1 py-0.5 rounded font-medium leading-none flex-shrink-0">
                                                            <span className="hidden sm:inline">
                                                                {holidayEvent.title.length > 6 ? holidayEvent.title.substring(0, 4) + '..' : holidayEvent.title}
                                                            </span>
                                      <span className="sm:hidden">H</span>
                                    </div>
                                )}

                                {/* Event dots - only show if no leave/holiday indicator and has space */}
                                {!leaveEvent && !holidayEvent && (
                                    <div className="flex flex-wrap gap-0.5 justify-center mt-auto mb-0.5 max-w-full">
                                      {dayEvents.filter(e => e.type === 'note').length > 0 && (
                                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-500 rounded-full flex-shrink-0"></div>
                                      )}
                                      {dayEvents.filter(e => e.type === 'extraDay').length > 0 && (
                                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                                      )}
                                      {dayEvents.filter(e => e.type === 'addCasualLeave').length > 0 && (
                                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                                      )}
                                    </div>
                                )}
                              </>
                          )}
                        </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 max-h-[60vh] lg:max-h-[700px] flex flex-col">
                {(selectedDate || globalSearchTerm) ? (
                    <>
                      {/* Sidebar Header */}
                      <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {globalSearchTerm ? 'Search Results' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </h3>
                          {!globalSearchTerm && selectedDate && (
                              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                          )}
                        </div>
                        <button
                            onClick={() => {
                              setEditingEvent(null);
                              setShowModal(true);
                            }}
                            className="flex items-center justify-center gap-1 px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium ml-3 flex-shrink-0"
                            disabled={globalSearchTerm}
                        >
                          <Plus size={16} />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {/* Search */}
                      <div className="relative mb-4 sm:mb-6">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={globalSearchTerm}
                        />
                      </div>

                      {/* Events List */}
                      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map(event => (
                                <div key={event.id} className={`
                                                    p-3 sm:p-4 border rounded-lg transition-colors
                                                    ${event.type === 'leave' ? 'border-red-200 bg-red-50' :
                                    event.type === 'note' ? 'border-gray-200 bg-white' :
                                        event.type === 'holiday' ? 'border-orange-200 bg-orange-50' :
                                            event.type === 'extraDay' ? 'border-green-200 bg-green-50' :
                                                event.type === 'addCasualLeave' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}
                                                `}>
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div className={`
                                                                p-1.5 rounded-full flex-shrink-0
                                                                ${event.type === 'leave' ? 'bg-red-100' :
                                          event.type === 'note' ? 'bg-gray-100' :
                                              event.type === 'holiday' ? 'bg-orange-100' :
                                                  event.type === 'extraDay' ? 'bg-green-100' :
                                                      event.type === 'addCasualLeave' ? 'bg-blue-100' : 'bg-gray-100'}
                                                            `}>
                                        {event.type === 'leave' ? <User size={12} className="text-red-600 sm:w-3.5 sm:h-3.5" /> :
                                            event.type === 'note' ? <FileText size={12} className="text-gray-600 sm:w-3.5 sm:h-3.5" /> :
                                                event.type === 'holiday' ? <Calendar size={12} className="text-orange-600 sm:w-3.5 sm:h-3.5" /> :
                                                    event.type === 'extraDay' ? <Award size={12} className="text-green-600 sm:w-3.5 sm:h-3.5" /> :
                                                        event.type === 'addCasualLeave' ? <User size={12} className="text-blue-600 sm:w-3.5 sm:h-3.5" /> : <FileText size={12} className="text-gray-600 sm:w-3.5 sm:h-3.5" />}
                                      </div>
                                      <span className={`
                                                                text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium
                                                                ${event.type === 'leave' ?
                                          (event.consumedLeaveId ?
                                              (event.consumedLeaveDetails?.type === 'extraDay' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800') :
                                              'bg-purple-200 text-purple-800') :
                                          event.type === 'note' ? 'bg-gray-200 text-gray-800' :
                                              event.type === 'holiday' ? 'bg-orange-200 text-orange-800' :
                                                  event.type === 'extraDay' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}
                                                            `}>
                                                                {event.type === 'leave' ?
                                                                    (event.consumedLeaveId ?
                                                                        (event.consumedLeaveDetails?.type === 'extraDay' ? 'EX' : 'CL') :
                                                                        'Paid') :
                                                                    event.type === 'note' ? 'Note' :
                                                                        event.type === 'holiday' ? 'Holiday' :
                                                                            event.type === 'extraDay' ? 'Extra Day Earned' : 'CL Earned'}
                                                            </span>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0 ml-2">
                                      {event.type !== 'holiday' && (
                                          <>
                                            <button
                                                onClick={() => {
                                                  setEditingEvent(event);
                                                  setShowModal(true);
                                                }}
                                                className="p-1 sm:p-1.5 rounded hover:bg-gray-200 transition-colors"
                                            >
                                              <Edit3 size={10} className="text-gray-500 sm:w-3 sm:h-3" />
                                            </button>
                                            <button
                                                onClick={() => deleteEvent(event)}
                                                className="p-1 sm:p-1.5 rounded hover:bg-red-100 transition-colors"
                                            >
                                              <Trash2 size={10} className="text-red-500 sm:w-3 sm:h-3" />
                                            </button>
                                          </>
                                      )}
                                    </div>
                                  </div>
                                  <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">{event.title}</h4>
                                  {event.type === 'extraDay' && event.isMonthClaim && (
                                      <p className="text-purple-600 text-[10px] sm:text-xs font-medium">Claimed against month</p>
                                  )}
                                  {globalSearchTerm && (
                                      <p className="text-gray-500 text-[10px] sm:text-xs">
                                        {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                      </p>
                                  )}
                                  {event.description && (
                                      <p className="text-gray-600 text-[10px] sm:text-xs line-clamp-3">{event.description}</p>
                                  )}
                                  {event.type === 'leave' && event.consumedLeaveId && (
                                      <p className="text-gray-500 text-[10px] sm:text-xs mt-1">
                                        Used: {event.consumedLeaveDetails.type === 'extraDay' ? 'Extra Day' : 'Casual Leave'} ({new Date(event.consumedLeaveDetails.date + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                                      </p>
                                  )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 sm:py-8">
                              <Calendar className="text-gray-300 mx-auto mb-3" size={28} />
                              <p className="text-gray-500 text-xs sm:text-sm">
                                {globalSearchTerm ? 'No events match your search.' : (searchTerm ? 'No events match your search.' : 'No events for this date.')}
                              </p>
                            </div>
                        )}
                      </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                      <Calendar size={40} className="text-gray-300 mb-4 sm:w-12 sm:h-12" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Select a date</h3>
                      <p className="text-gray-600 text-xs sm:text-sm px-4">
                        Click on any date in the calendar to view and manage your events
                      </p>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal */}
          {showModal && (
              <EventModal
                  event={editingEvent}
                  onSave={editingEvent ? updateEvent : addEvent}
                  onCancel={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                  }}
                  leaveStats={leaveStats}
                  selectedDate={selectedDate}
              />
          )}

          {showClaimModal && (
              <ClaimDaysModal
                  onClaim={handleClaimDays}
                  onCancel={() => setShowClaimModal(false)}
                  availableExtraDays={leaveStats.availableExtraDaysEvents}
              />
          )}

          {breakdownModal.isOpen && (
              <LeaveBreakdownModal
                  title={breakdownModal.title}
                  icon={breakdownModal.icon}
                  tabs={breakdownModal.tabs}
                  onCancel={() => setBreakdownModal({ isOpen: false })}
              />
          )}

          {showConfirmModal && (
              <ConfirmationModal
                  message={confirmMessage}
                  onConfirm={() => {
                    confirmAction();
                    setShowConfirmModal(false);
                  }}
                  onCancel={() => setShowConfirmModal(false)}
              />
          )}
        </div>
      </div>
  );
};

const EventModal = ({ event, onSave, onCancel, leaveStats, selectedDate }) => {
  const [formData, setFormData] = useState({
    type: event?.type || 'note',
    title: event?.title || '',
    description: event?.description || '',
    leaveType: event?.type === 'leave'
        ? (event.leaveType === 'paid' ? 'paid' : String(event.consumedLeaveId))
        : (leaveStats.availableLeaveDays.length > 0
            ? String(leaveStats.availableLeaveDays[0].id)
            : 'paid')
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.title.trim()) {
      setValidationError('Please enter a title');
      return;
    }

    if (formData.type === 'leave' && formData.leaveType !== 'paid') {
      const selectedLeave = leaveStats.availableLeaveDays.find(day => day.id.toString() === formData.leaveType);
      if (!selectedLeave) {
        setValidationError('Please select a valid leave day.');
        return;
      }
    }

    onSave(formData);
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{event ? 'Edit Event' : 'Create Event'}</h3>
                {selectedDate && (
                    <p className="text-gray-500 text-sm">
                      For: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                )}
              </div>
            </div>
            <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
              <X className="text-gray-500" />
            </button>
          </div>

          {validationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <span className="block sm:inline text-sm">{validationError}</span>
              </div>
          )}

          <form id="event-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto -mx-4 px-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <div className="flex space-x-2 rounded-lg bg-gray-100 p-1">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'leave' }))} className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${formData.type === 'leave' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>Leave</button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'note' }))} className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${formData.type === 'note' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>Note</button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'extraDay' }))} className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${formData.type === 'extraDay' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>Extra Day</button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'addCasualLeave' }))} className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${formData.type === 'addCasualLeave' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>Add CL</button>
              </div>
            </div>

            {formData.type === 'leave' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                      value={formData.leaveType}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {leaveStats.availableLeaveDays.map(day => (
                        <option key={day.id} value={day.id}>
                          {day.type === 'extraDay' ? 'Extra Day' : 'Casual Leave'} - Earned on {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </option>
                    ))}
                    <option value="paid">Paid Leave</option>
                  </select>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={formData.type === 'leave' ? 'e.g., Vacation Day' : 'e.g., Team Meeting'}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              />
            </div>
          </form>

          <div className="flex gap-3 pt-6 mt-auto border-t border-gray-200">
            <button type="button" onClick={onCancel} className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" form="event-form" className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default App;
