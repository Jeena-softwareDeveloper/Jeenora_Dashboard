// VideoManager.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addVideo,
  getVideos,
  updateVideo,
  deleteVideo,
  toggleVideoStatus,
  clearMessages
} from '../../../store/Reducers/Awareness/videoReducer';
import { Plus, Edit, Trash2, X, Search, Loader, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import useConfirmDialog from '../../../utils/useConfirmDialog';

const VideoManager = () => {
  const dispatch = useDispatch();
  const { videos, loader, success, error } = useSelector(state => state.video);
  const { dialogConfig, showDialog } = useConfirmDialog();

  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [formData, setFormData] = useState({
    heading: '',
    secondaryHeading: '',
    author: '',
    views: '',
    videoFile: null
  });

  useEffect(() => {
    dispatch(getVideos());
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

  // Filter videos based on search
  const filteredVideos = useMemo(() => {
    if (!videos) return [];

    if (!searchTerm) return videos;

    return videos.filter(video =>
      video.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.secondaryHeading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.views?.toString().includes(searchTerm)
    );
  }, [videos, searchTerm]);

  const openModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        heading: video.heading || '',
        secondaryHeading: video.secondaryHeading || '',
        author: video.author || '',
        views: video.views || '',
        videoFile: null
      });
    } else {
      setEditingVideo(null);
      setFormData({
        heading: '',
        secondaryHeading: '',
        author: '',
        views: '',
        videoFile: null
      });
    }
    setShowModal(true);
    setMobileMenuOpen(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setFormData({ heading: '', secondaryHeading: '', author: '', views: '', videoFile: null });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = () => {
    if (!formData.heading?.trim() || !formData.author?.trim()) {
      toast.error('Heading and author are required');
      return;
    }

    // Video is required only when creating a new video
    if (!editingVideo && !formData.videoFile) {
      toast.error('Video file is required');
      return;
    }

    const data = new FormData();
    data.append('heading', formData.heading.trim());
    data.append('author', formData.author.trim());
    if (formData.secondaryHeading?.trim()) data.append('secondaryHeading', formData.secondaryHeading.trim());
    if (formData.views) data.append('views', formData.views);

    // Append video only if user selected a new file
    if (formData.videoFile instanceof File) {
      data.append('video', formData.videoFile, formData.videoFile.name);
    }

    if (editingVideo) {
      dispatch(updateVideo({ id: editingVideo._id, formData: data }));
    } else {
      dispatch(addVideo(data));
    }

    closeModal();
  };



  const handleDelete = (id) => {
    showDialog({
      title: 'Delete Video',
      message: 'Are you sure you want to delete this video? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      onConfirm: () => {
        dispatch(deleteVideo(id));
      }
    });
    setMobileMenuOpen(null);
  };

  const handleToggleStatus = (video) => {
    const action = video.isActive ? 'deactivate' : 'activate';

    showDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Video`,
      message: `Are you sure you want to ${action} this video?`,
      type: 'warning',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: () => {
        dispatch(toggleVideoStatus(video._id));
      }
    });
    setMobileMenuOpen(null);
  };

  return (
    <div className=" bg-green-50 p-4 sm:p-6">

      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8">
        <div className="w-full lg:w-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Organic Videos</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage organic farming tutorial videos</p>
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
              placeholder="Search videos..."
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
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* ---------------- Videos Table ---------------- */}
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
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Secondary</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Author</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Views</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Video</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Status</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map(video => (
                    <tr key={video._id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${!video.isActive ? 'bg-gray-50 opacity-80' : ''}`}>
                      <td className="p-4 text-gray-900 font-medium max-w-xs truncate">{video.heading}</td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{video.secondaryHeading}</td>
                      <td className="p-4 text-gray-900">{video.author}</td>
                      <td className="p-4 text-gray-900">{video.views}</td>
                      <td className="p-4">
                        {video.video && (
                          <video
                            width="120"
                            height="80"
                            controls
                            className="rounded-lg border border-gray-200"
                          >
                            <source src={video.video} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(video)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${video.isActive
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                          {video.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(video)}
                            className="p-2 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(video._id)}
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
              Video List ({filteredVideos.length})
            </div>

            {/* Card Layout for Mobile/Tablet */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {filteredVideos.map((video) => (
                  <div key={video._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Card Content */}
                    <div className="p-4">
                      {/* Video Preview and Basic Info Row */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Video Preview */}
                        <div className="flex-shrink-0">
                          {video.video && (
                            <video
                              width="80"
                              height="60"
                              controls
                              className="rounded-lg border border-gray-200"
                            >
                              <source src={video.video} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>

                        {/* Heading and Status */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{video.heading}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${video.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                              {video.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Secondary Heading */}
                      {video.secondaryHeading && (
                        <div className="mb-2">
                          <p className="text-gray-600 text-xs line-clamp-1">{video.secondaryHeading}</p>
                        </div>
                      )}

                      {/* Author and Views */}
                      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                        <span>By: {video.author}</span>
                        <span>{video.views} views</span>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleToggleStatus(video)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${video.isActive
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                          {video.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(video)}
                            className="p-1.5 text-[#236F21] hover:bg-green-50 rounded-lg transition-colors border border-[#236F21] hover:border-[#1B5C1A]"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(video._id)}
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
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No videos found' : 'No videos yet'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first video'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="bg-[#236F21] text-white px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors shadow-sm text-sm sm:text-base"
              >
                Create Video
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
                {editingVideo ? 'Edit Video' : 'Create New Video'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="heading"
                  value={formData.heading}
                  onChange={handleChange}
                  placeholder="Enter video heading"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Heading
                </label>
                <input
                  type="text"
                  name="secondaryHeading"
                  value={formData.secondaryHeading}
                  onChange={handleChange}
                  placeholder="Enter secondary heading"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Views
                </label>
                <input
                  type="number"
                  name="views"
                  value={formData.views}
                  onChange={handleChange}
                  placeholder="Enter number of views"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File {!editingVideo && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  name="videoFile"
                  accept="video/*"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236F21] focus:border-[#236F21] text-sm sm:text-base"
                  required={!editingVideo}
                />
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 sm:flex-none bg-[#236F21] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors flex items-center gap-2 justify-center shadow-sm text-sm sm:text-base"
                >
                  {editingVideo ? 'Update Video' : 'Create Video'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      <ConfirmDialog {...dialogConfig} />
    </div>
  );
};

export default VideoManager;