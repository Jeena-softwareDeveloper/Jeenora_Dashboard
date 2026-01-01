import React, { useState, useEffect } from 'react';
import { FaEye, FaDownload, FaFlag, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { get_resumes, delete_resume, messageClear } from '../../store/Reducers/Hire/adminResumeReducer';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const AdminResumes = () => {
    const dispatch = useDispatch();
    const { resumes, totalResumes, loader, successMessage, errorMessage } = useSelector(state => state.adminResume);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        dispatch(get_resumes({ page: currentPage, limit: 10, search: searchValue }));
    }, [currentPage, searchValue, dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this resume?")) {
            dispatch(delete_resume(id));
        }
    };

    return (
        <div className="px-2 lg:px-7 pt-5">
            <h1 className="text-[20px] font-bold mb-3 text-slate-700">Resume Management</h1>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-md mb-4 flex gap-4 border border-slate-200 shadow-sm">
                <input
                    className="w-full border p-2 rounded-md focus:outline-none focus:border-[#6a5fdf]"
                    placeholder="Search by resume title..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            <div className="w-full p-4 bg-white rounded-md shadow-sm border border-slate-200">
                {loader ? (
                    <div className="flex justify-center py-10"><PropagateLoader color='#6a5fdf' /></div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Resume Title</th>
                                    <th className="px-6 py-3">Format</th>
                                    <th className="px-6 py-3">Upload Date</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumes && resumes.length > 0 ? resumes.map((resume) => (
                                    <tr key={resume._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{resume.userId?.name || 'Unknown User'}</td>
                                        <td className="px-6 py-4">{resume.resumeTitle}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${resume.fileType === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {resume.fileType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(resume.uploadedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 flex gap-3">
                                            <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 tooltip" title="Download/View"><FaDownload size={16} /></a>
                                            <button onClick={() => handleDelete(resume._id)} className="text-red-500 hover:text-red-700 tooltip" title="Delete"><FaTrash size={16} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6">No resumes found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats (Mocked or derived) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Total Resumes</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{totalResumes}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminResumes;
