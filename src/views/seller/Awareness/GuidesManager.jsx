// components/Awareness/GuidesManager.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addCategory, getCategories, deleteCategory,
  addGuide, getGuides, updateGuide, deleteGuide,
  toggleGuideStatus, clearMessages
} from '../../../store/Reducers/Awareness/guideReducer';
import { Plus, Edit, Trash2, Eye, EyeOff, X, Search, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import useConfirmDialog from '../../../utils/useConfirmDialog';

const GuidesManager = () => {
  const dispatch = useDispatch();
  const { categories, guides, loader, success, error } = useSelector(state => state.guide);
  const { dialogConfig, showDialog } = useConfirmDialog();

  // ---------------- State ----------------
  const [categoryName, setCategoryName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [guideData, setGuideData] = useState({
    heading: '', level: '', secondHeading: '', description: '', categoryId: '', image: null
  });

  // ---------------- Constants ----------------
  const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

  // ---------------- Effects ----------------
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getGuides());
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

  // ---------------- Filter Guides ----------------
  const filteredGuides = useMemo(() => {
    if (!guides) return [];
    
    if (!searchTerm) return guides;
    
    return guides.filter(guide =>
      guide.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.secondHeading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guides, searchTerm]);

  // ---------------- Handlers ----------------
  // Category
  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    dispatch(addCategory(categoryName));
    setCategoryName('');
  };

  const handleDeleteCategory = (id) => {
    showDialog({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      onConfirm: () => {
        dispatch(deleteCategory(id));
      }
    });
  };

  // Guide Form
  const openGuideModal = (guide = null) => {
    if (guide) {
      setEditingGuide(guide);
      setGuideData({
        heading: guide.heading || '',
        level: guide.level || '',
        secondHeading: guide.secondHeading || '',
        description: guide.description || '',
        categoryId: guide.category?._id || '',
        image: null
      });
    } else {
      setEditingGuide(null);
      setGuideData({
        heading: '', level: '', secondHeading: '', description: '', categoryId: '', image: null
      });
    }
    setShowModal(true);
    setMobileMenuOpen(null);
  };

  const closeGuideModal = () => {
    setShowModal(false);
    setEditingGuide(null);
    setGuideData({ heading: '', level: '', secondHeading: '', description: '', categoryId: '', image: null });
  };

  const handleGuideChange = (e) => {
    const { name, value, files } = e.target;
    setGuideData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleAddOrUpdateGuide = (e) => {
    e.preventDefault();
    if (!guideData.categoryId || !guideData.heading.trim() || !guideData.level || !guideData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    Object.entries(guideData).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    if (editingGuide) {
      dispatch(updateGuide({ id: editingGuide._id, formData }));
    } else {
      dispatch(addGuide(formData));
    }

    closeGuideModal();
  };

  // Delete guide
  const handleDeleteGuide = (id) => {
    showDialog({
      title: 'Delete Guide',
      message: 'Are you sure you want to delete this guide? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      onConfirm: () => {
        dispatch(deleteGuide(id));
      }
    });
    setMobileMenuOpen(null);
  };

  // Toggle active/inactive
  const handleToggleStatus = (guide) => {
    const action = guide.isActive ? 'deactivate' : 'activate';
    
    showDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Guide`,
      message: `Are you sure you want to ${action} this guide?`,
      type: 'warning',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: () => {
        dispatch(toggleGuideStatus(guide._id));
      }
    });
    setMobileMenuOpen(null);
  };

  return (
    <div className=" bg-green-50 p-4 sm:p-6 space-y-6">

      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8">
        <div className="w-full lg:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Guides Manager</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage guide categories and content</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
            />
          </div>
        </div>
      </div>

      {/* ---------------- Category Section ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Categories</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
          />
          <button 
            onClick={handleAddCategory} 
            className="bg-[#236F21] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors flex items-center gap-2 justify-center shadow-sm text-sm sm:text-base"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Category</span>
          </button>
        </div>
        
        <div className="space-y-2">
          {categories.map(c => (
            <div key={c._id} className="flex justify-between items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900 text-sm sm:text-base">{c.name}</span>
              <button 
                onClick={() => handleDeleteCategory(c._id)} 
                className="text-red-600 hover:bg-red-50 px-2 sm:px-3 py-1 rounded-lg transition-colors border border-red-600 hover:border-red-700 flex items-center gap-1 sm:gap-2 text-sm"
              >
                <Trash2 size={14} className="sm:w-4 sm:h-4"/>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Guides Section ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-0">All Guides</h2>
          <button 
            onClick={() => openGuideModal()} 
            className="bg-[#236F21] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors flex items-center gap-2 justify-center shadow-sm w-full sm:w-auto text-sm sm:text-base"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Guide</span>
          </button>
        </div>

        {/* ---------------- Guides Table ---------------- */}
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
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Category</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Heading</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Level</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Second Heading</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Description</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Image</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Status</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuides.map(g => (
                    <tr key={g._id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${!g.isActive ? 'bg-gray-50 opacity-80' : ''}`}>
                      <td className="p-4 text-gray-900 font-medium">{g.category?.name}</td>
                      <td className="p-4 text-gray-900 max-w-xs truncate">{g.heading}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          g.level === 'Beginner' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : g.level === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {g.level}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 max-w-xs truncate">{g.secondHeading}</td>
                      <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{g.description}</td>
                      <td className="p-4">
                        {g.image && (
                          <img 
                            src={g.image} 
                            alt={g.heading} 
                            className="w-20 h-14 object-cover rounded-lg border border-gray-200" 
                          />
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(g)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            g.isActive
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {g.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openGuideModal(g)} 
                            className="p-2 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteGuide(g._id)} 
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
            <div className="lg:hidden p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-sm">
              Guide List ({filteredGuides.length})
            </div>

            {/* Card Layout for Mobile/Tablet */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {filteredGuides.map((g) => (
                  <div key={g._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Card Content */}
                    <div className="p-4">
                      {/* Image and Basic Info Row */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Guide Image */}
                        <div className="flex-shrink-0">
                          {g.image && (
                            <img 
                              src={g.image} 
                              alt={g.heading} 
                              className="w-16 h-12 object-cover rounded-lg border border-gray-200" 
                            />
                          )}
                        </div>

                        {/* Heading and Status */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{g.heading}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              g.level === 'Beginner' 
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : g.level === 'Intermediate'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {g.level}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              g.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {g.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Category and Second Heading */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="font-medium">{g.category?.name}</span>
                          {g.secondHeading && (
                            <span className="text-gray-500 truncate ml-2">{g.secondHeading}</span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-2">
                        <p className="text-gray-600 text-xs line-clamp-2">{g.description}</p>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleToggleStatus(g)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            g.isActive
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {g.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openGuideModal(g)}
                            className="p-1.5 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteGuide(g._id)}
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
        {filteredGuides.length === 0 && !loader && (
          <div className="text-center py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No guides found' : 'No guides yet'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Get started by creating your first guide'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => openGuideModal()}
                className="bg-[#236F21] text-white px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm text-sm sm:text-base"
              >
                Create Guide
              </button>
            )}
          </div>
        )}
      </div>

      {/* ---------------- Guide Modal ---------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2 sm:mx-4">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editingGuide ? 'Edit Guide' : 'Create New Guide'}
              </h2>
              <button 
                onClick={closeGuideModal} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddOrUpdateGuide} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={guideData.categoryId}
                  name="categoryId"
                  onChange={handleGuideChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="heading" 
                  value={guideData.heading} 
                  onChange={handleGuideChange} 
                  placeholder="Enter guide heading" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={guideData.level}
                  name="level"
                  onChange={handleGuideChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  required
                >
                  <option value="">Select Level</option>
                  {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second Heading
                </label>
                <input 
                  type="text" 
                  name="secondHeading" 
                  value={guideData.secondHeading} 
                  onChange={handleGuideChange} 
                  placeholder="Enter second heading" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="description" 
                  value={guideData.description} 
                  onChange={handleGuideChange} 
                  placeholder="Enter guide description" 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <input 
                  type="file" 
                  name="image" 
                  onChange={handleGuideChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200 mt-6">
                <button 
                  type="button" 
                  onClick={closeGuideModal} 
                  className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loader}
                  className="bg-[#236F21] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#1B5C1A] disabled:opacity-50 transition-colors flex items-center gap-2 justify-center shadow-sm text-sm sm:text-base order-1 sm:order-2"
                >
                  {loader && <Loader size={16} className="animate-spin" />}
                  {editingGuide ? 'Update Guide' : 'Create Guide'}
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

export default GuidesManager;