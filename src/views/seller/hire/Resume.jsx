import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createEditor,
  getAllEditors,
  getEditorById,
  updateEditor,
  deleteEditor,
  clearError,
  clearSuccess,
  clearEditorData
} from '../../../store/Reducers/Hire/resumeReducer';
import { Plus, Edit, Trash2, Eye, X, Search, Loader, Star, User, Mail, Phone, Briefcase, Award, BookOpen, FileText, ThumbsUp, Target, Clock, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Resume = () => {
  const dispatch = useDispatch();
  const { editorsList, editorData, loading, error, success } = useSelector(state => state.editors);

  // State
  const [showModal, setShowModal] = useState(false);
  const [editingEditor, setEditingEditor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(false);
  const [editorForm, setEditorForm] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    specialization: '',
    tagline: '',
    bio: '',
    experience: '',

    // Arrays
    languages: [''],
    expertise: [''],
    features: [''],
    certifications: [''],
    awards: [''],
    preferredMethods: [''],

    // Pricing & Delivery
    price: '',
    originalPrice: '',
    deliveryTime: '',
    responseTime: '',
    avgDelivery: '',

    // Stats & Metrics
    rating: '',
    totalReviews: '',
    completedJobs: '',
    successRate: '',
    viewCount: '',
    likeCount: '',
    responseRate: '',

    // Status Flags
    isOnline: false,
    isVerified: false,
    isPopular: false,
    isFeatured: false,

    // Object Arrays
    education: [{ degree: '', university: '', year: '' }],
    portfolio: [{ beforeScore: '', afterScore: '', industry: '', result: '' }]
  });

  // Effects
  useEffect(() => {
    dispatch(getAllEditors());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(getSuccessMessage());
      dispatch(clearSuccess());
      if (showModal) {
        closeModal();
      }
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const getSuccessMessage = () => {
    if (editingEditor && !viewMode) return 'Editor updated successfully!';
    if (!editingEditor && !viewMode) return 'Editor created successfully!';
    return 'Operation completed successfully!';
  };

  // Filter editors
  const filteredEditors = editorsList.filter(editor =>
    editor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editor.tagline?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const openModal = (editor = null, view = false) => {
    if (editor) {
      setEditingEditor(editor);
      if (view) {
        setViewMode(true);
        dispatch(getEditorById(editor._id));
      } else {
        setViewMode(false);
        // Convert all data to match form structure
        setEditorForm({
          name: editor.name || '',
          email: editor.email || '',
          phone: editor.phone || '',
          specialization: editor.specialization || '',
          tagline: editor.tagline || '',
          bio: editor.bio || '',
          experience: editor.experience || '',

          languages: editor.languages?.length ? editor.languages : [''],
          expertise: editor.expertise?.length ? editor.expertise : [''],
          features: editor.features?.length ? editor.features : [''],
          certifications: editor.certifications?.length ? editor.certifications : [''],
          awards: editor.awards?.length ? editor.awards : [''],
          preferredMethods: editor.communication?.preferredMethods?.length ? editor.communication.preferredMethods : [''],

          price: editor.price || '',
          originalPrice: editor.originalPrice || '',
          deliveryTime: editor.deliveryTime || '',
          responseTime: editor.responseTime || '',
          avgDelivery: editor.avgDelivery || '',

          rating: editor.rating || '',
          totalReviews: editor.totalReviews || '',
          completedJobs: editor.completedJobs || '',
          successRate: editor.successRate || '',
          viewCount: editor.viewCount || '',
          likeCount: editor.likeCount || '',
          responseRate: editor.communication?.responseRate || '',

          isOnline: editor.isOnline || false,
          isVerified: editor.isVerified || false,
          isPopular: editor.isPopular || false,
          isFeatured: editor.isFeatured || false,

          education: editor.education?.length ? editor.education : [{ degree: '', university: '', year: '' }],
          portfolio: editor.portfolio?.length ? editor.portfolio : [{ beforeScore: '', afterScore: '', industry: '', result: '' }]
        });
      }
    } else {
      setEditingEditor(null);
      setViewMode(false);
      setEditorForm({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        tagline: '',
        bio: '',
        experience: '',

        languages: [''],
        expertise: [''],
        features: [''],
        certifications: [''],
        awards: [''],
        preferredMethods: [''],

        price: '',
        originalPrice: '',
        deliveryTime: '',
        responseTime: '',
        avgDelivery: '',

        rating: '',
        totalReviews: '',
        completedJobs: '',
        successRate: '',
        viewCount: '',
        likeCount: '',
        responseRate: '',

        isOnline: false,
        isVerified: false,
        isPopular: false,
        isFeatured: false,

        education: [{ degree: '', university: '', year: '' }],
        portfolio: [{ beforeScore: '', afterScore: '', industry: '', result: '' }]
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEditor(null);
    setViewMode(false);
    dispatch(clearEditorData());
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditorForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayInputChange = (index, value, field) => {
    setEditorForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleObjectArrayInputChange = (index, field, subField, value) => {
    setEditorForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [subField]: value } : item
      )
    }));
  };

  const addArrayField = (field, defaultValue = '') => {
    setEditorForm(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const addObjectArrayField = (field, defaultValue) => {
    setEditorForm(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayField = (index, field) => {
    setEditorForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Filter out empty array values and prepare data
    const submitData = {
      ...editorForm,
      name: editorForm.name.trim(),
      email: editorForm.email.trim(),
      phone: editorForm.phone.trim(),
      specialization: editorForm.specialization.trim(),
      tagline: editorForm.tagline.trim(),
      bio: editorForm.bio.trim(),
      experience: editorForm.experience.trim(),

      languages: editorForm.languages.filter(lang => lang.trim()),
      expertise: editorForm.expertise.filter(exp => exp.trim()),
      features: editorForm.features.filter(feat => feat.trim()),
      certifications: editorForm.certifications.filter(cert => cert.trim()),
      awards: editorForm.awards.filter(award => award.trim()),
      preferredMethods: editorForm.preferredMethods.filter(method => method.trim()),

      education: editorForm.education.filter(edu =>
        edu.degree.trim() || edu.university.trim() || edu.year.trim()
      ),
      portfolio: editorForm.portfolio.filter(port =>
        port.beforeScore || port.afterScore || port.industry.trim() || port.result.trim()
      ),

      price: parseFloat(editorForm.price) || 0,
      originalPrice: parseFloat(editorForm.originalPrice) || 0,
      rating: parseFloat(editorForm.rating) || 0,
      totalReviews: parseInt(editorForm.totalReviews) || 0,
      completedJobs: parseInt(editorForm.completedJobs) || 0,
      successRate: parseFloat(editorForm.successRate) || 0,
      viewCount: parseInt(editorForm.viewCount) || 0,
      likeCount: parseInt(editorForm.likeCount) || 0,
      responseRate: parseFloat(editorForm.responseRate) || 0,

      // Add nested objects with proper structure
      availability: {
        status: "available",
        nextAvailable: null,
        currentWorkload: 0
      },
      communication: {
        responseRate: parseFloat(editorForm.responseRate) || 0,
        responseTime: editorForm.responseTime || '',
        preferredMethods: editorForm.preferredMethods.filter(method => method.trim())
      }
    };

    if (editingEditor) {
      dispatch(updateEditor({ id: editingEditor._id, editorData: submitData }));
    } else {
      dispatch(createEditor(submitData));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this editor?')) {
      dispatch(deleteEditor(id));
    }
  };

  const getStatusBadge = (editor) => {
    if (!editor.isVerified) return { text: 'Unverified', color: 'bg-gray-100 text-gray-800' };
    if (editor.isOnline) return { text: 'Online', color: 'bg-green-100 text-green-800' };
    return { text: 'Offline', color: 'bg-orange-100 text-orange-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Editors</h1>
        <p className="text-gray-600 mt-2">Manage resume editors and their profiles</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search editors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Add Editor
        </button>
      </div>

      {/* Editors Grid */}
      {loading && editorsList.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEditors.map((editor) => {
            const status = getStatusBadge(editor);
            return (
              <div key={editor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{editor.name}</h3>
                        <p className="text-sm text-gray-600">{editor.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {editor.isFeatured && <Star className="text-yellow-500 fill-current" size={16} />}
                      {editor.isPopular && <Star className="text-orange-500 fill-current" size={16} />}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    {editor.isVerified && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} />
                    <span className="truncate">{editor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    <span>{editor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={16} />
                    <span>{editor.experience} years exp</span>
                  </div>

                  {editor.tagline && (
                    <p className="text-sm text-gray-700 italic">"{editor.tagline}"</p>
                  )}

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{editor.price} Credits</span>
                      {editor.originalPrice > editor.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">{editor.originalPrice} Credits</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{editor.deliveryTime} days</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-current" size={12} />
                      <span>{editor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target size={12} />
                      <span>{editor.completedJobs} jobs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={12} />
                      <span>{editor.likeCount}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => openModal(editor, true)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(editor)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(editor._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredEditors.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-gray-400" size={40} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No editors found' : 'No editors yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first editor'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Editor
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">
                {viewMode ? 'Editor Details' : editingEditor ? 'Edit Editor' : 'Add New Editor'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {viewMode ? (
                // View Mode - Display all data
                <div className="space-y-6">
                  {editorData ? (
                    <>
                      {/* Personal Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Name</label>
                              <p className="mt-1 text-gray-900">{editorData.name}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <p className="mt-1 text-gray-900">{editorData.email}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Phone</label>
                              <p className="mt-1 text-gray-900">{editorData.phone}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Specialization</label>
                              <p className="mt-1 text-gray-900">{editorData.specialization}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Experience</label>
                              <p className="mt-1 text-gray-900">{editorData.experience} years</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Tagline</label>
                              <p className="mt-1 text-gray-900 italic">"{editorData.tagline}"</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {editorData.bio && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                          <p className="text-gray-900">{editorData.bio}</p>
                        </div>
                      )}

                      {/* Skills & Features */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                          <div className="flex flex-wrap gap-2">
                            {editorData.languages?.map((lang, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
                          <div className="flex flex-wrap gap-2">
                            {editorData.expertise?.map((exp, index) => (
                              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                          <div className="flex flex-wrap gap-2">
                            {editorData.features?.map((feature, index) => (
                              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Communication */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Response Rate:</span>
                              <span className="font-semibold text-gray-900">{editorData.communication?.responseRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Response Time:</span>
                              <span className="text-gray-900">{editorData.communication?.responseTime}</span>
                            </div>
                            {editorData.communication?.preferredMethods?.length > 0 && (
                              <div>
                                <span className="text-gray-700">Preferred Methods:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {editorData.communication.preferredMethods.map((method, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                      {method}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pricing & Delivery */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Credits & Delivery</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Current Credits:</span>
                              <span className="font-semibold text-gray-900">{editorData.price} Credits</span>
                            </div>
                            {editorData.originalPrice > editorData.price && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Original Credits:</span>
                                <span className="text-gray-500 line-through">{editorData.originalPrice} Credits</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-700">Delivery Time:</span>
                              <span className="text-gray-900">{editorData.deliveryTime} days</span>
                            </div>
                            {editorData.avgDelivery && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Avg. Delivery:</span>
                                <span className="text-gray-900">{editorData.avgDelivery}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{editorData.rating}</div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{editorData.totalReviews}</div>
                          <div className="text-xs text-gray-600">Reviews</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">{editorData.completedJobs}</div>
                          <div className="text-xs text-gray-600">Jobs Done</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">{editorData.successRate}%</div>
                          <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-indigo-600">{editorData.viewCount}</div>
                          <div className="text-xs text-gray-600">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-pink-600">{editorData.likeCount}</div>
                          <div className="text-xs text-gray-600">Likes</div>
                        </div>
                      </div>

                      {/* Additional Data */}
                      {(editorData.certifications?.length > 0 || editorData.awards?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {editorData.certifications?.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                              <div className="space-y-2">
                                {editorData.certifications.map((cert, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-gray-900">
                                    <Award size={16} className="text-green-600" />
                                    {cert}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {editorData.awards?.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Awards</label>
                              <div className="space-y-2">
                                {editorData.awards.map((award, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-gray-900">
                                    <Star size={16} className="text-yellow-600" />
                                    {award}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Education */}
                      {editorData.education?.length > 0 && editorData.education.some(edu => edu.degree || edu.university || edu.year) && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                          <div className="space-y-3">
                            {editorData.education.map((edu, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div>
                                  <div className="font-medium text-gray-900">{edu.degree}</div>
                                  <div className="text-sm text-gray-600">{edu.university}</div>
                                </div>
                                <div className="text-sm text-gray-500">{edu.year}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Portfolio */}
                      {editorData.portfolio?.length > 0 && editorData.portfolio.some(port => port.industry || port.result) && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editorData.portfolio.map((port, index) => (
                              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-gray-900">{port.industry}</span>
                                  <div className="flex gap-2 text-sm">
                                    <span className="text-red-600">{port.beforeScore}%</span>
                                    <span>→</span>
                                    <span className="text-green-600">{port.afterScore}%</span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">{port.result}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-center items-center py-8">
                      <Loader className="animate-spin text-blue-600" size={30} />
                    </div>
                  )}
                </div>
              ) : (
                // Edit/Create Form
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editorForm.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editorForm.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editorForm.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization *
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={editorForm.specialization}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience (years) *
                        </label>
                        <input
                          type="text"
                          name="experience"
                          value={editorForm.experience}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tagline
                        </label>
                        <input
                          type="text"
                          name="tagline"
                          value={editorForm.tagline}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="A catchy tagline for the editor"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={editorForm.bio}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tell us about the editor's background and expertise..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats & Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        name="rating"
                        value={editorForm.rating}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0 - 5.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Reviews
                      </label>
                      <input
                        type="number"
                        name="totalReviews"
                        value={editorForm.totalReviews}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completed Jobs
                      </label>
                      <input
                        type="number"
                        name="completedJobs"
                        value={editorForm.completedJobs}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Success Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        name="successRate"
                        value={editorForm.successRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        View Count
                      </label>
                      <input
                        type="number"
                        name="viewCount"
                        value={editorForm.viewCount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Like Count
                      </label>
                      <input
                        type="number"
                        name="likeCount"
                        value={editorForm.likeCount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        name="responseRate"
                        value={editorForm.responseRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Pricing & Delivery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Credits</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Credits *
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={editorForm.price}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Original Credits *
                          </label>
                          <input
                            type="number"
                            name="originalPrice"
                            value={editorForm.originalPrice}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Delivery & Response</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Time
                        </label>
                        <input
                          type="text"
                          name="deliveryTime"
                          value={editorForm.deliveryTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 3-5 days"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Response Time
                        </label>
                        <input
                          type="text"
                          name="responseTime"
                          value={editorForm.responseTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Within 24 hours"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Average Delivery
                        </label>
                        <input
                          type="text"
                          name="avgDelivery"
                          value={editorForm.avgDelivery}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 4 days"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Array Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Languages */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Languages
                      </label>
                      <div className="space-y-2">
                        {editorForm.languages.map((language, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={language}
                              onChange={(e) => handleArrayInputChange(index, e.target.value, 'languages')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., English"
                            />
                            {editorForm.languages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField(index, 'languages')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayField('languages')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Language
                        </button>
                      </div>
                    </div>

                    {/* Expertise */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expertise
                      </label>
                      <div className="space-y-2">
                        {editorForm.expertise.map((expertise, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={expertise}
                              onChange={(e) => handleArrayInputChange(index, e.target.value, 'expertise')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., IT Resume"
                            />
                            {editorForm.expertise.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField(index, 'expertise')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayField('expertise')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Expertise
                        </button>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features
                      </label>
                      <div className="space-y-2">
                        {editorForm.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => handleArrayInputChange(index, e.target.value, 'features')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., ATS optimized"
                            />
                            {editorForm.features.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField(index, 'features')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayField('features')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Feature
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Array Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Certifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certifications
                      </label>
                      <div className="space-y-2">
                        {editorForm.certifications.map((certification, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={certification}
                              onChange={(e) => handleArrayInputChange(index, e.target.value, 'certifications')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., Certified Resume Writer"
                            />
                            {editorForm.certifications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField(index, 'certifications')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayField('certifications')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Certification
                        </button>
                      </div>
                    </div>

                    {/* Awards */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Awards
                      </label>
                      <div className="space-y-2">
                        {editorForm.awards.map((award, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={award}
                              onChange={(e) => handleArrayInputChange(index, e.target.value, 'awards')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., Best Resume Writer 2024"
                            />
                            {editorForm.awards.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField(index, 'awards')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayField('awards')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Award
                        </button>
                      </div>
                    </div>

                    {/* Preferred Methods */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Communication Methods
                      </label>
                      <div className="space-y-2">
                        {editorForm.preferredMethods.map((method, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={method}
                              onChange={(e) => handleArrayInputChange(index, e.target.value, 'preferredMethods')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., Email, Chat"
                            />
                            {editorForm.preferredMethods.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField(index, 'preferredMethods')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayField('preferredMethods')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Method
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <div className="space-y-4">
                      {editorForm.education.map((edu, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Degree</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => handleObjectArrayInputChange(index, 'education', 'degree', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., B.Tech IT"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">University</label>
                            <input
                              type="text"
                              value={edu.university}
                              onChange={(e) => handleObjectArrayInputChange(index, 'education', 'university', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., ABC University"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => handleObjectArrayInputChange(index, 'education', 'year', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., 2020"
                            />
                          </div>
                          <div className="flex items-end">
                            {editorForm.education.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField(index, 'education')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addObjectArrayField('education', { degree: '', university: '', year: '' })}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Education
                      </button>
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio
                    </label>
                    <div className="space-y-4">
                      {editorForm.portfolio.map((port, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Before Score</label>
                            <input
                              type="number"
                              value={port.beforeScore}
                              onChange={(e) => handleObjectArrayInputChange(index, 'portfolio', 'beforeScore', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., 60"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">After Score</label>
                            <input
                              type="number"
                              value={port.afterScore}
                              onChange={(e) => handleObjectArrayInputChange(index, 'portfolio', 'afterScore', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., 90"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
                            <input
                              type="text"
                              value={port.industry}
                              onChange={(e) => handleObjectArrayInputChange(index, 'portfolio', 'industry', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., IT"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Result</label>
                            <input
                              type="text"
                              value={port.result}
                              onChange={(e) => handleObjectArrayInputChange(index, 'portfolio', 'result', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="e.g., Got Job at Google"
                            />
                          </div>
                          <div className="flex items-end">
                            {editorForm.portfolio.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField(index, 'portfolio')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addObjectArrayField('portfolio', { beforeScore: '', afterScore: '', industry: '', result: '' })}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Portfolio Item
                      </button>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isOnline"
                        checked={editorForm.isOnline}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Online</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isVerified"
                        checked={editorForm.isVerified}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Verified</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isPopular"
                        checked={editorForm.isPopular}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Popular</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={editorForm.isFeatured}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {loading && <Loader size={16} className="animate-spin" />}
                      {editingEditor ? 'Update Editor' : 'Create Editor'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resume;