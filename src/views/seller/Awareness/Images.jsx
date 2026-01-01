import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getImages,
  addImage,
  updateImage,
  deleteImage,
  setImage,
  clearMessages,
  toggleImageStatus
} from '../../../store/Reducers/Awareness/ImageReducer';
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

export default function AwarenessImagesTable() {
  const dispatch = useDispatch();
  const { loader, images, image, success, error } = useSelector(
    (state) => state.awarenessImage
  );

  const { dialogConfig, showDialog } = useConfirmDialog();

  const [form, setForm] = useState({
    heading: '',
    description: '',
    miniDescription: '',
    image: null
  });
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  useEffect(() => {
    dispatch(getImages());
  }, [dispatch]);

  // Handle success and error messages with toast
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

  // Filter images based on search
  const filteredImages = useMemo(() => {
    if (!images) return [];
    
    if (!searchTerm) return images;
    
    return images.filter(img =>
      img.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.miniDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [images, searchTerm]);

  const handleChange = (e) => {
    const { name, files, value } = e.target;
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

  const openModal = (img = null) => {
    if (img) {
      setEditId(img._id);
      setForm({
        heading: img.heading || '',
        description: img.description || '',
        miniDescription: img.miniDescription || '',
        image: null
      });
      setImagePreview(img.image);
      dispatch(setImage(img));
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

  const resetForm = () => {
    setForm({ heading: '', description: '', miniDescription: '', image: null });
    setEditId(null);
    setImagePreview(null);
    dispatch(setImage(null));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validation
  if (!form.heading.trim() || !form.description.trim() || !form.miniDescription.trim()) {
    toast.error('Please fill in all required fields');
    return;
  }

  if (!editId && !form.image) {
    toast.error('Please select an image');
    return;
  }

  try {
    if (editId) {
      await dispatch(updateImage({ id: editId, info: form })).unwrap();
    } else {
      await dispatch(addImage(form)).unwrap();
    }

    dispatch(getImages());
    resetForm();
    setShowModal(false);
  } catch (error) {
    console.error('Operation failed:', error);
  }
};


  // Delete image with custom dialog
  const handleDelete = async (id) => {
    showDialog({
      title: 'Delete Image',
      message: 'Are you sure you want to delete this image? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await dispatch(deleteImage(id)).unwrap();
          dispatch(getImages());
        } catch (error) {
          console.error('Delete failed:', error);
        }
      }
    });
    setMobileMenuOpen(null);
  };

  // Toggle image status with confirmation
  const handleToggleStatus = async (img) => {
    const action = img.isActive ? 'deactivate' : 'activate';
    
    showDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Image`,
      message: `Are you sure you want to ${action} this image?`,
      type: 'warning',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: async () => {
        try {
          await dispatch(toggleImageStatus(img._id)).unwrap();
        } catch (err) {
          console.error(err);
        }
      }
    });
    setMobileMenuOpen(null);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL || ''}${url}`;
  };

  return (
    <div className=" bg-green-50 p-4 sm:p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8">
        <div className="w-full lg:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Awareness Images</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your awareness campaign images</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="bg-[#236F21] text-white px-4 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors flex items-center gap-2 justify-center shadow-sm w-full sm:w-auto"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Image</span>
          </button>
        </div>
      </div>

      {/* Images Table */}
      {loader ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-[#236F21]" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table Header - Hidden on mobile */}
          <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-sm">
            <div className="col-span-2">Image</div>
            <div className="col-span-3">Heading</div>
            <div className="col-span-3">Mini Description</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-sm">
            Image List ({filteredImages.length})
          </div>

          {/* Table Body for Desktop */}
          <div className="hidden lg:block divide-y divide-gray-200">
            {filteredImages.map((img) => (
              <div key={img._id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center">
                {/* Image */}
                <div className="col-span-2">
                  <img 
                    src={getImageUrl(img.image)} 
                    alt={img.heading}
                    className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                  />
                </div>

                {/* Heading */}
                <div className="col-span-3">
                  <p className="font-medium text-gray-900 line-clamp-2">{img.heading}</p>
                </div>

                {/* Mini Description */}
                <div className="col-span-3">
                  <p className="text-gray-600 text-sm line-clamp-2">{img.miniDescription}</p>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(img)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      img.isActive
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {img.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openModal(img)}
                    className="p-2 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(img._id)}
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
              {filteredImages.map((img) => (
                <div key={img._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Card Content */}
                  <div className="p-4">
                    {/* Image and Basic Info Row */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img 
                          src={getImageUrl(img.image)} 
                          alt={img.heading}
                          className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </div>

                      {/* Heading and Status */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{img.heading}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            img.isActive 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {img.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mini Description */}
                    <div className="mb-3">
                      <p className="text-gray-600 text-xs line-clamp-2">{img.miniDescription}</p>
                    </div>

                    {/* Description (Truncated) */}
                    <div className="mb-3">
                      <p className="text-gray-500 text-xs line-clamp-2">{img.description}</p>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleStatus(img)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          img.isActive
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {img.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(img)}
                          className="p-1.5 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(img._id)}
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
          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No images found' : 'No images yet'}
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                {searchTerm 
                  ? 'Try adjusting your search criteria' 
                  : 'Get started by creating your first awareness image'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => openModal()}
                  className="bg-[#236F21] text-white px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm text-sm sm:text-base"
                >
                  Create Image
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2 sm:mx-4">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editId ? 'Edit Image' : 'Create New Image'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="heading"
                    value={form.heading}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                    placeholder="Enter image heading"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                    placeholder="Enter image description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mini Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="miniDescription"
                    value={form.miniDescription}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                    placeholder="Enter mini description"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image {!editId && <span className="text-red-500">*</span>}
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
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={closeModal}
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
                  {editId ? 'Update Image' : 'Create Image'}
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