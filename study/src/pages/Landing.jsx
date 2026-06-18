import { Link } from "react-router-dom";
import { useEffect } from "react";
import ScrollExpandMedia from "../components/common/ScrollExpandMedia";

const Landing = () => {
  useEffect(() => {
    // Scroll effect for header
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('shadow-lg', 'h-16');
          header.classList.remove('h-20');
        } else {
          header.classList.remove('shadow-lg', 'h-16');
          header.classList.add('h-20');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-body-md text-body-md selection:bg-primary-fixed bg-[#f9f9ff] text-[#141b2b] overflow-x-hidden min-h-screen">
      {/* Top Navigation */}
      <header className="glass-header fixed top-0 w-full z-[100] px-container-padding py-stack-md h-20 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary">Lumina</span>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#features">Features</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#testimonials">Success Stories</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#pricing">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden md:block font-label-md text-label-md text-primary px-6 py-2 hover:underline transition-all">Log In</Link>
          <Link to="/register" className="clay-button-primary px-6 py-3 font-label-md text-label-md inline-flex items-center justify-center">Get Started for Free</Link>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section with ScrollExpandMedia */}
        <section className="relative min-h-[920px] flex flex-col items-center justify-center text-center px-4 overflow-hidden hero-gradient">
          <div className="max-w-4xl mx-auto z-10 space-y-stack-lg mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-fixed text-on-primary-fixed rounded-full mb-4">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Meet the future of learning</span>
            </div>
            <h1 className="font-display-lg text-display-lg md:text-[64px] md:leading-[1.1] text-on-surface tracking-tight">
              Your Personal <span className="text-primary italic font-serif">AI Learning</span> Companion
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Lumina transforms dense textbooks, endless PDFs, and chaotic notes into structured study plans and interactive learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-stack-lg">
              <Link to="/register" className="clay-button-primary px-10 py-4 font-label-md text-label-md text-lg flex items-center gap-2 group justify-center">
                Start Studying Now
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
              <a href="#features" className="bg-surface-container-lowest border border-outline-variant px-10 py-4 rounded-full font-label-md text-label-md text-lg hover:bg-surface-container-low transition-colors inline-flex items-center justify-center">
                Watch Features
              </a>
            </div>
          </div>

          {/* Floating claymorphic dashboard preview using ScrollExpandMedia */}
          <div className="w-full max-w-5xl px-4 mt-8">
            <ScrollExpandMedia
              mediaType="image"
              mediaSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuDdKfQHFBpn1-x5VBABc6mB9chp0R6PS_MAerf1S-F2E7KcpE17BHN6UomtlgbKI_0VOXIa8MWrrUTj9zJVSwPm-_csiO3l4GjND_P2pNZNuhEmssfpdP3tjR8n29cNx6HpAA34WRdYVZ1xneENQQj6kKBV6Mp5W4Eer2pmq_EltdpOPOcJ7dVf-z1Ij5tTT44e7eWsVAgwWhot776bY2ALucCmE21yK6YJhMEXdje4IU4_l_fisuZzOkTzWAZT9r4u2ozgoTBiMu4"
              bgImageSrc="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
              title="Lumina Dashboard"
              scrollToExpand="Scroll to expand workspace"
              textBlend={false}
            >
              <div className="w-full h-12 bg-transparent"></div>
            </ScrollExpandMedia>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-section-gap px-container-padding max-w-7xl mx-auto" id="features">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Designed for High-Performance Students</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Everything you need to master any subject, powered by advanced AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Feature: AI Summaries */}
            <div className="md:col-span-8 clay-card p-8 flex flex-col justify-between overflow-hidden relative group min-h-[280px]">
              <div className="z-10 max-w-md">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2">AI Summaries</h3>
                <p className="text-on-surface-variant font-body-md leading-relaxed">Turn 50-page research papers into 5-minute actionable summaries. Our AI identifies key concepts, definitions, and formulas instantly.</p>
              </div>
              <div className="absolute bottom-[-10%] right-[-5%] w-1/3 opacity-10 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none">
                <span className="material-symbols-outlined text-[180px] text-primary">description</span>
              </div>
            </div>

            {/* Feature: PDF Chat */}
            <div className="md:col-span-4 clay-card p-8 flex flex-col justify-between bg-secondary/5 border border-secondary/10 min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-secondary-fixed text-secondary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <span className="material-symbols-outlined">chat_bubble</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2">PDF Chat</h3>
                <p className="text-on-surface-variant font-body-md leading-relaxed font-normal">Ask your textbooks questions and get citations directly from the text.</p>
              </div>
            </div>

            {/* Feature: Flashcards */}
            <div className="md:col-span-4 clay-card p-8 flex flex-col justify-between bg-surface-container-low min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-surface-container-high text-on-surface-variant rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <span className="material-symbols-outlined">quiz</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2">Flashcards</h3>
                <p className="text-on-surface-variant font-body-md leading-relaxed">Auto-generated cards from your notes with space-repetition logic.</p>
              </div>
            </div>

            {/* Large Feature: Study Planner */}
            <div className="md:col-span-8 clay-card p-8 flex flex-col justify-between overflow-hidden bg-primary/5 min-h-[280px]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-headline-md text-headline-md mb-2">Study Planner & Roadmaps</h3>
                  <p className="text-on-surface-variant max-w-sm font-body-md leading-relaxed">Input your exam date, and Lumina generates a day-by-day roadmap tailored to your specific pace and difficult areas.</p>
                </div>
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
              </div>
              <div className="mt-8 flex gap-4 overflow-hidden">
                <div className="min-w-[200px] h-24 bg-white rounded-xl shadow-sm border border-outline-variant p-4">
                  <div className="w-8 h-2 bg-primary/20 rounded mb-2"></div>
                  <div className="w-12 h-2 bg-primary/10 rounded"></div>
                </div>
                <div className="min-w-[200px] h-24 bg-white rounded-xl shadow-sm border border-outline-variant p-4 translate-y-2">
                  <div className="w-8 h-2 bg-secondary/20 rounded mb-2"></div>
                  <div className="w-12 h-2 bg-secondary/10 rounded"></div>
                </div>
                <div className="min-w-[200px] h-24 bg-white rounded-xl shadow-sm border border-outline-variant p-4">
                  <div className="w-8 h-2 bg-tertiary/20 rounded mb-2"></div>
                  <div className="w-12 h-2 bg-tertiary/10 rounded"></div>
                </div>
              </div>
            </div>

            {/* Feature: Interview Prep */}
            <div className="md:col-span-12 clay-card p-8 flex flex-col md:flex-row items-center gap-8 min-h-[360px]">
              <div className="flex-1">
                <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <span className="material-symbols-outlined">record_voice_over</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2">Interview Prep</h3>
                <p className="text-on-surface-variant font-body-md leading-relaxed">Lumina acts as your mock interviewer, giving real-time feedback on your answers and body language for technical or behavioral rounds.</p>
              </div>
              <div className="flex-1 w-full flex justify-center">
                <div className="relative w-full max-w-xs aspect-square bg-surface-container-high rounded-full flex items-center justify-center border-4 border-white shadow-inner overflow-hidden">
                  <img alt="Interview Simulation" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP90DPFWqWBed08ucqu8OZSIblzyHQl7Rf-4O-j2lGWofwoZNrGAFWxejo903nk6TvDokdA83xHLVh25Z8880WOjRDOlmfIh28qyj6cbPjUiNmqwWuK7zqzFPMJ9639w9DgjLLwILJH4lfBF_y2geEXDJuRfoWIpKOXX0XnwlWxjr0CEzB-rURNEMg5R21l8Dv6__82ICmkpXYoobmOffa5pTns0r_9v-q4TNrod0P7JfXC3vsuwogQUhedD76dy5baZPorn7m69g"/>
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
                    <span className="font-label-sm text-primary">Live Feedback...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section className="bg-surface-container-lowest py-section-gap overflow-hidden" id="testimonials">
          <div className="px-container-padding max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Loved by 50,000+ Students</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="clay-card p-8 space-y-6">
                <div className="flex gap-1 text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="italic text-on-surface-variant font-body-md leading-relaxed">"Lumina cut my study time in half. I used to spend hours summarizing chapters, now I just chat with my textbook and focus on understanding the hard parts."</p>
                <div className="flex items-center gap-4 pt-4 border-t border-surface-container">
                  <img alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCn3FlV1FnCWN7xDTWn8CFF4-tZhicnOF6_yoYCbdR_GZdREsl34tBxR6wrIx1vvmz4GUf67--USQf72xMmvIMpTJKtcEljqQUeFneFRnorPQLNikwepHKb5HaMmj2TwH5Bvel0vedx2PqnzVr6JT9_bVLJEiwyJ2_sIttEMRwBMPmhvmP7jyxBPFozVMPgRmoeryCyC8MGZMvJR8eQYBiAFNcB1lA_Q6z0RQiBLQWut02MNGK0FEoy_P2mdI-nObtJXp0cneNdwc"/>
                  <div>
                    <p className="font-label-md text-on-surface font-bold">Alex Thompson</p>
                    <p className="text-sm text-on-surface-variant">Medical Student, NYU</p>
                  </div>
                </div>
              </div>

              <div className="clay-card p-8 space-y-6 md:translate-y-8">
                <div className="flex gap-1 text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="italic text-on-surface-variant font-body-md leading-relaxed">"The roadmap feature is a lifesaver. It automatically rescheduled my study sessions when I missed a day. No more planning stress."</p>
                <div className="flex items-center gap-4 pt-4 border-t border-surface-container">
                  <img alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu77IGCJY5QOsipjBcMV9qQZlMEOg-BxuZXRxb-m-IM17lA9-xORxLsgekkiYkMYbyVLPd4x2RmU5FPPSMdmwgCExn1cS3r9R6p9CAJNYNAO0xFbNxoOzvfMuzYqfe-4HiFeNXEFmPX7cYb7ftgiwB5ULwt-yuFQ6XWzD7ogQO1_ZDbMhTUrouc5PLLNcG7cSFt54QameSVWRJ71GApyuXpsTBo7hL4hqpfGPD9OrhQqQdepuaFpavCQBlK0j0zyGbFSmIs9I56Ko"/>
                  <div>
                    <p className="font-label-md text-on-surface font-bold">Sarah Chen</p>
                    <p className="text-sm text-on-surface-variant">Computer Science, Stanford</p>
                  </div>
                </div>
              </div>

              <div className="clay-card p-8 space-y-6">
                <div className="flex gap-1 text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="italic text-on-surface-variant font-body-md leading-relaxed">"Interview prep with Lumina helped me land my internship at Google. The AI's feedback on my technical explanations was incredibly precise."</p>
                <div className="flex items-center gap-4 pt-4 border-t border-surface-container">
                  <img alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQHfr2ZOIuExeQ9wySjqXIrfmRfphv7YWtQOneQ7KQ0RQp4gNZO1nYeaoqgxPGgv4xZ4SZ9bLG3CdsWawwiUkn0o6ubwcq_A6KvgmOAs5bFCAl-NBRuSo1--qg6mGRhooJ3W65_wIV5EiBCvAA8eZaznz2cfXkesbAGZHrc0b0rEVoANa9GdPhs_Y5-3C68zLXORakG61VX9RxcVIBGENlTg2Yoz5yGwimJ16RP5Av_P4cPSoc6YJJ2nKXJ9KzAgoF6ZKXjjmidA0"/>
                  <div>
                    <p className="font-label-md text-on-surface font-bold">Marcus Rodriguez</p>
                    <p className="text-sm text-on-surface-variant">Economics, LSE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-section-gap px-container-padding" id="pricing">
          <div className="max-w-5xl mx-auto clay-card bg-primary p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h2 className="font-headline-lg text-headline-lg md:text-[40px]">Ready to Ace Your Next Exam?</h2>
              <p className="text-primary-fixed max-w-xl mx-auto font-body-lg leading-relaxed">Join thousands of students who are learning smarter, not harder. Start your free trial today.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register" className="bg-white text-primary px-10 py-4 rounded-full font-label-md text-label-md text-lg shadow-xl hover:scale-105 transition-transform inline-flex items-center justify-center">Get Started for Free</Link>
                <Link to="/login" className="border border-white/30 bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-label-md text-label-md text-lg hover:bg-white/20 transition-colors inline-flex items-center justify-center">See Plans</Link>
              </div>
              <p className="text-primary-fixed/60 text-sm">No credit card required. Cancel anytime.</p>
            </div>
            {/* Abstract blobs for the CTA card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low py-16 px-container-padding mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              </div>
              <span className="font-headline-md text-headline-md font-bold text-primary">Lumina</span>
            </div>
            <p className="text-on-surface-variant max-w-xs leading-relaxed text-sm">Building the intelligent infrastructure for the next generation of lifelong learners.</p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-on-surface-variant hover:text-primary shadow-sm" href="#"><span className="material-symbols-outlined">language</span></a>
              <a className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-on-surface-variant hover:text-primary shadow-sm" href="#"><span className="material-symbols-outlined">chat</span></a>
              <a className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-on-surface-variant hover:text-primary shadow-sm" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
            </div>
          </div>
          <div>
            <h4 class="font-label-md text-label-md text-on-surface mb-6 font-semibold">Product</h4>
            <ul className="space-y-4 text-on-surface-variant text-sm font-medium">
              <li><a className="hover:text-primary transition-colors" href="#features">AI Summaries</a></li>
              <li><a className="hover:text-primary transition-colors" href="#features">Roadmaps</a></li>
              <li><a className="hover:text-primary transition-colors" href="#features">Interview Prep</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Mobile App</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-label-md text-label-md text-on-surface mb-6 font-semibold">Company</h4>
            <ul className="space-y-4 text-on-surface-variant text-sm font-medium">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Privacy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Terms</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-label-md text-label-md text-on-surface mb-6 font-semibold">Stay Updated</h4>
            <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">Subscribe to our newsletter for learning tips and product updates.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input className="bg-white border border-outline-variant rounded-xl px-4 py-2 w-full focus:ring-primary focus:border-primary text-sm font-medium" placeholder="Email address" type="email"/>
              <button type="submit" className="bg-primary text-white p-2 rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center justify-center"><span className="material-symbols-outlined">send</span></button>
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-outline-variant text-center text-on-surface-variant text-sm">
          © 2026 Lumina AI Technologies Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
