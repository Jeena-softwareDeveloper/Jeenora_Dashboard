
import React, { useState, useRef, useEffect } from 'react';
import { FaList, FaSearch, FaBell, FaEnvelope, FaCog, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Header = ({ showSidebar, setShowSidebar }) => {
  const { userInfo } = useSelector(state => state.auth);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock data for notifications and messages
  useEffect(() => {
    setNotifications([
      { id: 1, text: 'New order received', time: '5 min ago', unread: true },
      { id: 2, text: 'System update completed', time: '1 hour ago', unread: true },
      { id: 3, text: 'Payment processed', time: '2 hours ago', unread: false }
    ]);

    setMessages([
      { id: 1, text: 'Welcome to the platform!', time: '1 day ago', unread: true },
      { id: 2, text: 'Your profile needs update', time: '2 days ago', unread: false }
    ]);
  }, []);

  const unreadNotifications = notifications.filter(n => n.unread).length;
  const unreadMessages = messages.filter(m => m.unread).length;

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
  };

  const handleProfile = () => {
    // Navigate to profile
    console.log('Navigate to profile');
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log('Navigate to settings');
  };

  return (
    <header className="ml-0 h-[70px] flex justify-between items-center bg-gradient-to-r from-primary-green to-green-600 px-6 transition-all shadow-lg border-b border-green-200/20">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 shadow-md hover:shadow-lg flex justify-center items-center cursor-pointer text-white transition-all duration-200 hover:scale-105"
          aria-label="Toggle sidebar"
        >
          <FaList className="text-lg" />
        </button>

        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-green-100 text-sm">Welcome back, {userInfo.name}!</p>
        </div>

        <div className="hidden md:block relative">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
            <input
              className="pl-10 pr-4 py-2 w-64 outline-none border bg-white/90 border-green-300 rounded-lg text-gray-700 placeholder-green-600 focus:bg-white focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-300"
              type="text"
              name="search"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">

        <div className="relative group">
          <button className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex justify-center items-center text-white transition-all duration-200 hover:scale-110 relative">
            <FaBell className="text-lg" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>

          <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <p className="text-sm text-gray-600">{unreadNotifications} unread</p>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.map(notification => (
                <div key={notification.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}>
                  <p className="text-sm text-gray-800">{notification.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
            <div className="p-2 text-center">
              <button className="text-sm text-primary-green hover:text-green-700 font-medium">
                View All Notifications
              </button>
            </div>
          </div>
        </div>

        <div className="relative group">
          <button className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex justify-center items-center text-white transition-all duration-200 hover:scale-110 relative">
            <FaEnvelope className="text-lg" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadMessages}
              </span>
            )}
          </button>
        </div>


        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="text-end text-white hidden sm:block">
                <h2 className="text-sm font-semibold leading-tight">{userInfo.name}</h2>
                <span className="text-xs text-green-100 capitalize">{userInfo.role}</span>
              </div>

              <div className="relative">
                {userInfo.role === "admin" ? (
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white/50 group-hover:border-white transition-all duration-200 shadow-md"
                    src="/images/admin.jpg"
                    alt="Admin"
                  />
                ) : (
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white/50 group-hover:border-white transition-all duration-200 shadow-md"
                    src={userInfo.image}
                    alt="User"
                  />
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>

              <FaChevronDown className={`text-white text-sm transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 top-14 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                <p className="text-sm text-gray-500 capitalize">{userInfo.role}</p>
              </div>

              <button
                onClick={handleProfile}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <FaUser className="text-gray-400" />
                Profile
              </button>


              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <FaSignOutAlt className="text-red-400" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;