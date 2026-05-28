"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-20, 20, -20],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
  },
};

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current.querySelectorAll(".hero-word"),
          { y: 80, opacity: 0, rotateX: -35 },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.04, ease: "power4.out" }
        );
      }
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.8, ease: "power3.out" }
        );
      }
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 1.2, ease: "power3.out" }
        );
      }
    }, titleRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-x-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-radial from-premium-violet/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-premium-violet/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-premium-glow/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "1s" }} />

      <motion.div
        className="absolute top-1/3 right-[15%] w-24 h-24 glass rounded-2xl"
        variants={floatingVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute bottom-1/3 left-[15%] w-20 h-20 glass rounded-full"
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 sm:mb-8 text-sm text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Disponibles para nuevos proyectos
        </motion.div>

        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-5 sm:mb-6 leading-[1.15] sm:leading-[1.1]"
        >
          <span className="hero-word inline-block" style={{ opacity: 0 }}>
            <span className="text-gradient">Transformamos</span>
          </span>
          <br />
          <span className="hero-word inline-block" style={{ opacity: 0 }}>
            <span className="text-white">tu</span>
          </span>{" "}
          <span className="hero-word inline-block" style={{ opacity: 0 }}>
            <span className="text-white">idea</span>
          </span>{" "}
          <span className="hero-word inline-block" style={{ opacity: 0 }}>
            <span className="text-white">en</span>
          </span>{" "}
          <span className="hero-word inline-block" style={{ opacity: 0 }}>
            <span className="text-white">realidad</span>
          </span>
          <span className="hero-word inline-block" style={{ opacity: 0 }}>
            <span className="text-premium-accent">.</span>
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed px-2"
          style={{ opacity: 0 }}
        >
          Creamos experiencias digitales premium que impulsan tu negocio.
          Desarrollo web profesional con diseño cinematográfico.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center"
        >
          <a
            href="#presupuesto"
            className="premium-button text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 inline-flex items-center justify-center gap-2 group"
          >
            Pedir presupuesto
            <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="/servicios"
            className="premium-button-outline text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 inline-flex items-center justify-center"
          >
            Conocé nuestros servicios
          </a>
        </div>

        <div className="mt-6 sm:mt-8">
          <a
            href="/cliente/login"
            className="text-gray-500 hover:text-premium-accent transition-colors text-sm"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </div>

        <div className="mt-10 sm:mt-16 flex items-center justify-center gap-2 sm:gap-8 text-gray-500 text-sm flex-wrap">
          {["Desarrollo Web", "Diseño UI/UX", "E-commerce", "Sistemas"].map(
            (tag) => (
              <span key={tag} className="glass rounded-full px-3 py-1.5 text-xs">
                {tag}
              </span>
            )
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-premium-black to-transparent" />
    </section>
  );
}
