import {
  AiOutlineDashboard,
  AiOutlineShoppingCart,
  AiOutlineShop,
  AiOutlineUser,
  AiOutlineMessage,
  AiOutlineVideoCamera,
  AiOutlineStar,
  AiOutlineAccountBook
} from "react-icons/ai";
import {
  BiCategory,
  BiUserX,
  BiMoney,
  BiChat,
  BiImageAdd
} from "react-icons/bi";
import {
  FaUsers,
  FaFileContract,
  FaBoxOpen,
  FaBullhorn
} from "react-icons/fa";
import {
  MdPayment,
  MdViewList,
  MdOutlineRequestQuote,
  MdOutlineLiveHelp,
  MdOutlineMenuBook
} from "react-icons/md";
import {
  IoIosChatbubbles,
  IoMdAdd,
  IoMdImages,
  IoMdCheckmarkCircle
} from "react-icons/io";
import {
  BsCartCheck,
  BsStars,
  BsCardChecklist
} from "react-icons/bs";
import {
  IoChatbubbles,
  IoPersonCircle
} from "react-icons/io5";
import {
  CgProfile,
  CgPlayListCheck
} from "react-icons/cg";
import {
  RiCustomerService2Line,
  RiRefundLine
} from "react-icons/ri";

export const allNav = [
  // Admin Navigation
  {
    id: 1,
    title: 'Dashboard',
    icon: <AiOutlineDashboard />,
    role: 'admin',
    path: '/admin/dashboard',
    badge: 'new'
  },
  {
    id: 2,
    title: 'Orders',
    icon: <AiOutlineShoppingCart />,
    role: 'admin',
    path: '/admin/dashboard/orders',
    badge: 5
  },
  {
    id: 3,
    title: 'Categories',
    icon: <BiCategory />,
    role: 'admin',
    path: '/admin/dashboard/categories'
  },
  {
    id: 4,
    title: 'Sellers',
    icon: <FaUsers />,
    role: 'admin',
    path: '/admin/dashboard/sellers',
    badge: 12
  },
  {
    id: 5,
    title: 'Payment Requests',
    icon: <MdPayment />,
    role: 'admin',
    path: '/admin/dashboard/payment-requests',
    badge: 3
  },
  {
    id: 6,
    title: 'Deactivated Sellers',
    icon: <BiUserX />,
    role: 'admin',
    path: '/admin/dashboard/deactivated-sellers'
  },
  {
    id: 7,
    title: 'Seller Requests',
    icon: <FaFileContract />,
    role: 'admin',
    path: '/admin/dashboard/seller-requests',
    badge: 8
  },

  {
    id: 18,
    title: 'Customers',
    icon: <IoPersonCircle />,
    role: 'admin',
    path: '/admin/dashboard/customers'
  },
  {
    id: 19,
    title: 'Analytics',
    icon: <BsCardChecklist />,
    role: 'admin',
    path: '/admin/dashboard/analytics'
  },
  {
    id: 20,
    title: 'Settings',
    icon: <CgPlayListCheck />,
    role: 'admin',
    path: '/admin/dashboard/settings'
  },
  {
    id: 55,
    title: 'Hire Administration',
    icon: <FaBullhorn />,
    role: 'admin',
    children: [
      {
        id: 21,
        title: 'Job Management',
        icon: <FaFileContract />,
        path: '/admin/dashboard/jobs'
      },
      {
        id: 22,
        title: 'Resume Management',
        icon: <BiImageAdd />,
        path: '/admin/dashboard/resumes'
      },
      {
        id: 23,
        title: 'Tickets Support',
        icon: <RiCustomerService2Line />,
        path: '/admin/dashboard/tickets-support',
        permission: 'hire.tickets'
      },
      {
        id: 24,
        title: 'Credit Settings',
        icon: <BiMoney />,
        path: '/admin/dashboard/credits',
        permission: 'hire.credits'
      },
      {
        id: 25,
        title: 'Static Content',
        icon: <MdOutlineMenuBook />,
        path: '/admin/dashboard/static-content',
        permission: 'hire.staticContent'
      }
    ]
  },


  // Seller Navigation
  {
    id: 9,
    title: 'Dashboard',
    icon: <AiOutlineDashboard />,
    role: 'seller',
    path: '/seller/dashboard',
    badge: 'updated',
    permission: 'dashboard.access'
  },
  {
    id: 10,
    title: 'Products',
    icon: <FaBoxOpen />,
    role: 'seller',
    children: [
      {
        id: 11,
        title: 'Add Product',
        icon: <IoMdAdd />,
        role: 'seller',
        path: '/seller/dashboard/add-product',
        permission: 'product.add',
        description: 'Create new product listing'
      },
      {
        id: 12,
        title: 'All Products',
        icon: <MdViewList />,
        role: 'seller',
        path: '/seller/dashboard/products',
        permission: 'product.all',
        badge: 24
      },
      {
        id: 13,
        title: 'Inventory',
        icon: <BsCartCheck />,
        role: 'seller',
        path: '/seller/dashboard/inventory',
        permission: 'product.inventory',
        description: 'Manage stock levels'
      },
      {
        id: 14,
        title: 'Product Reviews',
        icon: <AiOutlineStar />,
        role: 'seller',
        path: '/seller/dashboard/reviews',
        permission: 'product.reviews',
        badge: 7
      }
    ]
  },
  {
    id: 15,
    title: 'Orders',
    icon: <AiOutlineShoppingCart />,
    role: 'seller',
    permission: 'orders.access',
    path: '/seller/dashboard/orders',
    badge: 3
  },
  {
    id: 126,
    title: 'Analytics',
    icon: <BsCardChecklist />,
    role: 'seller',
    children: [
      {
        id: 299,
        title: 'Users',
        icon: <IoPersonCircle />,
        path: '/seller/Analytics/Analyticsuserlist',
        permission: 'analytics.users',
        description: 'analytics of users'
      },
    ]
  },
  {
    id: 16,
    title: 'Awareness & Marketing',
    icon: <FaBullhorn />,
    role: 'seller',
    children: [
      {
        id: 17,
        title: 'Banners',
        icon: <BiImageAdd />,
        path: '/seller/awareness/banners',
        permission: 'awareness.banners',
        description: 'Promotional banners'
      },
      {
        id: 18,
        title: 'Loyalty Points',
        icon: <BsStars />,
        path: '/seller/awareness/points',
        permission: 'awareness.points',
        description: 'Customer rewards system'
      },
      {
        id: 19,
        title: 'Gallery Images',
        icon: <IoMdImages />,
        path: '/seller/awareness/images',
        permission: 'awareness.gallery',
        description: 'Product gallery management'
      },
      {
        id: 20,
        title: 'Success Stories',
        icon: <IoMdCheckmarkCircle />,
        path: '/seller/awareness/successstories',
        permission: 'awareness.stories',
        description: 'Customer testimonials'
      },
      {
        id: 21,
        title: 'Guide & Tutorials',
        icon: <MdOutlineMenuBook />,
        path: '/seller/awareness/guide',
        permission: 'awareness.guide',
        description: 'Product usage guides'
      },
      {
        id: 22,
        title: 'Video Content',
        icon: <AiOutlineVideoCamera />,
        path: '/seller/awareness/video',
        permission: 'awareness.video',
        description: 'Marketing videos'
      },
      {
        id: 25,
        title: 'Campaign',
        icon: <FaBullhorn />,
        path: '/seller/awareness/Campaign',
        permission: 'awareness.campaign',
        description: 'email subscription'
      },
      {
        id: 23,
        title: 'Social Accounts',
        icon: <AiOutlineAccountBook />,
        path: '/seller/awareness/Accounts',
        permission: 'awareness.social',
        description: 'Social media integration'
      },
      {
        id: 24,
        title: 'Subscriber',
        icon: <AiOutlineAccountBook />,
        path: '/seller/awareness/subscriber',
        permission: 'awareness.subscriber',
        description: 'subscriber'
      },
    ]
  },
  {
    id: 54,
    title: 'Hire',
    icon: <FaBullhorn />,
    role: 'seller',
    children: [
      {
        id: 177,
        title: 'Resume',
        icon: <BiImageAdd />,
        path: '/hire/resume',
        permission: 'hire.resume',
        description: 'Promotional hire'
      },
      {
        id: 178,
        title: 'Users List',
        icon: <FaUsers />,
        path: '/seller/hire/users',
        permission: 'hire.users',
        description: 'List of all hire users'
      },
      {
        id: 179,
        title: 'Job Management',
        icon: <FaFileContract />,
        path: '/seller/hire/jobs',
        permission: 'hire.jobs',
        description: 'Manage Jobs'
      },
      {
        id: 180,
        title: 'Resume Mgmt',
        icon: <BiImageAdd />,
        path: '/seller/hire/resumes-manage',
        permission: 'hire.resumes',
        description: 'Manage Resumes'
      },
      {
        id: 181,
        title: 'Applications',
        icon: <FaFileContract />,
        path: '/seller/hire/applied-jobs',
        permission: 'hire.applied',
        description: 'View applied jobs'
      },
      {
        id: 182,
        title: 'Tickets Support',
        icon: <RiCustomerService2Line />,
        path: '/seller/hire/tickets-support',
        permission: 'hire.tickets',
        description: 'Manage hire support tickets'
      },
      {
        id: 183,
        title: 'Credit Settings',
        icon: <BiMoney />,
        path: '/seller/hire/credit-settings',
        permission: 'hire.credits',
        description: 'Manage credit costs'
      },
      {
        id: 184,
        title: 'Static Content',
        icon: <MdOutlineMenuBook />,
        path: '/seller/hire/static-content',
        permission: 'hire.staticContent',
        description: 'Manage Static Content'
      }
    ]
  },
  {
    id: 24,
    title: 'Payments',
    icon: <BiMoney />,
    role: 'seller',
    children: [
      {
        id: 25,
        title: 'Payment History',
        icon: <MdPayment />,
        path: '/seller/dashboard/payments/history',
        permission: 'payments.history'
      },
      {
        id: 26,
        title: 'Withdraw Funds',
        icon: <RiRefundLine />,
        path: '/seller/dashboard/payments/withdraw',
        permission: 'payments.withdraw'
      },
      {
        id: 27,
        title: 'Payment Methods',
        icon: <BsCardChecklist />,
        path: '/seller/dashboard/payments/methods',
        permission: 'payments.methods'
      }
    ]
  },
  {
    id: 28,
    title: 'Communication',
    icon: <AiOutlineMessage />,
    role: 'seller',
    children: [
      {
        id: 29,
        title: 'Customer Chat',
        icon: <IoChatbubbles />,
        path: '/seller/dashboard/chat-customer',
        permission: 'chat.customer',
        badge: 12
      },
      {
        id: 30,
        title: 'Support Chat',
        icon: <RiCustomerService2Line />,
        path: '/seller/dashboard/chat-support',
        permission: 'chat.support',
        description: 'Contact platform support'
      },
      {
        id: 31,
        title: 'Broadcast Messages',
        icon: <MdOutlineRequestQuote />,
        path: '/seller/dashboard/broadcast',
        permission: 'chat.broadcast'
      }
    ]
  },
  {
    id: 32,
    title: 'Store Profile',
    icon: <AiOutlineShop />,
    role: 'seller',
    path: '/seller/dashboard/store-profile',
    permission: 'store.profile'
  },
  {
    id: 33,
    title: 'Account Settings',
    icon: <CgProfile />,
    role: 'seller',
    children: [
      {
        id: 34,
        title: 'Personal Info',
        icon: <AiOutlineUser />,
        path: '/seller/dashboard/profile/personal',
        permission: 'setting.personal'
      },
      {
        id: 35,
        title: 'Store Settings',
        icon: <AiOutlineShop />,
        path: '/seller/dashboard/profile/store',
        permission: 'setting.store'
      },
      {
        id: 36,
        title: 'Security',
        icon: <MdOutlineLiveHelp />,
        path: '/seller/dashboard/profile/security',
        permission: 'setting.security'
      },
      {
        id: 37,
        title: 'Notifications',
        icon: <IoIosChatbubbles />,
        path: '/seller/dashboard/profile/notifications',
        permission: 'setting.notifications'
      }
    ]
  }
];