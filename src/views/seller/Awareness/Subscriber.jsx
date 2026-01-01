import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getSubscribers,
  addSubscriber,
  updateSubscriber,
  deleteSubscriber,
  getSubscribersByCategory,
  clearMessages,
  clearCurrentSubscriber,
  clearCurrentCategory,
  setSubscribersPage
} from '../../../store/Reducers/Awareness/SubscriberReducer';
import { Plus, Search, X, Loader, Edit, Trash2, Filter } from 'lucide-react';

const Subscriber = () => {
  const dispatch = useDispatch();
  const {
    categories,
    subscribers,
    currentSubscriber,
    currentCategory,
    loading,
    categoriesLoading,
    subscribersLoading,
    success,
    error,
    subscribersPagination
  } = useSelector(state => state.subscriber);

  // State
  const [activeTab, setActiveTab] = useState('subscribers');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [subscriberForm, setSubscriberForm] = useState({
    name: '',
    email: '',
    phone: '',
    categoryId: ''
  });

  // Load initial data
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getSubscribers());
  }, [dispatch]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // Handle category form
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      dispatch(updateCategory({ id: editingCategory._id, categoryData: categoryForm }))
        .then(() => {
          setShowCategoryModal(false);
          resetCategoryForm();
        });
    } else {
      dispatch(addCategory(categoryForm))
        .then(() => {
          setShowCategoryModal(false);
          resetCategoryForm();
        });
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(categoryId));
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' });
    setEditingCategory(null);
  };

  // Handle subscriber form
  const handleSubscriberSubmit = (e) => {
    e.preventDefault();
    if (editingSubscriber) {
      dispatch(updateSubscriber({ id: editingSubscriber._id, subscriberData: subscriberForm }))
        .then(() => {
          setShowSubscriberModal(false);
          resetSubscriberForm();
        });
    } else {
      dispatch(addSubscriber(subscriberForm))
        .then(() => {
          setShowSubscriberModal(false);
          resetSubscriberForm();
        });
    }
  };

  const handleEditSubscriber = (subscriber) => {
    setEditingSubscriber(subscriber);
    setSubscriberForm({
      name: subscriber.name,
      email: subscriber.email || '',
      phone: subscriber.phone || '',
      categoryId: subscriber.category?._id || ''
    });
    setShowSubscriberModal(true);
  };

  const handleDeleteSubscriber = (subscriberId) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      dispatch(deleteSubscriber(subscriberId));
    }
  };

  const resetSubscriberForm = () => {
    setSubscriberForm({ name: '', email: '', phone: '', categoryId: '' });
    setEditingSubscriber(null);
  };

  // Handle search and filter
  const handleSearch = () => {
    dispatch(getSubscribers({
      search: searchTerm,
      category: selectedCategory,
      page: 1,
      limit: subscribersPagination.limit
    }));
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      dispatch(getSubscribersByCategory({ categoryId, params: { page: 1, limit: subscribersPagination.limit } }));
    } else {
      dispatch(getSubscribers({ page: 1, limit: subscribersPagination.limit }));
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    dispatch(setSubscribersPage(newPage));
    dispatch(getSubscribers({
      search: searchTerm,
      category: selectedCategory,
      page: newPage,
      limit: subscribersPagination.limit
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Row 1: Title & Mobile Add */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Subscriber Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage categories and subscribers</p>
          </div>

          {/* Mobile Add Button */}
          <button
            onClick={() => activeTab === 'subscribers' ? setShowSubscriberModal(true) : setShowCategoryModal(true)}
            className="sm:hidden bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Row 2: Search & Desktop Add */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Search Bar */}
          <div className={`relative w-full sm:w-96 ${activeTab !== 'subscribers' ? 'invisible sm:visible' : ''}`}>
            {activeTab === 'subscribers' && (
              <>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </>
            )}
          </div>

          {/* Desktop Add Button */}
          <button
            onClick={() => activeTab === 'subscribers' ? setShowSubscriberModal(true) : setShowCategoryModal(true)}
            className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            <span>{activeTab === 'subscribers' ? 'New Subscriber' : 'New Category'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {(success || error) && (
        <div className={`mb-4 p-3 rounded-lg ${success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
          {success || error}
        </div>
      )}

      {/* Tabs & Filter Row */}
      <div className="flex justify-between items-center border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`py-3 px-4 border-b-2 font-medium text-sm sm:text-base transition-colors ${activeTab === 'subscribers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Subscribers ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 border-b-2 font-medium text-sm sm:text-base transition-colors ${activeTab === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Categories ({categories.length})
          </button>
        </nav>

        {/* Mobile Filter Toggle */}
        {activeTab === 'subscribers' && (
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className={`sm:hidden p-2 rounded-lg transition-colors ${showMobileFilter ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            <Filter size={20} />
          </button>
        )}
      </div>

      {/* Mobile Filter Dropdown */}
      {showMobileFilter && activeTab === 'subscribers' && (
        <div className="sm:hidden mb-6 animate-in slide-in-from-top-2">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                handleCategoryFilter(e.target.value);
                setShowMobileFilter(false);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-lg shadow-sm sm:shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Subscribers</h2>

              {/* Desktop Filter */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Filter size={18} />
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribers Table - Mobile Cards View */}
          <div className="sm:hidden">
            {subscribersLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 text-sm">Loading subscribers...</p>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No subscribers found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {subscribers.map(subscriber => (
                  <div key={subscriber._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{subscriber.name}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditSubscriber(subscriber)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscriber(subscriber._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-end gap-4">
                      <div className="space-y-1 text-sm text-gray-600">
                        {subscriber.email && (
                          <div className="flex items-center gap-2">
                            <span>{subscriber.email}</span>
                          </div>
                        )}
                        {subscriber.phone && (
                          <div className="flex items-center gap-2">
                            <span>{subscriber.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {subscriber.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscribers Table - Desktop/Tablet View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribersLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  subscribers.map(subscriber => (
                    <tr key={subscriber._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                        {subscriber.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                        {subscriber.email || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                        {subscriber.phone || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                        {subscriber.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSubscriber(subscriber)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 hover:bg-blue-50 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(subscriber._id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {subscribersPagination.pages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-700">
                  Showing page {subscribersPagination.page} of {subscribersPagination.pages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(subscribersPagination.page - 1)}
                    disabled={subscribersPagination.page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(subscribersPagination.page + 1)}
                    disabled={subscribersPagination.page === subscribersPagination.pages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-lg shadow-sm sm:shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Categories</h2>
          </div>

          {/* Categories Table - Mobile Cards View */}
          <div className="sm:hidden">
            {categoriesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 text-sm">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No categories found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories.map(category => (
                  <div key={category._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                        )}
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {category.subscriberCount || 0} subscribers
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories Table - Desktop/Tablet View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribers
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categoriesLoading ? (
                  <tr>
                    <td colSpan="4" className="px-4 sm:px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map(category => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                        {category.description || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                        {category.subscriberCount || 0}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 hover:bg-blue-50 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    resetCategoryForm();
                  }}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriber Modal */}
      {showSubscriberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingSubscriber ? 'Edit Subscriber' : 'Add Subscriber'}
              </h3>
              <button
                onClick={() => {
                  setShowSubscriberModal(false);
                  resetSubscriberForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubscriberSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={subscriberForm.name}
                  onChange={(e) => setSubscriberForm({ ...subscriberForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={subscriberForm.email}
                  onChange={(e) => setSubscriberForm({ ...subscriberForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={subscriberForm.phone}
                  onChange={(e) => setSubscriberForm({ ...subscriberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={subscriberForm.categoryId}
                  onChange={(e) => setSubscriberForm({ ...subscriberForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubscriberModal(false);
                    resetSubscriberForm();
                  }}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : (editingSubscriber ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriber;