import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { FaEye, FaEdit, FaPlus, FaKey } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { get_active_sellers, admin_create_seller, update_seller_permissions, update_seller_password, messageClear } from '../../store/Reducers/sellerReducer';
import { allNav } from '../../navigation/allNav';
import toast from 'react-hot-toast';
import { IoMdClose } from "react-icons/io";
import api from '../../api/api';

const Sellers = () => {
    const dispatch = useDispatch()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(5)
    // const [show, setShow] =  useState(false)
    const { sellers, totalSeller, successMessage, errorMessage } = useSelector(state => state.seller)

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isPasswordChange, setIsPasswordChange] = useState(false);
    const [selectedSellerId, setSelectedSellerId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        permissions: []
    });
    const [menuDisplaySettings, setMenuDisplaySettings] = useState({});

    // Get all parent menus with children (menu groups)
    const getMenuGroups = () => {
        const groups = [];
        allNav.forEach(nav => {
            if (nav.role === 'seller' && nav.children && nav.children.length > 0) {
                groups.push({
                    id: nav.id,
                    title: nav.title
                });
            }
        });
        return groups;
    };

    const menuGroups = getMenuGroups();

    // Fetch current menu display settings on mount
    useEffect(() => {
        const fetchMenuDisplaySettings = async () => {
            try {
                const { data } = await api.get('/admin/settings/menuDisplayMode');
                setMenuDisplaySettings(data.setting?.settingValue || {});
            } catch (error) {
                console.log('Using default menu display settings');
            }
        };
        fetchMenuDisplaySettings();
    }, []);

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        }
        dispatch(get_active_sellers(obj))
    }, [searchValue, currentPage, parPage])

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', permissions: [] });
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage]);

    const getAvailablePermissions = () => {
        const permissions = [];
        allNav.forEach(nav => {
            if (nav.role === 'seller') {
                if (nav.permission) {
                    permissions.push({ label: nav.title, value: nav.permission });
                }
                if (nav.children) {
                    nav.children.forEach(child => {
                        if (child.permission) {
                            permissions.push({ label: `${nav.title} > ${child.title}`, value: child.permission });
                        }
                    });
                }
            }
        });
        return permissions;
    };

    const availablePermissions = getAvailablePermissions();

    const handlePermissionChange = (permValue) => {
        setFormData(prev => {
            const newPerms = prev.permissions.includes(permValue)
                ? prev.permissions.filter(p => p !== permValue)
                : [...prev.permissions, permValue];
            return { ...prev, permissions: newPerms };
        });
    };

    const handleOpenCreate = () => {
        setIsEdit(false);
        setIsPasswordChange(false);
        setFormData({ name: '', email: '', password: '', permissions: [] });
        setShowModal(true);
    };

    const handleOpenPermissions = (seller) => {
        setIsEdit(true);
        setIsPasswordChange(false);
        setSelectedSellerId(seller._id);
        setFormData({
            name: seller.name, // Just for display if needed, or ignored
            email: seller.email,
            permissions: seller.permissions || []
        });
        setShowModal(true);
    }

    const handleOpenPasswordChange = (seller) => {
        setIsEdit(false);
        setIsPasswordChange(true);
        setSelectedSellerId(seller._id);
        setFormData({
            name: seller.name,
            email: seller.email,
            password: '',
            permissions: []
        });
        setShowModal(true);
    }

    const handleMenuDisplayModeChange = async (menuId, mode) => {
        try {
            const newSettings = { ...menuDisplaySettings, [menuId]: mode };
            console.log('Saving menu display settings:', newSettings);
            const response = await api.post('/admin/settings/menu-display-mode', { menuGroupSettings: newSettings });
            console.log('Save response:', response.data);
            setMenuDisplaySettings(newSettings);
            toast.success(`Menu display mode updated`);
        } catch (error) {
            console.error('Failed to save menu display mode:', error);
            toast.error('Failed to update menu display mode');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isPasswordChange) {
            dispatch(update_seller_password({
                sellerId: selectedSellerId,
                password: formData.password
            }));
        } else if (isEdit) {
            dispatch(update_seller_permissions({
                sellerId: selectedSellerId,
                permissions: formData.permissions
            }));
        } else {
            dispatch(admin_create_seller(formData));
        }
    }

    return (
        <div className='px-2 lg:px-7 pt-5 relative'>
            <div className="flex justify-between items-center mb-3">
                <h1 className='text-[20px] font-bold'>Seller</h1>
                <button onClick={handleOpenCreate} className='bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2'>
                    <FaPlus /> Create Seller
                </button>
            </div>

            <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>

                <div className='flex justify-between items-center'>
                    <select onChange={(e) => setParPage(parseInt(e.target.value))} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]'>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                    <input onChange={e => setSearchValue(e.target.value)} value={searchValue} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#6a5fdf] border border-slate-700 rounded-md text-[#d0d2d6]' type="text" placeholder='search' />
                </div>

                <div className='relative overflow-x-auto'>
                    <table className='w-full text-sm text-left text-[#d0d2d6]'>
                        <thead className='text-sm text-[#d0d2d6] uppercase border-b border-slate-700'>
                            <tr>
                                <th scope='col' className='py-3 px-4'>No</th>
                                <th scope='col' className='py-3 px-4'>Image</th>
                                <th scope='col' className='py-3 px-4'>Name</th>
                                <th scope='col' className='py-3 px-4'>Shop Name</th>
                                <th scope='col' className='py-3 px-4'>Payment Status</th>
                                <th scope='col' className='py-3 px-4'>Email</th>
                                <th scope='col' className='py-3 px-4'>Région </th>
                                <th scope='col' className='py-3 px-4'>Gouvernorat</th>
                                <th scope='col' className='py-3 px-4'>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                sellers.map((d, i) => <tr key={i}>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{i + 1}</td>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
                                        <img className='w-[45px] h-[45px]' src={d.image} alt="" />
                                    </td>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.name} </td>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.shopInfo?.shopName}</td>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
                                        <span>{d.payment}</span> </td>
                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.email} </td>

                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.shopInfo?.division} </td>

                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>{d.shopInfo?.district} </td>

                                    <td scope='row' className='py-1 px-4 font-medium whitespace-nowrap'>
                                        <div className='flex justify-start items-center gap-4'>
                                            <Link to={`/admin/dashboard/seller/details/${d._id}`} className='p-[6px] bg-green-500 rounded hover:shadow-lg hover:shadow-green-500/50'> <FaEye /> </Link>
                                            <button onClick={() => handleOpenPermissions(d)} className='p-[6px] bg-yellow-500 rounded hover:shadow-lg hover:shadow-yellow-500/50' title="Manage Permissions"> <FaEdit /> </button>
                                            <button onClick={() => handleOpenPasswordChange(d)} className='p-[6px] bg-red-500 rounded hover:shadow-lg hover:shadow-red-500/50' title="Change Password"> <FaKey /> </button>
                                        </div>

                                    </td>
                                </tr>)
                            }


                        </tbody>
                    </table>
                </div>
                {
                    totalSeller <= parPage ? <div className='w-full flex justify-end mt-4 bottom-4 right-4'>
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalSeller}
                            parPage={parPage}
                            showItem={3}
                        />
                    </div> : ""
                }

            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white text-black p-6 rounded-lg w-[500px] shadow-xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                            <IoMdClose size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4">
                            {isPasswordChange ? 'Change Password' : (isEdit ? 'Manage Permissions' : 'Create Seller')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Create Seller Form */}
                            {!isEdit && !isPasswordChange && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded p-2"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full border rounded p-2"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Password</label>
                                        <input
                                            type="password"
                                            className="w-full border rounded p-2"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Permissions</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
                                            {availablePermissions.map((perm) => (
                                                <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions.includes(perm.value)}
                                                        onChange={() => handlePermissionChange(perm.value)}
                                                    />
                                                    <span className='text-sm'>{perm.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Permission Edit Form */}
                            {isEdit && !isPasswordChange && (
                                <div>
                                    <div className="mb-4 p-2 bg-gray-100 rounded">
                                        <p className="font-semibold">{formData.name}</p>
                                        <p className="text-sm text-gray-600">{formData.email}</p>
                                    </div>

                                    {/* Menu Display Mode Toggle - Per Group */}
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                        <label className="block text-sm font-medium mb-3 text-blue-900">Menu Display Mode (Per Group)</label>
                                        <div className="space-y-3 max-h-48 overflow-y-auto">
                                            {menuGroups.map((group) => (
                                                <div key={group.id} className="bg-white p-2 rounded border border-gray-200">
                                                    <p className="text-sm font-semibold mb-2 text-gray-700">{group.title}</p>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`menu-${group.id}`}
                                                                value="grouped"
                                                                checked={(menuDisplaySettings[group.id] || 'grouped') === 'grouped'}
                                                                onChange={(e) => handleMenuDisplayModeChange(group.id.toString(), e.target.value)}
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <span className="text-xs">Grouped</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`menu-${group.id}`}
                                                                value="flat"
                                                                checked={menuDisplaySettings[group.id] === 'flat'}
                                                                onChange={(e) => handleMenuDisplayModeChange(group.id.toString(), e.target.value)}
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <span className="text-xs">Flat</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Grouped = Show parent menu with children | Flat = Show children directly</p>
                                    </div>

                                    <label className="block text-sm font-medium mb-2">Permissions</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
                                        {availablePermissions.map((perm) => (
                                            <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(perm.value)}
                                                    onChange={() => handlePermissionChange(perm.value)}
                                                />
                                                <span className='text-sm'>{perm.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Password Change Form */}
                            {isPasswordChange && (
                                <>
                                    <div className="mb-4 p-2 bg-gray-100 rounded">
                                        <p className="font-semibold">{formData.name}</p>
                                        <p className="text-sm text-gray-600">{formData.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full border rounded p-2"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </>
                            )}

                            <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                                {isPasswordChange ? 'Update Password' : (isEdit ? 'Update Permissions' : 'Create Seller')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Sellers;