import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserById,
  deleteUser,
  clearUserSessions
} from "../../../../store/Reducers/Awareness/analyticsReducer";
import UAParser from "ua-parser-js";

const UserDetailModal = ({ userId, onClose }) => {
  const dispatch = useDispatch();
  const { userDetails, loading, error } = useSelector((state) => state.analytics);
  const [activeTab, setActiveTab] = useState("overview");
  const [sessionsLimit, setSessionsLimit] = useState(50);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'user' or 'sessions'
    title: "",
    message: ""
  });

  // Fetch user data when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(getUserById(userId));
    }
  }, [dispatch, userId]);

  // Delete handlers
  const openDeleteModal = useCallback((type) => {
    if (type === 'user') {
      setDeleteModal({
        isOpen: true,
        type: 'user',
        title: 'Delete User',
        message: `Are you sure you want to delete user "${userDetails?.user_id}"? This will permanently remove all user data including sessions and events.`
      });
    } else if (type === 'sessions') {
      setDeleteModal({
        isOpen: true,
        type: 'sessions',
        title: 'Clear User Sessions',
        message: `Are you sure you want to clear all sessions for user "${userDetails?.user_id}"? This will reset their session history but keep the user profile.`
      });
    }
  }, [userDetails]);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({
      isOpen: false,
      type: null,
      title: "",
      message: ""
    });
  }, []);

  const confirmDelete = useCallback(() => {
    const { type } = deleteModal;

    if (type === 'user') {
      dispatch(deleteUser(userId)).then(() => {
        onClose(); // Close modal after successful deletion
      });
    } else if (type === 'sessions') {
      dispatch(clearUserSessions(userId));
    }

    closeDeleteModal();
  }, [deleteModal, userId, dispatch, onClose, closeDeleteModal]);

  // Memoized formatting functions
  const formatDuration = useCallback((minutes) => {
    if (!minutes || minutes === 0) return "0m";

    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.round((minutes % 1) * 60);

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  }, []);

  const formatTime = useCallback((dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString();
  }, []);

  // Memoized session data
  const allSessions = useMemo(() => {
    if (!userDetails?.sessions?.recent) return [];
    return userDetails.sessions.recent.slice(0, sessionsLimit === 0 ? undefined : sessionsLimit);
  }, [userDetails?.sessions?.recent, sessionsLimit]);

  // Memoized page analytics
  const pageAnalytics = useMemo(() => {
    return userDetails?.page_analytics?.popular_pages || [];
  }, [userDetails?.page_analytics?.popular_pages]);

  // Memoized acquisition sources
  const acquisitionSources = useMemo(() => {
    return userDetails?.acquisition?.sources || [];
  }, [userDetails?.acquisition?.sources]);

  // Memoized device info parsing
  const parsedDeviceInfo = useMemo(() => {
    if (!userDetails?.device) return {};

    // If we have raw user agent string or "Win32", try to parse it
    const uaParser = new UAParser();

    // Check if browser field looks like a user agent string
    const browserStr = userDetails.device.browser || '';
    const osStr = userDetails.device.os || '';

    // Use the stored User Agent if available, otherwise try to use the browser field if it looks like a UA
    const uaString = userDetails.device.user_agent || (browserStr.includes('Mozilla') ? browserStr : '');

    if (uaString) {
      uaParser.setUA(uaString);
      const result = uaParser.getResult();

      return {
        os: `${result.os.name || 'Windows'} ${result.os.version || ''}`.trim(),
        browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
        device_type: result.device.type || userDetails.device.device_type || 'desktop',
        screen_resolution: userDetails.device.screen_resolution,
        language: userDetails.device.language
      };
    }

    // Fallback for simple "Win32" case if no UA string
    let displayOS = osStr;
    if (osStr === 'Win32') displayOS = 'Windows';
    if (osStr === 'MacIntel') displayOS = 'macOS';

    return {
      os: displayOS,
      browser: browserStr,
      device_type: userDetails.device.device_type,
      screen_resolution: userDetails.device.screen_resolution,
      language: userDetails.device.language
    };
  }, [userDetails?.device]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!userId) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-7xl p-6 rounded-2xl shadow-2xl relative max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-2xl font-bold z-10 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          ×
        </button>

        {loading.userDetails ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading user details...</span>
          </div>
        ) : error.userDetails ? (
          <div className="text-center py-10">
            <div className="text-red-500 text-lg font-semibold">Error loading user details</div>
            <p className="text-gray-600 mt-2">{error.userDetails}</p>
            <button
              onClick={() => dispatch(getUserById(userId))}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : userDetails ? (
          <>
            {/* Header with Actions */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-800 truncate">
                    👤 User Analytics - {userDetails.user_id}
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm">
                    First seen: {formatDate(userDetails.first_seen_at)} |
                    Last active: {formatDate(userDetails.last_active_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${userDetails.is_online
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                    {userDetails.is_online ? '🟢 Online' : '⚫ Offline'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${userDetails.status === 'new'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                    {userDetails.status === 'new' ? '🆕 New User' : '🔄 Returning User'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openDeleteModal('sessions')}
                  disabled={loading.clearUserSessions}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  {loading.clearUserSessions ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Sessions
                    </>
                  )}
                </button>

                <button
                  onClick={() => openDeleteModal('user')}
                  disabled={loading.deleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  {loading.deleteUser ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8 overflow-x-auto">
                {[
                  { key: "overview", label: "📊 Overview", count: null },
                  { key: "sessions", label: `🕒 Sessions`, count: userDetails.sessions?.total || 0 },
                  { key: "pages", label: `📄 Pages`, count: userDetails.page_analytics?.total_unique_pages || 0 },
                  { key: "acquisition", label: "🔗 Acquisition", count: acquisitionSources.length }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && <OverviewTab userDetails={userDetails} deviceInfo={parsedDeviceInfo} formatDuration={formatDuration} formatDate={formatDate} />}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <SessionsTab
                sessions={allSessions}
                totalSessions={userDetails.sessions?.total || 0}
                sessionsLimit={sessionsLimit}
                setSessionsLimit={setSessionsLimit}
                formatDuration={formatDuration}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            )}

            {/* Pages Tab */}
            {activeTab === "pages" && (
              <PagesTab
                pages={pageAnalytics}
                totalPages={userDetails.page_analytics?.total_unique_pages || 0}
                formatDuration={formatDuration}
                formatDate={formatDate}
              />
            )}

            {/* Acquisition Tab */}
            {activeTab === "acquisition" && (
              <AcquisitionTab
                sources={acquisitionSources}
                formatDate={formatDate}
              />
            )}

            {/* Close Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No user data available</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        loading={loading.deleteUser || loading.clearUserSessions}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, title, message, loading, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-xl">
                ⚠️
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            {message}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for better organization
const OverviewTab = ({ userDetails, deviceInfo, formatDuration, formatDate }) => (
  <div className="space-y-6">
    {/* Engagement Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Sessions"
        value={userDetails.engagement?.total_sessions || 0}
        bgColor="blue"
      />
      <StatCard
        label="Total Time"
        value={formatDuration(userDetails.engagement?.total_time_spent_min)}
        bgColor="green"
      />
      <StatCard
        label="Pages Visited"
        value={userDetails.engagement?.total_pages_visited || 0}
        bgColor="purple"
      />
      <StatCard
        label="Avg. Session"
        value={formatDuration(userDetails.engagement?.avg_session_time_min)}
        bgColor="orange"
      />
    </div>

    {/* Device & Location */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InfoCard title="💻 Device Info">
        <InfoItem label="OS" value={deviceInfo?.os || userDetails.device?.os} />
        <InfoItem label="Browser" value={deviceInfo?.browser || userDetails.device?.browser} />
        <InfoItem label="Device Type" value={deviceInfo?.device_type || userDetails.device?.device_type} />
        <InfoItem label="Screen" value={deviceInfo?.screen_resolution || userDetails.device?.screen_resolution} />
        <InfoItem label="Language" value={deviceInfo?.language || userDetails.device?.language} />
      </InfoCard>

      <InfoCard title="🌍 Location">
        <InfoItem label="Country" value={userDetails.location?.country} />
        <InfoItem label="Region" value={userDetails.location?.region} />
        <InfoItem label="City" value={userDetails.location?.city} />
        <InfoItem label="Timezone" value={userDetails.location?.timezone} />
        <InfoItem label="IP" value={userDetails.location?.ip} />
      </InfoCard>
    </div>

    {/* Timeline */}
    <InfoCard title="📈 Activity Timeline">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <InfoItem label="First Seen" value={formatDate(userDetails.first_seen_at)} />
        <InfoItem label="Last Active" value={formatDate(userDetails.last_active_at)} />
        <InfoItem label="Activity Status" value={userDetails.activity_status} capitalize />
      </div>
    </InfoCard>
  </div>
);

const SessionsTab = ({ sessions, totalSessions, sessionsLimit, setSessionsLimit, formatDuration, formatDate, formatTime }) => (
  <div>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <h4 className="text-lg font-semibold text-gray-800">
        📜 All Sessions ({totalSessions})
      </h4>
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600 whitespace-nowrap">Show:</label>
        <select
          value={sessionsLimit}
          onChange={(e) => setSessionsLimit(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        >
          <option value={20}>20 sessions</option>
          <option value={50}>50 sessions</option>
          <option value={100}>100 sessions</option>
          <option value={0}>All sessions</option>
        </select>
      </div>
    </div>

    {sessions.length > 0 ? (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">Session ID</th>
                <th className="px-4 py-3 text-left">Start Time</th>
                <th className="px-4 py-3 text-left">End Time</th>
                <th className="px-4 py-3 text-center">Duration</th>
                <th className="px-4 py-3 text-center">Pages</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, index) => (
                <SessionRow
                  key={session.session_id}
                  session={session}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <EmptyState
        icon="🕒"
        title="No session data available"
        message="Session data will appear when users interact with your application"
      />
    )}
  </div>
);

const PagesTab = ({ pages, totalPages, formatDuration, formatDate }) => (
  <div>
    <h4 className="text-lg font-semibold text-gray-800 mb-4">
      📄 Page Analytics ({totalPages} unique pages)
    </h4>

    {pages.length > 0 ? (
      <div className="space-y-4">
        {pages.map((page, index) => (
          <PageCard
            key={page.page_url}
            page={page}
            formatDuration={formatDuration}
            formatDate={formatDate}
          />
        ))}
      </div>
    ) : (
      <EmptyState
        icon="📄"
        title="No page data available"
        message="Page tracking will appear when users navigate between pages"
      />
    )}
  </div>
);

const AcquisitionTab = ({ sources, formatDate }) => (
  <div>
    <h4 className="text-lg font-semibold text-gray-800 mb-4">
      🔗 Acquisition Sources ({sources.length})
    </h4>

    {sources.length > 0 ? (
      <div className="space-y-4">
        {sources.map((source, index) => (
          <AcquisitionCard
            key={source._id || 'direct'}
            source={source}
            formatDate={formatDate}
          />
        ))}
      </div>
    ) : (
      <EmptyState
        icon="🔗"
        title="No acquisition data available"
        message="Acquisition data appears when users come from external sources"
      />
    )}
  </div>
);

// Reusable Components
const StatCard = ({ label, value, bgColor = "blue" }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
  };

  const color = colors[bgColor];

  return (
    <div className={`p-4 rounded-lg border ${color.bg} ${color.border}`}>
      <p className={`text-sm font-medium ${color.text}`}>{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
};

const InfoCard = ({ title, children }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <h4 className="text-lg font-semibold text-gray-800 mb-3">{title}</h4>
    {children}
  </div>
);

const InfoItem = ({ label, value, capitalize = false }) => (
  <p className="flex justify-between items-center py-1">
    <strong className="text-gray-700">{label}:</strong>
    <span className={`text-gray-600 ${capitalize ? 'capitalize' : ''}`}>
      {value || 'Unknown'}
    </span>
  </p>
);

const SessionRow = ({ session, formatDuration, formatDate, formatTime }) => (
  <tr className="border-b hover:bg-gray-50 transition-colors">
    <td className="px-4 py-3 font-mono text-xs text-gray-600">
      {session.session_id.substring(0, 10)}...
    </td>
    <td className="px-4 py-3">
      <div>{formatDate(session.start_time)}</div>
      <div className="text-xs text-gray-500">{formatTime(session.start_time)}</div>
    </td>
    <td className="px-4 py-3">
      {session.end_time ? (
        <>
          <div>{formatDate(session.end_time)}</div>
          <div className="text-xs text-gray-500">{formatTime(session.end_time)}</div>
        </>
      ) : (
        <span className="text-green-600 font-medium">Active</span>
      )}
    </td>
    <td className="px-4 py-3 text-center font-medium">
      {formatDuration(session.duration_min)}
    </td>
    <td className="px-4 py-3 text-center">
      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
        {session.page_views || 0}
      </span>
    </td>
    <td className="px-4 py-3 text-center">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${session.is_active
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
        {session.is_active ? '🟢 Active' : '⚫ Closed'}
      </span>
    </td>
    <td className="px-4 py-3">
      {session.referrer?.source ? (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200">
          {session.referrer.source}
        </span>
      ) : (
        <span className="text-xs text-gray-500">Direct</span>
      )}
    </td>
  </tr>
);

const PageCard = ({ page, formatDuration, formatDate }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-gray-800 text-lg truncate">
          {page.page_title || 'Untitled Page'}
        </h5>
        <p className="text-sm text-gray-600 mt-1 font-mono truncate">
          {page.page_url}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium border border-blue-200">
          {page.total_visits} {page.total_visits === 1 ? 'visit' : 'visits'}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
      <MetricItem label="Total Time" value={formatDuration(page.total_time_spent_min)} />
      <MetricItem label="Avg. Time" value={formatDuration(page.avg_time_spent_min)} />
      <MetricItem
        label="Time per Visit"
        value={page.total_visits > 0 ? formatDuration(page.total_time_spent_min / page.total_visits) : '0m'}
      />
      <MetricItem label="Last Visit" value={formatDate(page.last_visit)} />
    </div>
  </div>
);

const AcquisitionCard = ({ source, formatDate }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div className="flex-1">
        <h5 className="font-medium text-gray-800 text-lg capitalize">
          {source._id || 'direct'}
          {source.medium && (
            <span className="text-sm text-gray-600 ml-2">({source.medium})</span>
          )}
        </h5>
        {source.campaign && source.campaign !== 'organic' && (
          <p className="text-sm text-gray-600 mt-1">Campaign: {source.campaign}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <span className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium border border-green-200">
          {source.sessions} {source.sessions === 1 ? 'session' : 'sessions'}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-sm text-gray-600">
      <InfoItem label="First Visit" value={formatDate(source.first_visit)} />
      <InfoItem label="Last Visit" value={formatDate(source.last_visit)} />
    </div>
  </div>
);

const MetricItem = ({ label, value }) => (
  <div className="text-center">
    <div className="font-bold text-gray-800">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{label}</div>
  </div>
);

const EmptyState = ({ icon, title, message }) => (
  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-4xl mb-3">{icon}</div>
    <p className="text-lg font-medium mb-2">{title}</p>
    <p className="text-sm">{message}</p>
  </div>
);

export default UserDetailModal;