import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_job, update_job, messageClear } from '../../store/Reducers/Hire/jobReducer';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const EditJob = () => {
    const { jobId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { job, loader, successMessage, errorMessage } = useSelector(state => state.job);

    const [state, setState] = useState({
        title: '',
        companyName: '',
        locationCity: '',
        jobType: '',
        description: '',
        minExp: 0,
        maxExp: 0,
        minSalary: 0,
        maxSalary: 0,
        currency: 'INR',
        creditsRequired: 1,
        deadLine: '',
        status: '',
        skills: '',
        companyAbout: '',
        companyIndustry: '',
        companySize: '',
        companyWebsite: ''
    });

    useEffect(() => {
        dispatch(get_job(jobId));
    }, [jobId, dispatch]);

    useEffect(() => {
        if (job) {
            setState({
                title: job.title || '',
                companyName: job.company?.name || '',
                locationCity: job.location?.city || '',
                jobType: job.jobType || 'full-time',
                description: job.description || '',
                minExp: job.requirements?.experience?.min || 0,
                maxExp: job.requirements?.experience?.max || 0,
                minSalary: job.salary?.min || 0,
                maxSalary: job.salary?.max || 0,
                currency: job.salary?.currency || 'INR',
                creditsRequired: job.application?.creditsRequired || 1,
                deadLine: job.application?.deadline ? new Date(job.application.deadline).toISOString().split('T')[0] : '',
                status: job.status || 'active',
                skills: job.requirements?.mustHave?.join(', ') || '',
                companyAbout: job.company?.about || '',
                companyIndustry: job.company?.industry || '',
                companySize: job.company?.size || '',
                companyWebsite: job.company?.website || ''
            });
        }
    }, [job]);

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const submitHandler = (e) => {
        e.preventDefault();

        const jobData = {
            title: state.title,
            company: {
                name: state.companyName,
                about: state.companyAbout,
                industry: state.companyIndustry,
                size: state.companySize,
                website: state.companyWebsite
            },
            location: {
                city: state.locationCity
            },
            jobType: state.jobType,
            description: state.description,
            requirements: {
                experience: {
                    min: parseInt(state.minExp),
                    max: parseInt(state.maxExp)
                },
                mustHave: state.skills.split(',').map(s => s.trim()).filter(s => s)
            },
            salary: {
                min: parseInt(state.minSalary),
                max: parseInt(state.maxSalary),
                currency: state.currency
            },
            application: {
                creditsRequired: parseInt(state.creditsRequired),
                deadline: state.deadLine
            },
            status: state.status
        };

        dispatch(update_job({ id: jobId, jobData }));
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

    if (!job && loader) return <div className="flex justify-center py-10"><PropagateLoader color='#6a5fdf' /></div>;

    return (
        <div className="px-2 lg:px-7 pt-5">
            <h1 className="text-[20px] font-bold mb-6 text-slate-700">Edit Job: {state.title}</h1>

            <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200">
                <form onSubmit={submitHandler}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Job Title</label>
                            <input required onChange={inputHandle} value={state.title} name="title" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Company Name</label>
                            <input required onChange={inputHandle} value={state.companyName} name="companyName" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-medium mb-2">Location (City)</label>
                            <input required onChange={inputHandle} value={state.locationCity} name="locationCity" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
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
                        <input onChange={inputHandle} value={state.skills} name="skills" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none" />
                    </div>

                    <div className="mb-6">
                        <label className="block text-slate-600 font-medium mb-2">Job Description</label>
                        <textarea required onChange={inputHandle} value={state.description} name="description" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none h-40"></textarea>
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
                            <label className="block text-slate-600 font-medium mb-2">Status</label>
                            <select onChange={inputHandle} value={state.status} name="status" className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-[#6a5fdf] outline-none text-slate-600">
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="paused">Paused</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Link to="/admin/dashboard/jobs" className="px-6 py-2 border border-slate-300 rounded-md text-slate-600 font-medium hover:bg-slate-50">Cancel</Link>
                        <button disabled={loader} className="px-6 py-2 bg-[#6a5fdf] text-white rounded-md font-medium hover:bg-[#5a51c7] flex items-center gap-2">
                            {loader ? <PropagateLoader color='#fff' size={10} /> : 'Update Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJob;
