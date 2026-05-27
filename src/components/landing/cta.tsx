"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = sectionRef.current;
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll(".anim-up"),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
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
    <section ref={sectionRef} className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-premium-darker" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-premium-violet/30 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-premium-violet/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="anim-up">
          <span className="text-premium-accent text-sm uppercase tracking-[0.2em] mb-4 block">
            Listo para empezar
          </span>
        </div>
        <h2 className="anim-up text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Transformemos tu<br />
          <span className="text-gradient">idea en realidad</span>
        </h2>
        <p className="anim-up text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
          Contanos qué necesitás y te enviaremos un presupuesto personalizado en menos de 24 horas.
        </p>
        <div className="anim-up flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#presupuesto"
            className="premium-button text-lg px-10 py-4 inline-flex items-center gap-2 group"
          >
            Solicitar presupuesto
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href={`https://wa.me/5492622530837`}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-button-outline text-lg px-10 py-4"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
