import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { FaSave, FaSync, FaEye, FaCode, FaCheckCircle, FaExclamationTriangle, FaEdit } from 'react-icons/fa';

const RecursiveField = ({ data, path, onUpdate, level = 0 }) => {
    if (data === null || data === undefined) return null;

    // Helper to format keys (e.g., "jobMatching" -> "Job Matching")
    const formatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    // Render Array
    if (Array.isArray(data)) {
        return (
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className={`p-4 rounded-xl border-2 ${level % 2 === 0 ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200'} relative`}>
                        <div className="absolute top-2 right-2 px-2 py-1 bg-slate-200 rounded text-xs font-bold text-slate-500">
                            #{index + 1}
                        </div>
                        <RecursiveField
                            data={item}
                            path={[...path, index]}
                            onUpdate={onUpdate}
                            level={level + 1}
                        />
                    </div>
                ))}
            </div>
        );
    }

    // Render Object
    if (typeof data === 'object') {
        return (
            <div className="space-y-4">
                {Object.keys(data).map((key) => {
                    const value = data[key];
                    // Skip certain keys if needed, e.g., internal IDs
                    if (key === '_id') return null;

                    return (
                        <div key={key} className={typeof value === 'object' && value !== null ? "mt-4" : ""}>
                            {typeof value === 'object' && value !== null ? (
                                <div className="mb-2 pb-2 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{formatKey(key)}</h3>
                                </div>
                            ) : (
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{formatKey(key)}</label>
                            )}

                            <RecursiveField
                                data={value}
                                path={[...path, key]}
                                onUpdate={onUpdate}
                                level={level + 1}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    // Render Primitive Inputs
    const isLongText = typeof data === 'string' && data.length > 60;
    const isNumber = typeof data === 'number';

    return (
        <div className="relative group">
            {isLongText ? (
                <textarea
                    value={data}
                    onChange={(e) => onUpdate(path, e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y min-h-[100px]"
                />
            ) : (
                <input
                    type={isNumber ? "number" : "text"}
                    value={data}
                    onChange={(e) => onUpdate(path, isNumber ? parseFloat(e.target.value) : e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                />
            )}
            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`}>
                <FaEdit className="text-slate-300" />
            </div>
        </div>
    );
};

const StaticContentManagement = () => {
    const [pages, setPages] = useState(['home', 'how-it-works', 'pricing', 'jobs-preview', 'about', 'faq']);
    const [activePage, setActivePage] = useState('home');
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContent(activePage);
    }, [activePage]);

    const fetchContent = async (page) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/hire/static/${page}`);
            setContent(data.content || {});
        } catch (err) {
            console.error(err);
            toast.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (path, value) => {
        setContent(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            let current = newData;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newData;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/hire/static/${activePage}`, { content });
            toast.success(`${activePage} content updated successfully`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="px-2 lg:px-7 pt-5 pb-20">
            <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 bg-slate-900 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight mb-1">Content Manager</h1>
                            <p className="text-slate-400 font-medium text-sm">Update text, numbers, and features for public pages</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-900/20 transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1'}`}
                        >
                            <FaSave /> {saving ? 'Saving...' : 'Publish Changes'}
                        </button>
                    </div>

                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                        {pages.map(page => (
                            <button
                                key={page}
                                onClick={() => setActivePage(page)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${activePage === page
                                    ? 'bg-white text-slate-900 border-white'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:border-slate-600'}`}
                            >
                                {page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 md:p-8 bg-slate-50 min-h-[500px] relative">
                    {loading ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-slate-500 font-bold">Loading content...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl">
                            {Object.keys(content).length > 0 ? (
                                <div className="space-y-8">
                                    <RecursiveField
                                        data={content}
                                        path={[]}
                                        onUpdate={handleUpdate}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-slate-400 font-medium">No content found for this page.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaticContentManagement;
