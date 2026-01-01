// src/views/seller/Awareness/Banners.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addBanner,
  getBanners,
  updateBanner,
  deleteBanner,
  clearMessages,
  toggleBannerStatus
} from '../../../store/Reducers/Awareness/bannerReducer';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Upload,
  Loader,
  Search,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import useConfirmDialog from '../../../utils/useConfirmDialog';

function Banners() {
  const dispatch = useDispatch();
  const { loader, success, error, banners } = useSelector(state => state.awarenessBanner);
  const { dialogConfig, showDialog } = useConfirmDialog();

  // Form state
  const [form, setForm] = useState({ title: '', description: '', image: null });
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  // Fetch banners on mount and when success changes
  useEffect(() => {
    dispatch(getBanners());
  }, [dispatch, success]);

  // Show toast messages
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

  // Filter banners based on search
  const filteredBanners = useMemo(() => {
    if (!banners) return [];

    if (!searchTerm) return banners;

    return banners.filter(banner =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [banners, searchTerm]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files[0];
      setForm({ ...form, image: file });

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Open modal for add/edit
  const openModal = (banner = null) => {
    if (banner) {
      setEditId(banner._id);
      setForm({
        title: banner.title,
        description: banner.description,
        image: null
      });
      setImagePreview(banner.image);
    } else {
      resetForm();
    }
    setShowModal(true);
    setMobileMenuOpen(null);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setForm({ title: '', description: '', image: null });
    setEditId(null);
    setImagePreview(null);
  };

  // Add or Update banner
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (form.image) formData.append('image', form.image);

    try {
      if (editId) {
        await dispatch(updateBanner({ id: editId, info: formData })).unwrap();
        //   toast.success('Banner updated successfully!');
      } else {
        await dispatch(addBanner(formData)).unwrap();
        //      toast.success('Banner created successfully!');
      }

      dispatch(getBanners());
      resetForm();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save banner');
      console.error('Operation failed:', error);
    }
  };

  // Delete a banner with custom dialog
  const handleDelete = async (id) => {
    showDialog({
      title: 'Delete Banner',
      message: 'Are you sure you want to delete this banner? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await dispatch(deleteBanner(id)).unwrap();
          //  toast.success('Banner deleted successfully!');
          dispatch(getBanners());
        } catch (error) {
          toast.error('Failed to delete banner');
          console.error('Delete failed:', error);
        }
      }
    });
    setMobileMenuOpen(null);
  };

  // Toggle banner status with confirmation
  const handleToggleStatus = async (banner) => {
    const action = banner.isActive ? 'deactivate' : 'activate';

    showDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Banner`,
      message: `Are you sure you want to ${action} this banner?`,
      type: 'warning',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: async () => {
        try {
          await dispatch(toggleBannerStatus(banner._id)).unwrap();
        } catch (err) {
          console.error(err);
        }
      }
    });
    setMobileMenuOpen(null);
  };

  // Construct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL || ''}${imagePath}`;
  };

  return (
    <div className=" bg-green-50 p-4 sm:p-6">
      {/* Header with Search and Add Button */}
      {/* Header with Search and Add Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8">
        {/* Title Section & Mobile Add Button */}
        <div className="w-full lg:w-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Awareness Banners</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your awareness campaign banners</p>
          </div>

          {/* Mobile Add Button - Icon Only */}
          <button
            onClick={() => openModal()}
            className="lg:hidden bg-[#236F21] text-white p-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm flex-shrink-0 ml-4"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Desktop Actions & Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] w-full"
            />
          </div>

          {/* Desktop Add Button */}
          <button
            onClick={() => openModal()}
            className="hidden lg:flex bg-[#236F21] text-white px-4 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors items-center gap-2 justify-center shadow-sm"
          >
            <Plus size={20} />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {/* Banners Table */}
      {loader ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-[#236F21]" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table Header - Hidden on mobile */}
          <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-sm">
            <div className="col-span-2">Image</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-sm">
            Banner List ({filteredBanners.length})
          </div>

          {/* Table Body for Desktop */}
          <div className="hidden lg:block divide-y divide-gray-200">
            {filteredBanners.map((banner) => (
              <div key={banner._id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center">
                {/* Banner Image */}
                <div className="col-span-2">
                  <img
                    src={getImageUrl(banner.image)}
                    alt={banner.title}
                    className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                  />
                </div>

                {/* Banner Title */}
                <div className="col-span-3">
                  <p className="font-medium text-gray-900 line-clamp-2">{banner.title}</p>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <p className="text-gray-600 text-sm line-clamp-2">{banner.description}</p>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${banner.isActive
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                  >
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openModal(banner)}
                    className="p-2 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-600 hover:border-red-700"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Card Layout for Mobile/Tablet */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {filteredBanners.map((banner) => (
                <div key={banner._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Card Content */}
                  <div className="p-4">
                    {/* Image and Basic Info Row */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Banner Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={getImageUrl(banner.image)}
                          alt={banner.title}
                          className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </div>

                      {/* Title and Status */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{banner.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${banner.isActive
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <p className="text-gray-600 text-xs line-clamp-2">{banner.description}</p>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${banner.isActive
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                      >
                        {banner.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(banner)}
                          className="p-1.5 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
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

          {/* Empty State */}
          {filteredBanners.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No banners found' : 'No banners yet'}
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first awareness banner'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => openModal()}
                  className="bg-[#236F21] text-white px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm text-sm sm:text-base"
                >
                  Create Banner
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] mx-2 sm:mx-4 flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editId ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 no-scrollbar">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                    placeholder="Enter banner title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                    placeholder="Enter banner description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image {!editId && <span className="text-red-500">*</span>}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-[#236F21] transition-colors">
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                      id="file-upload"
                      required={!editId}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-gray-400" size={32} />
                          <p className="text-gray-600 text-sm sm:text-base">Click to upload or drag and drop</p>
                          <p className="text-xs sm:text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t mt-6">
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
                  {editId ? 'Update Banner' : 'Create Banner'}
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
}

export default Banners;