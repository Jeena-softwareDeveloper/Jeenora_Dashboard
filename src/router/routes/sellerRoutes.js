import { lazy } from "react";
const Banners = lazy(() => import('../../views/seller/Awareness/Banners'))
const Images = lazy(() => import('../../views/seller/Awareness/Images'))
const SuccessStories = lazy(() => import('../../views/seller/Awareness/SuccessStories'))
const Guide = lazy(() => import('../../views/seller/Awareness/GuidesManager'))
const Video = lazy(() => import('../../views/seller/Awareness/Video'))
const Accounts = lazy(() => import('../../views/seller/Awareness/AccountsManager'))
const Campaign = lazy(() => import('../../views/seller/Awareness/Campaign'))
const AnalyticsUserList = lazy(() => import('../../views/seller/Awareness/Analytics/AnalyticsUsersList'))
const Resume = lazy(() => import('../../views/seller/hire/Resume'))
const AppliedJobs = lazy(() => import('../../views/seller/hire/AppliedJobs'))
const UsersList = lazy(() => import('../../views/seller/hire/UsersList'))

const Subscriber = lazy(() => import('../../views/seller/Awareness/Subscriber'))
const Points = lazy(() => import('../../views/seller/Awareness/Points')) // Restored Import
const SellerDashboard = lazy(() => import('../../views/seller/SellerDashboard'))
const AdminJobs = lazy(() => import('../../views/admin/AdminJobs'))
const AdminResumes = lazy(() => import('../../views/admin/AdminResumes'))
const ChatSupport = lazy(() => import('../../views/admin/ChatSupport'))
const CreateJob = lazy(() => import('../../views/admin/CreateJob'))
const EditJob = lazy(() => import('../../views/admin/EditJob'))
const JobDetails = lazy(() => import('../../views/admin/JobDetails'))
const AddProduct = lazy(() => import('../../views/seller/AddProduct'))
const Products = lazy(() => import('../../views/seller/Products'))
const Orders = lazy(() => import('../../views/seller/Orders'))
const Payments = lazy(() => import('../../views/seller/Payments'))
const SellerToAdmin = lazy(() => import('../../views/seller/SellerToAdmin'))
const SellerToCustomer = lazy(() => import('../../views/seller/SellerToCustomer'))
const Profile = lazy(() => import('../../views/Profile'))
const EditProduct = lazy(() => import('../../views/seller/EditProduct'))
const OrderDetails = lazy(() => import('../../views/seller/OrderDetails'))
const Pending = lazy(() => import('./../../views/Pending'))
const Deactive = lazy(() => import('./../../views/Deactive'))
const AddBanner = lazy(() => import('../../views/seller/AddBanner'))
const CreditManagement = lazy(() => import('../../views/admin/CreditManagement'))
const StaticContentManagement = lazy(() => import('../../views/admin/StaticContentManagement'))
export const sellerRoutes = [

    {
        path: '/seller/account-pending',
        element: <Pending />,
        ability: 'seller'
    },
    {
        path: '/seller/account-deactive',
        element: <Deactive />,
        ability: 'seller'
    },
    {
        path: '/seller/dashboard',
        element: <SellerDashboard />,
        role: 'seller',
        status: 'active',
        permission: 'dashboard.access'
    },
    {
        path: '/seller/awareness/banners',
        element: <Banners />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.banners'
    },

    {
        path: '/seller/dashboard/add-product',
        element: <AddProduct />,
        role: 'seller',
        status: 'active',
        permission: 'product.add'

    },
    {
        path: '/seller/dashboard/edit-product/:productId',
        element: <EditProduct />,
        role: 'seller',
        status: 'active',
        permission: 'product.edit'
    },
    {
        path: '/seller/dashboard/products',
        element: <Products />,
        role: 'seller',
        status: 'active',
        permission: 'product.all'
    },

    {
        path: '/seller/dashboard/orders',
        element: <Orders />,
        role: 'seller',
        visibility: ['active', 'deactive'],
        permission: 'orders.access'
    },
    {
        path: '/seller/dashboard/order/details/:orderId',
        element: <OrderDetails />,
        role: 'seller',
        visibility: ['active', 'deactive'],
        permission: 'orders.access'
    },
    {
        path: '/seller/dashboard/payments',
        element: <Payments />,
        role: 'seller',
        status: 'active',
        permission: 'payments.history'
    },
    {
        path: '/seller/dashboard/chat-support',
        element: <SellerToAdmin />,
        role: 'seller',
        visibility: ['active', 'deactive', 'pending'],
        permission: 'chat.support'
    },
    {
        path: '/seller/dashboard/chat-customer/:customerId',
        element: <SellerToCustomer />,
        role: 'seller',
        status: 'active',
        permission: 'chat.customer'
    },
    {
        path: '/seller/dashboard/chat-customer',
        element: <SellerToCustomer />,
        role: 'seller',
        status: 'active',
        permission: 'chat.customer'
    },
    {
        path: '/seller/profile',
        element: <Profile />,
        role: 'seller',
        visibility: ['active', 'deactive', 'pending']
    },
    {
        path: '/seller/awareness/add-banner/:productId',
        element: <AddBanner />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.banners'
    },
    {
        path: '/seller/awareness/points',
        element: <Points />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.points'
    },
    {
        path: '/seller/awareness/Images',
        element: <Images />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.gallery'
    },
    {
        path: '/seller/awareness/SuccessStories',
        element: <SuccessStories />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.stories'
    },
    {
        path: '/seller/awareness/Guide',
        element: <Guide />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.guide'
    },
    {
        path: '/seller/awareness/Video',
        element: <Video />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.video'
    },
    {
        path: '/seller/awareness/Accounts',
        element: <Accounts />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.social'
    },
    {
        path: '/seller/awareness/Subscriber',
        element: <Subscriber />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.subscriber'
    },
    {
        path: '/seller/awareness/Campaign',
        element: <Campaign />,
        role: 'seller',
        status: 'active',
        permission: 'awareness.campaign'
    },
    {
        path: '/seller/Analytics/Analyticsuserlist',
        element: <AnalyticsUserList />,
        role: 'seller',
        status: 'active',
        permission: 'analytics.users'
    },
    {
        path: '/hire/resume',
        element: <Resume />,
        role: 'seller',
        status: 'active',
        permission: 'hire.resume'
    },
    {
        path: '/seller/hire/users',
        element: <UsersList />,
        role: 'seller',
        status: 'active',
        permission: 'hire.users'
    },
    {
        path: '/seller/hire/jobs',
        element: <AdminJobs />, // Reusing admin component
        role: 'seller',
        status: 'active',
        permission: 'hire.jobs'
    },
    {
        path: '/seller/hire/jobs/create',
        element: <CreateJob />, // Reusing admin component
        role: 'seller',
        status: 'active',
        permission: 'hire.jobs'
    },
    {
        path: '/seller/hire/jobs/edit/:jobId',
        element: <EditJob />,
        role: 'seller',
        status: 'active',
        permission: 'hire.jobs'
    },
    {
        path: '/seller/hire/jobs/:jobId',
        element: <JobDetails />,
        role: 'seller',
        status: 'active',
        permission: 'hire.jobs'
    },
    {
        path: '/seller/hire/resumes-manage', // Different path from existing /hire/resume which is a different view
        element: <AdminResumes />, // Reusing admin component
        role: 'seller',
        status: 'active',
        permission: 'hire.resumes'
    },
    {
        path: '/seller/hire/applied-jobs',
        element: <AppliedJobs />,
        role: 'seller',
        status: 'active',
        permission: 'hire.applied'
    },
    {
        path: '/seller/hire/tickets-support',
        element: <ChatSupport />,
        role: 'seller',
        status: 'active',
        permission: 'hire.tickets'
    },
    {
        path: '/seller/hire/credit-settings',
        element: <CreditManagement />,
        role: 'seller',
        status: 'active',
        permission: 'hire.credits'
    },
    {
        path: '/seller/hire/static-content',
        element: <StaticContentManagement />,
        role: 'seller',
        status: 'active',
        permission: 'hire.staticContent'
    }

]