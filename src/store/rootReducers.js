import authReducer from "./Reducers/authReducer";
import categoryReducer from "./Reducers/categoryReducer";
import chatReducer from "./Reducers/chatReducer";
import productReducer from "./Reducers/productReducer";
import sellerReducer from "./Reducers/sellerReducer";
import OrderReducer from "./Reducers/OrderReducer";
import PaymentReducer from "./Reducers/PaymentReducer";
import dashboardReducer from "./Reducers/dashboardReducer";
import bannerReducer from "./Reducers/bannerReducer";
import awarenessBannerReducer from "./Reducers/Awareness/bannerReducer";
import awarenessPointsReducer from "./Reducers/Awareness/pointsReducer"
import awarenessSuccessStoryReducer from "./Reducers/Awareness/successStoryReducer"
import awarenessguideReducer from "./Reducers/Awareness/guideReducer"
import awarenessVideoReducer from "./Reducers/Awareness/videoReducer"
import awarenessAccountReducer from "./Reducers/Awareness/accountReducer"
import awarenessImageReducer from "./Reducers/Awareness/ImageReducer"
import analyticsReducer from "./Reducers/Awareness/analyticsReducer";
import awarenessSubscriberReducer from "./Reducers/Awareness/SubscriberReducer"
import awarenessCampaignReducer from "./Reducers/Awareness/campaignReducer"
import hireResumeEditorReducer from "./Reducers/Hire/resumeReducer"
import jobReducer from "./Reducers/Hire/jobReducer";
import adminResumeReducer from "./Reducers/Hire/adminResumeReducer";

const rootReducer = {
    auth: authReducer,
    category: categoryReducer,
    product: productReducer,
    seller: sellerReducer,
    chat: chatReducer,
    order: OrderReducer,
    payment: PaymentReducer,
    dashboard: dashboardReducer,
    banner: bannerReducer,
    awarenessBanner: awarenessBannerReducer,
    awarenessPoints: awarenessPointsReducer,
    awarenessImage: awarenessImageReducer,
    successStory: awarenessSuccessStoryReducer,
    guide: awarenessguideReducer,
    video: awarenessVideoReducer,
    accounts: awarenessAccountReducer,
    subscriber: awarenessSubscriberReducer,
    campaign: awarenessCampaignReducer,
    analytics: analyticsReducer,
    editors: hireResumeEditorReducer,
    job: jobReducer,
    adminResume: adminResumeReducer
}
export default rootReducer;