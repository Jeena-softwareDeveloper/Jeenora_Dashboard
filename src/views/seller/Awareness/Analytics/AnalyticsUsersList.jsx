import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getAllUsers, 
  deleteUser, 
  deleteMultipleUsers,
  clearUserSessions,
  clearAllSessions,
  resetAllAnalytics
} from "../../../../store/Reducers/Awareness/analyticsReducer";
import UserDetailModal from "./UserDetailModel";

const AnalyticsUserList = () => {
  const dispatch = useDispatch();
  const { userList, loading, error, deleteResults } = useSelector((state) => state.analytics);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    online: "all",
    source: "all"
  });
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'single', 'multiple', 'sessions', 'allSessions', 'resetAll'
    userId: null,
    userName: null
  });

  // Show success message when delete operations complete
  useEffect(() => {
    if (deleteResults) {
      console.log('Delete operation completed:', deleteResults);
      // You could add a toast notification here
    }
  }, [deleteResults]);

  // Debounced filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const apiFilters = {
        page, 
        limit, 
        search: filters.search || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        online: filters.online !== "all" ? filters.online : undefined,
        referrer_source: filters.source !== "all" ? filters.source : undefined
      };
      
      dispatch(getAllUsers(apiFilters));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, page, limit, filters]);

  // Memoized computed values
  const stats = useMemo(() => {
    if (!userList?.length) return null;
    
    return {
      totalUsers: userList.length,
      onlineUsers: userList.filter(user => user.is_online).length,
      newUsers: userList.filter(user => user.status === 'new').length,
      totalSessions: userList.reduce((sum, user) => sum + (user.total_sessions || 0), 0),
      totalPages: userList.reduce((sum, user) => sum + (user.total_pages_visited || 0), 0),
      avgSessionTime: Math.round(
        userList.reduce((sum, user) => sum + (user.avg_session_time_min * 60 || 0), 0) / userList.length
      )
    };
  }, [userList]);

  // Event handlers
  const handleNextPage = () => setPage(prev => prev + 1);
  const handlePrevPage = () => page > 1 && setPage(prev => prev - 1);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "all",
      online: "all",
      source: "all"
    });
    setPage(1);
  }, []);

  // Selection handlers
  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.size === userList.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(userList.map(user => user.user_id)));
    }
  }, [userList, selectedUsers.size]);

  // Delete handlers
  const openDeleteModal = useCallback((type, userId = null, userName = null) => {
    setDeleteModal({
      isOpen: true,
      type,
      userId,
      userName
    });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({
      isOpen: false,
      type: null,
      userId: null,
      userName: null
    });
  }, []);

  const confirmDelete = useCallback(() => {
    const { type, userId } = deleteModal;
    
    switch (type) {
      case 'single':
        if (userId) {
          dispatch(deleteUser(userId));
        }
        break;
      case 'multiple':
        if (selectedUsers.size > 0) {
          dispatch(deleteMultipleUsers(Array.from(selectedUsers)));
          setSelectedUsers(new Set());
        }
        break;
      case 'sessions':
        if (userId) {
          dispatch(clearUserSessions(userId));
        }
        break;
      case 'allSessions':
        dispatch(clearAllSessions());
        break;
      case 'resetAll':
        dispatch(resetAllAnalytics('I understand this will delete all data'));
        break;
      default:
        break;
    }
    
    closeDeleteModal();
  }, [deleteModal, selectedUsers, dispatch, closeDeleteModal]);

  // Formatting functions
  const formatTime = useCallback((totalSeconds) => {
    if (!totalSeconds) return "0s";
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  const formatTotalTime = useCallback((totalMinutes) => {
    if (!totalMinutes) return "0m";
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, []);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== "all" && value !== "").length;
  }, [filters]);

  if (loading.userList) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <p className="text-lg">Loading users...</p>
      </div>
    );
  }

  if (error.userList) {
    return (
      <div className="text-center text-red-500 font-semibold mt-4">
        Error loading users: {error.userList}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Enhanced Header Section */}
      <HeaderSection 
        selectedUsersCount={selectedUsers.size}
        totalUsers={userList.length}
        onDeleteAllSessions={() => openDeleteModal('allSessions')}
        onResetAllAnalytics={() => openDeleteModal('resetAll')}
      />

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <BulkActions 
          selectedCount={selectedUsers.size}
          onDelete={() => openDeleteModal('multiple')}
          onClearSelection={() => setSelectedUsers(new Set())}
        />
      )}

      {/* Filters Section */}
      <FiltersSection 
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Stats Summary */}
      {stats && <StatsSummary stats={stats} formatTime={formatTime} />}

      {/* Users Table */}
      <UsersTable 
        users={userList}
        selectedUsers={selectedUsers}
        onUserSelect={setSelectedUserId}
        onUserCheck={handleSelectUser}
        onSelectAll={handleSelectAll}
        onDeleteUser={openDeleteModal}
        onClearSessions={openDeleteModal}
        formatTotalTime={formatTotalTime}
      />

      {/* Pagination */}
      {userList?.length > 0 && (
        <Pagination 
          page={page}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          userCount={userList.length}
        />
      )}

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        type={deleteModal.type}
        userId={deleteModal.userId}
        userName={deleteModal.userName}
        selectedCount={selectedUsers.size}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        loading={loading.deleteUser || loading.deleteMultipleUsers || loading.clearUserSessions || loading.clearAllSessions || loading.resetAllAnalytics}
      />
    </div>
  );
};

// Enhanced Header Section Component
const HeaderSection = ({ selectedUsersCount, totalUsers, onDeleteAllSessions, onResetAllAnalytics }) => (
  <div className="mb-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          👥 User Analytics Dashboard
        </h2>
        <p className="text-gray-600 mt-2">
          Manage and analyze user activity, sessions, and engagement metrics
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onDeleteAllSessions}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All Sessions
        </button>
        
        <button
          onClick={onResetAllAnalytics}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset All Analytics
        </button>
      </div>
    </div>

  </div>
);

const QuickStat = ({ label, value, icon, color = "blue" }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
};

// Bulk Actions Component
const BulkActions = ({ selectedCount, onDelete, onClearSelection }) => (
  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-yellow-800 font-semibold">
          🎯 {selectedCount} user{selectedCount > 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Selected
        </button>
        <button
          onClick={onClearSelection}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
        >
          Clear Selection
        </button>
      </div>
    </div>
  </div>
);

// Filters Section Component
const FiltersSection = ({ filters, onFilterChange, onClearFilters, activeFiltersCount }) => (
  <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <FilterInput
    //    label="🔍 Search Users"
        type="text"
        value={filters.search}
        onChange={(value) => onFilterChange('search', value)}
        placeholder="User ID, country, city..."
      />
      
      <FilterSelect
      //  label="📊 Status"
        value={filters.status}
        onChange={(value) => onFilterChange('status', value)}
        options={[
          { value: "all", label: "All Status" },
          { value: "new", label: "New" },
          { value: "returning", label: "Returning" }
        ]}
      />
      
      <FilterSelect
      //  label="🟢 Online Status"
        value={filters.online}
        onChange={(value) => onFilterChange('online', value)}
        options={[
          { value: "all", label: "All" },
          { value: "true", label: "Online" },
          { value: "false", label: "Offline" }
        ]}
      />
      
      <FilterSelect
    //    label="🔗 Source"
        value={filters.source}
        onChange={(value) => onFilterChange('source', value)}
        options={[
          { value: "all", label: "All Sources" },
          { value: "direct", label: "Direct" },
          { value: "google", label: "Google" },
          { value: "facebook", label: "Facebook" },
          { value: "twitter", label: "Twitter" },
          { value: "email", label: "Email" }
        ]}
      />
      
      <div className="flex items-end">
        <button
          onClick={onClearFilters}
          disabled={activeFiltersCount === 0}
          className={`w-full px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
            activeFiltersCount === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Clear All
        </button>
      </div>
    </div>

    {/* Active Filters Display */}
    {activeFiltersCount > 0 && (
      <ActiveFilters filters={filters} onFilterChange={onFilterChange} />
    )}
  </div>
);

const FilterInput = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ActiveFilters = ({ filters, onFilterChange }) => {
  const activeFilters = [
    { key: 'search', value: filters.search, label: `Search: "${filters.search}"` },
    { key: 'status', value: filters.status, label: `Status: ${filters.status}` },
    { key: 'online', value: filters.online, label: `Online: ${filters.online === "true" ? "Yes" : "No"}` },
    { key: 'source', value: filters.source, label: `Source: ${filters.source}` }
  ].filter(filter => filter.value !== "all" && filter.value !== "");

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {activeFilters.map(filter => (
        <span
          key={filter.key}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
        >
          {filter.label}
          <button
            onClick={() => onFilterChange(filter.key, filter.key === 'search' ? '' : 'all')}
            className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};

const StatsSummary = ({ stats, formatTime }) => (
  <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
    <StatCard label="Total Users" value={stats.totalUsers} color="blue" />
    <StatCard label="Online Now" value={stats.onlineUsers} color="green" />
    <StatCard label="Total Sessions" value={stats.totalSessions} color="purple" />
    <StatCard label="Total Pages" value={stats.totalPages} color="orange" />
    <StatCard label="Avg Session" value={formatTime(stats.avgSessionTime)} color="red" />
  </div>
);

const StatCard = ({ label, value, color = "blue" }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
  };

  const colorClass = colors[color];

  return (
    <div className={`p-4 rounded-lg border ${colorClass.bg} ${colorClass.border}`}>
      <p className={`text-sm font-medium ${colorClass.text}`}>{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

const UsersTable = ({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  onUserCheck, 
  onSelectAll, 
  onDeleteUser, 
  onClearSessions,
  formatTotalTime 
}) => (
  <div className="overflow-x-auto shadow-md rounded-lg">
    <table className="min-w-full bg-white border border-gray-200">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr className="text-gray-700 text-sm uppercase">
          <th className="px-4 py-3 text-left w-12">
            <input
              type="checkbox"
              checked={users.length > 0 && selectedUsers.size === users.length}
              onChange={onSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </th>
          <th className="px-4 py-3 text-left">User ID</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-left">Online</th>
          <th className="px-4 py-3 text-left">Sessions</th>
          <th className="px-4 py-3 text-left">Pages</th>
          <th className="px-4 py-3 text-left">Total Time</th>
          <th className="px-4 py-3 text-left">Source</th>
          <th className="px-4 py-3 text-left">Country / City</th>
          <th className="px-4 py-3 text-left">Device</th>
          <th className="px-4 py-3 text-left">Last Active</th>
          <th className="px-4 py-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users?.length > 0 ? (
          users.map((user) => (
            <UserRow
              key={user.user_id}
              user={user}
              isSelected={selectedUsers.has(user.user_id)}
              onUserSelect={onUserSelect}
              onUserCheck={onUserCheck}
              onDeleteUser={onDeleteUser}
              onClearSessions={onClearSessions}
              formatTotalTime={formatTotalTime}
            />
          ))
        ) : (
          <EmptyTableState />
        )}
      </tbody>
    </table>
  </div>
);

const UserRow = ({ 
  user, 
  isSelected, 
  onUserSelect, 
  onUserCheck, 
  onDeleteUser, 
  onClearSessions,
  formatTotalTime 
}) => (
  <tr className="border-b hover:bg-gray-50 transition-colors duration-150 text-sm">
    <td className="px-4 py-2">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onUserCheck(user.user_id)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </td>
    
    <td className="px-4 py-2 font-mono text-gray-800 text-xs">
      {user.user_id.length > 20 ? `${user.user_id.substring(0, 20)}...` : user.user_id}
    </td>
    
    <td className="px-4 py-2">
      <UserStatus status={user.status} />
    </td>
    
    <td className="px-4 py-2">
      <OnlineStatus isOnline={user.is_online} />
    </td>
    
    <td className="px-4 py-2 text-center">
      <CountBadge count={user.total_sessions} color="blue" />
    </td>
    
    <td className="px-4 py-2 text-center">
      <CountBadge count={user.total_pages_visited} color="purple" />
    </td>
    
    <td className="px-4 py-2 text-gray-700 font-medium">
      {formatTotalTime(user.total_time_spent_min)}
    </td>

    <td className="px-4 py-2">
      <SourceBadge source={user.referrer?.source} />
    </td>
    
    <td className="px-4 py-2 text-gray-700">
      <LocationInfo country={user.country} city={user.city} />
    </td>
    
    <td className="px-4 py-2 text-gray-700">
      <DeviceInfo device={user.device} />
    </td>
    
    <td className="px-4 py-2 text-gray-500 text-xs">
      <LastActiveTime date={user.last_active_at} />
    </td>
    
    <td className="px-4 py-2">
      <div className="flex gap-1">
        <ActionButtons 
          onView={() => onUserSelect(user.user_id)}
          onClearSessions={() => onClearSessions('sessions', user.user_id, user.user_id)}
          onDelete={() => onDeleteUser('single', user.user_id, user.user_id)}
        />
      </div>
    </td>
  </tr>
);

const UserStatus = ({ status }) => (
  status === "new" ? (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
      New
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
      Returning
    </span>
  )
);

const OnlineStatus = ({ isOnline }) => (
  isOnline ? (
    <span className="flex items-center text-green-600 font-semibold">
      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
      Online
    </span>
  ) : (
    <span className="flex items-center text-gray-500 font-semibold">
      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
      Offline
    </span>
  )
);

const CountBadge = ({ count, color = "blue" }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {count || 0}
    </span>
  );
};

const SourceBadge = ({ source }) => {
  if (!source || source === 'direct') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        🎯 Direct
      </span>
    );
  }

  const icons = {
    google: '🔍',
    facebook: '📘',
    twitter: '🐦',
    email: '📧'
  };

  const colors = {
    google: 'bg-blue-100 text-blue-800 border-blue-200',
    facebook: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    twitter: 'bg-sky-100 text-sky-800 border-sky-200',
    email: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[source] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {icons[source] || ''} {source}
    </span>
  );
};

const LocationInfo = ({ country, city }) => (
  <div>
    <div className="font-medium">{country || "Unknown"}</div>
    <div className="text-xs text-gray-500">{city || "Unknown"}</div>
  </div>
);

const DeviceInfo = ({ device }) => {
  const deviceType = device?.toLowerCase() || '';
  const icons = {
    desktop: '',
    mobile: '',
    tablet: ''
  };

  const icon = icons[deviceType] || '';

  return (
    <div className="text-xs">
      {device || "Unknown"} {icon}
    </div>
  );
};

const LastActiveTime = ({ date }) => (
  <>
    {new Date(date).toLocaleDateString()} 
    <br />
    {new Date(date).toLocaleTimeString()}
  </>
);

const ActionButtons = ({ onView, onClearSessions, onDelete }) => (
  <div className="flex gap-1">
    <button
      onClick={onView}
      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
      title="View Details"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
    <button
      onClick={onClearSessions}
      className="p-1 text-green-600 hover:text-green-800 transition-colors"
      title="Clear Sessions"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
    <button
      onClick={onDelete}
      className="p-1 text-red-600 hover:text-red-800 transition-colors"
      title="Delete User"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
);

const EmptyTableState = () => (
  <tr>
    <td colSpan="12" className="text-center py-12 text-gray-500 italic">
      <div className="flex flex-col items-center">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <p className="text-lg mb-2">No users found</p>
        <p className="text-sm">Try adjusting your search filters</p>
      </div>
    </td>
  </tr>
);

const Pagination = ({ page, onPrevPage, onNextPage, userCount }) => (
  <div className="flex justify-between items-center mt-6">
    <button
      onClick={onPrevPage}
      disabled={page === 1}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
        page === 1
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Previous
    </button>

    <span className="text-gray-700 font-semibold">
      Page {page} 
      <span className="text-gray-500 font-normal ml-2">
        (Showing {userCount} users)
      </span>
    </span>

    <button
      onClick={onNextPage}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
    >
      Next
      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
      </svg>
    </button>
  </div>
);

// Enhanced Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ 
  isOpen, 
  type, 
  userId, 
  userName, 
  selectedCount, 
  onConfirm, 
  onCancel,
  loading 
}) => {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case 'single':
        return {
          title: 'Delete User',
          message: `Are you sure you want to delete user "${userName || userId}"? This action cannot be undone.`,
          confirmText: 'Delete User',
          confirmColor: 'bg-red-600 hover:bg-red-700',
          icon: '🗑️'
        };
      case 'multiple':
        return {
          title: 'Delete Multiple Users',
          message: `Are you sure you want to delete ${selectedCount} user${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`,
          confirmText: `Delete ${selectedCount} Users`,
          confirmColor: 'bg-red-600 hover:bg-red-700',
          icon: '🗑️'
        };
      case 'sessions':
        return {
          title: 'Clear User Sessions',
          message: `Are you sure you want to clear all sessions for user "${userName || userId}"? This will reset their session data.`,
          confirmText: 'Clear Sessions',
          confirmColor: 'bg-orange-600 hover:bg-orange-700',
          icon: '🔄'
        };
      case 'allSessions':
        return {
          title: 'Clear All Sessions',
          message: `Are you sure you want to clear ALL sessions for ALL users? This will reset session data for every user in the system. This action cannot be undone.`,
          confirmText: 'Clear All Sessions',
          confirmColor: 'bg-orange-600 hover:bg-orange-700',
          icon: '🔄'
        };
      case 'resetAll':
        return {
          title: 'Reset All Analytics',
          message: `⚠️ DANGEROUS ACTION! Are you sure you want to reset ALL analytics data? This will permanently delete ALL users, sessions, events, and reset the entire analytics system. This action cannot be undone.`,
          confirmText: 'Reset Everything',
          confirmColor: 'bg-red-600 hover:bg-red-700',
          icon: '🚨'
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          icon: '⚠️'
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-xl">
                {content.icon}
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {content.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            {content.message}
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
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${content.confirmColor} disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {content.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsUserList;