import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Zap, Palette, BarChart3, Shield } from "lucide-react";
import { VideoBackground } from "@/components/VideoBackground";
import { HeroContent } from "@/components/HeroContent";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  const isLoggedIn = !!session;
  const ctaLink = isLoggedIn ? "/dashboard" : "/role-select";

  return (
    <main className="min-h-screen bg-black text-white font-body overflow-visible">
      
      {/* SECTION 1 — NAVBAR */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-6 max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        <div className="w-12 h-12 flex items-center justify-center font-heading italic font-bold text-2xl">InfinityCare</div>
        
        <div className="liquid-glass rounded-full px-8 py-3 hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
          <Link href="#" className="hover:text-white transition-colors">Home</Link>
          <Link href="#" className="hover:text-white transition-colors">Services</Link>
          <Link href="#" className="hover:text-white transition-colors">Work</Link>
          <Link href="#" className="hover:text-white transition-colors">Process</Link>
          <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        <Link
          href={ctaLink}
          className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
        >
          {isLoggedIn ? "Dashboard" : "Get Started"}
          <span className="text-lg leading-none">&rarr;</span>
        </Link>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="relative overflow-visible h-[1000px] bg-black">
        <VideoBackground
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          poster="/images/hero_bg.jpeg"
          className="top-[20%]"
        />
        <div className="absolute inset-0 bg-black/40 xl:bg-black/10 z-0" />
        <div className="absolute bottom-0 left-0 right-0 z-[1] h-[300px]" style={{ background: "linear-gradient(to bottom, transparent, black)" }} />
        
        <HeroContent ctaLink={ctaLink} />

        {/* SECTION 3 — PARTNERS BAR */}
        <div className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center justify-center text-center">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body mb-8">
            Trusted by leading healthcare providers
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-2xl md:text-3xl font-heading italic text-white/80">
            <span>Apollo</span>
            <span>Fortis</span>
            <span>Max Healthcare</span>
            <span>AIIMS</span>
            <span>Pharmeasy</span>
          </div>
        </div>
      </section>

      {/* SECTION 4 — START SECTION */}
      <section className="relative min-h-[700px] py-32 px-6 md:px-16 lg:px-24 flex items-center justify-center border-t border-white/5">
        <VideoBackground src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8" />
        <div className="absolute inset-0 bg-black/60 md:bg-black/40 z-0" />
        <div className="absolute top-0 left-0 right-0 h-[200px] z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, black, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-[200px] z-10 pointer-events-none" style={{ background: "linear-gradient(to top, black, transparent)" }} />
        
        <div className="relative z-20 flex flex-col items-center text-center max-w-3xl mx-auto min-h-[500px] justify-center">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-sm font-medium text-white font-body inline-block mb-6">
            Your Health. Your Rules.
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] mb-6 text-white pt-4">
            Upload records. Set explicit permissions.
          </h2>
          <p className="text-white/60 font-body font-light text-lg mb-10 pb-4">
            Our zero-trust ecosystem ensures your sensitive medical data is seen only by the doctors and institutions you actively authorize.
          </p>
          <Link href={ctaLink} className="liquid-glass-strong rounded-full px-8 py-4 flex items-center gap-2 font-medium text-sm hover:text-white/80 transition-colors">
            Get Started
            <span className="text-lg leading-none">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* SECTION 5 — FEATURES CHESS */}
      <section className="py-32 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-24">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-sm font-medium text-white font-body inline-block mb-6">
            Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading italic tracking-tight leading-[0.9] text-white pt-4">
            Advanced Healthcare. Zero Compromise.
          </h2>
        </div>

        <div className="flex flex-col gap-32">
          {/* Row 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <h3 className="text-4xl lg:text-5xl font-heading italic text-white mb-6">Patient-Owned Data. Cryptographically Secure.</h3>
              <p className="text-white/60 font-body font-light mb-8 text-lg leading-relaxed">
                Your medical records are yours. Every document access requires explicit permission. Hospitals see only what you allow, and every access is persistently logged.
              </p>
              <Link href={ctaLink} className="liquid-glass-strong rounded-full px-8 py-4 inline-flex items-center gap-2 text-sm">
                Learn more
              </Link>
            </div>
            <div className="flex-1 w-full">
              <div className="liquid-glass rounded-3xl overflow-hidden aspect-[4/3] bg-white/5 flex items-center justify-center shadow-lg">
                <span className="text-white/20 italic font-heading text-lg">Interactive UI Component</span>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 text-left">
              <h3 className="text-4xl lg:text-5xl font-heading italic text-white mb-6">Doctor Intelligence. AI Summaries.</h3>
              <p className="text-white/60 font-body font-light mb-8 text-lg leading-relaxed">
                Doctors work with AI-generated summaries—not raw records. This reduces cognitive overload, speeds up diagnosis, and protects your granular history.
              </p>
              <Link href={ctaLink} className="border border-white/20 rounded-full px-8 py-4 inline-flex items-center gap-2 text-sm hover:bg-white/5 transition-colors">
                See how it works
              </Link>
            </div>
            <div className="flex-1 w-full">
              <div className="liquid-glass rounded-3xl overflow-hidden aspect-[4/3] bg-white/5 flex items-center justify-center shadow-lg">
                <span className="text-white/20 italic font-heading text-lg">Data Visualization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FEATURES GRID */}
      <section className="py-32 px-6 md:px-16 lg:px-24 mx-auto max-w-7xl border-t border-white/5">
        <div className="text-center mb-20">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-sm font-medium text-white font-body inline-block mb-6">
            Platform Pillars
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading italic tracking-tight leading-[0.9] text-white pt-4">
            A unified, secure healthcare ecosystem.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="liquid-glass rounded-3xl p-8 hover:bg-white/[0.02] transition-colors">
            <div className="liquid-glass-strong rounded-full w-12 h-12 flex items-center justify-center mb-8 shadow-inner">
              <Zap className="w-5 h-5 text-white/90" />
            </div>
            <h3 className="text-2xl font-heading italic text-white mb-3 tracking-tight">Patient Control</h3>
            <p className="text-white/60 font-body font-light text-base leading-relaxed">Set per-file access permissions and maintain ultimate authority over your health data.</p>
          </div>
          <div className="liquid-glass rounded-3xl p-8 hover:bg-white/[0.02] transition-colors">
            <div className="liquid-glass-strong rounded-full w-12 h-12 flex items-center justify-center mb-8 shadow-inner">
              <Palette className="w-5 h-5 text-white/90" />
            </div>
            <h3 className="text-2xl font-heading italic text-white mb-3 tracking-tight">Doctor Intelligence</h3>
            <p className="text-white/60 font-body font-light text-base leading-relaxed">Create structured prescriptions and review AI summaries rather than raw medical histories.</p>
          </div>
          <div className="liquid-glass rounded-3xl p-8 hover:bg-white/[0.02] transition-colors">
            <div className="liquid-glass-strong rounded-full w-12 h-12 flex items-center justify-center mb-8 shadow-inner">
              <BarChart3 className="w-5 h-5 text-white/90" />
            </div>
            <h3 className="text-2xl font-heading italic text-white mb-3 tracking-tight">Hospital Access</h3>
            <p className="text-white/60 font-body font-light text-base leading-relaxed">Search patients and view only permitted documents. Granular access logging keeps everyone accountable.</p>
          </div>
          <div className="liquid-glass rounded-3xl p-8 hover:bg-white/[0.02] transition-colors">
            <div className="liquid-glass-strong rounded-full w-12 h-12 flex items-center justify-center mb-8 shadow-inner">
              <Shield className="w-5 h-5 text-white/90" />
            </div>
            <h3 className="text-2xl font-heading italic text-white mb-3 tracking-tight">Pharmacy + Vendor Trust</h3>
            <p className="text-white/60 font-body font-light text-base leading-relaxed">Scan prescription QRs to dispense medicine. Verify medicine authenticity via blockchain-backed hashes.</p>
          </div>
        </div>
      </section>

      {/* SECTION 7 — STATS */}
      <section className="relative min-h-[500px] flex items-center justify-center py-32 px-6 border-t border-white/5">
        <VideoBackground src="https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8" style={{ filter: 'saturate(0)' }} />
        <div className="absolute inset-0 bg-black/60 md:bg-black/30 z-0" />
        <div className="absolute top-0 left-0 right-0 h-[200px] z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, black, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-[200px] z-10 pointer-events-none" style={{ background: "linear-gradient(to top, black, transparent)" }} />
        
        <div className="relative z-20 liquid-glass rounded-[2.5rem] p-12 md:p-20 max-w-6xl mx-auto w-full shadow-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            <div className="pt-6 lg:pt-0">
              <p className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white mb-3 drop-shadow-sm">100k+</p>
              <p className="text-white/60 font-body font-light text-base">Records Secured</p>
            </div>
            <div className="pt-6 lg:pt-0">
              <p className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white mb-3 drop-shadow-sm">100%</p>
              <p className="text-white/60 font-body font-light text-base">Verifiable Access</p>
            </div>
            <div className="pt-6 lg:pt-0">
              <p className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white mb-3 drop-shadow-sm">0</p>
              <p className="text-white/60 font-body font-light text-base">Data Breaches</p>
            </div>
            <div className="pt-6 lg:pt-0">
              <p className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white mb-3 drop-shadow-sm">&lt;1s</p>
              <p className="text-white/60 font-body font-light text-base">QR Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — TESTIMONIALS */}
      <section className="py-32 px-6 md:px-16 lg:px-24 mx-auto max-w-7xl border-t border-white/5">
        <div className="text-center mb-20">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-sm font-medium text-white font-body inline-block mb-6">
            Ecosystem Trust
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading italic tracking-tight leading-[0.9] text-white pt-4">
            Built for patients, doctors, and institutions.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="liquid-glass rounded-3xl p-10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors">
            <p className="text-white/80 font-body font-light text-lg italic mb-12 leading-relaxed">
              "The AI summaries allow us to understand the patient's history in seconds without violating their detailed privacy preferences. It's a game changer."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div>
                <p className="text-white font-body font-medium text-base">Dr. Sarah Chen</p>
                <p className="text-white/50 font-body font-light text-sm">Chief Medical Officer</p>
              </div>
            </div>
          </div>
          <div className="liquid-glass rounded-3xl p-10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors">
            <p className="text-white/80 font-body font-light text-lg italic mb-12 leading-relaxed">
              "Scanning the blockchain-backed QR codes guarantees that the medicine we dispense matches the doctor's exact prescription and vendor batch."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div>
                <p className="text-white font-body font-medium text-base">Marcus Webb</p>
                <p className="text-white/50 font-body font-light text-sm">Pharmacy Manager</p>
              </div>
            </div>
          </div>
          <div className="liquid-glass rounded-3xl p-10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors">
            <p className="text-white/80 font-body font-light text-lg italic mb-12 leading-relaxed">
              "For the first time, I actually know which hospital has seen my records. The permission system gives me complete peace of mind."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div>
                <p className="text-white font-body font-medium text-base">Elena Voss</p>
                <p className="text-white/50 font-body font-light text-sm">Patient</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — CTA FOOTER */}
      <section className="relative min-h-[800px] flex flex-col items-center justify-center pt-40 pb-12 px-6 text-center border-t border-white/5">
        <VideoBackground src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8" />
        <div className="absolute inset-0 bg-black/50 md:bg-black/20 z-0" />
        <div className="absolute top-0 left-0 right-0 h-[200px] z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, black, transparent)" }} />
        
        <div className="relative z-20 flex flex-col items-center max-w-4xl pt-20">
          <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-heading italic tracking-tight leading-[0.9] text-white mb-8">
            Your secure healthcare journey starts here.
          </h2>
          <p className="text-white/60 font-body font-light text-xl mb-12 max-w-2xl">
            Join the privacy-first medical ecosystem. Take back control of your health data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href={ctaLink} className="liquid-glass-strong rounded-full px-10 py-5 font-medium text-base hover:text-white/80 transition-colors">
              Register as Patient
            </Link>
            <Link href={ctaLink} className="bg-white text-black rounded-full px-10 py-5 font-medium text-base hover:bg-white/90 transition-colors">
              Register as Institution
            </Link>
          </div>
        </div>

        <footer className="relative z-20 mt-auto w-full max-w-7xl pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white/40 text-sm font-light text-center md:text-left border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-heading italic text-xl mr-2 text-white/80">InfinityCare</span>
            <p>© 2026 InfinityCare. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white/80 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white/80 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white/80 transition-colors">Contact</Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
