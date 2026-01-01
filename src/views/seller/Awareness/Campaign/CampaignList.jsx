import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCampaigns } from '../../../../store/Reducers/Awareness/campaignReducer';
import CampaignActions from './CampaignActions';
import CreateCampaign from './CreateCampaign';
import { 
  FaEnvelope, 
  FaWhatsapp, 
  FaCheckCircle, 
  FaSyncAlt, 
  FaClock, 
  FaCalendarAlt,
  FaTimesCircle,
  FaPauseCircle,
  FaQuestionCircle,
  FaRedo,
  FaSearch,
  FaFilter,
  FaBars,
  FaTimes
} from 'react-icons/fa';

export default function CampaignList() {
  const dispatch = useDispatch();
  const { campaigns, campaignsLoading, error } = useSelector(state => state.campaign || {});
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    mode: '',
    scheduleType: '',
    search: ''
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Refresh campaigns when lastActionTime changes
  useEffect(() => {
    dispatch(getCampaigns(filters));
  }, [dispatch, lastActionTime, filters]);

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setShowEditForm(true);
  };

  const handleCloseEdit = () => {
    setEditingCampaign(null);
    setShowEditForm(false);
    setLastActionTime(Date.now());
  };

  const handleManualRefresh = () => {
    dispatch(getCampaigns(filters));
  };

  const handleActionPerformed = () => {
    setLastActionTime(Date.now());
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      mode: '',
      scheduleType: '',
      search: ''
    });
    setShowMobileFilters(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': 
        return { 
          icon: <FaCheckCircle className="text-green-500" />, 
          text: 'Sent',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'sending': 
        return { 
          icon: <FaSyncAlt className="text-blue-500 animate-spin" />, 
          text: 'Sending',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'pending': 
        return { 
          icon: <FaClock className="text-yellow-500" />, 
          text: 'Pending',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'scheduled': 
        return { 
          icon: <FaCalendarAlt className="text-purple-500" />, 
          text: 'Scheduled',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        };
      case 'failed': 
        return { 
          icon: <FaTimesCircle className="text-red-500" />, 
          text: 'Failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'paused': 
        return { 
          icon: <FaPauseCircle className="text-gray-500" />, 
          text: 'Paused',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
      case 'stopped': 
        return { 
          icon: <FaTimesCircle className="text-orange-500" />, 
          text: 'Stopped',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        };
      case 'completed': 
        return { 
          icon: <FaCheckCircle className="text-green-500" />, 
          text: 'Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      default: 
        return { 
          icon: <FaQuestionCircle className="text-gray-400" />, 
          text: 'Unknown',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const getModeIcon = (mode) => {
    if (mode === 'email') {
      return { 
        icon: <FaEnvelope className="text-blue-500" />, 
        color: 'text-blue-600',
        label: 'Email'
      };
    } else {
      return { 
        icon: <FaWhatsapp className="text-green-500" />, 
        color: 'text-green-600',
        label: 'WhatsApp'
      };
    }
  };

  const getStatusMessage = (campaign) => {
    const sent = campaign.successCount || 0;
    const failed = campaign.failedCount || 0;
    const total = campaign.totalRecipients || 0;

    // Check if scheduled time has expired
    if (campaign.scheduleType === 'scheduled' && campaign.scheduledDate) {
      const scheduledTime = new Date(campaign.scheduledDate);
      const now = new Date();
      
      if (scheduledTime < now && campaign.status === 'scheduled') {
        return 'Schedule expired - needs update';
      }
    }

    if (campaign.status === 'failed') {
      return `Failed: ${failed}/${total}`;
    }
    if (campaign.status === 'sent' || campaign.status === 'completed') {
      if (sent === total) return 'All messages sent';
      if (failed > 0) return `${sent}/${total} sent (${failed} failed)`;
      return `${sent}/${total} sent`;
    }
    if (campaign.status === 'sending') {
      const progress = total > 0 ? Math.round((sent / total) * 100) : 0;
      return `Sending ${sent}/${total} (${progress}%)`;
    }
    if (campaign.status === 'pending') {
      return 'Ready to send';
    }
    if (campaign.status === 'scheduled') {
      return 'Scheduled for delivery';
    }
    if (campaign.status === 'stopped') {
      return `Stopped: ${sent}/${total} sent`;
    }
    return 'Waiting...';
  };

  const getScheduleInfo = (campaign) => {
    switch (campaign.scheduleType) {
      case 'immediate':
        return 'Send immediately';
      case 'scheduled':
        if (campaign.scheduledDate) {
          const date = new Date(campaign.scheduledDate);
          const now = new Date();
          
          // Check if schedule has expired
          if (date < now) {
            return `Schedule expired: ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
          }
          
          const time = campaign.scheduledTime || 
            `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          return `Scheduled: ${date.toLocaleDateString()} ${time}`;
        }
        return 'Scheduled (no date set)';
      case 'recurring':
        const pattern = campaign.recurringPattern || 'daily';
        const count = campaign.repeatCount || 1;
        const time = campaign.recurrenceConfig?.startTime || 
                     campaign.scheduledTime || 
                     '09:00';
        const currentRepeat = campaign.currentRepeat || 0;
        return `Recurring: ${pattern} at ${time} (${currentRepeat}/${count} completed)`;
      default:
        return campaign.scheduleType || 'Unknown';
    }
  };

  const getFilteredCampaigns = () => {
    if (!campaigns) return [];
    
    return campaigns.filter(campaign => {
      if (filters.status && campaign.status !== filters.status) return false;
      if (filters.mode && campaign.mode !== filters.mode) return false;
      if (filters.scheduleType && campaign.scheduleType !== filters.scheduleType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          campaign.title?.toLowerCase().includes(searchLower) ||
          campaign.subject?.toLowerCase().includes(searchLower) ||
          campaign.message?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  const filteredCampaigns = getFilteredCampaigns();

  if (campaignsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading campaigns...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 sm:mx-0">
        <div className="flex items-center">
          <FaTimesCircle className="text-red-500 mr-2" />
          <span className="text-red-700">Error loading campaigns: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 mx-2 sm:mx-0">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Marketing Campaigns</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your email and WhatsApp campaigns</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <button
                onClick={handleManualRefresh}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                title="Refresh campaigns"
              >
                <FaRedo className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-3 mt-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="failed">Failed</option>
              <option value="paused">Paused</option>
              <option value="stopped">Stopped</option>
              <option value="completed">Completed</option>
            </select>

            {/* Mode Filter */}
            <select
              value={filters.mode}
              onChange={(e) => handleFilterChange('mode', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>

            {/* Schedule Type Filter */}
            <select
              value={filters.scheduleType}
              onChange={(e) => handleFilterChange('scheduleType', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Schedules</option>
              <option value="immediate">Immediate</option>
              <option value="scheduled">Scheduled</option>
              <option value="recurring">Recurring</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <FaFilter className="w-4 h-4" />
              Clear Filters
            </button>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="lg:hidden mt-4 space-y-3 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Status Filter */}
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="sending">Sending</option>
                  <option value="sent">Sent</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="failed">Failed</option>
                </select>

                {/* Mode Filter */}
                <select
                  value={filters.mode}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Channels</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>

                {/* Schedule Type Filter */}
                <select
                  value={filters.scheduleType}
                  onChange={(e) => handleFilterChange('scheduleType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Schedules</option>
                  <option value="immediate">Immediate</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="recurring">Recurring</option>
                </select>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <FaFilter className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Campaigns Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Campaign Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => {
                const statusInfo = getStatusIcon(campaign.status);
                const modeInfo = getModeIcon(campaign.mode);
                const statusMessage = getStatusMessage(campaign);
                const scheduleInfo = getScheduleInfo(campaign);
                
                return (
                  <tr key={campaign._id} className="hover:bg-blue-50 transition-colors duration-200">
                    {/* Campaign Title */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-gray-900">
                          {campaign.title}
                        </div>
                        {campaign.subject && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {campaign.subject}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {campaign._id?.slice(-8)}
                        </div>
                      </div>
                    </td>

                    {/* Created Date & Time */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900 font-medium">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(campaign.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className={`flex flex-col items-center p-2 rounded-lg ${modeInfo.color === 'text-blue-600' ? 'bg-blue-50' : 'bg-green-50'}`}>
                          <div className="text-2xl">
                            {modeInfo.icon}
                          </div>
                          <div className={`text-xs font-medium mt-1 ${modeInfo.color}`}>
                            {modeInfo.label}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${statusInfo.bgColor} min-w-[120px]`}>
                          <div className="text-xl">
                            {statusInfo.icon}
                          </div>
                          <div className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-center">
                          {statusMessage}
                        </div>
                        {!campaign.isActive && campaign.status !== 'paused' && (
                          <div className="text-xs text-gray-400 mt-1">Inactive</div>
                        )}
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-sm font-medium text-gray-900 text-center capitalize">
                          {scheduleInfo}
                        </div>
                        {campaign.scheduleType === 'recurring' && campaign.currentRepeat > 0 && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Progress: {campaign.currentRepeat}/{campaign.repeatCount}
                          </div>
                        )}
                        {campaign.lastSentAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last: {new Date(campaign.lastSentAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <CampaignActions 
                          campaign={campaign} 
                          onEdit={handleEdit}
                          onActionComplete={handleActionPerformed}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden">
          <div className="p-4 space-y-4">
            {filteredCampaigns.map((campaign) => {
              const statusInfo = getStatusIcon(campaign.status);
              const modeInfo = getModeIcon(campaign.mode);
              const statusMessage = getStatusMessage(campaign);
              const scheduleInfo = getScheduleInfo(campaign);
              
              return (
                <div key={campaign._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {campaign.title}
                      </h3>
                      {campaign.subject && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {campaign.subject}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className={`p-1.5 rounded-lg ${modeInfo.color === 'text-blue-600' ? 'bg-blue-50' : 'bg-green-50'}`}>
                        {modeInfo.icon}
                      </div>
                    </div>
                  </div>

                  {/* Status and Schedule */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* Status */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Status</span>
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${statusInfo.bgColor}`}>
                        <div className="text-lg">
                          {statusInfo.icon}
                        </div>
                        <span className={`text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {statusMessage}
                      </span>
                    </div>

                    {/* Schedule */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Schedule</span>
                      <div className="text-xs font-medium text-gray-900 p-2 bg-gray-50 rounded-lg">
                        {scheduleInfo}
                      </div>
                      {campaign.scheduleType === 'recurring' && campaign.currentRepeat > 0 && (
                        <span className="text-xs text-green-600 font-medium mt-1">
                          Progress: {campaign.currentRepeat}/{campaign.repeatCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Created Date and Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <CampaignActions 
                        campaign={campaign} 
                        onEdit={handleEdit}
                        onActionComplete={handleActionPerformed}
                        compact={true}
                      />
                    </div>
                  </div>

                  {/* Campaign ID */}
                  <div className="text-xs text-gray-400 mt-2">
                    ID: {campaign._id?.slice(-8)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">
              <FaEnvelope className="inline-block" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {Object.values(filters).some(f => f) ? 'No campaigns match your filters' : 'No campaigns yet'}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
              {Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first campaign to start sending emails or WhatsApp messages to your audience.'
              }
            </p>
            {Object.values(filters).some(f => f) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Campaign Modal */}
      {showEditForm && editingCampaign && (
        <CreateCampaign 
          onClose={handleCloseEdit} 
          editData={editingCampaign} 
          onSaveComplete={handleActionPerformed}
        />
      )}
    </>
  );
}