import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getNav } from '../navigation';
import { BiLogOutCircle, BiChevronRight, BiSearch } from 'react-icons/bi';
import { IoIosArrowDown, IoIosSettings } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/Reducers/authReducer';
import logo from '../assets/logo.png';

const Sidebar = ({ showSidebar, setShowSidebar, collapsed, setCollapsed, isMobile }) => {
    const dispatch = useDispatch();
    const { role, userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [allNav, setAllNav] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeHover, setActiveHover] = useState(null);
    const sidebarRef = useRef(null);

    // Handle resize inside Sidebar if needed
    useEffect(() => {
        if (!isMobile) setShowSidebar(true);
    }, [isMobile, setShowSidebar]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !isMobile) {
                e.preventDefault();
                setCollapsed(!collapsed);
            }
            if (e.key === 'Escape' && showSidebar && isMobile) {
                setShowSidebar(false);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [collapsed, showSidebar, isMobile, setCollapsed, setShowSidebar]);

    // Close sidebar on outside click (mobile)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && showSidebar && isMobile) {
                setShowSidebar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSidebar, isMobile, setShowSidebar]);

    // Load navigation
    useEffect(() => {
        setAllNav(getNav(role, userInfo?.permissions));
    }, [role, userInfo]);

    const filteredNav = allNav.filter(nav =>
        nav.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nav.children && nav.children.some(child =>
            child.title.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );

    const handleLogout = async () => {
        await dispatch(logout({ navigate, role }));
        setShowSidebar(false);
    };

    const toggleDropdown = useCallback((id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    }, [openDropdown]);

    const isActiveLink = (linkPath) => pathname === linkPath || pathname.startsWith(linkPath + '/');

    const NavItem = ({ nav, level = 0 }) => {
        const hasChildren = nav.children && nav.children.length > 0;
        const isActive = isActiveLink(nav.path);
        const isDropdownOpen = openDropdown === nav.id;

        return (
            <div className="relative">
                {!hasChildren ? (
                    <Link
                        to={nav.path}
                        className={`
              flex items-center gap-3 px-4  py-3 rounded-lg transition-all duration-200 group
              ${isActive ? 'bg-gradient-to-r from-[#236F21] to-green-600 text-white shadow-lg' : 'text-gray-700 hover:bg-green-50 hover:translate-x-1'}
              ${level > 0 ? 'ml-4 text-sm' : ''}
              ${collapsed ? 'justify-center px-3' : ''}
            `}
                        onClick={() => isMobile && setShowSidebar(false)}
                    >
                        <span className={`${collapsed ? 'text-xl' : ''}`}>{nav.icon}</span>
                        {!collapsed && (
                            <>
                                <span className="flex-1 truncate">{nav.title}</span>
                            </>
                        )}
                    </Link>
                ) : (
                    <div className="dropdown-group">
                        <button
                            onClick={() => toggleDropdown(nav.id)}
                            onMouseEnter={() => !isMobile && setActiveHover(nav.id)}
                            onMouseLeave={() => !isMobile && setActiveHover(null)}
                            className={`
                flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 group
                ${isActive ? 'bg-gradient-to-r from-[#236F21] to-green-600 text-white shadow-lg' : 'text-gray-700 hover:bg-green-50'}
                ${collapsed ? 'justify-center px-3' : ''}
              `}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`${collapsed ? 'text-xl' : ''}`}>{nav.icon}</span>
                                {!collapsed && <span className="truncate">{nav.title}</span>}
                            </div>
                            {!collapsed && <IoIosArrowDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />}
                        </button>
                        {!collapsed && (
                            <div className={`${isDropdownOpen ? 'max-h-180 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300`}>
                                <div className="ml-6 py-2 space-y-1 border-l-2 border-[#236F21]/30">
                                    {nav.children.map(child => <NavItem key={child.id} nav={child} level={level + 1} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const sidebarWidth = collapsed ? 'w-16 lg:w-20' : 'w-72 lg:w-74';

    return (
        <>
            {/* Mobile overlay */}
            <div
                onClick={() => setShowSidebar(false)}
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 lg:hidden ${showSidebar ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            />

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed h-screen flex flex-col z-50 bg-gradient-to-b from-green-50 to-white shadow-2xl border-r border-green-200/30 transition-all duration-300 ease-in-out ${sidebarWidth} ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Header with Collapse Button Only */}
                <div className="flex-shrink-0 h-16 lg:h-20 flex items-center justify-end px-3 lg:px-4 bg-gradient-to-r ">
                    {/* Search & Navigation */}
                    {!collapsed && (
                        <div className="p-3 lg:p-4 border-b border-green-200/30">
                            <div className="relative">
                                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
                                <input
                                    type="text"
                                    placeholder="Search menu..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2 bg-white border border-green-200 rounded-lg text-sm lg:text-base"
                                />
                            </div>
                        </div>
                    )}
                    {!isMobile && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className={`absolute top-5 -right-3 z-50 p-1 rounded-full shadow-md border bg-green-700 text-white`}
                            title={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
                        >
                            <BiChevronRight
                                className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                            />
                        </button>
                    )}
                </div>
                <div className=" overflow-y-auto p-3 lg:p-4 space-y-1">
                    {filteredNav.length > 0 ? filteredNav.map(nav => <NavItem key={nav.id} nav={nav} />)
                        : <p className="text-center text-green-400 py-6">No menu items</p>}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0  border-t border-green-200/30 p-3 lg:p-4">
                    <button onClick={handleLogout} className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
                        <BiLogOutCircle />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
