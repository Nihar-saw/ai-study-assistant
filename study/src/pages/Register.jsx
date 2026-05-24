import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BrainCircuit, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

const GlassInputWrapper = ({ children }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-purple-400/70 focus-within:bg-purple-500/10">
    {children}
  </div>
);

const TestimonialCard = ({ avatarSrc, name, handle, text }) => (
  <div className="flex items-start gap-3 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 p-5 w-64 shadow-2xl">
    <img src={avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug text-white">
      <p className="flex items-center gap-1 font-bold">{name}</p>
      <p className="text-gray-400">{handle}</p>
      <p className="mt-2 text-gray-200">{text}</p>
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success("Account created! Welcome to StudyAI.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#0a0a0b] text-white overflow-hidden">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-2 text-purple-400">
            <BrainCircuit className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">StudyAI</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Join <span className="font-light tracking-tighter">us</span>
            </h1>
            <p className="text-gray-400">Create your account and start accelerating your learning.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Full Name</label>
              <GlassInputWrapper>
                <input 
                  type="text" 
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe" 
                  className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-gray-600" 
                />
              </GlassInputWrapper>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email Address</label>
              <GlassInputWrapper>
                <input 
                  type="email" 
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com" 
                  className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-gray-600" 
                />
              </GlassInputWrapper>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Password</label>
              <GlassInputWrapper>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password" 
                    className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none placeholder:text-gray-600" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-4 flex items-center"
                  >
                    {showPassword ? 
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-white transition-colors" /> : 
                      <Eye className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                    }
                  </button>
                </div>
              </GlassInputWrapper>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-2xl bg-purple-600 py-4 font-bold text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25 disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-white/10"></span>
            <span className="px-4 text-sm text-gray-500 bg-[#0a0a0b] absolute">Or continue with</span>
          </div>

          <button 
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-2xl py-4 hover:bg-white/5 transition-colors font-medium text-gray-200"
          >
              <GoogleIcon />
              Sign up with Google
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-purple-400 hover:underline transition-colors font-medium">Sign in here</Link>
          </p>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      <section className="hidden md:block flex-1 relative p-4">
        <div 
          className="absolute inset-4 rounded-3xl bg-cover bg-center border border-white/10" 
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/80 via-transparent to-transparent rounded-3xl"></div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
          <TestimonialCard 
            avatarSrc="https://i.pravatar.cc/150?u=a042581f4e29026704a" 
            name="Emily Roberts" 
            handle="@emily_r" 
            text="The seamless PDF management and note-taking features save me hours every week." 
          />
          <div className="hidden xl:block">
            <TestimonialCard 
              avatarSrc="https://i.pravatar.cc/150?u=a042581f4e29026024f" 
              name="Marcus Johnson" 
              handle="@marcusj" 
              text="Generating quizzes straight from my lecture slides is a complete game changer." 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;