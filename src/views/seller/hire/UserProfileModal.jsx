import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { PropagateLoader } from 'react-spinners';
import api from '../../../api/api';
import toast from 'react-hot-toast';

const UserProfileModal = ({ userId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [profile, setProfile] = useState({
        personalDetails: {},
        professionalSummary: {},
        skills: { technical: [], softSkills: [] },
        education: [],
        workExperience: [],
        careerPreferences: {}
    });
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/hire/profile/admin/${userId}`);
                if (data.profile) {
                    setProfile(data.profile);
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchProfile();
    }, [userId]);

    const handleChange = (section, field, value) => {
        setProfile(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNestedChange = (e, section) => {
        const { name, value } = e.target;
        handleChange(section, name, value);
    };

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            const { data } = await api.put(`/hire/profile/admin/${userId}`, profile);
            toast.success("Profile updated successfully");
            setProfile(data.profile);
        } catch (error) {
            console.log(error);
            toast.error("Failed to update profile");
        } finally {
            setSaveLoading(false);
        }
    };

    // --- Skills Handlers ---
    const [newSkill, setNewSkill] = useState("");
    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        setProfile(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                technical: [...(prev.skills?.technical || []), { name: newSkill, level: 'Intermediate', years: 1 }]
            }
        }));
        setNewSkill("");
    };
    const handleRemoveSkill = (index) => {
        setProfile(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                technical: prev.skills.technical.filter((_, i) => i !== index)
            }
        }));
    };

    // --- Education Handlers ---
    const [newEducation, setNewEducation] = useState({ degree: '', institute: '', startYear: '', endYear: '' });
    const handleAddEducation = () => {
        if (!newEducation.degree || !newEducation.institute) return toast.error("Degree and Institute are required");
        setProfile(prev => ({
            ...prev,
            education: [...(prev.education || []), newEducation]
        }));
        setNewEducation({ degree: '', institute: '', startYear: '', endYear: '' });
    };
    const handleRemoveEducation = (index) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    // --- Experience Handlers ---
    const [newExperience, setNewExperience] = useState({ jobTitle: '', company: '', startDate: '', endDate: '', description: '' });
    const handleAddExperience = () => {
        if (!newExperience.jobTitle || !newExperience.company) return toast.error("Job Title and Company are required");
        setProfile(prev => ({
            ...prev,
            workExperience: [...(prev.workExperience || []), { ...newExperience, current: !newExperience.endDate }]
        }));
        setNewExperience({ jobTitle: '', company: '', startDate: '', endDate: '', description: '' });
    };
    const handleRemoveExperience = (index) => {
        setProfile(prev => ({
            ...prev,
            workExperience: prev.workExperience.filter((_, i) => i !== index)
        }));
    };

    // Helper for rendering tabs
    const TabButton = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
            {label}
        </button>
    );

    if (loading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <PropagateLoader color='#fff' />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-[#283046] rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#323c52]">
                    <h2 className="text-xl font-semibold text-[#d0d2d6]">User Profile Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><FaTimes size={24} /></button>
                </div>

                {/* Tabs */}
                <div className="flex px-4 bg-[#283046] border-b border-slate-700 overflow-x-auto">
                    <TabButton id="personal" label="Personal Details" />
                    <TabButton id="summary" label="Professional Summary" />
                    <TabButton id="education" label="Education" />
                    <TabButton id="experience" label="Experience" />
                    <TabButton id="skills" label="Skills" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                    {/* Personal Details */}
                    {activeTab === 'personal' && (
                        <div className="space-y-4">
                            <h3 className="text-lg text-white font-medium mb-4">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-slate-400 text-sm">Full Name</label>
                                    <input className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                        name="fullName" value={profile.personalDetails?.fullName || ''} onChange={(e) => handleNestedChange(e, 'personalDetails')} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-slate-400 text-sm">Date of Birth</label>
                                    <input type="date" className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                        name="dateOfBirth" value={profile.personalDetails?.dateOfBirth ? new Date(profile.personalDetails.dateOfBirth).toISOString().split('T')[0] : ''} onChange={(e) => handleNestedChange(e, 'personalDetails')} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-slate-400 text-sm">Gender</label>
                                    <select className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                        name="gender" value={profile.personalDetails?.gender || ''} onChange={(e) => handleNestedChange(e, 'personalDetails')}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-slate-400 text-sm">Phone</label>
                                    <input className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                        name="phone" value={profile.personalDetails?.phone || ''} onChange={(e) => handleNestedChange(e, 'personalDetails')} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Professional Summary */}
                    {activeTab === 'summary' && (
                        <div className="space-y-4">
                            <h3 className="text-lg text-white font-medium mb-4">Professional Overview</h3>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-400 text-sm">Professional Headline</label>
                                <input className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                    name="professionalHeadline" value={profile.professionalSummary?.professionalHeadline || ''} onChange={(e) => handleNestedChange(e, 'professionalSummary')} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-400 text-sm">Summary</label>
                                <textarea rows="5" className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                    name="summary" value={profile.professionalSummary?.summary || ''} onChange={(e) => handleNestedChange(e, 'professionalSummary')} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-slate-400 text-sm">Current Role</label>
                                    <input className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                        name="currentRole" value={profile.professionalSummary?.currentRole || ''} onChange={(e) => handleNestedChange(e, 'professionalSummary')} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-slate-400 text-sm">Total Experience (Years)</label>
                                    <input type="number" className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                        name="totalExperience" value={profile.professionalSummary?.totalExperience || ''} onChange={(e) => handleNestedChange(e, 'professionalSummary')} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-400 text-sm">Current Company</label>
                                <input className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                    name="currentCompany" value={profile.professionalSummary?.currentCompany || ''} onChange={(e) => handleNestedChange(e, 'professionalSummary')} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-400 text-sm">Industry</label>
                                <input className="px-3 py-2 bg-[#323c52] border border-slate-700 rounded text-slate-200 focus:border-blue-500 outline-none"
                                    name="industry" value={profile.professionalSummary?.industry || ''} onChange={(e) => handleNestedChange(e, 'professionalSummary')} />

                            </div>
                        </div>
                    )}

                    {/* Education - Simplified Read-only for now or simple JSON edit */}
                    {/* Education */}
                    {activeTab === 'education' && (
                        <div className="space-y-6">
                            <div className="bg-[#323c52] p-4 rounded border border-slate-700">
                                <h4 className="text-white font-medium mb-3">Add Education</h4>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input placeholder="Degree" className="px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm"
                                        value={newEducation.degree} onChange={e => setNewEducation({ ...newEducation, degree: e.target.value })} />
                                    <input placeholder="Institute" className="px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm"
                                        value={newEducation.institute} onChange={e => setNewEducation({ ...newEducation, institute: e.target.value })} />
                                    <input type="number" placeholder="Start Year" className="px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm"
                                        value={newEducation.startYear} onChange={e => setNewEducation({ ...newEducation, startYear: e.target.value })} />
                                    <input type="number" placeholder="End Year" className="px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm"
                                        value={newEducation.endYear} onChange={e => setNewEducation({ ...newEducation, endYear: e.target.value })} />
                                </div>
                                <button onClick={handleAddEducation} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Add Education</button>
                            </div>

                            <div className="space-y-3">
                                {profile.education && profile.education.map((edu, idx) => (
                                    <div key={idx} className="p-4 bg-[#323c52] rounded border border-slate-700 relative group">
                                        <button onClick={() => handleRemoveEducation(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FaTimes />
                                        </button>
                                        <h4 className="font-semibold text-blue-400">{edu.degree}</h4>
                                        <p className="text-slate-300 text-sm">{edu.institute}</p>
                                        <p className="text-slate-400 text-xs">{edu.startYear} - {edu.endYear}</p>
                                    </div>
                                ))}
                                {(!profile.education || profile.education.length === 0) && <p className="text-slate-500 italic">No education details added.</p>}
                            </div>
                        </div>
                    )}

                    {/* Experience - Simplified Read-only for now */}
                    {/* Experience */}
                    {activeTab === 'experience' && (
                        <div className="space-y-6">
                            <div className="bg-[#323c52] p-4 rounded border border-slate-700">
                                <h4 className="text-white font-medium mb-3">Add Experience</h4>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input placeholder="Job Title" className="px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm"
                                        value={newExperience.jobTitle} onChange={e => setNewExperience({ ...newExperience, jobTitle: e.target.value })} />
                                    <input placeholder="Company" className="px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm"
                                        value={newExperience.company} onChange={e => setNewExperience({ ...newExperience, company: e.target.value })} />
                                    <div className="flex flex-col">
                                        <label className="text-xs text-slate-400 mb-1">Start Date</label>
                                        <input type="date" className="px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm"
                                            value={newExperience.startDate} onChange={e => setNewExperience({ ...newExperience, startDate: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-slate-400 mb-1">End Date (Leave empty if current)</label>
                                        <input type="date" className="px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm"
                                            value={newExperience.endDate} onChange={e => setNewExperience({ ...newExperience, endDate: e.target.value })} />
                                    </div>
                                    <textarea placeholder="Description" className="col-span-2 px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm" rows="2"
                                        value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })} />
                                </div>
                                <button onClick={handleAddExperience} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Add Experience</button>
                            </div>

                            <div className="space-y-3">
                                {profile.workExperience && profile.workExperience.map((exp, idx) => (
                                    <div key={idx} className="p-4 bg-[#323c52] rounded border border-slate-700 relative group">
                                        <button onClick={() => handleRemoveExperience(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FaTimes />
                                        </button>
                                        <h4 className="font-semibold text-blue-400">{exp.jobTitle} at {exp.company}</h4>
                                        <p className="text-slate-300 text-sm">{exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.current || !exp.endDate ? 'Present' : new Date(exp.endDate).toLocaleDateString()}</p>
                                        <p className="text-slate-400 text-xs mt-1">{exp.description}</p>
                                    </div>
                                ))}
                                {(!profile.workExperience || profile.workExperience.length === 0) && <p className="text-slate-500 italic">No work experience added.</p>}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {/* Skills */}
                    {activeTab === 'skills' && (
                        <div className="space-y-6">
                            <div className="bg-[#323c52] p-4 rounded border border-slate-700 flex gap-3">
                                <input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add a technical skill..."
                                    className="flex-1 px-3 py-2 bg-[#283046] rounded border border-slate-600 text-white text-sm focus:border-blue-500 outline-none"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                />
                                <button onClick={handleAddSkill} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Add</button>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Technical Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills?.technical?.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2 group cursor-default">
                                            {typeof skill === 'string' ? skill : skill.name}
                                            <button onClick={() => handleRemoveSkill(i)} className="text-blue-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><FaTimes size={12} /></button>
                                        </span>
                                    ))}
                                    {(!profile.skills?.technical || profile.skills.technical.length === 0) && <span className="text-slate-500 italic text-sm">No skills added.</span>}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-[#323c52] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">Close</button>
                    <button onClick={handleSave} disabled={saveLoading} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2">
                        {saveLoading ? <PropagateLoader color='#fff' size={8} /> : (
                            <>
                                <FaSave /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default UserProfileModal;
