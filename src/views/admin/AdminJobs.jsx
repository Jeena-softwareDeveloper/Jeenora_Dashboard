import React, { useState, useEffect } from 'react';
// Force recompile
import { FaEdit, FaEye, FaTrash, FaPause, FaPlus, FaFileImport, FaFileExport, FaChartBar, FaSearch, FaPlay } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_jobs, delete_job, toggle_job_active_status, messageClear } from '../../store/Reducers/Hire/jobReducer';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const AdminJobs = () => {
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const base = pathname.includes('seller') ? '/seller/hire/jobs' : '/admin/dashboard/jobs';
    const { jobs, totalJobs, loader, successMessage, errorMessage } = useSelector(state => state.job);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [filters, setFilters] = useState({
        status: 'All',
        credits: 'All',
        applications: 'All',
        dateRange: ''
    });

    useEffect(() => {
        const obj = {
            page: currentPage,
            limit: 10,
            search: searchValue,
            status: filters.status,
            credits: filters.credits,
            applications: filters.applications
        };
        dispatch(get_admin_jobs(obj));
    }, [currentPage, searchValue, filters, dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            // Refetch or let Redux update state if handled in extraReducers
            const obj = {
                page: currentPage,
                limit: 10,
                search: searchValue,
                status: filters.status,
                credits: filters.credits,
                applications: filters.applications
            };
            dispatch(get_admin_jobs(obj));
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, currentPage, searchValue, filters]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            dispatch(delete_job(id));
        }
    };

    const handleToggleStatus = (id) => {
        dispatch(toggle_job_active_status(id));
    };

    return (
        <div className="px-2 lg:px-7 pt-5">
            <h1 className="text-[20px] font-bold mb-3 text-slate-700">Job Management</h1>

            {/* Actions Bar */}
            <div className="w-full p-4 bg-[#6a5fdf] rounded-md mb-4 flex flex-col md:flex-row justify-between items-center text-white gap-4">
                <div className="flex gap-4">
                    <Link to={`${base}/create`} className="bg-white text-[#6a5fdf] px-4 py-2 rounded-md font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
                        <FaPlus /> Create New Job
                    </Link>
                    <button className="bg-[#ffffff33] hover:bg-[#ffffff44] px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors">
                        <FaFileImport /> Bulk Import
                    </button>
                </div>
                <div className="flex gap-4">
                    <button className="bg-[#ffffff33] hover:bg-[#ffffff44] px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors">
                        <FaFileExport /> Export Jobs
                    </button>
                    <button className="bg-[#ffffff33] hover:bg-[#ffffff44] px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors">
                        <FaChartBar /> Analytics
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-md mb-4 flex flex-wrap gap-4 border border-slate-200 shadow-sm items-center">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-slate-400" />
                    <input
                        className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:border-[#6a5fdf]"
                        placeholder="Search jobs..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <select
                    className="border p-2 rounded-md focus:outline-none focus:border-[#6a5fdf] text-slate-600"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="All">Status: All</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                </select>
                <select
                    className="border p-2 rounded-md focus:outline-none focus:border-[#6a5fdf] text-slate-600"
                    value={filters.credits}
                    onChange={(e) => setFilters({ ...filters, credits: e.target.value })}
                >
                    <option value="All">Credits: All</option>
                    <option value="1-3">1-3</option>
                    <option value="4-6">4-6</option>
                    <option value="7+">7+</option>
                </select>
                <select
                    className="border p-2 rounded-md focus:outline-none focus:border-[#6a5fdf] text-slate-600"
                    value={filters.applications}
                    onChange={(e) => setFilters({ ...filters, applications: e.target.value })}
                >
                    <option value="All">Applications: All</option>
                    <option value="0">0</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51+">51+</option>
                </select>
            </div>

            {/* Table */}
            <div className="w-full p-4 bg-white rounded-md shadow-sm border border-slate-200">
                {loader ? (
                    <div className="flex justify-center items-center py-10">
                        <PropagateLoader color='#6a5fdf' />
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Job Title</th>
                                    <th className="px-6 py-3">Company</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Applications</th>
                                    <th className="px-6 py-3">Credits</th>
                                    <th className="px-6 py-3">Posted Date</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs && jobs.length > 0 ? jobs.map((job) => (
                                    <tr key={job._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700">{job.title}</td>
                                        <td className="px-6 py-4">{job.company?.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded text-xs font-medium 
                                            ${job.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    job.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                        job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{job.stats?.totalApplications || 0}</td>
                                        <td className="px-6 py-4">{job.application?.creditsRequired || 0}</td>
                                        <td className="px-6 py-4">{new Date(job.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 flex gap-3">
                                            <Link to={`${base}/edit/${job._id}`} className="text-blue-500 hover:text-blue-700 tooltip" title="Edit"><FaEdit size={16} /></Link>
                                            <button onClick={() => handleToggleStatus(job._id)} className="text-yellow-500 hover:text-yellow-700 tooltip" title={job.status === 'paused' ? 'Resume' : 'Pause'}>
                                                {job.status === 'paused' ? <FaPlay size={14} /> : <FaPause size={14} />}
                                            </button>
                                            <Link to={`${base}/${job._id}`} className="text-purple-500 hover:text-purple-700 tooltip" title="View Applications"><FaEye size={16} /></Link>
                                            <button onClick={() => handleDelete(job._id)} className="text-red-500 hover:text-red-700 tooltip" title="Delete"><FaTrash size={16} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6">No jobs found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination - Simplified for now */}
                {totalJobs > 10 && (
                    <div className='flex justify-end mt-4'>
                        {/* Pagination Component logic would go here */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminJobs;
