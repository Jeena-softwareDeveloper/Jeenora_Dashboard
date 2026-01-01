import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCampaign, updateCampaign } from '../../../../store/Reducers/Awareness/campaignReducer';
import { getCategories } from '../../../../store/Reducers/Awareness/SubscriberReducer';
import { getEmailTemplates } from '../../../../store/Reducers/Awareness/campaignReducer';
import {
  FaEnvelope,
  FaWhatsapp,
  FaCalendarAlt,
  FaRedo,
  FaClock,
  FaPaperPlane,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaUsers,
  FaCog,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

export default function CreateCampaign({ onClose, editData = null, onSaveComplete }) {
  const dispatch = useDispatch();

  const categoriesState = useSelector(state => state.categories || {});
  const campaignState = useSelector(state => state.campaign || {});

  const { categories = [] } = categoriesState;
  const { emailTemplates = [], loading = false } = campaignState;

  const [activeTab, setActiveTab] = useState('basic');
  const [campaignData, setCampaignData] = useState({
    title: '',
    mode: 'email',
    subject: '',
    message: '',
    categoryIds: [],
    contacts: [],
    scheduleType: 'immediate',
    scheduledDate: '',
    scheduledTime: '09:00',
    recurringPattern: 'daily',
    repeatCount: 1,
    recurrenceConfig: {
      startDate: "",
      startTime: "09:00",
      dailyMode: 'single',
      perDayCount: 1,
      intervalMinutes: 30,
      scheduleDays: "daily",
      repeatCount: 5,
      timezone: "Asia/Kolkata"
    },
    daysOfWeek: [],
    dayOfMonth: 1,
    mediaUrl: '',
    templateId: null,
    trackingEnabled: true,
    sendOptions: {
      delayBetweenMessages: 2000,
      maxRetries: 1,
      retryDelay: 300000,
      batchSize: 5,
    },
  });

  const [errors, setErrors] = useState({});
  const [contactSource, setContactSource] = useState('category');
  const [showScheduleWarning, setShowScheduleWarning] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showMobileTabs, setShowMobileTabs] = useState(false);

  useEffect(() => {
    dispatch(getCategories({ page: 1, searchValue: '', parPage: 100 }));
    dispatch(getEmailTemplates({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (editData) {
      console.log('📝 Editing campaign data:', editData);

      // Handle categories
      const categoryIds = editData.category
        ? (Array.isArray(editData.category)
          ? editData.category.map(cat => cat._id || cat)
          : [editData.category._id || editData.category])
        : (editData.categoryIds || []);

      const templateId = editData.templateId === "" ? null : editData.templateId;

      // 🗓 Scheduled date + time formatting
      let scheduledDate = '';
      let scheduledTime = '09:00';

      if (editData.scheduledDate) {
        const date = new Date(editData.scheduledDate);
        if (!isNaN(date.getTime())) {
          scheduledDate = date.toISOString().split('T')[0];
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          scheduledTime = `${hours}:${minutes}`;
        }
      } else if (editData.scheduledTime) {
        scheduledTime = editData.scheduledTime;
      }

      // 🕒 Recurring settings
      let recurringStartDate = '';
      if (editData.recurrenceConfig?.startDate) {
        const startDateObj = new Date(editData.recurrenceConfig.startDate);
        if (!isNaN(startDateObj.getTime())) {
          recurringStartDate = startDateObj.toISOString().split('T')[0];
        }
      } else if (editData.scheduledDate) {
        recurringStartDate = new Date(editData.scheduledDate).toISOString().split('T')[0];
      }

      // Determine daily mode from existing data
      const dailyMode = editData.recurrenceConfig?.dailyMode || 
                       (editData.recurrenceConfig?.perDayCount > 1 ? 'multiple' : 'single');

      const formattedData = {
        ...editData,
        title: editData.title || '',
        mode: editData.mode || 'email',
        subject: editData.subject || '',
        message: editData.message || '',
        categoryIds,
        contacts: Array.isArray(editData.contacts) ? editData.contacts : [],
        scheduleType: editData.scheduleType || 'immediate',
        scheduledDate,
        scheduledTime,
        recurringPattern: editData.recurringPattern || 'daily',
        repeatCount: editData.repeatCount || 1,
        daysOfWeek: editData.daysOfWeek || [],
        dayOfMonth: editData.dayOfMonth || 1,
        recurrenceConfig: {
          startDate: recurringStartDate || new Date().toISOString().split('T')[0],
          startTime: editData.recurrenceConfig?.startTime || '09:00',
          dailyMode: dailyMode,
          perDayCount: editData.recurrenceConfig?.perDayCount || 1,
          intervalMinutes: editData.recurrenceConfig?.intervalMinutes ?? 30,
          scheduleDays: editData.recurrenceConfig?.scheduleDays || editData.recurringPattern || 'daily',
          repeatCount: editData.recurrenceConfig?.repeatCount || editData.repeatCount || 5,
          timezone: editData.recurrenceConfig?.timezone || 'Asia/Kolkata',
        },
        mediaUrl: editData.mediaUrl || '',
        templateId,
        trackingEnabled: editData.trackingEnabled !== undefined ? editData.trackingEnabled : true,
        sendOptions: {
          delayBetweenMessages: editData.sendOptions?.delayBetweenMessages || 2000,
          maxRetries: editData.sendOptions?.maxRetries || 1,
          retryDelay: editData.sendOptions?.retryDelay || 300000,
          batchSize: editData.sendOptions?.batchSize || 5,
        }
      };

      console.log('📝 Formatted campaign data for edit:', formattedData);
      setCampaignData(formattedData);

      // Detect contact source
      if (formattedData.contacts && formattedData.contacts.length > 0) {
        setContactSource('manual');
      } else {
        setContactSource('category');
      }
    }
  }, [editData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setCampaignData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Show warning if changing schedule type of an active campaign
    if (editData && ['scheduleType', 'scheduledDate', 'scheduledTime'].includes(name)) {
      setShowScheduleWarning(true);
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRecurringConfigChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      recurrenceConfig: {
        ...prev.recurrenceConfig,
        [field]: value
      }
    }));

    // Auto-update dailyMode based on perDayCount
    if (field === 'perDayCount') {
      const perDayCount = parseInt(value) || 1;
      if (perDayCount > 1) {
        setCampaignData(prev => ({
          ...prev,
          recurrenceConfig: {
            ...prev.recurrenceConfig,
            dailyMode: 'multiple',
            perDayCount: perDayCount
          }
        }));
      } else {
        setCampaignData(prev => ({
          ...prev,
          recurrenceConfig: {
            ...prev.recurrenceConfig,
            dailyMode: 'single',
            perDayCount: 1
          }
        }));
      }
    }
  };

  const handleDaysOfWeekChange = (day) => {
    setCampaignData(prev => {
      const currentDays = prev.daysOfWeek || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];

      return {
        ...prev,
        daysOfWeek: newDays
      };
    });
  };

  const handleContactsChange = (e, index) => {
    const { name, value } = e.target;
    const newContacts = [...campaignData.contacts];
    newContacts[index] = { ...newContacts[index], [name]: value };
    setCampaignData(prev => ({ ...prev, contacts: newContacts }));
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const addContact = () => {
    setCampaignData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { email: '', phone: '', countryCode: '+91' }]
    }));
  };

  const removeContact = (index) => {
    setCampaignData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setCampaignData(prev => ({ ...prev, categoryIds: selectedValues }));
  };

  const handleTemplateSelect = (templateId) => {
    if (templateId) {
      const selectedTemplate = emailTemplates.find(t => t._id === templateId);
      if (selectedTemplate) {
        setCampaignData(prev => ({
          ...prev,
          templateId: selectedTemplate._id,
          subject: selectedTemplate.subject || prev.subject,
          message: selectedTemplate.content || prev.message
        }));
      }
    } else {
      setCampaignData(prev => ({ ...prev, templateId: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!campaignData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    }

    if (!campaignData.message.trim()) {
      newErrors.message = 'Campaign message is required';
    }

    if (campaignData.mode === 'email' && !campaignData.subject.trim()) {
      newErrors.subject = 'Email subject is required';
    }

    // Contact validation
    if (contactSource === 'manual' && campaignData.contacts.length === 0) {
      newErrors.contacts = 'Add at least one contact';
    } else if (contactSource === 'category' && campaignData.categoryIds.length === 0) {
      newErrors.categoryIds = 'Select at least one category';
    }

    // Validate manual contacts
    if (contactSource === 'manual') {
      campaignData.contacts.forEach((contact, index) => {
        if (campaignData.mode === 'email' && !contact.email) {
          newErrors[`contact_${index}`] = `Email is required for contact ${index + 1}`;
        }
        if (campaignData.mode === 'whatsapp' && !contact.phone) {
          newErrors[`contact_${index}`] = `Phone number is required for contact ${index + 1}`;
        }
      });
    }

    if (campaignData.scheduleType === 'scheduled' && !campaignData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }

    if (campaignData.scheduleType === 'recurring') {
      if (!campaignData.recurrenceConfig?.startDate) {
        newErrors.startDate = 'Start date is required for recurring campaigns';
      }
      
      // Validate perDayCount for multiple mode
      if (campaignData.recurrenceConfig?.dailyMode === 'multiple') {
        const perDayCount = parseInt(campaignData.recurrenceConfig.perDayCount) || 1;
        if (perDayCount < 1 || perDayCount > 100) {
          newErrors.perDayCount = 'Messages per day must be between 1 and 100';
        }
        
        // Validate interval for multiple messages
        if (perDayCount > 1) {
          const intervalMinutes = parseInt(campaignData.recurrenceConfig.intervalMinutes) || 0;
          if (intervalMinutes < 0 || intervalMinutes > 1440) {
            newErrors.intervalMinutes = 'Interval must be between 0 and 1440 minutes';
          }
        }
      }

      if (campaignData.recurringPattern === 'weekly' && (!campaignData.daysOfWeek || campaignData.daysOfWeek.length === 0)) {
        newErrors.daysOfWeek = 'Select at least one day for weekly recurrence';
      }
      if (campaignData.recurringPattern === 'monthly' && (!campaignData.dayOfMonth || campaignData.dayOfMonth < 1 || campaignData.dayOfMonth > 31)) {
        newErrors.dayOfMonth = 'Valid day of month (1-31) is required';
      }

      // Validate repeat count
      const repeatCount = parseInt(campaignData.recurrenceConfig?.repeatCount) || 1;
      if (repeatCount < 1 || repeatCount > 365) {
        newErrors.repeatCount = 'Repeat count must be between 1 and 365 days';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareCampaignData = () => {
    const data = { ...campaignData };
    console.log("📋 Original data before preparation:", data);

    const preparedData = JSON.parse(JSON.stringify(data));

    // 🔹 Handle schedule types
    if (preparedData.scheduleType === "immediate") {
      preparedData.scheduledDate = null;
      preparedData.scheduledTime = null;
      preparedData.recurringPattern = null;
      preparedData.repeatCount = null;
      preparedData.recurrenceConfig = null;
      preparedData.daysOfWeek = null;
      preparedData.dayOfMonth = null;
    } else if (preparedData.scheduleType === "scheduled") {
      preparedData.recurringPattern = null;
      preparedData.repeatCount = null;
      preparedData.recurrenceConfig = null;
      preparedData.daysOfWeek = null;
      preparedData.dayOfMonth = null;

      // 🕓 Combine date + time for scheduled campaigns
      if (preparedData.scheduledDate && preparedData.scheduledTime) {
        try {
          const localDateTime = `${preparedData.scheduledDate}T${preparedData.scheduledTime}`;
          const scheduledDateTime = new Date(localDateTime);
          
          if (!isNaN(scheduledDateTime.getTime())) {
            preparedData.scheduledDate = scheduledDateTime.toISOString();
          } else {
            console.error('❌ Invalid scheduled date/time');
            preparedData.scheduledDate = null;
          }
        } catch (error) {
          console.error('❌ Error parsing scheduled date:', error);
          preparedData.scheduledDate = null;
        }
      } else {
        preparedData.scheduledDate = null;
      }
    } else if (preparedData.scheduleType === "recurring") {
      // Remove single schedule values
      preparedData.scheduledDate = null;
      preparedData.scheduledTime = null;

      // Ensure recurrenceConfig exists and has proper values
      const recurrenceConfig = preparedData.recurrenceConfig || {};
      
      // Calculate dailyMode based on perDayCount if not explicitly set
      const perDayCountValue = parseInt(recurrenceConfig.perDayCount || 1, 10);
      const dailyMode = recurrenceConfig.dailyMode || (perDayCountValue > 1 ? 'multiple' : 'single');

      preparedData.recurrenceConfig = {
        startDate: recurrenceConfig.startDate || new Date().toISOString().split('T')[0],
        startTime: recurrenceConfig.startTime || "09:00",
        timezone: recurrenceConfig.timezone || "Asia/Kolkata",
        dailyMode: dailyMode,
        perDayCount: dailyMode === 'multiple' ? perDayCountValue : 1,
        intervalMinutes: parseInt(recurrenceConfig.intervalMinutes ?? 30, 10),
        scheduleDays: recurrenceConfig.scheduleDays || preparedData.recurringPattern || "daily",
        repeatCount: parseInt(recurrenceConfig.repeatCount || preparedData.repeatCount || 5, 10)
      };

      console.log('📤 Sending recurrenceConfig:', preparedData.recurrenceConfig);

      // Ensure repeatCount is set properly
      preparedData.repeatCount = parseInt(preparedData.repeatCount || 5, 10);
    }

    // 🧩 Ensure categoryIds is valid array
    if (preparedData.categoryIds && !Array.isArray(preparedData.categoryIds)) {
      preparedData.categoryIds = [preparedData.categoryIds];
    }
    preparedData.categoryIds = (preparedData.categoryIds || []).filter(
      (id) => id && id.trim() !== ""
    );

    // 🧾 Handle templateId cleanup
    if (!preparedData.templateId || preparedData.templateId === "" || preparedData.templateId === "null") {
      preparedData.templateId = null;
    }

    // 📇 Filter contacts (remove empty rows)
    if (preparedData.contacts && Array.isArray(preparedData.contacts)) {
      preparedData.contacts = preparedData.contacts.filter(
        (contact) =>
          (contact.email && contact.email.trim() !== "") ||
          (contact.phone && contact.phone.trim() !== "")
      );
    }

    console.log("🎯 Final prepared data for API:", preparedData);
    return preparedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (!validateForm()) {
      setActiveTab('basic');
      setFormLoading(false);
      return;
    }

    try {
      const preparedData = prepareCampaignData();

      let result;
      if (editData) {
        console.log('📝 Updating campaign:', editData._id);
        result = await dispatch(updateCampaign({
          id: editData._id,
          campaignData: preparedData
        })).unwrap();
      } else {
        console.log('🆕 Creating new campaign');
        result = await dispatch(createCampaign(preparedData)).unwrap();
      }

      console.log('✅ Campaign saved successfully:', result);

      if (onSaveComplete) {
        onSaveComplete(result);
      }

      handleClose();
    } catch (error) {
      console.error('❌ Failed to save campaign:', error);
      alert(`Failed to save campaign: ${error.message || 'Unknown error'}`);
    } finally {
      setFormLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FaPaperPlane className="w-4 h-4" /> },
    { id: 'contacts', label: 'Contacts', icon: <FaUsers className="w-4 h-4" /> },
    { id: 'scheduling', label: 'Scheduling', icon: <FaClock className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <FaCog className="w-4 h-4" /> }
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const nextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const prevTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl lg:max-w-6xl max-h-[95vh] overflow-hidden mx-2 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                {editData ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
              <p className="text-blue-100 mt-1 text-xs sm:text-sm">
                {editData ? 'Update your campaign settings' : 'Configure your marketing campaign'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
              type="button"
            >
              <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Schedule Change Warning */}
        {showScheduleWarning && editData && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4">
            <div className="flex items-start">
              <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
              <div>
                <p className="text-yellow-700 text-xs sm:text-sm">
                  <strong>Note:</strong> Changing schedule settings will update the campaign timing.
                  If the campaign was already scheduled, it will be rescheduled with the new time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden border-b border-gray-200 bg-white">
          <button
            onClick={() => setShowMobileTabs(!showMobileTabs)}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              {tabs.find(tab => tab.id === activeTab)?.icon}
              <span className="font-medium text-gray-700">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </span>
            </div>
            <FaChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showMobileTabs ? 'rotate-90' : ''}`} />
          </button>
          
          {showMobileTabs && (
            <div className="border-t border-gray-200 bg-white">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileTabs(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 w-full text-left border-b border-gray-100 last:border-b-0 ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:block border-b border-gray-200 bg-white">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-180px)]">

          {/* Mobile Navigation Controls */}
          <div className="lg:hidden flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
            <button
              type="button"
              onClick={prevTab}
              disabled={activeTab === 'basic'}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 disabled:opacity-30"
            >
              <FaChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  className={`w-2 h-2 rounded-full ${
                    activeTab === tab.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              type="button"
              onClick={nextTab}
              disabled={activeTab === 'settings'}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 disabled:opacity-30"
            >
              Next
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Campaign Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={campaignData.title}
                      onChange={handleInputChange}
                      placeholder="Enter campaign title"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.title}</p>}
                  </div>

                  {/* Campaign Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Mode *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCampaignData(prev => ({ ...prev, mode: 'email' }))}
                        className={`p-3 sm:p-4 border-2 rounded-lg text-center transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                          campaignData.mode === 'email'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <FaEnvelope className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Email</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampaignData(prev => ({ ...prev, mode: 'whatsapp' }))}
                        className={`p-3 sm:p-4 border-2 rounded-lg text-center transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                          campaignData.mode === 'whatsapp'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Email Subject */}
                  {campaignData.mode === 'email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={campaignData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter email subject"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                          errors.subject ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.subject && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.subject}</p>}
                    </div>
                  )}

                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Template
                    </label>
                    <select
                      value={campaignData.templateId || ''}
                      onChange={(e) => handleTemplateSelect(e.target.value || null)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                    >
                      <option value="">Select a template</option>
                      {emailTemplates.map(template => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Message *
                  </label>
                  <textarea
                    name="message"
                    value={campaignData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your campaign message here..."
                    rows={10}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.message && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.message}</p>}
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-2">
                    <span>{campaignData.message.length} characters</span>
                    <span>{campaignData.message.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Contact Source Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                  Contact Source
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContactSource('category')}
                    className={`p-3 sm:p-4 border-2 rounded-lg text-center transition-all text-sm sm:text-base ${
                      contactSource === 'category'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaUsers className="w-4 h-4" />
                      <span>From Categories</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactSource('manual')}
                    className={`p-3 sm:p-4 border-2 rounded-lg text-center transition-all text-sm sm:text-base ${
                      contactSource === 'manual'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaEnvelope className="w-4 h-4" />
                      <span>Manual Entry</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Category-based Contacts */}
              {contactSource === 'category' && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Categories *
                    </label>
                    <select
                      multiple
                      value={campaignData.categoryIds}
                      onChange={handleCategoryChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                        errors.categoryIds ? 'border-red-500' : 'border-gray-300'
                      }`}
                      size={4}
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name} ({category.subscribersCount || 0} subscribers)
                        </option>
                      ))}
                    </select>
                    {errors.categoryIds && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.categoryIds}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Hold Ctrl/Cmd to select multiple categories
                    </p>
                  </div>
                </div>
              )}

              {/* Manual Contacts */}
              {contactSource === 'manual' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Manual Contacts ({campaignData.contacts.length})
                    </label>
                    <button
                      type="button"
                      onClick={addContact}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <FaEnvelope className="w-4 h-4" />
                      Add Contact
                    </button>
                  </div>

                  {campaignData.contacts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <FaEnvelope className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-base sm:text-lg mb-2">No contacts added</p>
                      <p className="text-xs sm:text-sm text-gray-400">Add contacts manually to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {campaignData.contacts.map((contact, index) => (
                        <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-700 text-sm sm:text-base">Contact {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeContact(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Email {campaignData.mode === 'email' && '*'}
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={contact.email}
                                onChange={(e) => handleContactsChange(e, index)}
                                placeholder="email@example.com"
                                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Phone {campaignData.mode === 'whatsapp' && '*'}
                              </label>
                              <input
                                type="text"
                                name="phone"
                                value={contact.phone}
                                onChange={(e) => handleContactsChange(e, index)}
                                placeholder="Phone number"
                                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Country Code
                              </label>
                              <input
                                type="text"
                                name="countryCode"
                                value={contact.countryCode}
                                onChange={(e) => handleContactsChange(e, index)}
                                placeholder="+91"
                                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                          </div>
                          {errors[`contact_${index}`] && (
                            <p className="text-red-500 text-xs mt-2">{errors[`contact_${index}`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {errors.contacts && (
                <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.contacts}</p>
                </div>
              )}
            </div>
          )}

          {/* Scheduling Tab */}
          {activeTab === 'scheduling' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Schedule Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Type
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {[
                        { value: 'immediate', label: 'Send Immediately', icon: <FaPaperPlane className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { value: 'scheduled', label: 'Scheduled', icon: <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { value: 'recurring', label: 'Recurring', icon: <FaRedo className="w-4 h-4 sm:w-5 sm:h-5" /> }
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setCampaignData(prev => ({ ...prev, scheduleType: option.value }));
                            setShowScheduleWarning(true);
                          }}
                          className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-all flex items-center gap-2 sm:gap-3 text-sm sm:text-base ${
                            campaignData.scheduleType === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {option.icon}
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">
                              {option.value === 'immediate' && 'Send campaign immediately'}
                              {option.value === 'scheduled' && 'Schedule for specific date/time'}
                              {option.value === 'recurring' && 'Send campaign repeatedly'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scheduled Date/Time */}
                  {campaignData.scheduleType === 'scheduled' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scheduled Date *
                        </label>
                        <input
                          type="date"
                          name="scheduledDate"
                          value={campaignData.scheduledDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                            errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.scheduledDate && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.scheduledDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scheduled Time
                        </label>
                        <input
                          type="time"
                          name="scheduledTime"
                          value={campaignData.scheduledTime}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        />
                      </div>
                    </>
                  )}

                  {/* Recurring Options */}
                  {campaignData.scheduleType === 'recurring' && (
                    <>
                      {/* Start Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={campaignData.recurrenceConfig?.startDate || ''}
                          onChange={(e) => handleRecurringConfigChange('startDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                            errors.startDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.startDate && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.startDate}</p>}
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={campaignData.recurrenceConfig?.startTime || '09:00'}
                          onChange={(e) => handleRecurringConfigChange('startTime', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        />
                      </div>

                      {/* Schedule Pattern */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recurring Pattern
                        </label>
                        <select
                          name="recurringPattern"
                          value={campaignData.recurringPattern}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      {/* Daily Sending Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Sending Mode
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              handleRecurringConfigChange('dailyMode', 'single');
                              handleRecurringConfigChange('perDayCount', 1);
                            }}
                            className={`p-3 border-2 rounded-lg text-center transition-all flex items-center justify-center gap-2 text-sm ${
                              campaignData.recurrenceConfig?.dailyMode === 'single'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <FaPaperPlane className="w-4 h-4" />
                            <span>Send Once</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRecurringConfigChange('dailyMode', 'multiple')}
                            className={`p-3 border-2 rounded-lg text-center transition-all flex items-center justify-center gap-2 text-sm ${
                              campaignData.recurrenceConfig?.dailyMode === 'multiple'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <FaRedo className="w-4 h-4" />
                            <span>Send Multiple</span>
                          </button>
                        </div>
                      </div>

                      {/* Messages Per Day - Show for multiple mode */}
                      {campaignData.recurrenceConfig?.dailyMode === 'multiple' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Messages Per Day *
                          </label>
                          <input
                            type="number"
                            value={campaignData.recurrenceConfig?.perDayCount || 1}
                            onChange={(e) => handleRecurringConfigChange('perDayCount', parseInt(e.target.value) || 1)}
                            min="1"
                            max="100"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                              errors.perDayCount ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.perDayCount && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.perDayCount}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            Number of messages to send each day (1-100)
                          </p>
                        </div>
                      )}

                      {/* Interval Between Messages - Show for multiple mode and when perDayCount > 1 */}
                      {campaignData.recurrenceConfig?.dailyMode === 'multiple' && 
                       campaignData.recurrenceConfig?.perDayCount > 1 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interval Between Messages (minutes)
                          </label>
                          <input
                            type="number"
                            value={campaignData.recurrenceConfig?.intervalMinutes || 0}
                            onChange={(e) => handleRecurringConfigChange('intervalMinutes', parseInt(e.target.value) || 0)}
                            min="0"
                            max="1440"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                              errors.intervalMinutes ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.intervalMinutes && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.intervalMinutes}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            Set to 0 to send all messages immediately, or set minutes between messages
                          </p>
                        </div>
                      )}

                      {/* Weekly or Monthly pattern selections */}
                      {campaignData.recurringPattern === 'weekly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days of Week *
                          </label>
                          <div className="grid grid-cols-4 gap-1 sm:gap-2">
                            {dayNames.map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => handleDaysOfWeekChange(index)}
                                className={`p-2 border rounded-lg text-center text-xs sm:text-sm transition-all ${
                                  campaignData.daysOfWeek?.includes(index)
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                {day.substring(0, 3)}
                              </button>
                            ))}
                          </div>
                          {errors.daysOfWeek && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.daysOfWeek}</p>}
                        </div>
                      )}

                      {campaignData.recurringPattern === 'monthly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Day of Month *
                          </label>
                          <input
                            type="number"
                            name="dayOfMonth"
                            value={campaignData.dayOfMonth || ''}
                            onChange={handleInputChange}
                            min="1"
                            max="31"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                              errors.dayOfMonth ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.dayOfMonth && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.dayOfMonth}</p>}
                        </div>
                      )}

                      {/* Total Repeat Count */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Days to Run Campaign
                        </label>
                        <input
                          type="number"
                          value={campaignData.recurrenceConfig?.repeatCount || 5}
                          onChange={(e) => handleRecurringConfigChange('repeatCount', parseInt(e.target.value) || 5)}
                          min="1"
                          max="365"
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${
                            errors.repeatCount ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.repeatCount && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.repeatCount}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          Total number of days the campaign will run
                        </p>
                      </div>
                    </>
                  )}

                </div>

                {/* Schedule Preview */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Schedule Preview</h4>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    {campaignData.scheduleType === 'immediate' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <FaPaperPlane className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Campaign will be sent immediately after {editData ? 'update' : 'creation'}</span>
                      </div>
                    )}
                    {campaignData.scheduleType === 'scheduled' && campaignData.scheduledDate && (
                      <>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                          <span>Scheduled for: {new Date(campaignData.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                          <span>At: {campaignData.scheduledTime}</span>
                        </div>
                        {editData && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-blue-700 text-xs">
                              <FaExclamationTriangle className="inline w-3 h-3 mr-1" />
                              Updating schedule will reschedule the campaign
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {campaignData.scheduleType === 'recurring' && (
                      <>
                        <div className="flex items-center gap-2">
                          <FaRedo className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          <span>Repeats: {campaignData.recurringPattern}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          <span>At: {campaignData.recurrenceConfig?.startTime || '09:00'}</span>
                        </div>
                        {campaignData.recurringPattern === 'weekly' && campaignData.daysOfWeek && campaignData.daysOfWeek.length > 0 && (
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                            <span>On: {campaignData.daysOfWeek.map(day => dayNames[day].substring(0, 3)).join(', ')}</span>
                          </div>
                        )}
                        {campaignData.recurringPattern === 'monthly' && (
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                            <span>On day: {campaignData.dayOfMonth}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FaInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          <span>Daily Mode: {campaignData.recurrenceConfig?.dailyMode || 'single'}</span>
                        </div>
                        {campaignData.recurrenceConfig?.dailyMode === 'multiple' && (
                          <div className="flex items-center gap-2">
                            <FaInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                            <span>Messages per day: {campaignData.recurrenceConfig?.perDayCount || 1}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FaInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          <span>Total Days: {campaignData.recurrenceConfig?.repeatCount || campaignData.repeatCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          <span>Total Messages: {
                            (campaignData.recurrenceConfig?.repeatCount || campaignData.repeatCount) * 
                            (campaignData.recurrenceConfig?.perDayCount || 1)
                          }</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Media URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="mediaUrl"
                      value={campaignData.mediaUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      For WhatsApp campaigns, you can attach images, videos, or documents
                    </p>
                  </div>

                  {/* Tracking */}
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      name="trackingEnabled"
                      checked={campaignData.trackingEnabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Enable Tracking</label>
                      <p className="text-xs text-gray-500">
                        Track opens, clicks, and engagement metrics. For emails, this adds tracking pixels and click tracking.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Send Options */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Send Options</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Between Messages (ms)
                    </label>
                    <input
                      type="number"
                      name="delayBetweenMessages"
                      value={campaignData.sendOptions.delayBetweenMessages}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        sendOptions: { ...prev.sendOptions, delayBetweenMessages: parseInt(e.target.value) || 0 }
                      }))}
                      min="0"
                      max="60000"
                      step="1000"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Delay between sending messages to avoid rate limits
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Retries
                    </label>
                    <input
                      type="number"
                      name="maxRetries"
                      value={campaignData.sendOptions.maxRetries}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        sendOptions: { ...prev.sendOptions, maxRetries: parseInt(e.target.value) || 0 }
                      }))}
                      min="0"
                      max="5"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      name="batchSize"
                      value={campaignData.sendOptions.batchSize}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        sendOptions: { ...prev.sendOptions, batchSize: parseInt(e.target.value) || 0 }
                      }))}
                      min="1"
                      max="100"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of messages to send in each batch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={formLoading}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
            >
              {formLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  {editData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4 sm:w-5 sm:h-5" />
                  {editData ? 'Update Campaign' : 'Create Campaign'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}