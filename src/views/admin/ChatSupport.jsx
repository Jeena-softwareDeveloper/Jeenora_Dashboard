import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../api/api';
import { socket } from '../../utils/utils';
import {
    FaSearch, FaFilter, FaPlus, FaEllipsisV, FaChevronUp, FaChevronDown,
    FaArrowRight, FaPaperclip, FaPaperPlane, FaTimes, FaCircle, FaUserCircle,
    FaTicketAlt, FaTrash
} from 'react-icons/fa';
import { MdOutlineChevronLeft, MdOutlineChevronRight, MdHistory } from 'react-icons/md';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import moment from 'moment';

const ChatSupport = () => {
    const { userInfo } = useSelector(state => state.auth);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // active, open, pending, on-hold, closed
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const messagesEndRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        fetchTickets();
        if (userInfo?._id) {
            socket.emit('add_admin', userInfo);
        }
    }, [userInfo]);

    // Socket Listeners
    useEffect(() => {
        socket.on('ticket_message_received', (data) => {
            setTickets(prev => {
                const updated = prev.map(t => {
                    if (t._id === data.ticketId) {
                        return {
                            ...t,
                            messages: [...t.messages, data.message],
                            lastMessageAt: data.message.timestamp
                        };
                    }
                    return t;
                });
                return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
            });

            if (selectedTicket?._id === data.ticketId) {
                setSelectedTicket(prev => ({
                    ...prev,
                    messages: [...prev.messages, data.message]
                }));
            }
        });

        socket.on('new_ticket_alert', (data) => {
            fetchTickets();
        });

        return () => {
            socket.off('ticket_message_received');
            socket.off('new_ticket_alert');
        };
    }, [selectedTicket?._id]);

    const fetchTickets = async () => {
        try {
            const { data } = await api.get('/admin/chat-support/tickets');
            setTickets(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedTicket) return;
        try {
            const msg = messageInput;
            setMessageInput('');
            await api.post(`/admin/chat-support/tickets/${selectedTicket._id}/message`, {
                senderId: userInfo._id,
                senderModel: 'admins',
                message: msg
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTicket = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this log?")) return;
        try {
            await api.delete(`/admin/chat-support/tickets/${id}`);
            setTickets(prev => prev.filter(t => t._id !== id));
            if (selectedTicket?._id === id) setSelectedTicket(null);
            toast.success('Log Deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete log');
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;
        try {
            await api.put(`/admin/chat-support/tickets/${selectedTicket._id}/close`);
            setSelectedTicket(prev => ({ ...prev, status: 'closed' }));
            setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, status: 'closed' } : t));
            toast.success('Ticket Closed');
        } catch (error) {
            console.error(error);
            toast.error('Failed to close ticket');
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedTicket?.messages]);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesSearch = t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            if (statusFilter === 'active') return matchesSearch && t.status !== 'closed';
            if (statusFilter === 'all') return matchesSearch;
            return matchesSearch && t.status === statusFilter;
        });
    }, [tickets, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        active: tickets.filter(t => t.status !== 'closed').length,
        open: tickets.filter(t => t.status === 'open').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        onHold: tickets.filter(t => t.status === 'on-hold').length,
        closed: tickets.filter(t => t.status === 'closed').length,
    }), [tickets]);

    const getPriorityIcon = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'highest': return <div className="flex items-center gap-1 text-red-600 font-bold"><FaChevronUp /><FaChevronUp /> <span className="text-[10px]">Highest</span></div>;
            case 'high': return <div className="flex items-center gap-1 text-orange-600 font-bold"><FaChevronUp /> <span className="text-[10px]">High</span></div>;
            case 'medium': return <div className="flex items-center gap-1 text-yellow-600 font-bold"><span className="text-lg leading-none">=</span> <span className="text-[10px]">Medium</span></div>;
            case 'low': return <div className="flex items-center gap-1 text-blue-600 font-bold"><FaChevronDown /> <span className="text-[10px]">Low</span></div>;
            case 'lowest': return <div className="flex items-center gap-1 text-slate-400 font-bold"><FaChevronDown /><FaChevronDown /> <span className="text-[10px]">Lowest</span></div>;
            default: return <span className="text-[10px] text-slate-500 capitalize">{priority}</span>;
        }
    };

    const getStatusPill = (status) => {
        const styles = {
            open: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
            pending: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
            'on-hold': 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
            closed: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${styles[status] || styles.open}`}>
                {status?.replace('-', ' ')}
            </span>
        );
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] overflow-hidden">
            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedTicket ? 'mr-0 lg:mr-[400px]' : ''}`}>
                {/* HEADER */}
                <div className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-200 transition-all text-sm">
                            <FaPlus className="text-xs" /> New ticket
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group max-w-md w-full md:w-80">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search requester..."
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-2 font-medium text-sm">
                            Filters <FaFilter className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="px-6 py-2 bg-white flex items-center gap-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'active', label: 'All active tickets', count: stats.active },
                        { id: 'open', label: 'Open', count: stats.open },
                        { id: 'pending', label: 'Pending', count: stats.pending },
                        { id: 'on-hold', label: 'On hold', count: stats.onHold },
                        { id: 'closed', label: 'Closed', count: stats.closed },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`pb-3 pt-2 text-xs font-bold uppercase tracking-widest relative whitespace-nowrap transition-colors
                                ${statusFilter === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                            `}
                        >
                            {tab.label} ({tab.count})
                            {statusFilter === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
                        </button>
                    ))}
                </div>

                {/* TABLE AREA */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-4 w-12 border-b border-slate-100">
                                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="p-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">ID</th>
                                <th className="p-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Requester</th>
                                <th className="p-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Priority</th>
                                <th className="p-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Subject</th>
                                <th className="p-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                <th className="p-4 text-center border-b border-slate-100"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="p-8 border-b border-slate-50">
                                            <div className="h-6 bg-slate-100 rounded"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredTickets.length > 0 ? filteredTickets.map((ticket, i) => (
                                <tr
                                    key={ticket._id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`group cursor-pointer transition-colors border-b border-slate-100
                                        ${selectedTicket?._id === ticket._id ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'}
                                    `}
                                >
                                    <td className="p-4 border-b border-slate-100">
                                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" onClick={e => e.stopPropagation()} />
                                    </td>
                                    <td className="p-4 text-xs font-bold text-slate-400 border-b border-slate-100">#{ticket._id.slice(-4).toUpperCase()}</td>
                                    <td className="p-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs shadow-sm ring-2 ring-white overflow-hidden">
                                                {ticket.userId?.profileImageUrl ? <img src={ticket.userId.profileImageUrl} alt="user" className="w-full h-full object-cover" /> : ticket.userId?.name?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800 tracking-tight leading-tight">{ticket.userId?.name || 'Inquiry Node'}</span>
                                                <span className="text-[10px] text-slate-500 font-medium">User: {ticket.userId?.email?.split('@')[0]}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-slate-100">
                                        {getPriorityIcon(ticket.priority)}
                                    </td>
                                    <td className="p-4 border-b border-slate-100">
                                        <div className="max-w-[200px] truncate text-xs font-bold text-slate-700 tracking-tight">{ticket.subject}</div>
                                    </td>
                                    <td className="p-4 border-b border-slate-100">
                                        {getStatusPill(ticket.status)}
                                    </td>
                                    <td className="p-4 text-center border-b border-slate-100">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket._id); }}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete Log"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                                <FaEllipsisV />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-300">
                                            <FaTicketAlt size={48} />
                                            <p className="font-bold uppercase tracking-widest text-xs">No tickets found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-center gap-2">
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MdOutlineChevronLeft size={20} /></button>
                    {[1, 2, 3, 4, 5, '...', 11].map((p, i) => (
                        <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-100'}`}>
                            {p}
                        </button>
                    ))}
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MdOutlineChevronRight size={20} /></button>
                </div>
            </div>

            {/* RIGHT CONVERSATION PANE */}
            {selectedTicket && (
                <div className="fixed top-0 right-0 h-full w-full lg:w-[400px] bg-white border-l border-slate-100 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    {/* CHAT HEADER */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex gap-4">
                            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm" onClick={handleCloseTicket}>Close ticket</button>
                        </div>
                        <button
                            onClick={() => setSelectedTicket(null)}
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    <div className="p-6 border-b border-slate-50 bg-slate-50/10 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                                {selectedTicket.userId?.name?.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h3 className="text-base font-black text-slate-900 truncate leading-tight">{selectedTicket.subject}</h3>
                                <p className="text-xs text-slate-500 font-medium">Requester: {selectedTicket.userId?.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* MESSAGES FEED */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#FDFDFF] pt-8">
                        {selectedTicket.messages.map((msg, i) => {
                            const isAdmin = msg.senderModel === 'admins';
                            return (
                                <div key={i} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl shadow-sm text-sm font-medium leading-relaxed
                                        ${isAdmin
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}
                                    `}>
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest whitespace-nowrap">
                                        {moment(msg.timestamp).format('HH:mm')}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* REPLY BOX */}
                    <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2 italic">Support typing...</div>
                        <form onSubmit={handleSendMessage} className="relative bg-slate-50 rounded-2xl p-4 shadow-inner border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:bg-white focus-within:border-blue-100">
                            <textarea
                                className="w-full bg-transparent border-none text-sm font-medium text-slate-800 placeholder:text-slate-300 resize-none h-24 focus:ring-0 px-2 pt-2"
                                placeholder="Write your message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                            />
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/50">
                                <div className="flex gap-2 text-slate-300">
                                    <button type="button" className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FaPaperclip /></button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
                                >
                                    <FaPaperPlane className="rotate-12 translate-x-[-1px] translate-y-[1px]" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

export default ChatSupport;
