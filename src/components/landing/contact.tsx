"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageCircle, Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = "2622530837";
const EMAIL = "gonzalezlucasaaron@gmail.com";

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = sectionRef.current;
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll(".anim-up"),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-premium-darker to-premium-black" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="anim-up mb-16">
          <span className="text-premium-accent text-sm uppercase tracking-[0.2em] mb-4 block">
            Contacto
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Hablemos de tu <span className="text-gradient">proyecto</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Estamos listos para transformar tu idea en realidad. Elegí el canal que prefieras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="anim-up premium-card group flex items-center gap-4 hover:border-green-500/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-medium">WhatsApp</p>
              <p className="text-sm text-gray-400">Respuesta rápida</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href={`mailto:${EMAIL}`}
            className="anim-up premium-card group flex items-center gap-4 hover:border-premium-accent/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-premium-accent/10 flex items-center justify-center group-hover:bg-premium-accent/20 transition-colors">
              <Mail className="w-6 h-6 text-premium-accent" />
            </div>
            <div className="text-left">
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-400">{EMAIL}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
