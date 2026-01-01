import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  getCampaigns,
  getWhatsAppStatus,
  getWhatsAppQR,
  resetWhatsApp,
  startCampaign,
  stopCampaign,
  pauseCampaign,
  resumeCampaign,
  duplicateCampaign,
  deleteCampaign
} from "../../../store/Reducers/Awareness/campaignReducer";
import {
  FaEdit,
  FaRedo,
  FaClone,
  FaTrash,
  FaPaperPlane,
  FaPause,
  FaPlay,
  FaQrcode,
  FaWhatsapp,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
  FaPowerOff,
  FaExclamationCircle,
  FaMobileAlt,
  FaCheck,
  FaTimes
} from "react-icons/fa";

export default function Campaign() {
  const [socket, setSocket] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState({
    connected: false,
    initializing: false,
    qrNeeded: false,
    message: "❌ WhatsApp Not Connected",
    state: "UNKNOWN",
    authenticating: false
  });
  const [latestQR, setLatestQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [campaignStats, setCampaignStats] = useState({});
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [connectionStep, setConnectionStep] = useState('disconnected'); // disconnected -> qr_generated -> scanning -> authenticating -> connected
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  

  const dispatch = useDispatch();
  const {
    campaigns,
    loading,
    error,
    whatsappQR,
    whatsappLoading,
  } = useSelector((state) => state.campaign);

  // Initialize Socket Connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });
    
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    newSocket.on("whatsapp-status", (data) => {
      console.log("📱 WhatsApp Status Update:", data);
      
      // Update connection steps based on status
      if (data.connected) {
        setConnectionStep('connected');
        setShowSuccessNotification(true);
        // Auto-hide success notification after 5 seconds
        setTimeout(() => setShowSuccessNotification(false), 5000);
      } else if (data.initializing) {
        setConnectionStep('authenticating');
      } else if (data.qrNeeded && latestQR) {
        setConnectionStep('scanning');
      }
      
      setWhatsappStatus(prev => ({
        ...prev,
        ...data
      }));
      
      // Auto-close QR modal when connected
      if (data.connected) {
        setTimeout(() => {
          setShowQRModal(false);
          setLatestQR(null);
          setQrLoading(false);
        }, 2000); // Keep modal open for 2 seconds to show success
      }
    });

    newSocket.on("campaign-progress", (data) => {
      console.log("Campaign Progress:", data);
      setCampaignStats(prev => ({
        ...prev,
        [data.campaignId]: data
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [latestQR]);

  // Load initial data
  useEffect(() => {
    dispatch(getCampaigns());
    // Get initial WhatsApp status
    dispatch(getWhatsAppStatus());
  }, [dispatch]);

  // Handle QR code fetching
  const handleFetchQR = async () => {
    try {
      setQrLoading(true);
      setQrError(null);
      setConnectionStep('qr_generated');
      console.log("🔄 Fetching QR code...");
      
      const result = await dispatch(getWhatsAppQR());
      console.log("📄 QR Code Result:", result);
      
      if (result.payload?.success && result.payload.qr) {
        setLatestQR(result.payload.qr);
        setQrError(null);
        setConnectionStep('scanning');
      } else {
        setQrError(result.payload?.error || "Failed to generate QR code");
        setConnectionStep('disconnected');
      }
    } catch (error) {
      console.error("❌ QR Code Error:", error);
      setQrError("Failed to generate QR code");
      setConnectionStep('disconnected');
    } finally {
      setQrLoading(false);
    }
  };

  // Handle WhatsApp connection
  const handleConnectWhatsApp = async () => {
    setShowQRModal(true);
    setQrLoading(true);
    setQrError(null);
    setConnectionStep('qr_generated');
    
    // Wait a bit for socket to be ready
    setTimeout(() => {
      handleFetchQR();
    }, 1000);
  };

  // Handle WhatsApp logout
  const handleLogoutWhatsApp = async () => {
    try {
      await dispatch(resetWhatsApp());
      setWhatsappStatus({
        connected: false,
        initializing: false,
        qrNeeded: false,
        message: "❌ WhatsApp Disconnected",
        state: "DISCONNECTED",
        authenticating: false
      });
      setLatestQR(null);
      setShowQRModal(false);
      setConnectionStep('disconnected');
      setShowSuccessNotification(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // Auto-refresh QR code every 30 seconds if needed
  useEffect(() => {
    let interval;
    if (showQRModal && whatsappStatus.qrNeeded && !whatsappStatus.connected) {
      interval = setInterval(() => {
        if (!qrLoading && connectionStep === 'scanning') {
          console.log("🔄 Auto-refreshing QR code...");
          handleFetchQR();
        }
      }, 300000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQRModal, whatsappStatus.qrNeeded, whatsappStatus.connected, qrLoading, connectionStep]);

  // Get connection step display
  const getConnectionStepDisplay = () => {
    switch (connectionStep) {
      case 'disconnected':
        return {
          title: "Disconnected",
          description: "WhatsApp is not connected",
          icon: <FaTimes className="text-red-500 text-2xl" />,
          color: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      case 'qr_generated':
        return {
          title: "Generating QR Code",
          description: "Please wait while we generate your QR code",
          icon: <FaSync className="text-blue-500 text-2xl animate-spin" />,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
      case 'scanning':
        return {
          title: "Scan QR Code",
          description: "Open WhatsApp on your phone and scan the QR code",
          icon: <FaMobileAlt className="text-purple-500 text-2xl" />,
          color: "text-purple-500",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200"
        };
      case 'authenticating':
        return {
          title: "Authenticating",
          description: "Please wait while we authenticate your device",
          icon: <FaSync className="text-yellow-500 text-2xl animate-spin" />,
          color: "text-yellow-500",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200"
        };
      case 'connected':
        return {
          title: "Connected Successfully!",
          description: "WhatsApp is now connected and ready to use",
          icon: <FaCheck className="text-green-500 text-2xl" />,
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      default:
        return {
          title: "Disconnected",
          description: "WhatsApp is not connected",
          icon: <FaTimes className="text-red-500 text-2xl" />,
          color: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
    }
  };

  // Campaign Actions (same as before)
  const handleStartCampaign = (campaignId) => {
    if (!whatsappStatus.connected && campaigns.find(c => c._id === campaignId)?.mode === 'whatsapp') {
      alert("WhatsApp is not connected. Please connect WhatsApp first.");
      return;
    }
    dispatch(startCampaign(campaignId));
  };

  const handleStopCampaign = (campaignId) => {
    dispatch(stopCampaign(campaignId));
  };

  const handlePauseCampaign = (campaignId) => {
    dispatch(pauseCampaign(campaignId));
  };

  const handleResumeCampaign = (campaignId) => {
    dispatch(resumeCampaign(campaignId));
  };

  const handleDuplicateCampaign = (campaignId) => {
    dispatch(duplicateCampaign(campaignId));
  };

  const handleDeleteCampaign = (campaignId) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      dispatch(deleteCampaign(campaignId));
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get mode icon
  const getModeIcon = (mode) => {
    return mode === 'whatsapp' ? <FaWhatsapp className="text-green-500" /> : '📧';
  };

  const connectionStepDisplay = getConnectionStepDisplay();

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-6xl mx-auto mt-4">
      <strong>Error:</strong> {error}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm max-w-6xl mx-auto">
      {/* ===== Success Notification ===== */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
              <div>
                <p className="text-green-800 font-semibold">WhatsApp Connected!</p>
                <p className="text-green-600 text-sm">Your WhatsApp is now connected successfully</p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="text-green-400 hover:text-green-600 ml-auto"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Header Section ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600 mt-1">Manage your email and WhatsApp campaigns</p>
        </div>

        {/* WhatsApp Status Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-w-80">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              whatsappStatus.connected ? 'bg-green-500' : 
              whatsappStatus.initializing ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-semibold text-gray-700">WhatsApp Status</span>
          </div>
          <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
            {whatsappStatus.initializing && <FaSync className="animate-spin" />}
            {whatsappStatus.message}
          </div>
          <div className="flex gap-2">
            {!whatsappStatus.connected && !whatsappStatus.initializing && (
              <button
                onClick={handleConnectWhatsApp}
                disabled={whatsappStatus.initializing}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <FaQrcode />
                Connect WhatsApp
              </button>
            )}
            {whatsappStatus.connected && (
              <button
                onClick={handleLogoutWhatsApp}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaPowerOff />
                Logout
              </button>
            )}
            {whatsappStatus.initializing && (
              <button
                disabled
                className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg opacity-50"
              >
                <FaSync className="animate-spin" />
                Initializing...
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== QR Code Modal ===== */}
      {showQRModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Connect WhatsApp</h3>
              {!whatsappStatus.connected && (
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setQrLoading(false);
                    setQrError(null);
                    setConnectionStep('disconnected');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Connection Status Steps */}
            <div className={`mb-6 p-4 rounded-lg border ${connectionStepDisplay.bgColor} ${connectionStepDisplay.borderColor}`}>
              <div className="flex items-center gap-3 mb-2">
                {connectionStepDisplay.icon}
                <span className={`font-semibold ${connectionStepDisplay.color}`}>
                  {connectionStepDisplay.title}
                </span>
              </div>
              <p className="text-sm text-gray-600 text-left">
                {connectionStepDisplay.description}
              </p>
            </div>

            {/* QR Loading State */}
            {qrLoading && connectionStep === 'qr_generated' && (
              <div className="py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating QR Code...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            )}

            {/* QR Code Display */}
            {!qrLoading && latestQR && connectionStep === 'scanning' && (
              <>
                <img
                  src={latestQR}
                  alt="WhatsApp QR Code"
                  className="mx-auto w-64 h-64 border border-gray-200 rounded-lg"
                />
                <p className="mt-4 text-sm text-gray-600">
                  Scan this QR code with WhatsApp to connect your account
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  QR code will auto-refresh every 30 seconds
                </p>
              </>
            )}

            {/* Authenticating State */}
            {connectionStep === 'authenticating' && (
              <div className="py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Authenticating...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please wait while we authenticate your device
                </p>
              </div>
            )}

            {/* Connected Success State */}
            {connectionStep === 'connected' && (
              <div className="py-8">
                <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                <p className="text-green-600 font-semibold text-lg">Connected Successfully!</p>
                <p className="text-gray-600 mt-2">Your WhatsApp is now connected</p>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Error State */}
            {!qrLoading && qrError && (
              <div className="py-8">
                <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
                <p className="text-red-600 font-semibold">Failed to generate QR</p>
                <p className="text-gray-600 text-sm mt-2">{qrError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-2 justify-center">
              {!whatsappStatus.connected && connectionStep !== 'connected' && (
                <button
                  onClick={handleFetchQR}
                  disabled={qrLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <FaSync className={qrLoading ? "animate-spin" : ""} />
                  {qrLoading ? "Generating..." : "Refresh QR"}
                </button>
              )}
              
              {!whatsappStatus.connected && (
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setQrLoading(false);
                    setQrError(null);
                    setConnectionStep('disconnected');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rest of your campaigns table code */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Campaigns ({campaigns.length})</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Create Campaign
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📧</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No campaigns found</h3>
            <p className="text-gray-500">Create your first campaign to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-lg">
                          {getModeIcon(campaign.mode)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                          <div className="text-sm text-gray-500">
                            {campaignStats[campaign._id] ? (
                              <span>
                                Progress: {campaignStats[campaign._id].sent || 0}/{campaign.totalRecipients}
                              </span>
                            ) : (
                              campaign.mode === 'email' ? 'Email Campaign' : 'WhatsApp Campaign'
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.mode === 'whatsapp' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {campaign.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.totalRecipients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.scheduleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {/* Your action buttons here */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}