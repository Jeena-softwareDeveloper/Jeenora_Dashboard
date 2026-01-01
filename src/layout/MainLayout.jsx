import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { socket } from '../utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { updateCustomer, updateSellers } from '../store/Reducers/chatReducer';

const MainLayout = () => {
  const { userInfo } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
      if (mobile) setCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Socket connections
  useEffect(() => {
    socket.on('activeCustomer', customers => dispatch(updateCustomer(customers)));
    socket.on('activeSeller', sellers => dispatch(updateSellers(sellers)));
    return () => {
      socket.off('activeCustomer');
      socket.off('activeSeller');
    };
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'seller') socket.emit('add_seller', userInfo._id, userInfo);
      else socket.emit('add_admin', userInfo);
    }
  }, [userInfo]);

  // Sidebar width
  const sidebarWidth = collapsed ? 'w-16 lg:w-20' : 'w-72 lg:w-80';

  return (
    <div className="flex flex-col w-full bg-green-500">
      {/* Header full width */}
      <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

      <div className="flex mt--10 flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Main content */}
        <main
          className={`flex-1 bg-green-50 transition-all duration-300 
            ${!isMobile && showSidebar ? (collapsed ? 'ml-16 lg:ml-20' : 'ml-72 lg:ml-86') : 'ml-0'}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
