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
    TrendingUp,
    Award,
    AlertTriangle
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
    const [googleUser, setGoogleUser] = useState(null);

    // ONLY ADDITION: User state and mandatory login
    const [currentUser, setCurrentUser] = useState(null);
    const [showLogin, setShowLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const API_BASE_URL = 'https://a3sd.fullformsdirectory.com/api.php';

    // ONLY ADDITION: Database sync (works silently in background)
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
                await loadUserData(currentUser.id); // Re-fetch all data after successful sync
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
                setLeaveBalance({ casualLeave: 12, extraDays: 0 }); // Use default if API fails or no balance exists
                console.warn('Failed to load leave balance, using defaults:', await leaveBalanceResponse.text());
            }

        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };
    
    // ONLY ADDITION: Login function
    const handleLogin = async (email, name) => {
        setLoading(true);
        try {
            const response = await fetch('https://a3sd.fullformsdirectory.com/api.php/login', {
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
                toast.error('Invalid email or name. Please check your credentials.');
            }
        } catch (error) {
            toast.error('Login failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // ONLY ADDITION: Logout function
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

    // ONLY ADDITION: Check if user is already logged in
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

    const CLIENT_ID = '784762823694-lv6b66f7ggmbi369gcqua0m3ik7lkpre.apps.googleusercont';

    useEffect(() => {
        /* global google */
        if (window.google) {
            google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleCredentialResponse,
            });

            google.accounts.id.renderButton(
                document.getElementById('google-sign-in-button'),
                { theme: 'outline', size: 'large', width: '100%' }
            );
        }
    }, []);

    const handleCredentialResponse = (response) => {
        if (response.credential) {
            const decoded = jwt_decode(response.credential);
            setGoogleUser(decoded);
            toast.success(`Logged in as ${decoded.name}`);
        }
    };

    const handleSignOut = () => {
        setGoogleUser(null);
        toast.success('Signed out from Google');
    };

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
                // Don't clear holidays for other years if one year fails
                // setPublicHolidays([]); 
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

        const casualUsedCount = earnedCasualLeaveEvents.filter(event => consumedLeaveIds.has(event.id)).length;
        const extraUsedCount = earnedExtraDayEvents.filter(event => consumedLeaveIds.has(event.id)).length;

        const casualRemaining = earnedCasualLeaveEvents.length - casualUsedCount;
        const extraRemaining = earnedExtraDayEvents.length - extraUsedCount;

        const availableLeaveDays = [
            ...earnedExtraDayEvents.filter(event => !consumedLeaveIds.has(event.id)),
            ...earnedCasualLeaveEvents.filter(event => !consumedLeaveIds.has(event.id))
        ];

        return {
            casualUsed: casualUsedCount,
            extraUsed: extraUsedCount,
            casualLeaveEarned: earnedCasualLeaveEvents.length,
            casualRemaining: casualRemaining,
            extraDaysEarned: earnedExtraDayEvents.length,
            extraRemaining: extraRemaining,
            totalUsed: leaveEvents.length,
            availableLeaveDays
        };
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

        // ONLY ADDITION: Sync to database
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
        const dateKey = selectedDate;
    
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
    
        // Sync to database
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

    const deleteEvent = async (eventId) => {
        const dateKey = selectedDate;
        
        setEvents(prev => ({
            ...prev,
            [dateKey]: prev[dateKey].filter(event => event.id !== eventId)
        }));

        // Sync to database
        await syncToDatabase('delete_event', { id: eventId });
    };

    const addExtraDay = () => {
        setLeaveBalance(prev => ({
            ...prev,
            extraDays: prev.extraDays + 1
        }));
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
            return allEvents.filter(event =>
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

    // Login Modal Component
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

                    {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Test Credentials:</p>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>• pratik@gmail.com / Pratik</p>
                            <p>• admin@gmail.com / Admin</p>
                            <p>• test@gmail.com / Test User</p>
                        </div>
                    </div> */}
                </div>
            </div>
        );
    };

    // If not logged in, show login modal
    if (showLogin) {
        return <LoginModal handleLogin={handleLogin} loading={loading} />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="max-w-screen-2xl mx-auto p-6">
                {/* Header */}
                <div className="card p-6 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-center">
                        <div className="flex items-center gap-4 mb-6 lg:mb-0">
                            <div className="p-3 bg-blue-500 rounded-xl">
                                <CalendarDays className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Leave Tracker</h1>
                                <p className="text-gray-600">Welcome back, {currentUser?.name}!</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Global Search..."
                                    value={globalSearchTerm}
                                    onChange={(e) => setGlobalSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button onClick={goToToday} className="btn-primary">
                                <Clock size={16} />
                                Today
                            </button>
                            <button onClick={exportData} className="btn-secondary">
                                <Download size={16} />
                                Export
                            </button>
                            <label className="btn-secondary cursor-pointer">
                                <Upload size={16} />
                                Import
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={importData}
                                    className="hidden"
                                />
                            </label>
                            <button onClick={clearAllData} className="btn-danger">
                                <RotateCcw size={16} />
                                Clear
                            </button>
                            {/* ONLY ADDITION: Logout button */}
                            <button 
                                onClick={handleLogout}
                                className="btn-secondary"
                            >
                                <User size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Leave Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar size={20} className="text-blue-600" />
                            </div>
                            <span className="text-gray-600 font-medium">Casual Leave</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {leaveStats.casualRemaining}/{leaveStats.casualLeaveEarned}
                        </div>
                        <div className="text-sm text-gray-500">Remaining/Total</div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Award size={20} className="text-green-600" />
                            </div>
                            <span className="text-gray-600 font-medium">Extra Days</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {leaveStats.extraRemaining}/{leaveStats.extraDaysEarned}
                        </div>
                        <div className="text-sm text-gray-500">Available/Earned</div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText size={20} className="text-purple-600" />
                            </div>
                            <span className="text-gray-600 font-medium">Total Used</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{leaveStats.totalUsed}</div>
                        <div className="text-sm text-gray-500">This year</div>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="card p-6 mb-6">
                    <div className="flex justify-center items-center gap-8">
                        <button onClick={goToPreviousMonth} className="nav-btn">
                            <ChevronLeft size={24} />
                        </button>
                        <div className={`text-center transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <p className="text-gray-600">Click on any date to manage events</p>
                        </div>
                        <button onClick={goToNextMonth} className="nav-btn">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <div className="card p-6">
                            <div className="calendar-grid">
                                {/* Day headers */}
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center font-semibold text-gray-600 p-3 text-sm">
                                        {day}
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
                                                calendar-day
                                                ${!date ? 'empty' : ''}
                                                ${isToday(date) ? 'today' : ''}
                                                ${isSelected(date) ? 'selected' : ''}
                                                ${leaveEvent ? 'has-leave' : ''}
                                                ${holidayEvent ? 'has-holiday' : ''}
                                                ${isWeekend(date) ? 'weekend' : ''}
                                            `}
                                            onClick={() => handleDateClick(date)}
                                        >
                                            {date && (
                                                <>
                                                    <span className="day-number">{date.getDate()}</span>
                                                    {leaveEvent && (
                                                        <div className={`leave-indicator ${leaveEvent.leaveType}`}>
                                                            {leaveEvent.leaveType === 'casual' ? 'CL' :
                                                                leaveEvent.leaveType === 'extra' ? 'EX' :
                                                                    leaveEvent.leaveType === 'paid' ? 'PL' : 'SL'}
                                                        </div>
                                                    )}
                                                    {holidayEvent && (
                                                        <div className="holiday-indicator" title={holidayEvent.title}>
                                                            {holidayEvent.title.substring(0, 10)}...
                                                        </div>
                                                    )}
                                                    {dayEvents.filter(e => e.type === 'note').length > 0 && (
                                                        <div className="note-dot"></div>
                                                    )}
                                                    {dayEvents.filter(e => e.type === 'extraDay').length > 0 && (
                                                        <div className="extra-day-dot"></div>
                                                    )}
                                                    {dayEvents.filter(e => e.type === 'addCasualLeave').length > 0 && (
                                                        <div className="casual-leave-dot"></div>
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
                        <div className="card p-6 max-h-[700px] flex flex-col">
                            {(selectedDate || globalSearchTerm) ? (
                                <>
                                    {/* Sidebar Header */}
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {globalSearchTerm ? 'Search Results' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </h3>
                                            {!globalSearchTerm && selectedDate && (
                                                <p className="text-gray-600 text-sm">
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
                                            className="btn-primary-sm"
                                            disabled={globalSearchTerm} // Disable if global search is active
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {/* Search */}
                                    <div className="relative mb-6">
                                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search events..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={globalSearchTerm} // Disable if global search is active
                                        />
                                    </div>

                                    {/* Events List */}
                                    <div className="flex-1 overflow-y-auto space-y-3">
                                        {filteredEvents.length > 0 ? (
                                            filteredEvents.map(event => (
                                                <div key={event.id} className={`event-card ${event.type}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`event-icon ${event.type}`}>
                                                                {event.type === 'leave' ? <User size={14} /> :
                                                                    event.type === 'note' ? <FileText size={14} /> :
                                                                        event.type === 'holiday' ? <Calendar size={14} /> :
                                                                            event.type === 'extraDay' ? <Award size={14} /> :
                                                                                event.type === 'addCasualLeave' ? <User size={14} /> : <FileText size={14} />}
                                                            </div>
                                                            <span className={`event-badge ${event.type}`}>
                                                                {event.type === 'leave' ?
                                                                    (event.consumedLeaveId ?
                                                                        (event.consumedLeaveDetails?.type === 'extraDay' ? 'EX' : 'CL') :
                                                                        'Paid') :
                                                                    event.type === 'note' ? 'Note' :
                                                                        event.type === 'holiday' ? 'Holiday' :
                                                                            event.type === 'extraDay' ? 'Extra Day Earned' : 'CL Earned'}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {event.type !== 'holiday' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingEvent(event);
                                                                            setShowModal(true);
                                                                        }}
                                                                        className="icon-btn"
                                                                    >
                                                                        <Edit3 size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteEvent(event.id)}
                                                                        className="icon-btn text-red-500 hover:text-red-700"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h4>
                                                    {globalSearchTerm && (
                                                        <p className="text-gray-500 text-xs">
                                                            {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </p>
                                                    )}
                                                    {event.description && (
                                                        <p className="text-gray-600 text-xs">{event.description}</p>
                                                    )}
                                                    {event.type === 'leave' && event.consumedLeaveId && (
                                                        <p className="text-gray-500 text-xs mt-1">
                                                            Used: {event.consumedLeaveDetails.type === 'extraDay' ? 'Extra Day' : 'Casual Leave'} ({new Date(event.consumedLeaveDetails.date + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Calendar className="text-gray-300 mx-auto mb-3" size={32} />
                                                <p className="text-gray-500 text-sm">
                                                    {globalSearchTerm ? 'No events match your search.' : (searchTerm ? 'No events match your search.' : 'No events for this date.')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <Calendar size={48} className="text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a date</h3>
                                    <p className="text-gray-600 text-sm">
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
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="text-blue-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {event ? 'Edit Event' : 'Create Event'}
                    </h3>
                    {selectedDate && (
                        <p className="text-gray-600 text-sm mb-4">
                            For: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    )}
                </div>

                {validationError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{validationError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Event Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div
                                className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${
                                    formData.type === 'leave'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, type: 'leave' }))}
                            >
                                <User size={20} className="mx-auto mb-2 text-blue-600" />
                                <span className="text-sm font-medium">Leave</span>
                            </div>
                            <div
                                className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${
                                    formData.type === 'note'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, type: 'note' }))}
                            >
                                <FileText size={20} className="mx-auto mb-2 text-blue-600" />
                                <span className="text-sm font-medium">Note</span>
                            </div>
                            <div
                                className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${
                                    formData.type === 'extraDay'
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, type: 'extraDay' }))}
                            >
                                <Award size={20} className="mx-auto mb-2 text-green-600" />
                                <span className="text-sm font-medium">Extra Day</span>
                            </div>
                            <div
                                className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${
                                    formData.type === 'addCasualLeave'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, type: 'addCasualLeave' }))}
                            >
                                <User size={20} className="mx-auto mb-2 text-blue-600" />
                                <span className="text-sm font-medium">Add Casual Leave</span>
                            </div>
                        </div>
                    </div>

                    {/* Leave Type (only for leave) */}
                    {formData.type === 'leave' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Leave Type</label>
                            <select
                                value={formData.leaveType}
                                onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder={formData.type === 'leave' ? 'e.g., Vacation Day' : 'e.g., Team Meeting'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Additional details..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1 justify-center">
                            {event ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};



export default App;