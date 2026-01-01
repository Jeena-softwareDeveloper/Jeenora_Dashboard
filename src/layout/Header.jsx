
import React, { useState, useRef, useEffect } from 'react';
import { FaList, FaBell, FaEnvelope, FaCog, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/Reducers/authReducer';

import Profile from '../views/Profile';
import { FaTimes } from 'react-icons/fa';

const Header = ({ showSidebar, setShowSidebar }) => {
  const { userInfo } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  const handleLogout = async () => {
    await dispatch(logout({ navigate, role: userInfo.role }));
    setShowUserDropdown(false);
  };

  const handleProfile = () => {
    setShowUserDropdown(false);
    setShowProfileModal(true);
  };

  return (
    <>
      <header className="ml-0 h-[70px] flex justify-between items-center bg-gradient-to-r from-primary-green to-green-600 px-6 transition-all shadow-lg border-b border-green-200/20">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 shadow-md hover:shadow-lg flex justify-center items-center cursor-pointer text-white transition-all duration-200 hover:scale-105"
            aria-label="Toggle sidebar"
          >
            <FaList className="text-lg" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border border-white/50">
                {userInfo.image ? (
                  <img src={userInfo.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-white" />
                )}
              </div>
              <div className="text-left flex flex-col">
                <span className="text-white text-sm font-medium leading-tight">{userInfo.name || 'User'}</span>
              </div>
              <FaChevronDown className={`text-white transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in-down">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-800">{userInfo.name}</p>
                  <p className="text-sm text-gray-600 truncate">{userInfo.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <FaUser />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-scale-in">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors z-10 bg-white rounded-full p-1 shadow-sm border border-gray-100"
            >
              <FaTimes size={20} />
            </button>
            <div className="p-1">
              <Profile />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;