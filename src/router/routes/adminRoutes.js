import { lazy } from "react";
const AdminDashboard = lazy(() => import('../../views/admin/AdminDashboard'))
const Orders = lazy(() => import('../../views/admin/Orders'))
const Category = lazy(() => import('../../views/admin/Category'))
const Sellers = lazy(() => import('../../views/admin/Sellers'))
const PaymentRequest = lazy(() => import('../../views/admin/PaymentRequest'))
const DeactiveSellers = lazy(() => import('../../views/admin/DeactiveSellers'))
const SellerRequest = lazy(() => import('../../views/admin/SellerRequest'))
const SellerDetails = lazy(() => import('../../views/admin/SellerDetails'))
const ChatSeller = lazy(() => import('../../views/admin/ChatSeller'))
const OrderDetails = lazy(() => import('../../views/admin/OrderDetails'))
const Profile = lazy(() => import('../../views/Profile'))
const AdminJobs = lazy(() => import('../../views/admin/AdminJobs'))
const CreateJob = lazy(() => import('../../views/admin/CreateJob'))
const EditJob = lazy(() => import('../../views/admin/EditJob'))
const JobDetails = lazy(() => import('../../views/admin/JobDetails'))
const AdminResumes = lazy(() => import('../../views/admin/AdminResumes'))
const ChatSupport = lazy(() => import('../../views/admin/ChatSupport'))
const CreditManagement = lazy(() => import('../../views/admin/CreditManagement'))

const StaticContentManagement = lazy(() => import('../../views/admin/StaticContentManagement'))

export const adminRoutes = [
    {
        path: 'admin/dashboard/static-content',
        element: <StaticContentManagement />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard',
        element: <AdminDashboard />,
        role: 'admin'
    },
    {
        path: 'admin/profile',
        element: <Profile />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/credits',
        element: <CreditManagement />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/orders',
        element: <Orders />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/category',
        element: <Category />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/sellers',
        element: <Sellers />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/payment-request',
        element: <PaymentRequest />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/deactive-sellers',
        element: <DeactiveSellers />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/sellers-request',
        element: <SellerRequest />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/seller/details/:sellerId',
        element: <SellerDetails />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/chat-sellers',
        element: <ChatSeller />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/chat-sellers/:sellerId',
        element: <ChatSeller />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/order/details/:orderId',
        element: <OrderDetails />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/jobs',
        element: <AdminJobs />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/jobs/create',
        element: <CreateJob />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/jobs/edit/:jobId',
        element: <EditJob />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/jobs/:jobId',
        element: <JobDetails />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/resumes',
        element: <AdminResumes />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/tickets-support',
        element: <ChatSupport />,
        role: 'admin'
    },

]