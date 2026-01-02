import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
  toggleAccountStatus,
  clearMessages
} from '../../../store/Reducers/Awareness/accountReducer';
import { Plus, Edit, Trash2, X, Search, Loader, Twitter, Facebook, Instagram, Youtube, Linkedin, Phone, Mail, MapPin, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import useConfirmDialog from '../../../utils/useConfirmDialog';

const AccountsManager = () => {
  const dispatch = useDispatch();
  const { accounts, loader, error, success } = useSelector(state => state.accounts);
  const { dialogConfig, showDialog } = useConfirmDialog();

  const [form, setForm] = useState({
    name: '',
    area: '',
    twitter: '',
    facebook: '',
    instagram: '',
    phoneNumber: '',
    email: '',
    linkedin: '',
    youtube: '',
    role: 'User',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);

  useEffect(() => {
    dispatch(getAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [success, error, dispatch]);

  // Filter accounts based on search
  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];

    if (!searchTerm) return accounts;

    return accounts.filter(account =>
      account.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.twitter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.facebook?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.instagram?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.phoneNumber?.includes(searchTerm) ||
      account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.linkedin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.youtube?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.area?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateAccount({ id: editingId, info: form }));
    } else {
      dispatch(addAccount(form));
    }
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setForm({
      name: '',
      area: '',
      twitter: '',
      facebook: '',
      instagram: '',
      phoneNumber: '',
      email: '',
      linkedin: '',
      youtube: '',
      role: 'User',
      isActive: true
    });
    setEditingId(null);
  };

  const openModal = (account = null) => {
    if (account) {
      setEditingId(account._id);
      setForm({
        name: account.name || '',
        area: account.area || '',
        twitter: account.twitter || '',
        facebook: account.facebook || '',
        instagram: account.instagram || '',
        phoneNumber: account.phoneNumber || '',
        email: account.email || '',
        linkedin: account.linkedin || '',
        youtube: account.youtube || '',
        role: account.role || 'User',
        isActive: account.isActive ?? true
      });
    } else {
      resetForm();
    }
    setShowModal(true);
    setMobileMenuOpen(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id) => {
    showDialog({
      title: 'Delete Account',
      message: 'Are you sure you want to delete this account? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      onConfirm: () => {
        dispatch(deleteAccount(id));
      }
    });
    setMobileMenuOpen(null);
  };

  const handleToggleActive = (account) => {
    const action = account.isActive ? 'deactivate' : 'activate';

    showDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account`,
      message: `Are you sure you want to ${action} this account?`,
      type: 'warning',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: () => {
        dispatch(toggleAccountStatus(account._id));
      }
    });
    setMobileMenuOpen(null);
  };

  // Copy URL to clipboard - ONLY for social media
  const copyToClipboard = async (text, platform, accountId) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(`${accountId}-${platform}`);
      toast.success(`${platform} URL copied to clipboard!`);

      setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  // Social Media Icon Component with Copy Functionality
  const SocialIcon = ({ platform, url, size = 16, accountId }) => {
    const isCopied = copiedItem === `${accountId}-${platform}`;

    const handleClick = () => {
      if (url) {
        copyToClipboard(url, platform, accountId);
      }
    };

    if (!url) {
      return (
        <div className={`w-${size} h-${size} bg-gray-200 rounded-full flex items-center justify-center`}>
          {platform === 'twitter' && <Twitter size={size - 4} className="text-gray-400" />}
          {platform === 'facebook' && <Facebook size={size - 4} className="text-gray-400" />}
          {platform === 'instagram' && <Instagram size={size - 4} className="text-gray-400" />}
          {platform === 'youtube' && <Youtube size={size - 4} className="text-gray-400" />}
          {platform === 'linkedin' && <Linkedin size={size - 4} className="text-gray-400" />}
        </div>
      );
    }

    return (
      <button
        onClick={handleClick}
        className={`p-1 rounded-full transition-colors ${isCopied
          ? 'bg-green-100 text-green-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        title={`Copy ${platform} URL`}
      >
        {isCopied ? (
          <Check size={size} />
        ) : (
          <>
            {platform === 'twitter' && <Twitter size={size} className="transition-all duration-200 hover:scale-110" />}
            {platform === 'facebook' && <Facebook size={size} className="transition-all duration-200 hover:scale-110" />}
            {platform === 'instagram' && <Instagram size={size} className="transition-all duration-200 hover:scale-110" />}
            {platform === 'youtube' && <Youtube size={size} className="transition-all duration-200 hover:scale-110" />}
            {platform === 'linkedin' && <Linkedin size={size} className="transition-all duration-200 hover:scale-110" />}
          </>
        )}
      </button>
    );
  };

  return (
    <div className=" bg-green-50 p-4 sm:p-6">

      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8">
        <div className="w-full lg:w-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Accounts Manager</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage social media accounts and contact information</p>
          </div>
          {/* Mobile Add Button (Icon Only) */}
          <button
            onClick={() => openModal()}
            className="lg:hidden bg-[#236F21] text-white p-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm ml-4 flex-shrink-0"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="hidden lg:flex bg-[#236F21] text-white px-4 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors items-center gap-2 justify-center shadow-sm"
          >
            <Plus size={20} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* ---------------- Accounts Table ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loader ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-[#236F21]" size={40} />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Name</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Area</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Role</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Phone</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Email</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">
                      <Twitter size={18} className="inline" />
                    </th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">
                      <Facebook size={18} className="inline" />
                    </th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">
                      <Instagram size={18} className="inline" />
                    </th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">
                      <Linkedin size={18} className="inline" />
                    </th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">
                      <Youtube size={18} className="inline" />
                    </th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Status</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map(account => (
                    <tr key={account._id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${!account.isActive ? 'bg-gray-50 opacity-80' : ''}`}>
                      <td className="p-4 text-gray-900 font-medium text-center">{account.name}</td>
                      <td className="p-4 text-gray-900 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <MapPin size={14} className="text-gray-400" />
                          {account.area}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${account.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : account.role === 'Staff'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : account.role === 'Customer'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                            {account.role}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-900 text-center">
                        {account.phoneNumber}
                      </td>
                      <td className="p-4 text-gray-900 text-center max-w-xs truncate">
                        {account.email}
                      </td>
                      {/* Social Media Columns - Click to Copy */}
                      <td className="p-4 text-center">
                        <SocialIcon platform="twitter" url={account.twitter} size={18} accountId={account._id} />
                      </td>
                      <td className="p-4 text-center">
                        <SocialIcon platform="facebook" url={account.facebook} size={18} accountId={account._id} />
                      </td>
                      <td className="p-4 text-center">
                        <SocialIcon platform="instagram" url={account.instagram} size={18} accountId={account._id} />
                      </td>
                      <td className="p-4 text-center">
                        <SocialIcon platform="linkedin" url={account.linkedin} size={18} accountId={account._id} />
                      </td>
                      <td className="p-4 text-center">
                        <SocialIcon platform="youtube" url={account.youtube} size={18} accountId={account._id} />
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleToggleActive(account)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${account.isActive
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                          >
                            {account.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openModal(account)}
                            className="p-2 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-600 hover:border-red-700"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-sm text-left">
              Account List ({filteredAccounts.length})
            </div>

            {/* Card Layout for Mobile/Tablet */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {filteredAccounts.map((account) => (
                  <div key={account._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-4">
                      {/* Top Row: Name (Left) and Badges (Right) */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{account.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${account.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : account.role === 'Staff'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : account.role === 'Customer'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                            {account.role}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${account.isActive
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Middle Grid: Left (Area, Phone) | Right (Email, Socials) */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {/* Left Column */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{account.area || 'No Area'}</span>
                          </div>
                          {account.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Phone size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{account.phoneNumber}</span>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2 flex flex-col items-end">
                          {account.email && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 justify-end w-full">
                              <span className="truncate">{account.email}</span>
                              <Mail size={12} className="text-gray-400 flex-shrink-0" />
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 justify-end flex-wrap">
                            <SocialIcon platform="twitter" url={account.twitter} size={14} accountId={account._id} />
                            <SocialIcon platform="facebook" url={account.facebook} size={14} accountId={account._id} />
                            <SocialIcon platform="instagram" url={account.instagram} size={14} accountId={account._id} />
                            <SocialIcon platform="linkedin" url={account.linkedin} size={14} accountId={account._id} />
                            <SocialIcon platform="youtube" url={account.youtube} size={14} accountId={account._id} />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleToggleActive(account)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${account.isActive
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                          {account.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(account)}
                            className="p-1.5 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-600 hover:border-red-700"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {filteredAccounts.length === 0 && !loader && (
          <div className="text-center py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No accounts found' : 'No accounts yet'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first account'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="bg-[#236F21] text-white px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm text-sm sm:text-base"
              >
                Create Account
              </button>
            )}
          </div>
        )}
      </div>

      {/* ---------------- Modal ---------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2 sm:mx-4 flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editingId ? 'Edit Account' : 'Create New Account'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Jeenora"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    placeholder="Chennai"
                    value={form.area}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Twitter size={16} className="inline mr-2" />
                    Twitter URL
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    placeholder="https://twitter.com/username"
                    value={form.twitter}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Facebook size={16} className="inline mr-2" />
                    Facebook URL
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    placeholder="https://facebook.com/username"
                    value={form.facebook}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Instagram size={16} className="inline mr-2" />
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    placeholder="https://instagram.com/username"
                    value={form.instagram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Linkedin size={16} className="inline mr-2" />
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={form.linkedin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Youtube size={16} className="inline mr-2" />
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    name="youtube"
                    placeholder="https://youtube.com/username"
                    value={form.youtube}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="+1234567890"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="User">User</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#236F21] border-gray-300 rounded focus:ring-[#236F21]"
                />
                <label className="text-sm font-medium text-gray-700">Active Account</label>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loader}
                  className="flex-1 sm:flex-none bg-[#236F21] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#1B5C1A] disabled:opacity-50 transition-colors flex items-center gap-2 justify-center shadow-sm text-sm sm:text-base"
                >
                  {loader && <Loader size={16} className="animate-spin" />}
                  {editingId ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      <ConfirmDialog {...dialogConfig} />
    </div>
  );
};

export default AccountsManager;