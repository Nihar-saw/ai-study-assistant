import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

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
      toast.success("Account created! Welcome to Lumina.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dot-pattern min-h-screen w-full flex items-center justify-center p-6 bg-[#f9f9ff] relative overflow-x-hidden">
      {/* Register Container */}
      <main className="w-full max-w-[480px] z-10 py-10">
        {/* Brand Header */}
        <div className="text-center mb-stack-lg flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-stack-md clay-button text-white animate-bounce-slow">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight">Lumina</h1>
          <p className="font-body-md text-on-surface-variant mt-2 font-medium">Your Premium Study Assistant</p>
        </div>

        {/* Main Claymorphic Card */}
        <div className="clay-card p-container-padding border border-white/40 bg-white">
          <header className="mb-stack-lg text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Create account</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">Start your premium learning journey today.</p>
          </header>

          {/* Register Form */}
          <form className="space-y-stack-md text-left" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 block" htmlFor="name">Full Name</label>
              <div className="relative group transition-transform duration-200 focus-within:scale-[1.01]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                <input 
                  className="clay-input w-full pl-12 pr-4 py-3.5 rounded-xl font-body-md text-on-surface placeholder:text-outline border border-transparent" 
                  id="name" 
                  name="name" 
                  placeholder="John Doe" 
                  required 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 block" htmlFor="email">Email Address</label>
              <div className="relative group transition-transform duration-200 focus-within:scale-[1.01]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  className="clay-input w-full pl-12 pr-4 py-3.5 rounded-xl font-body-md text-on-surface placeholder:text-outline border border-transparent" 
                  id="email" 
                  name="email" 
                  placeholder="name@university.edu" 
                  required 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 block" htmlFor="password">Password</label>
              <div className="relative group transition-transform duration-200 focus-within:scale-[1.01]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  className="clay-input w-full pl-12 pr-12 py-3.5 rounded-xl font-body-md text-on-surface placeholder:text-outline border border-transparent" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors flex items-center justify-center" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="clay-button w-full bg-primary hover:bg-primary-container text-white py-4 rounded-2xl font-headline-md text-headline-md mt-stack-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:brightness-90 transition-all" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Creating Account..." : "Sign Up"}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-stack-lg flex items-center">
            <div className="flex-grow border-t border-surface-container"></div>
            <span className="px-4 font-label-sm text-label-sm text-outline uppercase tracking-wider bg-white z-10">or continue with</span>
            <div className="flex-grow border-t border-surface-container"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-stack-md">
            <button className="social-btn py-3 px-4 rounded-xl flex items-center justify-center gap-3 cursor-pointer">
              <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnuG7TG2eKcQKwor5KtAwMQYxMsLtkIstP_tVzNY-nDu--0jBPnCuj67MFczCrCIMz5xv6AddsfpnNnc8rwYkBQgDbfQE396NhYnDMKCwwv-cRiQksLCAn-7tnjfwNiTnxgKhP60W6N9U-jSJIhbRPxsicj5j_GmXXtwB0XdVqDk-cnjAXKKjKTOZkUn6uXNJaHYtloMykoNy-g_WPDwXyuKrd9oAFb8YQIjOKNEEmnL4S_xPnJ8TVn198nARmXb9Oi-4m_r2UEIo"/>
              <span className="font-label-md text-label-md text-on-surface font-semibold">Google</span>
            </button>
            <button className="social-btn py-3 px-4 rounded-xl flex items-center justify-center gap-3 cursor-pointer">
              <img alt="Apple Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUtx2rdwjgT7nDA66cnEFv3wkRSAyFpeHHPrWT2P4yOnsVTLlprw5lpPMRcblhbwdm5QIEFThzpZ8QNzppbGwk5uGmLJ_AzKaC6OTbwvX7UkO6gUZeHv9Gjqqf7rMuq1--q5ACAF6Y3sY81PQHEirGxZa0caW2OmmNNy0-ubHENulFwj1NumO42S380pJyZimJITdCSKInpnEkaleC2XcKaR4T6TFlXUA-1-Q65MNgt_gwZH2lbdPlkdSacjQuxVGcBqObvY7H5Mg"/>
              <span className="font-label-md text-label-md text-on-surface font-semibold">Apple</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <p className="text-center mt-stack-lg font-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link className="text-primary font-bold hover:underline transition-all" to="/login">Sign In here</Link>
        </p>
        <div className="mt-section-gap flex justify-center gap-gutter text-outline font-label-sm">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#">Help Center</a>
        </div>
      </main>

      {/* Visual Embellishment: Background Elements */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default Register;