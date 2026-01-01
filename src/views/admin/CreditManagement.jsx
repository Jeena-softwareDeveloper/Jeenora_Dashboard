import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { FaCoins, FaSave, FaExclamationCircle, FaInfoCircle, FaHandHoldingUsd, FaComments, FaRegClock, FaRocket } from 'react-icons/fa';
import { MdSettingsSuggest, MdOutlineAttachMoney, MdOutlineTimer, MdSystemUpdateAlt } from 'react-icons/md';

const CreditManagement = () => {
    const [settings, setSettings] = useState({
        jobApplyCost: 5,
        jobApplyEnabled: true,
        jobApplyType: 'Standard',
        messageSendCost: 1,
        messageSendEnabled: true,
        messageSendType: 'Basic',
        resumeEditCost: 50,
        resumeEditEnabled: true,
        resumeEditType: 'Premium',
        supportInquiryCost: 0,
        supportInquiryEnabled: true,
        supportInquiryType: 'Standard',
        chatEnableCost: 10,
        chatEnableEnabled: true,
        chatEnableType: 'Premium',
        minPurchaseCredits: 30,
        perCreditCostINR: 1.00,
        initialFreeCredits: 0,
        creditsComingSoon: false,
    });

    const [planSettings, setPlanSettings] = useState({
        plans: {
            Free: { price: 0, days: 7, active: true },
            Basic: { price: 199, days: 30, active: true },
            Pro: { price: 499, days: 90, active: true },
            Elite: { price: 999, days: 180, active: true }
        },
        plansComingSoon: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('credits');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [creditRes, planRes] = await Promise.all([
                api.get('/hire/setting/credits'),
                api.get('/hire/payment/admin/plan-settings')
            ]);
            setSettings(prev => ({ ...prev, ...creditRes.data }));
            setPlanSettings(planRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await Promise.all([
                api.put('/hire/setting/credits', settings),
                api.put('/hire/payment/admin/plan-settings', planSettings)
            ]);
            toast.success('All configurations updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const SettingRow = ({ label, costKey, enabledKey, typeKey, icon: Icon, note }) => (
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <Icon className="text-indigo-600" size={18} />
                    </div>
                    <label className='block text-[11px] font-black text-slate-600 uppercase tracking-widest'>
                        {label}
                    </label>
                </div>
                <button
                    type="button"
                    onClick={() => setSettings({ ...settings, [enabledKey]: !settings[enabledKey] })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings[enabledKey] ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[enabledKey] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className='relative'>
                    <input
                        type="number"
                        min="0"
                        className='w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500/50 text-sm font-black text-slate-800 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400'
                        value={settings[costKey]}
                        disabled={!settings[enabledKey]}
                        onChange={(e) => setSettings({ ...settings, [costKey]: parseInt(e.target.value) || 0 })}
                    />
                    <MdOutlineAttachMoney className='absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400' size={16} />
                </div>

                <select
                    className='w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500/50 text-[11px] font-black text-slate-800 transition-all outline-none uppercase tracking-wider'
                    value={settings[typeKey]}
                    disabled={!settings[enabledKey]}
                    onChange={(e) => setSettings({ ...settings, [typeKey]: e.target.value })}
                >
                    <option value="Basic">Basic Tier</option>
                    <option value="Standard">Standard Tier</option>
                    <option value="Premium">Premium Tier</option>
                    <option value="Enterprise">Enterprise Tier</option>
                </select>
            </div>
            {note && <p className='text-[9px] text-slate-400 font-bold uppercase tracking-tight'>{note}</p>}
        </div>
    );

    if (loading) return <div className='p-8 text-center font-black animate-pulse text-indigo-600 uppercase tracking-[0.3em]'>Synchronizing Gateway...</div>;

    return (
        <div className='px-2 lg:px-7 pt-5 font-["Outfit"]'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h2 className='text-3xl font-black text-slate-800 tracking-tighter uppercase'>Control <span className='text-indigo-600 font-black'>Matrix</span></h2>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1'>Unified Revenue & Economy Management</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('credits')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'credits' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Credits
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'plans' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Subscriptions
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
                <div className='xl:col-span-2'>
                    <form onSubmit={handleUpdate} className='space-y-8'>

                        {activeTab === 'credits' ? (
                            <div className='bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100'>
                                <div className='flex justify-between items-center mb-8'>
                                    <h3 className='text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2'>
                                        <FaCoins className='text-amber-500' />
                                        Credit Economics
                                    </h3>
                                    <div className="flex items-center gap-3 px-4 py-2 bg-rose-50 rounded-xl border border-rose-100">
                                        <span className='text-[10px] font-black text-rose-600 uppercase tracking-widest'>Coming Soon Mode</span>
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, creditsComingSoon: !settings.creditsComingSoon })}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${settings.creditsComingSoon ? 'bg-rose-600' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.creditsComingSoon ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <SettingRow
                                        label="Job Application"
                                        costKey="jobApplyCost"
                                        enabledKey="jobApplyEnabled"
                                        typeKey="jobApplyType"
                                        icon={FaCoins}
                                        note="* Deducted when a user applies for a job."
                                    />

                                    <SettingRow
                                        label="Direct Messaging"
                                        costKey="messageSendCost"
                                        enabledKey="messageSendEnabled"
                                        typeKey="messageSendType"
                                        icon={FaHandHoldingUsd}
                                        note="* Credits deducted for each message sent in Live Tracking hub."
                                    />

                                    <SettingRow
                                        label="Resume Service"
                                        costKey="resumeEditCost"
                                        enabledKey="resumeEditEnabled"
                                        typeKey="resumeEditType"
                                        icon={MdSettingsSuggest}
                                        note="* Credits deducted for professional resume edit requests."
                                    />

                                    <SettingRow
                                        label="Chat Activation"
                                        costKey="chatEnableCost"
                                        enabledKey="chatEnableEnabled"
                                        typeKey="chatEnableType"
                                        icon={FaComments}
                                        note="* One-time cost to unlock direct chat support."
                                    />
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className='block text-[11px] font-black text-slate-600 uppercase tracking-widest'>Cost Per Credit (₹)</label>
                                        <div className='relative'>
                                            <input
                                                type="number" step="0.01" className='w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 font-black'
                                                value={settings.perCreditCostINR}
                                                onChange={(e) => setSettings({ ...settings, perCreditCostINR: parseFloat(e.target.value) || 0 })}
                                            />
                                            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 font-bold'>₹</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className='block text-[11px] font-black text-slate-600 uppercase tracking-widest'>Min Purchase (Credits)</label>
                                        <div className='relative'>
                                            <input
                                                type="number" className='w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 font-black'
                                                value={settings.minPurchaseCredits}
                                                onChange={(e) => setSettings({ ...settings, minPurchaseCredits: parseInt(e.target.value) || 1 })}
                                            />
                                            <FaCoins className='absolute left-3 top-1/2 -translate-y-1/2 text-amber-500' size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest">Sign-up Bonus (Free Credits)</label>
                                        <div className="relative">
                                            <input
                                                type="number" className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 font-black"
                                                value={settings.initialFreeCredits}
                                                onChange={(e) => setSettings({ ...settings, initialFreeCredits: parseInt(e.target.value) || 0 })}
                                            />
                                            <FaCoins className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100'>
                                <div className='flex justify-between items-center mb-8'>
                                    <h3 className='text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2'>
                                        <FaRocket className='text-indigo-600' />
                                        Subscription Plans
                                    </h3>
                                    <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <span className='text-[10px] font-black text-indigo-600 uppercase tracking-widest'>Coming Soon Mode</span>
                                        <button
                                            type="button"
                                            onClick={() => setPlanSettings({ ...planSettings, plansComingSoon: !planSettings.plansComingSoon })}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${planSettings.plansComingSoon ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${planSettings.plansComingSoon ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                    {Object.entries(planSettings.plans).map(([key, plan]) => (
                                        <div key={key} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{key} Plan</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPlans = { ...planSettings.plans };
                                                        newPlans[key].active = !newPlans[key].active;
                                                        setPlanSettings({ ...planSettings, plans: newPlans });
                                                    }}
                                                    className={`h-5 w-9 rounded-full relative transition-colors ${plan.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                >
                                                    <span className={`h-3 w-3 bg-white rounded-full absolute top-1 transition-all ${plan.active ? 'left-5' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase">Price (₹)</label>
                                                    <input
                                                        type="number" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-black"
                                                        value={plan.price}
                                                        onChange={(e) => {
                                                            const newPlans = { ...planSettings.plans };
                                                            newPlans[key].price = parseInt(e.target.value) || 0;
                                                            setPlanSettings({ ...planSettings, plans: newPlans });
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase">Validity (Days)</label>
                                                    <input
                                                        type="number" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-black"
                                                        value={plan.days}
                                                        onChange={(e) => {
                                                            const newPlans = { ...planSettings.plans };
                                                            newPlans[key].days = parseInt(e.target.value) || 0;
                                                            setPlanSettings({ ...planSettings, plans: newPlans });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase">Plan Features (One per line)</label>
                                                <textarea
                                                    rows="3"
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold leading-relaxed resize-none"
                                                    value={plan.features?.join('\n')}
                                                    onChange={(e) => {
                                                        const newPlans = { ...planSettings.plans };
                                                        newPlans[key].features = e.target.value.split('\n');
                                                        setPlanSettings({ ...planSettings, plans: newPlans });
                                                    }}
                                                    placeholder="Enter features..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className='w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]'
                        >
                            {saving ? 'Synchronizing Protocols...' : (
                                <>
                                    <MdSystemUpdateAlt size={18} />
                                    Commit All Modifications
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className='space-y-6'>
                    <div className='bg-indigo-600 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-indigo-200'>
                        <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl'></div>
                        <h4 className='text-lg font-black uppercase tracking-tighter mb-4 relative z-10'>Gateway: <span className='text-cyan-300'>PhonePe</span></h4>
                        <div className='space-y-4 relative z-10'>
                            <div className='flex items-start gap-4 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md'>
                                <FaRocket className='text-cyan-300 mt-1 shrink-0' />
                                <p className='text-[11px] leading-relaxed opacity-90 font-bold uppercase tracking-tight'>
                                    UPI Infrastructure Active. All payments are now routed through PhonePe's secure V1 API.
                                </p>
                            </div>
                            <div className='flex items-start gap-4 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md'>
                                <MdOutlineTimer className='text-amber-300 mt-1 shrink-0' />
                                <p className='text-[11px] leading-relaxed opacity-90 font-bold uppercase tracking-tight'>
                                    Coming Soon modes will hide the purchase options from the frontend while you perform maintenance.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-slate-900 p-8 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl'>
                        <div className='w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10'>
                            <MdSettingsSuggest className='text-indigo-400' size={24} />
                        </div>
                        <h5 className='text-xs font-black text-white uppercase tracking-widest mb-2'>Revenue Core</h5>
                        <p className='text-[10px] text-slate-400 max-w-[200px] leading-relaxed font-bold uppercase tracking-tight opacity-60'>
                            The economic matrix dictates global interaction costs. Modifications are instantaneous.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditManagement;
