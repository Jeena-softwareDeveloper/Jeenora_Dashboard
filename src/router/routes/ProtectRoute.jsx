import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectRoute = ({ route, children }) => {
    const { role, userInfo, loading } = useSelector(state => state.auth);

    if (loading) {
        return <div>Loading...</div>;
    } if (!role) {
        return <Navigate to='/login' replace />;
    }

    // If route has specific role requirement
    if (route.role) {
        // Check if user has the required role
        if (userInfo && userInfo.role === route.role) {
            // Check status requirements
            if (route.status) {
                if (route.status === userInfo.status) {
                    // Status matches, now check permissions
                    if (route.permission) {
                        const userPermissions = userInfo?.permissions || [];

                        if (!userPermissions.includes(route.permission)) {
                            // User doesn't have required permission, redirect based on role
                            if (userInfo.role === 'seller') {
                                return <Navigate to='/seller/awareness/banners' replace />;
                            } else if (userInfo.role === 'hireUser') {
                                return <Navigate to='/hire/dashboard' replace />;
                            } else {
                                return <Navigate to='/' replace />;
                            }
                        }
                    }
                    // Permission check passed or no permission required, allow access
                    return <Suspense fallback={null}>{children}</Suspense>;
                } else {
                    // Handle different status redirects based on user role
                    if (userInfo.role === 'seller') {
                        if (userInfo.status === 'pending') {
                            return <Navigate to='/seller/account-pending' replace />;
                        } else {
                            return <Navigate to='/seller/account-deactive' replace />;
                        }
                    } else if (userInfo.role === 'hireUser') {
                        if (userInfo.status === 'pending') {
                            return <Navigate to='/hire/account-pending' replace />;
                        } else if (userInfo.status === 'inactive') {
                            return <Navigate to='/hire/account-inactive' replace />;
                        } else {
                            return <Navigate to='/' replace />;
                        }
                    } else {
                        return <Navigate to='/' replace />;
                    }
                }
            } else {
                // Check visibility requirements
                if (route.visibility) {
                    if (route.visibility.some(r => r === userInfo.status)) {
                        // Visibility check passed, now check permissions
                        if (route.permission) {
                            const userPermissions = userInfo?.permissions || [];

                            if (!userPermissions.includes(route.permission)) {
                                // User doesn't have required permission, redirect based on role
                                if (userInfo.role === 'seller') {
                                    return <Navigate to='/seller/awareness/banners' replace />;
                                } else if (userInfo.role === 'hireUser') {
                                    return <Navigate to='/hire/dashboard' replace />;
                                } else {
                                    return <Navigate to='/' replace />;
                                }
                            }
                        }
                        // Permission check passed or no permission required, allow access
                        return <Suspense fallback={null}>{children}</Suspense>;
                    } else {
                        // Redirect based on role and status
                        if (userInfo.role === 'seller') {
                            return <Navigate to='/seller/account-pending' replace />;
                        } else if (userInfo.role === 'hireUser') {
                            return <Navigate to='/hire/account-pending' replace />;
                        } else {
                            return <Navigate to='/' replace />;
                        }
                    }
                } else {
                    // No status or visibility requirements, check permissions
                    if (route.permission) {
                        const userPermissions = userInfo?.permissions || [];

                        if (!userPermissions.includes(route.permission)) {
                            // User doesn't have required permission, redirect based on role
                            if (userInfo.role === 'seller') {
                                return <Navigate to='/seller/awareness/banners' replace />;
                            } else if (userInfo.role === 'hireUser') {
                                return <Navigate to='/hire/dashboard' replace />;
                            } else {
                                return <Navigate to='/' replace />;
                            }
                        }
                    }
                    // Permission check passed or no permission required, allow access
                    return <Suspense fallback={null}>{children}</Suspense>;
                }
            }
        } else {
            // User doesn't have the required role
            return <Navigate to='/' replace />;
        }
    } else {
        // Route without specific role requirement, check ability
        if (route.ability) {
            if (route.ability === 'seller' && userInfo.role === 'seller') {
                return <Suspense fallback={null}>{children}</Suspense>;
            } else if (route.ability === 'hireUser' && userInfo.role === 'hireUser') {
                return <Suspense fallback={null}>{children}</Suspense>;
            } else if (route.ability === 'admin' && userInfo.role === 'admin') {
                return <Suspense fallback={null}>{children}</Suspense>;
            } else if (Array.isArray(route.ability) && route.ability.includes(userInfo.role)) {
                return <Suspense fallback={null}>{children}</Suspense>;
            } else {
                return <Navigate to='/' replace />;
            }
        } else {
            // No role or ability requirements, allow access to all authenticated users
            return <Suspense fallback={null}>{children}</Suspense>;
        }
    }
};

export default ProtectRoute;