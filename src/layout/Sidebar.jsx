import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getNav } from '../navigation';
import { BiChevronRight } from 'react-icons/bi';
import { IoIosArrowDown, IoIosSettings } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../assets/logo.png';
import { getMenuDisplaySettings } from '../store/Reducers/adminSettingsReducer';

const Sidebar = ({ showSidebar, setShowSidebar, collapsed, setCollapsed, isMobile }) => {
    const dispatch = useDispatch();
    const { role, userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [allNav, setAllNav] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [activeHover, setActiveHover] = useState(null);
    const { menuDisplaySettings, isLoaded } = useSelector(state => state.adminSettings);
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

    // Fetch per-group menu display mode settings
    useEffect(() => {
        if (!isLoaded) {
            dispatch(getMenuDisplaySettings());
        }
    }, [dispatch, isLoaded]);

    // Load navigation
    useEffect(() => {
        setAllNav(getNav(role, userInfo?.permissions, menuDisplaySettings));
    }, [role, userInfo, menuDisplaySettings]);



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
                className={`
                    ${isMobile ? 'fixed' : 'relative'} 
                    h-full flex flex-col z-50 
                    bg-gradient-to-b from-green-50 to-white 
                    shadow-2xl border-r border-green-200/30 
                    transition-all duration-300 ease-in-out 
                    ${sidebarWidth} 
                    ${isMobile && !showSidebar ? '-translate-x-full' : 'translate-x-0'}
                `}
            >
                {/* Logo and Brand */}
                <div className={`flex-shrink-0 h-16 lg:h-20 flex items-center ${collapsed ? 'justify-center' : 'justify-start px-4'} bg-gradient-to-r border-b border-green-200/30`}>
                    {collapsed ? (
                        <img src={logo} alt="Jeenora" className="h-10 w-10 object-contain" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Jeenora" className="h-12 w-12 object-contain" />
                            <div>
                                <h1 className="text-xl font-bold text-green-700">Jeenora</h1>
                                <p className="text-xs text-green-600">Dashboard</p>
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

                {/* Navigation Menu */}
                <div className=" overflow-y-auto p-3 lg:p-4 space-y-1">
                    {allNav.length > 0 ? allNav.map(nav => <NavItem key={nav.id} nav={nav} />)
                        : <p className="text-center text-green-400 py-6">No menu items</p>}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
