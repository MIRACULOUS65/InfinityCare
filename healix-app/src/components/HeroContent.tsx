"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import { BlurText } from "./BlurText";

export function HeroContent({ ctaLink }: { ctaLink: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center pt-[200px] px-6">
      <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-4">
        <span className="bg-white text-black px-2 py-0.5 rounded-full mr-2">Zero-Trust</span>
        Introducing Privacy-First Healthcare.
      </div>

      <BlurText
        text="Medical Data. Under Your Control."
        className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-foreground leading-[0.8] tracking-[-4px] max-w-4xl mt-4"
      />

      <motion.p
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 text-white/60 font-body font-light text-xl max-w-2xl"
      >
        Patients own the data. Doctors read AI summaries. Hospitals access what is permitted. Medicine authenticity is verifiable.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="mt-10 flex items-center gap-6"
      >
        <Link href={ctaLink} className="liquid-glass-strong rounded-full px-8 py-4 flex items-center justify-center gap-2 font-medium text-sm">
          Get Started
          <ArrowUpRight className="w-4 h-4" />
        </Link>
        <button className="flex items-center gap-2 font-body text-sm font-medium hover:text-white/80 transition-colors">
          Watch the Film
          <Play className="w-4 h-4 fill-white" />
        </button>
      </motion.div>
    </div>
  );
}
