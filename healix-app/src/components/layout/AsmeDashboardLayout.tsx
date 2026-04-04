"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { Globe, Bell, LogOut, ArrowRight, ArrowUpRight } from "lucide-react";

// -- Custom looping crossfade video for the Hero section --
function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [opacity, setOpacity] = useState(0);
  const opacityRef = useRef(0);
  const isFadingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let frameId: number;

    const fadeStep = (target: number, duration: number, callback?: () => void) => {
      const startOpacity = opacityRef.current;
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentOpacity = startOpacity + (target - startOpacity) * progress;
        
        opacityRef.current = currentOpacity;
        setOpacity(currentOpacity);

        if (progress < 1) {
          frameId = requestAnimationFrame(animate);
        } else if (callback) {
          callback();
        }
      };
      
      cancelAnimationFrame(frameId); // prevent overlapping animations
      frameId = requestAnimationFrame(animate);
    };

    const handleCanPlay = () => {
      if (opacityRef.current === 0 && !isFadingRef.current) {
        opacityRef.current = 1;
        setOpacity(1); // Manage fade state initially
      }
    };

    const handleTimeUpdate = () => {
      if (video.duration - video.currentTime <= 0.55 && opacityRef.current === 1 && !isFadingRef.current) {
        isFadingRef.current = true;
        fadeStep(0, 500, () => {
          video.currentTime = 0;
          video.play().catch((e) => console.error("Video play failed:", e));
          fadeStep(1, 500, () => {
            isFadingRef.current = false;
          });
        });
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    
    if (video.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      cancelAnimationFrame(frameId);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      autoPlay
      playsInline
      preload="auto"
      style={{ opacity }}
      className="absolute inset-0 w-full h-full object-cover translate-y-[calc(17%+100px)] z-0"
      src={src}
    />
  );
}

export interface AsmeDashboardLayoutProps {
  // Top nav
  role: string;
  unreadCount?: number;
  onNotificationsClick?: () => void;
  onSignOut: () => void;

  // Hero Section
  heroVideoSrc?: string;
  heroProps: {
    title: ReactNode;
    statText?: string;
    statIcon?: ReactNode;
    onStatClick?: () => void;
    description: string;
    primaryAction?: { label: string; icon: ReactNode; onClick: () => void };
    bottomActions?: { icon: ReactNode; onClick: () => void }[];
  };

  // About Section
  aboutProps?: {
    topText: string;
    heading: ReactNode;
  };

  // Featured Section
  featuredVideoProps?: {
    videoSrc: string;
    tagText: string;
    description: string;
    action: { label: string; onClick: () => void };
  };

  // Philosophy Section
  philosophyProps?: {
    heading: ReactNode;
    videoSrc: string;
    tagText1: string;
    desc1: string;
    tagText2: string;
    action: { label: string; icon: ReactNode; onClick: () => void };
  };

  // Services Section
  servicesProps?: {
    heading: ReactNode;
    tagText: string;
    cards: Array<{
      videoSrc: string;
      tagText: string;
      title: string;
      description: string;
      onClick: () => void;
    }>;
  };

  children?: ReactNode; // For modals to render outside
}

export function AsmeDashboardLayout({
  role,
  unreadCount = 0,
  onNotificationsClick,
  onSignOut,
  heroVideoSrc = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_050931_6b868bbb-85a4-498d-921e-e815d5a55906.mp4",
  heroProps,
  aboutProps,
  featuredVideoProps,
  philosophyProps,
  servicesProps,
  children,
}: AsmeDashboardLayoutProps) {
  // --- SECTION REFS FOR ANIMATIONS ---
  const aboutRef = useRef(null);
  const isAboutInView = useInView(aboutRef, { once: true, margin: "-100px" });

  const featRef = useRef(null);
  const isFeatInView = useInView(featRef, { once: true, margin: "-100px" });

  const philRef = useRef(null);
  const isPhilInView = useInView(philRef, { once: true, margin: "-100px" });

  const servRef = useRef(null);
  const isServInView = useInView(servRef, { once: true, margin: "-100px" });

  return (
    <div className="bg-black min-h-screen text-white font-body selection:bg-white/30 selection:text-white">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen w-full flex flex-col items-center overflow-hidden">
        <HeroVideo src={heroVideoSrc} />
        <div className="absolute inset-0 bg-black/30 z-[1]" />
        
        {/* Navbar */}
        <nav className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-6">
          <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-lg tracking-tight">InfinityCare</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <span className="text-white/80 text-sm font-medium hover:text-white transition-colors cursor-pointer capitalize">{role.toLowerCase()}</span>
              <span className="text-white/80 text-sm font-medium hover:text-white transition-colors cursor-pointer">Vault</span>
              <span className="text-white/80 text-sm font-medium hover:text-white transition-colors cursor-pointer">Security</span>
            </div>
            <div className="flex items-center gap-4">
              {onNotificationsClick && (
                <div className="relative">
                  <button onClick={onNotificationsClick} className="text-white text-sm font-medium pl-4 pr-2 hover:text-white/80 transition-colors flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 right-0 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    )}
                  </button>
                </div>
              )}
              <button 
                onClick={onSignOut} 
                className="liquid-glass rounded-full px-5 py-2 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                Sign Out
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center -translate-y-[20%] text-center px-4 w-full">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white tracking-tight whitespace-nowrap mb-8 leading-[1.1]">
            {heroProps.title}
          </h1>
          
          {heroProps.statText && heroProps.onStatClick && (
            <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center mb-6 max-w-sm w-full">
              <span className="text-white/80 text-sm font-medium flex-1 text-left line-clamp-1">
                {heroProps.statText}
              </span>
              <button 
                onClick={heroProps.onStatClick}
                className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition-transform"
              >
                {heroProps.statIcon}
              </button>
            </div>
          )}
          
          <p className="text-white/60 text-sm leading-relaxed px-4 max-w-md mb-8">
            {heroProps.description}
          </p>
          
          {heroProps.primaryAction && (
            <button 
              onClick={heroProps.primaryAction.onClick}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              {heroProps.primaryAction.icon}
              {heroProps.primaryAction.label}
            </button>
          )}
        </div>

        {/* Bottom indicators */}
        {heroProps.bottomActions && heroProps.bottomActions.length > 0 && (
          <div className="absolute bottom-8 z-10 flex items-center gap-4">
            {heroProps.bottomActions.map((action, i) => (
              <button 
                key={i} 
                onClick={action.onClick} 
                className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/10 transition-colors tooltip pb-3"
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: ABOUT */}
      {aboutProps && (
        <section ref={aboutRef} className="pt-32 md:pt-44 pb-10 md:pb-14 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-white/40 text-sm tracking-widest uppercase mb-16"
            >
              {aboutProps.topText}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-sans text-white leading-[1.1] tracking-tight max-w-4xl"
            >
              {aboutProps.heading}
            </motion.div>
          </div>
        </section>
      )}

      {/* SECTION 3: FEATURED VIDEO */}
      {featuredVideoProps && (
        <section ref={featRef} className="pt-6 md:pt-10 pb-20 md:pb-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={isFeatInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9 }}
              className="relative rounded-3xl overflow-hidden aspect-video group"
            >
              <video
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                src={featuredVideoProps.videoSrc}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row items-end justify-between z-10 gap-6">
                <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md w-full">
                  <p className="text-white/50 text-xs tracking-widest uppercase mb-3">{featuredVideoProps.tagText}</p>
                  <p className="text-white text-sm md:text-base leading-relaxed">
                    {featuredVideoProps.description}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={featuredVideoProps.action.onClick}
                  className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                >
                  {featuredVideoProps.action.label}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* SECTION 4: PHILOSOPHY */}
      {philosophyProps && (
        <section ref={philRef} className="py-28 md:py-40 px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isPhilInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24"
          >
            {philosophyProps.heading}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isPhilInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-3xl overflow-hidden aspect-[4/3] relative"
            >
              <video
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                src={philosophyProps.videoSrc}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isPhilInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col justify-center gap-8"
            >
              <div>
                <p className="text-white/40 text-xs tracking-widest uppercase mb-4">{philosophyProps.tagText1}</p>
                <p className="text-white/70 text-base md:text-lg leading-relaxed">
                  {philosophyProps.desc1}
                </p>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div>
                <p className="text-white/40 text-xs tracking-widest uppercase mb-4">{philosophyProps.tagText2}</p>
                <button 
                  onClick={philosophyProps.action.onClick}
                  className="liquid-glass rounded-full px-6 py-3 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
                >
                  {philosophyProps.action.icon}
                  {philosophyProps.action.label}
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* SECTION 5: SERVICES */}
      {servicesProps && (
        <section ref={servRef} className="py-28 md:py-40 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />
          
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isServInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="flex items-baseline justify-between mb-16"
            >
              <h2 className="text-3xl md:text-5xl text-white tracking-tight">{servicesProps.heading}</h2>
              <p className="text-white/40 text-sm hidden md:block">{servicesProps.tagText}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {servicesProps.cards.map((card, i) => (
                <motion.button
                  key={i}
                  onClick={card.onClick}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isServInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.15 + (i * 0.15) }}
                  className="group liquid-glass rounded-3xl overflow-hidden relative text-left"
                >
                  <div className="aspect-video w-full h-full relative overflow-hidden">
                    <video
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={card.videoSrc}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/40 text-xs tracking-widest uppercase">{card.tagText}</span>
                      <div className="liquid-glass rounded-full p-2 text-white/60 group-hover:text-white transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl text-white mb-2 tracking-tight">{card.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Render Modals at the bottom */}
      {children}
    </div>
  );
}
