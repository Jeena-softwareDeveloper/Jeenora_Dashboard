import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_job, get_job_applications, update_application_status, messageClear } from '../../store/Reducers/Hire/jobReducer';
import { PropagateLoader } from 'react-spinners';
import { FaEye, FaDownload, FaUserTie, FaCheckCircle, FaChartLine, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const JobDetails = () => {
    const { jobId } = useParams();
    const dispatch = useDispatch();
    const { job, applications, loader, successMessage, errorMessage } = useSelector(state => state.job);
    const [activeTab, setActiveTab] = useState('overview'); // overview, applications

    // Status Modal State
    const [selectedApp, setSelectedApp] = useState(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [note, setNote] = useState('');
    const [communicationMode, setCommunicationMode] = useState('notification');
    const [sendEmail, setSendEmail] = useState(false);
    const [sendWhatsapp, setSendWhatsapp] = useState(false);

    useEffect(() => {
        dispatch(get_job(jobId));
        dispatch(get_job_applications(jobId));
    }, [jobId, dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            setStatusModalOpen(false);
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    const openStatusModal = (app) => {
        setSelectedApp(app);
        setNewStatus(app.currentStatus || app.status || 'applied');
        setNote('');
        setCommunicationMode('notification');
        setSendEmail(false);
        setSendWhatsapp(false);
        setStatusModalOpen(true);
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

    if (!job && loader) return <div className="flex justify-center py-10"><PropagateLoader color='#6a5fdf' /></div>;

    // Mock Analytics Data for "Dynamic Report"
    const analytics = {
        totalViews: 1245,
        conversionRate: '7.2%',
        funnel: [
            { label: 'Views', value: 1245, color: 'bg-blue-500' },
            { label: 'Applied', value: applications?.length || 0, color: 'bg-purple-500' },
            { label: 'Shortlisted', value: Math.floor((applications?.length || 0) * 0.3), color: 'bg-yellow-500' },
            { label: 'Hired', value: Math.floor((applications?.length || 0) * 0.1), color: 'bg-green-500' }
        ]
    };

    return (
        <div className="px-2 lg:px-7 pt-5 relative">
            {/* Header */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{job?.title}</h1>
                        <p className="text-slate-500 font-medium">{job?.company?.name}</p>
                        <div className="flex gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job?.location?.city}</span>
                            <span className="flex items-center gap-1"><FaBriefcase /> {job?.jobType}</span>
                            <span className="flex items-center gap-1"><FaMoneyBillWave /> {job?.salary?.min / 100000}-{job?.salary?.max / 100000} LPA</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <span className={`px-4 py-1 rounded-full text-sm font-bold capitalize
                            ${job?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {job?.status}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mt-8 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[#6a5fdf] text-[#6a5fdf]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Overview & Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'applications' ? 'border-[#6a5fdf] text-[#6a5fdf]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Applications ({applications?.length || 0})
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Key Metrics */}
                    <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 lg:col-span-3">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FaChartLine /> Performance Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-600 font-medium">Total Views</p>
                                <p className="text-2xl font-bold text-slate-800">{job?.stats?.totalViews || analytics.totalViews}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-purple-600 font-medium">Total Applications</p>
                                <p className="text-2xl font-bold text-slate-800">{applications?.length || 0}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-green-600 font-medium">Conversion Rate</p>
                                <p className="text-2xl font-bold text-slate-800">{analytics.conversionRate}</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-sm text-yellow-600 font-medium">Credits Used</p>
                                <p className="text-2xl font-bold text-slate-800">{(applications?.length || 0) * (job?.application?.creditsRequired || 1)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Funnel Chart (Visual) */}
                    <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 lg:col-span-2">
                        <h3 className="font-bold text-slate-700 mb-6">Application Funnel</h3>
                        <div className="space-y-4">
                            {analytics.funnel.map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="flex justify-between text-sm mb-1 text-slate-600">
                                        <span>{item.label}</span>
                                        <span className="font-semibold">{item.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${item.color}`}
                                            style={{ width: `${(item.value / analytics.totalViews) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Job Info Side */}
                    <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4">Job Requirements</h3>
                        <div className="space-y-3 text-sm text-slate-600">
                            <div>
                                <span className="block font-medium text-slate-800">Skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {job?.requirements?.mustHave?.map((s, i) => (
                                        <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-xs">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="block font-medium text-slate-800">Experience:</span>
                                {job?.requirements?.experience?.min} - {job?.requirements?.experience?.max} Years
                            </div>
                            <div>
                                <span className="block font-medium text-slate-800">Education:</span>
                                {job?.requirements?.education?.join(', ') || 'Any'}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Applicant Name</th>
                                    <th className="px-6 py-3">Applied Date</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications && applications.length > 0 ? applications.map((app) => (
                                    <tr key={app._id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 flex items-center gap-2 font-medium text-slate-800">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><FaUserTie /></div>
                                            {app.userId?.name || 'Unknown User'}
                                        </td>
                                        <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{app.userId?.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded text-xs font-medium capitalize 
                                                ${app.currentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    app.currentStatus === 'offer_accepted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {(app.currentStatus || app.status || 'applied').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex gap-3">
                                            <button className="text-purple-500 hover:text-purple-700 tooltip" title="View Profile"><FaEye size={16} /></button>
                                            <button className="text-blue-500 hover:text-blue-700 tooltip" title="Download Resume"><FaDownload size={16} /></button>
                                            <button onClick={() => openStatusModal(app)} className="text-green-600 hover:text-green-800 tooltip border border-green-200 bg-green-50 px-2 py-1 rounded text-xs font-semibold" title="Update Status">
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-slate-500">No applications yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {statusModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Update Application Status</h3>
                            <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600"><FaTimesCircle size={20} /></button>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm text-slate-500 mb-1">Applicant</div>
                            <div className="font-semibold text-slate-900">{selectedApp?.userId?.name}</div>
                        </div>

                        <form onSubmit={handleUpdateStatus}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
                                <select
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {[
                                        'viewed', 'shortlisted', 'interview_scheduled', 'interview_completed',
                                        'offer_extended', 'offer_accepted', 'rejected', 'withdrawn'
                                    ].map(s => (
                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Add a reason or internal note..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            <div className="mb-6 bg-slate-50 p-4 rounded-md border border-slate-200">
                                <label className="block text-sm font-bold text-slate-800 mb-3">Communication Type</label>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="commMode"
                                            checked={communicationMode === 'chat'}
                                            onChange={() => setCommunicationMode('chat')}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">Direct Message (Chat)</span>
                                            <span className="text-xs text-slate-500">Opens a chat thread. Expect a reply.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="commMode"
                                            checked={communicationMode === 'notification'}
                                            onChange={() => setCommunicationMode('notification')}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">Notification Only</span>
                                            <span className="text-xs text-slate-500">One-way update. No reply allowed.</span>
                                        </div>
                                    </label>

                                    {/* Additional Channels */}
                                    <div className="pt-3 mt-3 border-t border-slate-200 flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sendEmail}
                                                onChange={(e) => setSendEmail(e.target.checked)}
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">Send Email</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sendWhatsapp}
                                                onChange={(e) => setSendWhatsapp(e.target.checked)}
                                                className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                                            />
                                            <span className="text-sm text-slate-700">Send WhatsApp</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setStatusModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-md transition shadow-sm">Update Status</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetails;
