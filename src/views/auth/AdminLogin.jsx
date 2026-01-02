import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { admin_login, messageClear } from '../../store/Reducers/authReducer';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { overrideStyle } from '../../utils/utils';
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth);

    const [state, setState] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const submit = (e) => {
        e.preventDefault();
        dispatch(admin_login(state));
    };

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/');
        }
    }, [errorMessage, successMessage, dispatch, navigate]);

    return (
        <div className="min-h-screen w-full flex justify-center items-center relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
            {/* ---------------- Background Blobs ---------------- */}
            {/* Large Green Blob (Top Left) */}
            <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-green-500 rounded-full filter blur-[100px] opacity-50 animate-blob"></div>

            {/* Large Emerald Blob (Top Right) */}
            <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] bg-emerald-500 rounded-full filter blur-[100px] opacity-50 animate-blob animation-delay-2000"></div>

            {/* Large Lime Blob (Bottom Left) */}
            <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] bg-lime-500 rounded-full filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>

            {/* Teal Blob (Bottom Right) */}
            <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-teal-600 rounded-full filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>

            {/* Floating Ball Elements (Decorative) */}
            <div className="absolute top-[20%] left-[20%] w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full shadow-lg opacity-80 animate-float" style={{ animationDuration: '6s' }}></div>
            <div className="absolute bottom-[20%] right-[20%] w-40 h-40 bg-gradient-to-r from-teal-500 to-green-500 rounded-full shadow-lg opacity-80 animate-float" style={{ animationDuration: '8s' }}></div>


            {/* ---------------- Glassmorphism Card ---------------- */}
            <div className="relative w-[400px] p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl z-10">
                <div className='flex justify-center items-center mb-6'>
                    <div className='w-[180px]'>
                        {/* Using the logo as in previous design but creating a nice container if needed. 
                             Assuming logo.png is white or fits well. If not, might need a background. 
                             For now, keeping it clean transparent. */}
                        <img className='w-full h-auto drop-shadow-lg' src="/images/logo.png" alt="Jeenora Logo" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h2>

                <form onSubmit={submit} className="flex flex-col gap-4">

                    {/* Email Input */}
                    <div className="relative">
                        <label htmlFor="email" className="text-white text-xs ml-1 mb-1 block">Email</label>
                        <input
                            onChange={inputHandle}
                            value={state.email}
                            className="w-full px-4 py-3 bg-white/20 border border-transparent rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/30 transition-all font-medium"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            id="email"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <label htmlFor="password" className="text-white text-xs ml-1 mb-1 block">Password</label>
                        <div className="relative">
                            <input
                                onChange={inputHandle}
                                value={state.password}
                                className="w-full px-4 py-3 bg-white/20 border border-transparent rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/30 transition-all font-medium"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                id="password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={loader}
                        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition-all text-lg border border-green-400/50"
                    >
                        {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Login'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AdminLogin;