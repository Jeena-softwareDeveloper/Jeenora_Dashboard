import React, { useState, useEffect } from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';
import Pagination from '../../Pagination';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../../utils/utils';
import api from '../../../api/api';
import toast from 'react-hot-toast';
import UserProfileModal from './UserProfileModal';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [parPage, setParPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [totalUser, setTotalUser] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'JOB_SEEKER',
        userType: 'FREE',
        creditBalance: 0,
        status: 'Active',
        resumeEditorEnabled: false
    });

    const [userTypeFilter, setUserTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Profile Modal State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);

    const get_users = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/hire/user/admin/users?page=${currentPage}&parPage=${parPage}&searchValue=${searchValue}&userType=${userTypeFilter}&status=${statusFilter}`);
            setUsers(data.users);
            setTotalUser(data.totalUser);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        get_users();
    }, [currentPage, parPage, searchValue, userTypeFilter, statusFilter]);

    const deleteUser = async (id) => {
        try {
            const { data } = await api.delete(`/hire/user/admin/users/${id}`);
            toast.success(data.message);
            get_users();
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.error || 'Failed to delete user');
        }
    }

    const openEditModal = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: '', // Keep empty, don't update if not changed (backend logic might need adjustment but typically distinct for security)
            role: user.role,
            userType: user.userType,
            creditBalance: user.creditBalance,
            status: user.settings?.account?.isActive !== false ? 'Active' : 'Inactive',
            resumeEditorEnabled: user.resumeEditorEnabled
        });
        setSelectedUserId(user._id);
        setIsEdit(true);
        setShowModal(true);
    };

    const openProfileModal = (userId) => {
        setSelectedProfileUserId(userId);
        setShowProfileModal(true);
    };

    const handleInputModalClose = () => {
        setShowModal(false);
        setIsEdit(false);
        setSelectedUserId(null);
        setFormData({
            name: '', email: '', phone: '', password: '', role: 'JOB_SEEKER', userType: 'FREE', creditBalance: 0, status: 'Active'
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            if (isEdit) {
                const { data } = await api.put(`/hire/user/admin/users/${selectedUserId}`, formData);
                toast.success(data.message);
            } else {
                const { data } = await api.post('/hire/user/admin/users', formData);
                toast.success(data.message);
            }
            handleInputModalClose();
            get_users();
        } catch (error) {
            toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} user`);
        } finally {
            setCreateLoading(false);
        }
    }

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-[#283046] rounded-md'>
                {/* Header Section */}
                <div className='flex flex-col gap-4 pb-4'>
                    <div className='flex justify-between items-center'>
                        <h1 className='text-[#d0d2d6] text-xl font-semibold'>User Management</h1>
                        <button
                            onClick={() => { setIsEdit(false); setShowModal(true); }}
                            className='bg-blue-500 hover:shadow-blue-500/50 hover:shadow-lg text-white rounded-md px-7 py-2'
                        >
                            Add User
                        </button>
                    </div>

                    <div className='flex flex-wrap items-center gap-4 bg-[#323c52] p-4 rounded-md'>
                        <input
                            onChange={(e) => setSearchValue(e.target.value)}
                            value={searchValue}
                            className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                            type="text"
                            placeholder='Search by Name/Email...'
                        />
                        <select
                            onChange={(e) => setUserTypeFilter(e.target.value)}
                            value={userTypeFilter}
                            className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                        >
                            <option value="">All Types</option>
                            <option value="FREE">Free</option>
                            <option value="CREDIT">Credit</option>
                            <option value="PREMIUM">Premium</option>
                        </select>
                        <select
                            onChange={(e) => setStatusFilter(e.target.value)}
                            value={statusFilter}
                            className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <select onChange={(e) => setParPage(parseInt(e.target.value))} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'>
                            <option value="5">5 / page</option>
                            <option value="15">15 / page</option>
                            <option value="25">25 / page</option>
                        </select>
                    </div>
                </div>

                {/* Table Section */}
                <div className='relative overflow-x-auto mt-2'>
                    {loading ? <div className='w-full flex justify-center items-center py-10'><PropagateLoader color='#fff' cssOverride={overrideStyle} /></div> :
                        <table className='w-full text-sm text-left text-[#d0d2d6]'>
                            <thead className='text-xs text-[#d0d2d6] uppercase border-b border-slate-700 bg-[#323c52]'>
                                <tr>
                                    <th scope='col' className='py-3 px-4'>User</th>
                                    <th scope='col' className='py-3 px-4'>Type / Role</th>
                                    <th scope='col' className='py-3 px-4'>Status</th>
                                    <th scope='col' className='py-3 px-4'>Resume Service</th>
                                    <th scope='col' className='py-3 px-4'>Joined</th>
                                    <th scope='col' className='py-3 px-4'>Completion</th>
                                    <th scope='col' className='py-3 px-4'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    users.map((d, i) => <tr key={i} className='border-b border-slate-700 hover:bg-[#323c52] transition-colors'>
                                        <td className='py-3 px-4 whitespace-nowrap'>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-8 h-8 rounded-full bg-slate-600 flex justify-center items-center text-xs font-bold'>
                                                    {d.profileImageUrl ?
                                                        <img src={d.profileImageUrl} alt="avatar" className="w-full h-full rounded-full object-cover" /> :
                                                        d.name.substring(0, 2).toUpperCase()
                                                    }
                                                </div>
                                                <div>
                                                    <div className='font-medium'>{d.name}</div>
                                                    <div className='text-xs text-gray-400'>{d.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 whitespace-nowrap'>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${d.userType === 'PREMIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                                                d.userType === 'CREDIT' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {d.userType}
                                            </span>
                                            <div className='text-xs text-gray-500 mt-1'>{d.role}</div>
                                        </td>
                                        <td className='py-3 px-4 whitespace-nowrap'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.settings?.account?.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {d.settings?.account?.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className='py-3 px-4 whitespace-nowrap'>
                                            {d.resumeEditorEnabled ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className='py-3 px-4 whitespace-nowrap text-xs'>
                                            {new Date(d.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className='py-3 px-4 whitespace-nowrap w-32'>
                                            <div className='flex items-center gap-2'>
                                                <div className="w-20 bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`bg-blue-600 h-1.5 rounded-full`}
                                                        style={{ width: `${d.completionPercentage || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className='text-xs'>{d.completionPercentage || 0}%</span>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 whitespace-nowrap'>
                                            <div className='flex justify-start items-center gap-2'>
                                                <button onClick={() => openProfileModal(d._id)} className='p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white transition-all'>
                                                    <span className="text-xs font-bold">Profile</span>
                                                </button>
                                                <button onClick={() => openEditModal(d)} className='p-2 bg-yellow-500/20 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white transition-all'>
                                                    {/* Using FaRegEdit if imported or FaPen if simpler. Assuming FaPen or similar exists or import it */}
                                                    <span className="text-xs font-bold">Edit</span>
                                                </button>
                                                <button onClick={() => deleteUser(d._id)} className='p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all'><FaTrash size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>)
                                }
                            </tbody>
                        </table>
                    }
                </div>
                {
                    totalUser <= parPage ? "" : <div className='w-full flex justify-end mt-4'>
                        <Pagination pageNumber={currentPage} setPageNumber={setCurrentPage} totalItem={totalUser} parPage={parPage} showItem={3} />
                    </div>
                }
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <UserProfileModal userId={selectedProfileUserId} onClose={() => setShowProfileModal(false)} />
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-[#283046] rounded-lg w-full max-w-lg p-6 relative shadow-lg">
                        <button
                            onClick={handleInputModalClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-xl font-semibold text-[#d0d2d6] mb-6">{isEdit ? 'Edit User' : 'Create New User'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">Name</label>
                                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none" placeholder="Name" />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">Email</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none" placeholder="Email" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">Phone</label>
                                    <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none" placeholder="Phone" />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">Password {isEdit && <span className="text-xs text-gray-400">(Leave blank to keep)</span>}</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none" placeholder="Password" required={!isEdit} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">Role</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none">
                                        <option value="JOB_SEEKER">Job Seeker</option>
                                        <option value="hire">Hire</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">User Type</label>
                                    <select name="userType" value={formData.userType} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none">
                                        <option value="FREE">Free</option>
                                        <option value="CREDIT">Credit</option>
                                        <option value="PREMIUM">Premium</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">Credit Balance</label>
                                    <input type="number" name="creditBalance" value={formData.creditBalance} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">Account Status</label>
                                    <select name="status" value={formData.status || 'Active'} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#d0d2d6] mb-1">Resume Service</label>
                                    <select
                                        name="resumeEditorEnabled"
                                        value={formData.resumeEditorEnabled ? 'true' : 'false'}
                                        onChange={(e) => setFormData({ ...formData, resumeEditorEnabled: e.target.value === 'true' })}
                                        className="w-full px-3 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] focus:border-indigo-500 outline-none"
                                    >
                                        <option value="false">Inactive</option>
                                        <option value="true">Active</option>
                                    </select>
                                </div>
                            </div>

                            <button disabled={createLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 mt-4 transition-colors">
                                {createLoading ? <PropagateLoader color='#fff' size={10} cssOverride={{ display: 'block', margin: '0 auto' }} /> : (isEdit ? 'Update User' : 'Create User')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersList;
