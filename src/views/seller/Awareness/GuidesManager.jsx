// components/Awareness/GuidesManager.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addCategory, getCategories, deleteCategory,
  addGuide, getGuides, updateGuide, deleteGuide,
  toggleGuideStatus, clearMessages
} from '../../../store/Reducers/Awareness/guideReducer';
import { Plus, Edit, Trash2, X, Search, Loader, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import useConfirmDialog from '../../../utils/useConfirmDialog';

const GuidesManager = () => {
  const dispatch = useDispatch();
  const { categories, guides, loader, success, error } = useSelector(state => state.guide);
  const { dialogConfig, showDialog } = useConfirmDialog();

  // ---------------- State ----------------
  const [activeTab, setActiveTab] = useState('guides');
  const [categoryName, setCategoryName] = useState('');
  const [showModal, setShowModal] = useState(false); // Guide Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false); // New Category Modal (to match UI)
  const [editingGuide, setEditingGuide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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
    let filtered = guides || [];

    if (selectedCategory) {
      filtered = filtered.filter(g => g.category?._id === selectedCategory);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(guide =>
        guide.heading?.toLowerCase().includes(lower) ||
        guide.level?.toLowerCase().includes(lower) ||
        guide.secondHeading?.toLowerCase().includes(lower) ||
        guide.description?.toLowerCase().includes(lower) ||
        guide.category?.name?.toLowerCase().includes(lower)
      );
    }

    return filtered;
  }, [guides, searchTerm, selectedCategory]);

  // ---------------- Handlers ----------------
  // Category
  const handleAddCategory = (e) => {
    e?.preventDefault(); // Handle form submit
    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    dispatch(addCategory(categoryName));
    setCategoryName('');
    setShowCategoryModal(false);
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
  };

  const handleCreateButtonClick = () => {
    if (activeTab === 'guides') {
      openGuideModal();
    } else {
      setShowCategoryModal(true);
    }
  };

  return (
    <div className="bg-gray-50 p-3 sm:p-4 md:p-6 min-h-screen">
      {/* ---------------- Header Section ---------------- */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Row 1: Title & Mobile Create Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Guides Manager</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage guides and categories</p>
          </div>

          <button
            onClick={handleCreateButtonClick}
            className="sm:hidden bg-[#236F21] text-white p-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Row 2: Search & Desktop Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className={`relative w-full sm:w-96 ${activeTab !== 'guides' ? 'invisible sm:visible' : ''}`}>
            {activeTab === 'guides' && (
              <>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] bg-white"
                />
              </>
            )}
          </div>

          <button
            onClick={handleCreateButtonClick}
            className="hidden sm:flex items-center gap-2 bg-[#236F21] text-white px-6 py-2.5 rounded-lg hover:bg-[#1B5C1A] transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            <span>{activeTab === 'guides' ? 'New Guide' : 'New Category'}</span>
          </button>
        </div>
      </div>

      {/* ---------------- Tabs & Filter Row ---------------- */}

      <div className="flex justify-between items-center border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('guides')}
            className={`py-3 px-4 border-b-2 font-medium text-sm sm:text-base transition-colors ${activeTab === 'guides'
              ? 'border-[#236F21] text-[#236F21]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Guides ({guides?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 border-b-2 font-medium text-sm sm:text-base transition-colors ${activeTab === 'categories'
              ? 'border-[#236F21] text-[#236F21]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Categories ({categories?.length || 0})
          </button>
        </nav>

        {activeTab === 'guides' && (
          <div className="mb-px">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] text-xs sm:text-sm bg-white cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>


      {/* ---------------- Guides Tab ---------------- */}
      {
        activeTab === 'guides' && (
          <div className="bg-white rounded-lg shadow-sm sm:shadow">
            {loader ? (
              <div className="flex justify-center items-center py-20">
                <Loader className="animate-spin text-[#236F21]" size={40} />
              </div>
            ) : filteredGuides.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No guides found
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-left font-semibold text-gray-700 text-sm">Heading</th>
                        <th className="p-4 text-left font-semibold text-gray-700 text-sm">Category</th>
                        <th className="p-4 text-left font-semibold text-gray-700 text-sm">Level</th>
                        <th className="p-4 text-left font-semibold text-gray-700 text-sm">Image</th>
                        <th className="p-4 text-left font-semibold text-gray-700 text-sm">Status</th>
                        <th className="p-4 text-left font-semibold text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuides.map(g => (
                        <tr key={g._id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${!g.isActive ? 'bg-gray-50 opacity-80' : ''}`}>
                          <td className="p-4 text-gray-900 font-medium max-w-xs">{g.heading}</td>
                          <td className="p-4 text-gray-900">{g.category?.name}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${g.level === 'Beginner'
                              ? 'bg-green-100 text-green-800'
                              : g.level === 'Intermediate'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {g.level}
                            </span>
                          </td>
                          <td className="p-4">
                            {g.image && (
                              <img src={g.image} alt="" className="w-12 h-12 object-cover rounded border border-gray-200" />
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleStatus(g)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${g.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                            >
                              {g.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button onClick={() => openGuideModal(g)} className="text-[#236F21] hover:text-[#1B5C1A]">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDeleteGuide(g._id)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {filteredGuides.map((g) => (
                    <div key={g._id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-3 mb-3">
                        {g.image && <img src={g.image} alt="" className="w-16 h-16 object-cover rounded-lg" />}
                        <div>
                          <h3 className="font-medium text-gray-900 line-clamp-2">{g.heading}</h3>
                          <span className="text-xs text-gray-500">{g.category?.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <button onClick={() => handleToggleStatus(g)} className={`text-xs font-medium px-2 py-1 rounded ${g.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {g.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <div className="flex gap-3">
                          <button onClick={() => openGuideModal(g)} className="text-[#236F21]"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteGuide(g._id)} className="text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )
      }


      {/* ---------------- Categories Tab ---------------- */}
      {
        activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm sm:shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">All Categories</h2>
            </div>

            {loader ? (
              <div className="flex justify-center items-center py-20">
                <Loader className="animate-spin text-[#236F21]" size={40} />
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No categories found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories.map(c => (
                  <div key={c._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <span className="font-medium text-gray-900">{c.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(c._id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      {/* ---------------- Guide Modal ---------------- */}
      {
        showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">{editingGuide ? 'Edit Guide' : 'Create New Guide'}</h2>
                <button onClick={closeGuideModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddOrUpdateGuide} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    name="categoryId"
                    value={guideData.categoryId}
                    onChange={handleGuideChange}
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#236F21]"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Heading *</label>
                  <input
                    type="text"
                    name="heading"
                    value={guideData.heading}
                    onChange={handleGuideChange}
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#236F21]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Level *</label>
                    <select
                      name="level"
                      value={guideData.level}
                      onChange={handleGuideChange}
                      className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#236F21]"
                      required
                    >
                      <option value="">Select Level</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Second Heading</label>
                    <input
                      type="text"
                      name="secondHeading"
                      value={guideData.secondHeading}
                      onChange={handleGuideChange}
                      className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#236F21]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={guideData.description}
                    onChange={handleGuideChange}
                    rows={4}
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#236F21]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <input type="file" name="image" onChange={handleGuideChange} className="w-full border rounded-lg p-2" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={closeGuideModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={loader} className="px-6 py-2 bg-[#236F21] text-white rounded-lg hover:bg-[#1B5C1A]">
                    {loader ? 'Saving...' : (editingGuide ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ---------------- Category Modal ---------------- */}
      {
        showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold">Add Category</h3>
                <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddCategory} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#236F21]"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#236F21] text-white rounded-lg hover:bg-[#1B5C1A]">Add</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      <ConfirmDialog {...dialogConfig} />
    </div >
  );
};

export default GuidesManager;