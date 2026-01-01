import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_applied_jobs, update_application_status, messageClear, get_job_messages, send_job_message, add_message, update_message_read } from '../../../store/Reducers/Hire/jobReducer';
import { socket } from '../../../utils/utils';
import api from '../../../api/api';
import { FaSearch, FaEye, FaDownload, FaEdit, FaTimesCircle, FaBell, FaComments, FaPaperPlane } from 'react-icons/fa';
import Pagination from '../../Pagination';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AppliedJobs = () => {
    const dispatch = useDispatch();
    const { applications, loader, successMessage, errorMessage, messages } = useSelector(state => state.job);
    const { userInfo } = useSelector(state => state.auth);
    const scrollRef = useRef();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');

    // Status Modal State
    const [selectedApp, setSelectedApp] = useState(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [note, setNote] = useState('');
    const [communicationMode, setCommunicationMode] = useState('notification');
    const [sendEmail, setSendEmail] = useState(false);
    const [sendWhatsapp, setSendWhatsapp] = useState(false);

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue,
            status: statusFilter
        };
        dispatch(get_applied_jobs(obj));
    }, [currentPage, parPage, searchValue, statusFilter, dispatch]);

    const [partnerOnline, setPartnerOnline] = useState(false);

    useEffect(() => {
        if (statusModalOpen && selectedApp) {
            dispatch(get_job_messages(selectedApp._id));

            // Join Chat Room
            socket.emit('join_application_chat', { applicationId: selectedApp._id, userId: userInfo?._id, role: 'admin' });

            // Mark existing messages as read
            const markReadFn = async () => {
                try { await api.put('/hire/applications/message/read', { applicationId: selectedApp._id }); } catch (e) { }
            };
            markReadFn();

            socket.on('new_job_message', (msg) => {
                if (selectedApp && msg.applicationId === selectedApp._id) {
                    // Prevent Duplicate: Only add if sender is NOT me
                    if (msg.senderId !== userInfo?._id) {
                        dispatch(add_message(msg));
                        // Mark this new message as read since chat is open
                        api.put('/hire/applications/message/read', { applicationId: selectedApp._id }).catch(() => { });
                    }
                }
            });

            socket.on('chat_partner_status', (data) => {
                if (data.applicationId === selectedApp._id && data.userId !== userInfo?._id) {
                    setPartnerOnline(data.status === 'online');
                }
            });

            socket.on('message_read_update', (data) => {
                if (data.applicationId === selectedApp._id && data.readerId !== userInfo?._id) {
                    dispatch(update_message_read());
                }
            });

            return () => {
                socket.emit('leave_application_chat', { applicationId: selectedApp._id, userId: userInfo?._id, role: 'admin' });
                socket.off('new_job_message');
                socket.off('chat_partner_status');
                socket.off('message_read_update');
            };
        }
    }, [statusModalOpen, selectedApp, dispatch, userInfo]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            if (communicationMode !== 'chat') {
                setStatusModalOpen(false);
            }
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, communicationMode]);

    const openStatusModal = (app) => {
        setSelectedApp(app);
        setNewStatus(app.currentStatus || app.status || 'applied');
        setNote('');
        setCommunicationMode('notification');
        setSendEmail(false);
        setSendWhatsapp(false);
        setStatusModalOpen(true);
    };

    const handleSendMessage = () => {
        if (!note.trim()) return;
        dispatch(send_job_message({
            applicationId: selectedApp._id,
            message: note
        }));
        setNote('');
    };

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        if (!selectedApp) return;
        dispatch(update_application_status({
            id: selectedApp._id,
            status: newStatus,
            note: note,
            triggeredBy: 'admin',
            communicationMode,
            sendEmail,
            sendWhatsapp
        }));
    };

    return (
        <div className="px-2 lg:px-7 pt-5">
            <div className="w-full p-4 bg-white rounded-md shadow-sm border border-slate-200">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700">Applications</h2>
                    <div className="flex items-center gap-2">
                        <select
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500 text-slate-600 shadow-sm transition-all"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="viewed">Viewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview_scheduled">Interview</option>
                            <option value="rejected">Rejected</option>
                            <option value="offer_extended">Offer Extended</option>
                            <option value="offer_accepted">Hired</option>
                        </select>
                        <div className="relative">
                            <input
                                onChange={(e) => setSearchValue(e.target.value)}
                                value={searchValue}
                                className="px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500 text-slate-600 shadow-sm transition-all pl-8 w-[200px]"
                                type="text"
                                placeholder="Search..."
                            />
                            <FaSearch className="absolute left-2.5 top-3 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Job Title</th>
                                <th className="px-6 py-3">Applicant</th>
                                <th className="px-6 py-3">Applied Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications && applications.length > 0 ? applications.map((app) => (
                                <tr key={app._id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {app.jobId?.title || 'Unknown Job'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {app.userId?.profileImageUrl ? (
                                                <img src={app.userId.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {app.userId?.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            <span>{app.userId?.name || 'Unknown User'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(app.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold capitalize
                                            ${app.currentStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                                                app.currentStatus === 'shortlisted' ? 'bg-yellow-100 text-yellow-600' :
                                                    app.currentStatus === 'offer_accepted' ? 'bg-green-100 text-green-600' :
                                                        'bg-blue-100 text-blue-600'
                                            }`}>
                                            {(app.currentStatus || 'Applied').replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <Link to={`/seller/hire/jobs/${app.jobId?._id}`} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors tooltip" title="View Job">
                                            <FaEye />
                                        </Link>
                                        <button onClick={() => openStatusModal(app)} className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors tooltip" title="Update Status">
                                            <FaEdit />
                                        </button>
                                        {app.resumeUrl && (
                                            <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors tooltip" title="Download Resume">
                                                <FaDownload />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {/*  <div className="w-full flex justify-end mt-4 bottom-4 right-4">
                    <Pagination
                        pageNumber={currentPage}
                        setPageNumber={setCurrentPage}
                        totalItem={totalApplications || 50}
                        parPage={parPage}
                        showItem={3}
                    />
                </div> */}
            </div>

            {/* Status Update Modal */}
            {statusModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fadeIn">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Update Status</h3>
                            <div className="flex items-center gap-3">
                                <select
                                    value={communicationMode}
                                    onChange={(e) => setCommunicationMode(e.target.value)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-blue-500 outline-none bg-slate-50 font-medium text-slate-700 cursor-pointer hover:border-blue-400 transition-colors"
                                >
                                    <option value="notification">🔔 Notification</option>
                                    <option value="chat">💬 Direct Message</option>
                                </select>
                                <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><FaTimesCircle size={22} /></button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm text-slate-500 mb-1">Applicant</div>
                            <div className="font-semibold text-slate-900">{selectedApp?.userId?.name}</div>
                        </div>

                        <form onSubmit={handleUpdateStatus}>
                            <div className="mb-6">
                                {/* Visual Stepper for Admin */}
                                <div className="flex items-center justify-between relative mb-6 mt-2">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2"></div>
                                    <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -z-0 -translate-y-1/2 transition-all duration-300`}
                                        style={{
                                            width: `${['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offer_extended', 'offer_accepted', 'rejected', 'withdrawn'].indexOf(newStatus) === -1 ? 0 :
                                                    (['viewed', 'shortlisted'].includes(newStatus) ? 33 :
                                                        ['interview_scheduled', 'interview_completed'].includes(newStatus) ? 66 :
                                                            ['offer_extended', 'offer_accepted', 'rejected', 'withdrawn'].includes(newStatus) ? 100 : 0)
                                                }%`
                                        }}
                                    ></div>

                                    {[
                                        { label: 'Applied', active: true },
                                        { label: 'Under Review', active: ['viewed', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offer_extended', 'offer_accepted', 'rejected', 'withdrawn'].includes(newStatus) },
                                        { label: 'Interview', active: ['interview_scheduled', 'interview_completed', 'offer_extended', 'offer_accepted', 'rejected', 'withdrawn'].includes(newStatus) },
                                        { label: 'Final Decision', active: ['offer_extended', 'offer_accepted', 'rejected', 'withdrawn'].includes(newStatus) }
                                    ].map((step, idx) => (
                                        <div key={idx} className="relative z-10 flex flex-col items-center cursor-pointer group"
                                            onClick={() => {
                                                // Quick-set status on click
                                                if (idx === 1) setNewStatus('viewed');
                                                if (idx === 2) setNewStatus('interview_scheduled');
                                                if (idx === 3) setNewStatus('offer_accepted'); // Default to Hired, user can change via dropdown
                                            }}
                                        >
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${step.active
                                                ? (newStatus === 'rejected' && idx === 3 ? 'bg-red-500 border-red-500' : 'bg-blue-600 border-blue-600')
                                                : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                            </div>
                                            <span className={`text-[10px] font-bold mt-2 ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <optgroup label="Stage 1: Application">
                                            <option value="applied">Applied</option>
                                        </optgroup>
                                        <optgroup label="Stage 2: Review">
                                            <option value="viewed">Under Review (Viewed)</option>
                                            <option value="shortlisted">Shortlisted</option>
                                        </optgroup>
                                        <optgroup label="Stage 3: Interview">
                                            <option value="interview_scheduled">Interview Scheduled</option>
                                            <option value="interview_completed">Interview Completed</option>
                                        </optgroup>
                                        <optgroup label="Stage 4: Final Decision">
                                            <option value="offer_extended">Offer Extended</option>
                                            <option value="offer_accepted">Hired (Offer Accepted)</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="withdrawn">Withdrawn</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-6">
                                {communicationMode === 'chat' ? (
                                    <div className="border border-slate-300 rounded-md overflow-hidden bg-[#e5ddd5]">
                                        {/* Chat Header */}
                                        <div className="bg-[#075e54] text-white p-2 px-3 flex items-center gap-2 text-sm shadow-sm">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden relative">
                                                {selectedApp?.userId?.profileImageUrl ? (
                                                    <img src={selectedApp?.userId?.profileImageUrl} alt="user" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-800 font-bold bg-white">{selectedApp?.userId?.name?.[0]}</div>
                                                )}
                                                {partnerOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>}
                                            </div>
                                            <div>
                                                <div className="font-bold">{selectedApp?.userId?.name}</div>
                                                <div className="text-[10px] opacity-80 flex items-center gap-1">
                                                    Candidate {partnerOnline && <span className="text-green-300 font-bold">• Online</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages Area */}
                                        <div className="h-96 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat' }}>
                                            {messages && messages.length > 0 ? (
                                                <>
                                                    {messages.map((m, i) => {
                                                        const isMe = m.senderId === userInfo?._id;
                                                        return (
                                                            <div key={i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                                <div className={`max-w-[80%] rounded-lg px-3 py-1.5 shadow-sm text-sm relative ${isMe ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                                                                    <div>{m.message}</div>
                                                                    <div className="text-[10px] text-slate-500 text-right mt-1 flex items-center justify-end gap-1">
                                                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        {isMe && <span className={m.isRead ? "text-blue-500" : "text-slate-400"}>✓✓</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                    <div ref={scrollRef} />
                                                </>
                                            ) : (
                                                <div className="text-center text-xs text-slate-500 bg-white/80 p-1 rounded inline-block self-center mt-4 shadow-sm">
                                                    No messages yet. Start the conversation.
                                                </div>
                                            )}
                                        </div>

                                        {/* Input Area */}
                                        <div className="bg-white p-2 flex items-end gap-2 border-t border-slate-200">
                                            <textarea
                                                className="w-full border-none focus:ring-0 outline-none text-sm resize-none py-2 px-2 bg-white custom-scrollbar"
                                                placeholder="Type a message..."
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                rows="1"
                                                style={{ minHeight: '40px', maxHeight: '100px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSendMessage}
                                                className="p-3 bg-[#075e54] text-white rounded-full hover:bg-[#128c7e] transition-colors shadow-sm mb-1 right-2"
                                            >
                                                <FaPaperPlane size={14} className="ml-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                                        <textarea
                                            className="w-full border border-slate-300 rounded-md p-2 text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Add a reason or internal note..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Channel Selection - Only for Notification */}
                            {communicationMode === 'notification' && (
                                <div className="mb-6 bg-slate-50 p-3 rounded-md border border-slate-200 animate-fadeIn">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Also Send Via</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                                            <input
                                                type="checkbox"
                                                checked={sendEmail}
                                                onChange={(e) => setSendEmail(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                            />
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Email</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                                            <input
                                                type="checkbox"
                                                checked={sendWhatsapp}
                                                onChange={(e) => setSendWhatsapp(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 transition-colors"
                                            />
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-green-600 transition-colors">WhatsApp</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setStatusModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition">
                                    {communicationMode === 'chat' ? 'Close' : 'Cancel'}
                                </button>
                                {communicationMode !== 'chat' && (
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-md transition shadow-sm">Update Status</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppliedJobs;
