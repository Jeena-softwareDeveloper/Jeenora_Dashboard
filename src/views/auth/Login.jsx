import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { overrideStyle } from '../../utils/utils';
import { seller_login, messageClear } from '../../store/Reducers/authReducer';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
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
        dispatch(seller_login(state));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/');
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate]);

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
                <h2 className="text-3xl font-bold text-white text-center mb-8">Login</h2>

                <form onSubmit={submit} className="flex flex-col gap-4">

                    {/* Email Input */}
                    <div className="relative">
                        <label htmlFor="email" className="text-white text-xs ml-1 mb-1 block">Username or email</label>
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
                        <div className="flex justify-between items-center mb-1 ml-1">
                            <label htmlFor="password" className="text-white text-xs">Password</label>
                            <Link to="/forgot-password" className="text-green-300 text-xs hover:text-green-200 transition-colors">Forgot password?</Link>
                        </div>
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

                    {/* Remember Me */}
                    <div className="flex items-center gap-2 mt-1">
                        <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-green-400 focus:ring-green-400 bg-white/20 checked:bg-green-500 checked:border-transparent" />
                        <label htmlFor="remember" className="text-white text-sm">Remember me</label>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={loader}
                        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition-all text-lg border border-green-400/50"
                    >
                        {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Login'}
                    </button>

                    {/* Sign Up Link */}
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-200">
                            Don't have an account? <Link className="font-bold text-white hover:underline" to="/register">Sign up</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;