import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { create_job, messageClear } from '../../store/Reducers/Hire/jobReducer';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const CreateJob = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loader, successMessage, errorMessage } = useSelector(state => state.job);

    const [state, setState] = useState({
        title: '',
        companyName: '', // map to company.name
        locationCity: '', // map to location.city
        jobType: 'full-time',
        description: '',
        minExp: 0,
        maxExp: 0,
        minSalary: 0,
        maxSalary: 0,
        currency: 'INR',
        creditsRequired: 1,
        deadLine: '',
        status: 'active',
        skills: '',
        companyAbout: '',
        companyIndustry: '',
        companySize: '',
        companyWebsite: ''
    });
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    const imageHandle = (e) => {
        if (e.target.files.length > 0) {
            setLogo(e.target.files[0]);
            setLogoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const submitHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', state.title);
        formData.append('jobType', state.jobType);
        formData.append('description', state.description);
        formData.append('status', state.status);

        // Complex objects as JSON strings
        formData.append('company', JSON.stringify({
            name: state.companyName,
            about: state.companyAbout,
            industry: state.companyIndustry,
            size: state.companySize,
            website: state.companyWebsite
        }));
        formData.append('location', JSON.stringify({ city: state.locationCity }));
        formData.append('requirements', JSON.stringify({
            experience: { min: parseInt(state.minExp), max: parseInt(state.maxExp) },
            mustHave: state.skills.split(',').map(s => s.trim()).filter(s => s)
        }));
        formData.append('salary', JSON.stringify({
            min: parseInt(state.minSalary),
            max: parseInt(state.maxSalary),
            currency: state.currency
        }));
        formData.append('application', JSON.stringify({
            creditsRequired: parseInt(state.creditsRequired),
            deadline: state.deadLine
        }));

        if (logo) {
            formData.append('logo', logo);
        }

        dispatch(create_job(formData));
    };

    const { pathname } = useLocation();

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            const basePath = pathname.includes('seller') ? '/seller/hire/jobs' : '/admin/dashboard/jobs';
            navigate(basePath);
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate, pathname]);


    return (
        <div className="px-2 lg:px-7 pt-5">
            <h1 className="text-[20px] font-bold mb-6 text-slate-700">Create New Job</h1>

            <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200">
                <form onSubmit={submitHandler}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Job Title</label>
                            <input required onChange={inputHandle} value={state.title} name="title" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" placeholder="e.g. Frontend Developer" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Company Name</label>
                            <input required onChange={inputHandle} value={state.companyName} name="companyName" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" placeholder="e.g. TechCorp Solutions" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Company Logo (Optional)</label>
                            <div className="flex items-center gap-3">
                                <div className="w-[45px] h-[45px] border border-slate-300 rounded-full overflow-hidden">
                                    {logoPreview ? <img className="w-full h-full object-cover" src={logoPreview} alt="logo" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">Logo</div>}
                                </div>
                                <label htmlFor="logo" className="px-3 py-2 border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50 text-sm">Upload Logo</label>
                                <input onChange={imageHandle} type="file" id="logo" className="hidden" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Location (City)</label>
                            <input required onChange={inputHandle} value={state.locationCity} name="locationCity" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" placeholder="e.g. Bengaluru" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Job Type</label>
                            <select onChange={inputHandle} value={state.jobType} name="jobType" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none text-slate-600">
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="freelance">Freelance</option>
                            </select>
                        </div>
                    </div>

                    {/* Company Information */}
                    <h3 className="text-xl font-bold mb-4 text-slate-700 pt-4 border-t border-slate-100">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Industry</label>
                            <input onChange={inputHandle} value={state.companyIndustry} name="companyIndustry" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" placeholder="e.g. Technology" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Company Size</label>
                            <input onChange={inputHandle} value={state.companySize} name="companySize" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" placeholder="e.g. 50-100 employees" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Website URL</label>
                            <input onChange={inputHandle} value={state.companyWebsite} name="companyWebsite" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" placeholder="https://example.com" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-600 font-medium mb-2">About Company</label>
                        <textarea onChange={inputHandle} value={state.companyAbout} name="companyAbout" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none h-24" placeholder="Briefly describe the company..."></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Min Exp (Yrs)</label>
                            <input type="number" onChange={inputHandle} value={state.minExp} name="minExp" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Max Exp (Yrs)</label>
                            <input type="number" onChange={inputHandle} value={state.maxExp} name="maxExp" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Min Salary</label>
                            <input type="number" onChange={inputHandle} value={state.minSalary} name="minSalary" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Max Salary</label>
                            <input type="number" onChange={inputHandle} value={state.maxSalary} name="maxSalary" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-slate-600 font-medium mb-2">Skills (Comma Separated)</label>
                        <input onChange={inputHandle} value={state.skills} name="skills" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" placeholder="React, Node.js, MongoDB" />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-slate-600 font-medium mb-2">Job Description</label>
                        <textarea required onChange={inputHandle} value={state.description} name="description" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none h-40" placeholder="Describe the role..."></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Credits Required</label>
                            <input type="number" onChange={inputHandle} value={state.creditsRequired} name="creditsRequired" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Deadline</label>
                            <input type="date" onChange={inputHandle} value={state.deadLine} name="deadLine" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Initial Status</label>
                            <select onChange={inputHandle} value={state.status} name="status" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none text-slate-600">
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Link to="/admin/dashboard/jobs" className="px-6 py-2 border border-slate-300 rounded-md text-slate-600 font-medium hover:bg-slate-50">Cancel</Link>
                        <button disabled={loader} className="px-6 py-2 bg-[#6a5fdf] text-white rounded-md font-medium hover:bg-[#5a51c7] flex items-center gap-2">
                            {loader ? <PropagateLoader color='#fff' size={10} /> : 'Publish Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;
