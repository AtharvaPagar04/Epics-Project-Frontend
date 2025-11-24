import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShoppingBasket, Store, User as UserIcon, ArrowRight, Check, Leaf, Lock } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API Call simulation
    setTimeout(() => {
      const mockUser: User = {
        id: Date.now().toString(),
        name: isLogin ? "Demo User" : formData.name,
        email: formData.email,
        role: isLogin ? 'user' : role // For login we default to user, normally comes from backend
      };
      
      // If logging in as the specific hardcoded vendor credentials
      if (isLogin && formData.email.includes('vendor')) {
          mockUser.role = 'vendor';
          mockUser.name = "Demo Vendor";
      }

      onLogin(mockUser);
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = (roleType: 'user' | 'vendor') => {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
          const mockUser: User = {
              id: roleType === 'vendor' ? 'vendor-demo-id' : 'buyer-demo-id',
              name: roleType === 'vendor' ? "Ram's Vegetables (Demo)" : "Alex User (Demo)",
              email: roleType === 'vendor' ? 'vendor@demo.com' : 'buyer@demo.com',
              role: roleType
          };
          onLogin(mockUser);
          setIsLoading(false);
      }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
        {/* Simplified Background to reduce lag */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-bl from-green-50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-tr from-emerald-50 to-transparent"></div>
        </div>
        
        {/* Main Card Container */}
        <div className="bg-white w-full max-w-5xl rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] z-10 animate-fadeIn">
            
            {/* Left Side - Visuals (Hidden on small mobile) */}
            <div className="hidden md:flex md:w-1/2 bg-green-600 relative flex-col justify-between p-12 text-white">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1974" 
                        alt="Fresh Vegetables" 
                        className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-emerald-900/90"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            <Leaf size={24} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-wide">FarmConnect</span>
                    </div>
                    
                    <h2 className="text-4xl font-bold leading-tight mb-6">
                        Fresh from the farm,<br/>straight to you.
                    </h2>
                    
                    <p className="text-green-50 text-lg leading-relaxed opacity-90">
                        Join thousands of locals finding the freshest produce nearby. Support local farmers and eat healthy.
                    </p>
                </div>

                <div className="relative z-10 space-y-4 mt-12">
                     <FeatureRow text="Real-time stock updates" />
                     <FeatureRow text="Connect directly with vendors" />
                     <FeatureRow text="No middleman fees" />
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
                
                <div className="max-w-sm mx-auto w-full">
                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            {isLogin ? 'Welcome back!' : 'Create Account'}
                        </h3>
                        <p className="text-gray-500">
                            {isLogin ? 'Please enter your details.' : 'Join us to get started.'}
                        </p>
                    </div>

                    {/* Quick Login for Demo */}
                    {isLogin && (
                        <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-3 justify-center">
                                <Lock size={12} className="text-blue-500" />
                                <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Quick Demo Access</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleDemoLogin('user')}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-blue-200 shadow-sm rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-95"
                                >
                                    <UserIcon size={16} /> Buyer
                                </button>
                                <button 
                                    onClick={() => handleDemoLogin('vendor')}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-blue-200 shadow-sm rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-95"
                                >
                                    <Store size={16} /> Vendor
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Or Divider */}
                    {isLogin && (
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-400 font-medium">Or login with email</span>
                            </div>
                        </div>
                    )}

                    {/* Role Selection (Only for Sign Up) */}
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <RoleButton 
                                active={role === 'user'} 
                                onClick={() => setRole('user')} 
                                icon={<UserIcon size={20} />}
                                title="Buyer"
                            />
                            <RoleButton 
                                active={role === 'vendor'} 
                                onClick={() => setRole('vendor')} 
                                icon={<Store size={20} />}
                                title="Vendor"
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Password</label>
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button type="button" className="text-sm font-medium text-green-600 hover:text-green-700">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Get Started'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="font-bold text-gray-800 hover:text-green-600 transition-colors underline decoration-2 decoration-transparent hover:decoration-green-600 underline-offset-4"
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const FeatureRow = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 text-green-50">
        <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center backdrop-blur-sm border border-green-400/30">
            <Check size={14} className="text-white" />
        </div>
        <span className="font-medium">{text}</span>
    </div>
);

const RoleButton = ({ active, onClick, icon, title }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string }) => (
    <button
        type="button"
        onClick={onClick}
        className={`
            p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200
            ${active 
                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' 
                : 'border-gray-100 bg-white text-gray-400 hover:border-green-200 hover:bg-gray-50'
            }
        `}
    >
        <div className={`p-2 rounded-full ${active ? 'bg-green-200' : 'bg-gray-100'}`}>
            {icon}
        </div>
        <span className="font-bold text-sm">{title}</span>
    </button>
);