import { useDispatch, useSelector } from 'react-redux';
import { 
  startCampaign, 
  stopCampaign, 
  pauseCampaign, 
  resumeCampaign,
  resendCampaign,
  duplicateCampaign,
  deleteCampaign,
  getCampaigns
} from '../../../../store/Reducers/Awareness/campaignReducer';
import {
  FaPlay,
  FaStop,
  FaPause,
  FaRedo,
  FaCopy,
  FaEdit,
  FaRegPlayCircle,
  FaTrash,
  FaChartBar,
  FaTimes,
  FaExclamationCircle,
  FaEllipsisV
} from 'react-icons/fa';
import { useState } from 'react';

export default function CampaignActions({ campaign, onEdit, onActionComplete, compact = false }) {
  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [resetAnalytics, setResetAnalytics] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Ensure campaign ID is properly handled
  const getCampaignId = () => {
    if (!campaign || !campaign._id) {
      console.error('❌ Campaign or campaign ID is missing:', campaign);
      return null;
    }
    
    // Handle both string and object IDs
    const campaignId = typeof campaign._id === 'string' 
      ? campaign._id 
      : campaign._id.toString();
    
    if (!campaignId || campaignId === '[object Object]') {
      console.error('❌ Invalid campaign ID:', campaignId);
      return null;
    }
    
    return campaignId;
  };

  const handleAction = async (action, options = {}) => {
    const campaignId = getCampaignId();
    if (!campaignId) {
      showErrorModal('Invalid campaign ID. Please refresh the page and try again.');
      return;
    }

    try {
      setActionLoading(action);
      console.log(`🔄 Performing action: ${action} on campaign:`, campaignId);
      
      let result;
      
      switch (action) {
        case 'start':
          result = await dispatch(startCampaign(campaignId)).unwrap();
          break;
        case 'stop':
          result = await dispatch(stopCampaign(campaignId)).unwrap();
          break;
        case 'pause':
          result = await dispatch(pauseCampaign(campaignId)).unwrap();
          break;
        case 'resume':
          result = await dispatch(resumeCampaign(campaignId)).unwrap();
          break;
        case 'resend':
          result = await dispatch(resendCampaign({ 
            id: campaignId, 
            resetAnalytics: options.resetAnalytics 
          })).unwrap();
          break;
        case 'duplicate':
          result = await dispatch(duplicateCampaign({ 
            id: campaignId, 
            newTitle: options.newTitle 
          })).unwrap();
          console.log('✅ Duplicate action completed:', result);
          break;
        case 'delete':
          result = await dispatch(deleteCampaign(campaignId)).unwrap();
          break;
        default:
          break;
      }
      
      // Close mobile menu after action
      setShowMobileMenu(false);
      
      // Refresh campaigns list after any action
      setTimeout(() => {
        dispatch(getCampaigns());
      }, 1000);
      
      // Also call the action complete callback if provided
      if (onActionComplete) {
        console.log('🔄 Triggering action complete callback');
        onActionComplete();
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to ${action} campaign:`, error);
      
      // Show more detailed error message using modal instead of alert
      const errorMessage = error.message || 'Unknown error occurred';
      showErrorModal(`Failed to ${action} campaign: ${errorMessage}`);
      
      // Still refresh on error to ensure UI is updated
      setTimeout(() => {
        dispatch(getCampaigns());
      }, 1000);
      
      if (onActionComplete) {
        onActionComplete();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const showErrorModal = (message) => {
    // Create a modal for error display
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div class="flex items-center gap-3 mb-4">
          <div class="text-red-500 text-xl">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Error</h3>
        </div>
        <p class="text-gray-600 mb-6 text-sm sm:text-base">${message}</p>
        <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const showInfoModal = (message) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div class="flex items-center gap-3 mb-4">
          <div class="text-blue-500 text-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Information</h3>
        </div>
        <p class="text-gray-600 mb-6 text-sm sm:text-base">${message}</p>
        <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
    setShowMobileMenu(false);
  };

  const confirmDelete = async () => {
    await handleAction('delete');
    setShowDeleteModal(false);
  };

  const handleDuplicate = () => {
    setDuplicateTitle(`${campaign.title} - Copy`);
    setShowDuplicateModal(true);
    setShowMobileMenu(false);
  };

  const confirmDuplicate = async () => {
    if (duplicateTitle.trim()) {
      await handleAction('duplicate', { newTitle: duplicateTitle });
      setShowDuplicateModal(false);
      setDuplicateTitle('');
    }
  };

  const handleResend = () => {
    setShowResendModal(true);
    setShowMobileMenu(false);
  };

  const confirmResend = async () => {
    await handleAction('resend', { resetAnalytics });
    setShowResendModal(false);
  };

  const getActionButtons = () => {
    const buttons = [];

    // View Analytics Button - Available for all campaigns
    buttons.push({
      action: 'analytics',
      icon: <FaChartBar className="w-4 h-4" />,
      title: 'View Campaign Analytics',
      label: 'Analytics',
      color: 'text-purple-600 hover:text-purple-800 hover:bg-purple-100',
      onClick: () => {
        console.log('View analytics for:', campaign._id);
        showInfoModal(`Analytics view for "${campaign.title}" would open here`);
        setShowMobileMenu(false);
      }
    });

    // Edit Button - Available for ALL campaigns except currently sending ones
    if (campaign.status !== 'sending') {
      buttons.push({
        action: 'edit',
        icon: <FaEdit className="w-4 h-4" />,
        title: campaign.status === 'sent' ? 'Edit & Reschedule Campaign' : 'Edit Campaign',
        label: 'Edit',
        color: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100',
        onClick: () => {
          onEdit(campaign);
          setShowMobileMenu(false);
        }
      });
    }

    // Start Button Logic
    const canStartCampaign = 
      (campaign.status === 'pending' && campaign.isActive) || 
      (campaign.scheduleType === 'scheduled' && campaign.scheduledDate && new Date(campaign.scheduledDate) < new Date()) ||
      (campaign.scheduleType === 'immediate' && campaign.status === 'pending') ||
      (campaign.status === 'stopped' && campaign.isActive);

    if (canStartCampaign) {
      let startTitle = 'Start Campaign Now';
      let startLabel = 'Start';
      if (campaign.status === 'scheduled' && new Date(campaign.scheduledDate) < new Date()) {
        startTitle = 'Send Now (Schedule Expired)';
        startLabel = 'Send Now';
      } else if (campaign.status === 'stopped') {
        startTitle = 'Resume Campaign';
        startLabel = 'Resume';
      }

      buttons.push({
        action: 'start',
        icon: <FaPlay className="w-4 h-4" />,
        title: startTitle,
        label: startLabel,
        color: 'text-green-600 hover:text-green-800 hover:bg-green-100',
        onClick: () => handleAction('start'),
        loading: actionLoading === 'start'
      });
    }

    // Stop Button - Only for sending campaigns
    if (campaign.status === 'sending') {
      buttons.push({
        action: 'stop',
        icon: <FaStop className="w-4 h-4" />,
        title: 'Stop Campaign',
        label: 'Stop',
        color: 'text-red-600 hover:text-red-800 hover:bg-red-100',
        onClick: () => handleAction('stop'),
        loading: actionLoading === 'stop'
      });
    }

    // Pause Button - For active recurring campaigns
    if (campaign.scheduleType === 'recurring' && campaign.isActive && campaign.status !== 'sending' && campaign.status !== 'sent' && campaign.status !== 'completed') {
      buttons.push({
        action: 'pause',
        icon: <FaPause className="w-4 h-4" />,
        title: 'Pause Recurring Campaign',
        label: 'Pause',
        color: 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100',
        onClick: () => handleAction('pause'),
        loading: actionLoading === 'pause'
      });
    }

    // Resume Button - For paused campaigns
    if (!campaign.isActive && campaign.status === 'paused') {
      buttons.push({
        action: 'resume',
        icon: <FaRegPlayCircle className="w-4 h-4" />,
        title: 'Resume Campaign',
        label: 'Resume',
        color: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100',
        onClick: () => handleAction('resume'),
        loading: actionLoading === 'resume'
      });
    }

    // Resend Button - For completed/failed campaigns (all schedule types)
    if (['sent', 'failed', 'completed', 'stopped'].includes(campaign.status)) {
      buttons.push({
        action: 'resend',
        icon: <FaRedo className="w-4 h-4" />,
        title: 'Resend Campaign',
        label: 'Resend',
        color: 'text-purple-600 hover:text-purple-800 hover:bg-purple-100',
        onClick: handleResend,
        loading: actionLoading === 'resend'
      });
    }

    // Duplicate Button - Available for all campaigns
    buttons.push({
      action: 'duplicate',
      icon: <FaCopy className="w-4 h-4" />,
      title: 'Duplicate Campaign',
      label: 'Duplicate',
      color: 'text-green-600 hover:text-green-800 hover:bg-green-100',
      onClick: handleDuplicate,
      loading: actionLoading === 'duplicate'
    });

    // Delete Button - Available for campaigns not currently sending
    if (campaign.status !== 'sending') {
      buttons.push({
        action: 'delete',
        icon: <FaTrash className="w-4 h-4" />,
        title: 'Delete Campaign',
        label: 'Delete',
        color: 'text-red-600 hover:text-red-800 hover:bg-red-100',
        onClick: handleDelete,
        loading: actionLoading === 'delete'
      });
    }

    return buttons;
  };

  const actionButtons = getActionButtons();

  if (actionButtons.length === 0) {
    return (
      <span className="text-gray-400 text-sm">No actions available</span>
    );
  }

  // For compact mode (mobile cards)
  if (compact) {
    return (
      <>
        <div className="flex items-center gap-1">
          {/* Show primary actions as icons */}
          {actionButtons.slice(0, 3).map((button) => (
            <button
              key={button.action}
              onClick={button.onClick}
              disabled={button.loading}
              title={button.title}
              className={`p-1.5 rounded-lg transition-all duration-200 ${button.color} ${
                button.loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {button.loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              ) : (
                button.icon
              )}
            </button>
          ))}
          
          {/* Show dropdown for additional actions */}
          {actionButtons.length > 3 && (
            <div className="relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaEllipsisV className="w-3 h-3" />
              </button>
              
              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                  {actionButtons.slice(3).map((button) => (
                    <button
                      key={button.action}
                      onClick={button.onClick}
                      disabled={button.loading}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                        button.loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {button.loading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                      ) : (
                        button.icon
                      )}
                      <span>{button.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Render modals */}
        {renderModals()}
      </>
    );
  }

  // Desktop layout
  return (
    <>
      {/* Desktop - Full button layout */}
      <div className="hidden lg:flex flex-wrap items-center justify-center gap-1">
        {actionButtons.map((button) => (
          <button
            key={button.action}
            onClick={button.onClick}
            disabled={button.loading}
            title={button.title}
            className={`p-2 rounded-lg transition-all duration-200 ${button.color} ${
              button.loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {button.loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              button.icon
            )}
          </button>
        ))}
      </div>

      {/* Mobile - Compact dropdown layout */}
      <div className="lg:hidden relative">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all border border-gray-300"
          title="Campaign actions"
        >
          <FaEllipsisV className="w-4 h-4" />
        </button>
        
        {showMobileMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-64 overflow-y-auto">
            {actionButtons.map((button) => (
              <button
                key={button.action}
                onClick={button.onClick}
                disabled={button.loading}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  button.loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className={`flex-shrink-0 ${button.color.replace('hover:text-', 'text-').split(' ')[0]}`}>
                  {button.loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    button.icon
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{button.label}</div>
                  <div className="text-xs text-gray-500">{button.title}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Render modals */}
      {renderModals()}
    </>
  );

  function renderModals() {
    return (
      <>
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-red-500 text-xl">
                  <FaTimes />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Campaign</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Are you sure you want to delete "<strong>{campaign.title}</strong>"? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading === 'delete'}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
                >
                  {actionLoading === 'delete' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Campaign Modal */}
        {showDuplicateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-green-500 text-xl">
                  <FaCopy />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Duplicate Campaign</h3>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Campaign Title
                </label>
                <input
                  type="text"
                  value={duplicateTitle}
                  onChange={(e) => setDuplicateTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Enter new campaign title"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setDuplicateTitle('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDuplicate}
                  disabled={!duplicateTitle.trim() || actionLoading === 'duplicate'}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
                >
                  {actionLoading === 'duplicate' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : null}
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resend Campaign Modal */}
        {showResendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-purple-500 text-xl">
                  <FaRedo />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Resend Campaign</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Resend "<strong>{campaign.title}</strong>" to all recipients?
              </p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
                <input
                  type="checkbox"
                  id="resetAnalytics"
                  checked={resetAnalytics}
                  onChange={(e) => setResetAnalytics(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 flex-shrink-0"
                />
                <label htmlFor="resetAnalytics" className="text-sm text-gray-700">
                  Reset campaign analytics and start fresh
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowResendModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResend}
                  disabled={actionLoading === 'resend'}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
                >
                  {actionLoading === 'resend' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : null}
                  Resend
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}