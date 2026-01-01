import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addStory,
  getStories,
  updateStory,
  deleteStory,
  clearMessages,
  toggleStoryStatus
} from '../../../store/Reducers/Awareness/successStoryReducer';
import { Plus, Edit, Trash2, X, Search, Loader, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import useConfirmDialog from '../../../utils/useConfirmDialog';

export default function SuccessStories() {
  const dispatch = useDispatch();
  const { loader, success, error, stories } = useSelector(state => state.successStory);
  const { dialogConfig, showDialog } = useConfirmDialog();

  const [form, setForm] = useState({
    heading: '',
    description: '',
    name: '',
    area: '',
    experience: '',
    image: null
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  // Fetch stories on mount
  useEffect(() => {
    dispatch(getStories());
  }, [dispatch]);

  // Handle toast messages
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

  // Filter stories based on search
  const filteredStories = useMemo(() => {
    if (!stories) return [];
    
    if (!searchTerm) return stories;
    
    return stories.filter(story =>
      story.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.experience?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stories, searchTerm]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const openModal = (story = null) => {
    if (story) {
      setEditId(story._id);
      setForm({
        heading: story.heading || '',
        description: story.description || '',
        name: story.name || '',
        area: story.area || '',
        experience: story.experience || '',
        image: null
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

  const resetForm = () => {
    setForm({ heading: '', description: '', name: '', area: '', experience: '', image: null });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      if (editId) {
        await dispatch(updateStory({ id: editId, formData })).unwrap();
      } else {
        await dispatch(addStory(formData)).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    showDialog({
      title: 'Delete Story',
      message: 'Are you sure you want to delete this success story? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await dispatch(deleteStory(id)).unwrap();
        } catch (err) {
          console.error(err);
        }
      }
    });
    setMobileMenuOpen(null);
  };

  const handleToggleStatus = async (story) => {
    const action = story.isActive ? 'deactivate' : 'activate';
    
    showDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Story`,
      message: `Are you sure you want to ${action} this success story?`,
      type: 'warning',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: async () => {
        try {
          await dispatch(toggleStoryStatus(story._id)).unwrap();
        } catch (err) {
          console.error(err);
        }
      }
    });
    setMobileMenuOpen(null);
  };

  return (
    <div className=" bg-green-50 p-4 sm:p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8">
        <div className="w-full lg:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Success Stories</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage success stories with images and details</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search stories..."
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
            <span className="hidden sm:inline">Add Story</span>
          </button>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loader ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-[#236F21]" size={40} />
          </div>
        ) : (
          <>
            {/* Desktop Table Header - Hidden on mobile */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Heading</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Image</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Description</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Name</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Area</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Experience</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Status</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStories.map(story => (
                    <tr key={story._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900 font-medium max-w-xs truncate">{story.heading}</td>
                      <td className="p-4">
                        {story.image && (
                          <img 
                            src={story.image} 
                            alt={story.heading} 
                            className="w-20 h-14 object-cover rounded-lg border border-gray-200" 
                          />
                        )}
                      </td>
                      <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{story.description}</td>
                      <td className="p-4 text-gray-900">{story.name}</td>
                      <td className="p-4 text-gray-900">{story.area}</td>
                      <td className="p-4 text-gray-900">{story.experience}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(story)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            story.isActive
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {story.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openModal(story)} 
                            className="p-2 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(story._id)} 
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
              Story List ({filteredStories.length})
            </div>

            {/* Card Layout for Mobile/Tablet */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {filteredStories.map((story) => (
                  <div key={story._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Card Content */}
                    <div className="p-4">
                      {/* Image and Basic Info Row */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Story Image */}
                        <div className="flex-shrink-0">
                          {story.image && (
                            <img 
                              src={story.image} 
                              alt={story.heading} 
                              className="w-16 h-12 object-cover rounded-lg border border-gray-200" 
                            />
                          )}
                        </div>

                        {/* Heading and Status */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{story.heading}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              story.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {story.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Name and Area */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="font-medium">{story.name}</span>
                          <span>{story.area}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-2">
                        <p className="text-gray-600 text-xs line-clamp-2">{story.description}</p>
                      </div>

                      {/* Experience */}
                      <div className="mb-3">
                        <p className="text-gray-500 text-xs line-clamp-1">{story.experience}</p>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleToggleStatus(story)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            story.isActive
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {story.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(story)}
                            className="p-1.5 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(story._id)}
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
        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No stories found' : 'No stories yet'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Get started by creating your first success story'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="bg-[#236F21] text-white px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm text-sm sm:text-base"
              >
                Create Story
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2 sm:mx-4">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editId ? 'Edit Story' : 'Create New Story'}
              </h2>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="heading" 
                  value={form.heading} 
                  onChange={handleChange} 
                  placeholder="Enter story heading" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base" 
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
                  placeholder="Enter story description" 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="Enter person's name" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="area" 
                  value={form.area} 
                  onChange={handleChange} 
                  placeholder="Enter area/location" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="experience" 
                  value={form.experience} 
                  onChange={handleChange} 
                  placeholder="Enter experience details" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image {!editId && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="file" 
                  name="image" 
                  onChange={handleChange} 
                  accept="image/*" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  required={!editId}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200 mt-6">
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
                  {editId ? 'Update Story' : 'Create Story'}
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