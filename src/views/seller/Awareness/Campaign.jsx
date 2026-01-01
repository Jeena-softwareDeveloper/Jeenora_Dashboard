import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  getCampaigns,
  getWhatsAppStatus,
  getWhatsAppQR,
  resetWhatsApp,
} from "../../../store/Reducers/Awareness/campaignReducer";
import CampaignList from "./Campaign/CampaignList";
import CreateCampaign from "./Campaign/CreateCampaign";
import {
  FaQrcode,
  FaPowerOff,
  FaSync,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaMobileAlt,
  FaCheck,
  FaPlus,
  FaChartBar,
  FaEnvelope,
  FaWhatsapp,
  FaBars,
  FaEllipsisV
} from "react-icons/fa";

export default function Campaign() {
  const dispatch = useDispatch();
  const { campaigns, loading, error, whatsappQR, whatsappLoading } = useSelector((state) => state.campaign);

  // State Management
  const [socket, setSocket] = useState(null);
  const [campaignStats, setCampaignStats] = useState({});
  const [showWhatsappStats, setShowWhatsappStats] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [latestQR, setLatestQR] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [connectionStep, setConnectionStep] = useState('disconnected');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showStatusNotification, setShowStatusNotification] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleToggleCreateCampaign = () => {
    setShowCreateCampaign(prevState => !prevState);
    setShowMobileMenu(false);
  };

  const [whatsappStatus, setWhatsappStatus] = useState({
    connected: false,
    initializing: false,
    qrNeeded: false,
    message: "❌ WhatsApp Not Connected",
    state: "UNKNOWN",
    authenticating: false,
  });

  // Socket Connection Setup
  useEffect(() => {
    const newSocket = io("http://localhost:5000", { 
      transports: ["websocket", "polling"], 
      timeout: 10000 
    });
    
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("✅ Connected to server"));
    newSocket.on("disconnect", () => console.log("❌ Disconnected from server"));
    
    newSocket.on("whatsapp-status", (data) => {
      console.log("📱 WhatsApp Status Update:", data);
      
      // Update connection steps based on status
      if (data.connected) {
        setConnectionStep('connected');
        setShowSuccessNotification(true);
        setNotificationMessage("WhatsApp Connected Successfully!");
        setTimeout(() => setShowSuccessNotification(false), 5000);
        setShowWhatsappStats(true);
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
        }, 2000);
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

  useEffect(() => {
    dispatch(getCampaigns());
    dispatch(getWhatsAppStatus());
  }, [dispatch]);

  useEffect(() => {
    let interval;
    if (showQRModal && whatsappStatus.qrNeeded && !whatsappStatus.connected) {
      interval = setInterval(() => {
        if (!qrLoading && connectionStep === 'scanning') {
          console.log("🔄 Auto-refreshing QR code...");
          handleFetchQR();
        }
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQRModal, whatsappStatus.qrNeeded, whatsappStatus.connected, qrLoading, connectionStep]);

  const handleConnectWhatsApp = () => {
    setShowQRModal(true);
    setQrLoading(true);
    setQrError(null);
    setConnectionStep('qr_generated');
    setShowMobileMenu(false);
    
    setTimeout(() => {
      handleFetchQR();
    }, 1000);
  };

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

  const handleLogoutWhatsApp = async () => {
    try {
      await dispatch(resetWhatsApp());
      setWhatsappStatus({
        connected: false,
        initializing: false,
        qrNeeded: false,
        message: "❌ WhatsApp Disconnected",
        state: "DISCONNECTED",
        authenticating: false,
      });
      setShowWhatsappStats(false);
      setLatestQR(null);
      setShowQRModal(false);
      setConnectionStep('disconnected');
      setNotificationMessage("Logged out from WhatsApp");
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 5000);
      setShowMobileMenu(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const getConnectionStepDisplay = () => {
    const stepConfigs = {
      disconnected: {
        title: "Disconnected",
        description: "WhatsApp is not connected",
        icon: <FaTimes className="text-red-500 text-xl sm:text-2xl" />,
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      },
      qr_generated: {
        title: "Generating QR Code",
        description: "Please wait while we generate your QR code",
        icon: <FaSync className="text-blue-500 text-xl sm:text-2xl animate-spin" />,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      },
      scanning: {
        title: "Scan QR Code",
        description: "Open WhatsApp on your phone and scan the QR code",
        icon: <FaMobileAlt className="text-purple-500 text-xl sm:text-2xl" />,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      },
      authenticating: {
        title: "Authenticating",
        description: "Please wait while we authenticate your device",
        icon: <FaSync className="text-yellow-500 text-xl sm:text-2xl animate-spin" />,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      },
      connected: {
        title: "Connected Successfully!",
        description: "WhatsApp is now connected and ready to use",
        icon: <FaCheck className="text-green-500 text-xl sm:text-2xl" />,
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      }
    };

    return stepConfigs[connectionStep] || stepConfigs.disconnected;
  };

  const getStatusNotification = () => {
    if (whatsappStatus.connected) {
      return {
        message: "✅ WhatsApp Connected",
        icon: <FaCheckCircle className="text-green-500 text-lg sm:text-xl" />,
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800"
      };
    } else if (whatsappStatus.initializing) {
      return {
        message: "🔄 WhatsApp Initializing...",
        icon: <FaSync className="text-yellow-500 text-lg sm:text-xl animate-spin" />,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-800"
      };
    } else if (whatsappStatus.qrNeeded) {
      return {
        message: "📱 QR Code Required - Please Scan",
        icon: <FaMobileAlt className="text-blue-500 text-lg sm:text-xl" />,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-800"
      };
    } else {
      return {
        message: "❌ WhatsApp Not Connected",
        icon: <FaTimes className="text-red-500 text-lg sm:text-xl" />,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800"
      };
    }
  };

  const connectionStepDisplay = getConnectionStepDisplay();
  const statusNotification = getStatusNotification();

  // Calculate campaign statistics
  const campaignStatsData = campaigns ? {
    total: campaigns.length,
    email: campaigns.filter(c => c.mode === 'email').length,
    whatsapp: campaigns.filter(c => c.mode === 'whatsapp').length,
    sending: campaigns.filter(c => c.status === 'sending').length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    failed: campaigns.filter(c => c.status === 'failed').length,
  } : { total: 0, email: 0, whatsapp: 0, sending: 0, sent: 0, scheduled: 0, failed: 0 };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-6xl mx-auto mt-4 mx-4 sm:mx-auto">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* WhatsApp Status Notification - Responsive Positioning */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 space-y-2 max-w-[calc(100vw-1rem)]">
        {/* WhatsApp Connection Status */}
        {showStatusNotification && (
          <div className={`${statusNotification.bgColor} border ${statusNotification.borderColor} rounded-lg p-3 sm:p-4 shadow-lg max-w-xs sm:max-w-sm animate-in slide-in-from-right`}>
            <div className="flex items-center gap-2 sm:gap-3">
              {statusNotification.icon}
              <div className="flex-1 min-w-0">
                <p className={`${statusNotification.textColor} font-semibold text-sm sm:text-base truncate`}>
                  {statusNotification.message}
                </p>
              </div>
              <button
                onClick={() => setShowStatusNotification(false)}
                className={`${statusNotification.textColor} hover:opacity-70 transition-opacity ml-1 sm:ml-2 flex-shrink-0`}
              >
                <FaTimes className="text-xs sm:text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Success Notification 
        {showSuccessNotification && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 shadow-lg max-w-xs sm:max-w-sm animate-in slide-in-from-right">
            <div className="flex items-center gap-2 sm:gap-3">
              <FaCheckCircle className="text-green-500 text-lg sm:text-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-green-800 font-semibold text-sm sm:text-base truncate">
                  {notificationMessage}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="text-green-600 hover:opacity-70 transition-opacity ml-1 sm:ml-2 flex-shrink-0"
              >
                <FaTimes className="text-xs sm:text-sm" />
              </button>
            </div>
          </div>
        )}  */}
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          {/* Title and Description */}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Campaign Manager</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Create and manage your email and WhatsApp marketing campaigns
            </p>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex flex-wrap items-center gap-3">

            {!showStatusNotification && (
              <button
                onClick={() => setShowStatusNotification(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaMobileAlt />
                Show Status
              </button>
            )}

            {/* WhatsApp Connect/Logout Button */}
            <div className="flex gap-2">
              {!whatsappStatus.connected && !whatsappStatus.initializing && (
                <button
                  onClick={handleConnectWhatsApp}
                  disabled={whatsappStatus.initializing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <FaQrcode />
                  Connect WhatsApp
                </button>
              )}
              {whatsappStatus.connected && (
                <button
                  onClick={handleLogoutWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaPowerOff />
                  Logout WhatsApp
                </button>
              )}
              {whatsappStatus.initializing && (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg opacity-50"
                >
                  <FaSync className="animate-spin" />
                  Initializing...
                </button>
              )}
            </div>

            {/* Add Campaign Button */}
            <button 
              onClick={handleToggleCreateCampaign}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>

          {/* Mobile Action Menu */}
          <div className="lg:hidden flex items-center justify-between">
            {/* Mobile Create Campaign Button */}
            <button 
              onClick={handleToggleCreateCampaign}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex-1 mr-2"
            >
              <FaPlus className="w-4 h-4" />
              Create
            </button>

            {/* Mobile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaEllipsisV className="w-5 h-5 text-gray-600" />
              </button>
              
              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                  {/* Show Status Toggle */}
                  {!showStatusNotification && (
                    <button
                      onClick={() => {
                        setShowStatusNotification(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <FaMobileAlt className="text-gray-600" />
                      Show Status
                    </button>
                  )}

                  {/* WhatsApp Actions */}
                  <div className="border-b border-gray-100">
                    {!whatsappStatus.connected && !whatsappStatus.initializing && (
                      <button
                        onClick={handleConnectWhatsApp}
                        disabled={whatsappStatus.initializing}
                        className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <FaQrcode className="text-green-600" />
                        Connect WhatsApp
                      </button>
                    )}
                    {whatsappStatus.connected && (
                      <button
                        onClick={handleLogoutWhatsApp}
                        className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <FaPowerOff className="text-red-600" />
                        Logout WhatsApp
                      </button>
                    )}
                    {whatsappStatus.initializing && (
                      <button
                        disabled
                        className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 opacity-50"
                      >
                        <FaSync className="text-yellow-600 animate-spin" />
                        Initializing...
                      </button>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <div className="text-xs font-medium text-gray-700 mb-1">Quick Stats</div>
                    <div className="text-xs text-gray-600">
                      Total: {campaignStatsData.total} • 
                      Email: {campaignStatsData.email} • 
                      WhatsApp: {campaignStatsData.whatsapp}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile WhatsApp Status Bar */}
        <div className="lg:hidden mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {statusNotification.icon}
              <span className={`text-sm font-medium ${statusNotification.textColor}`}>
                {whatsappStatus.connected ? 'Connected' : 
                 whatsappStatus.initializing ? 'Initializing...' : 
                 whatsappStatus.qrNeeded ? 'QR Required' : 'Not Connected'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {campaignStatsData.total} campaigns
            </div>
          </div>
        </div>
      </div>
      
      {/* Campaign List */}
      <CampaignList />

      {/* QR Code Modal - Responsive */}
      {showQRModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-2 text-center">
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
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border ${connectionStepDisplay.bgColor} ${connectionStepDisplay.borderColor}`}>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                {connectionStepDisplay.icon}
                <span className={`font-semibold text-sm sm:text-base ${connectionStepDisplay.color}`}>
                  {connectionStepDisplay.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 text-left">
                {connectionStepDisplay.description}
              </p>
            </div>

            {/* QR Loading State */}
            {qrLoading && connectionStep === 'qr_generated' && (
              <div className="py-6 sm:py-8">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-green-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">Generating QR Code...</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            )}

            {/* QR Code Display */}
            {!qrLoading && latestQR && connectionStep === 'scanning' && (
              <>
                <img
                  src={latestQR}
                  alt="WhatsApp QR Code"
                  className="mx-auto w-48 h-48 sm:w-64 sm:h-64 border border-gray-200 rounded-lg"
                />
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                  Scan this QR code with WhatsApp to connect your account
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  QR code will auto-refresh every 30 seconds
                </p>
              </>
            )}

            {/* Authenticating State */}
            {connectionStep === 'authenticating' && (
              <div className="py-6 sm:py-8">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-yellow-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">Authenticating...</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Please wait while we authenticate your device
                </p>
              </div>
            )}

            {/* Connected Success State */}
            {connectionStep === 'connected' && (
              <div className="py-6 sm:py-8">
                <FaCheckCircle className="text-green-500 text-4xl sm:text-5xl mx-auto mb-3 sm:mb-4" />
                <p className="text-green-600 font-semibold text-base sm:text-lg">Connected Successfully!</p>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Your WhatsApp is now connected</p>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Error State */}
            {!qrLoading && qrError && (
              <div className="py-6 sm:py-8">
                <FaExclamationCircle className="text-red-500 text-4xl sm:text-5xl mx-auto mb-3 sm:mb-4" />
                <p className="text-red-600 font-semibold text-sm sm:text-base">Failed to generate QR</p>
                <p className="text-gray-600 text-xs sm:text-sm mt-2">{qrError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              {!whatsappStatus.connected && connectionStep !== 'connected' && (
                <button
                  onClick={handleFetchQR}
                  disabled={qrLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
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
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base order-1 sm:order-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <CreateCampaign onClose={() => setShowCreateCampaign(false)} />
      )}
    </div>
  );
}