"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "@/lib/api";
import type { OfferItem } from "@/types";
import { Skeleton } from "@/components/shared/loading";
import { Clock, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(endDate).getTime();

    function update() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) return setTimeLeft("Finalizado");

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    }

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) return null;

  return (
    <span className="text-xs text-gray-500 flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {timeLeft}
    </span>
  );
}

export function OffersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["landing-offers"],
    queryFn: async () => {
      const res = await api.get("/offers");
      return (res.data.data ?? res.data) as OfferItem[];
    },
    staleTime: 120_000,
  });

  const offers = (Array.isArray(data) ? data : []).filter((o) => o.active);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [offers]);

  if (!isLoading && offers.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 lg:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-premium-darker via-premium-black to-premium-darker" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-premium-violet/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-premium-accent mb-4">
            <Sparkles className="w-4 h-4" />
            Ofertas especiales
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ahorrá en tu <span className="text-gradient">proyecto</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Promociones limitadas para impulsar tu presencia digital.
          </p>
        </div>

        <div
          ref={contentRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="premium-card h-48">
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-8 w-24 mb-4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            : offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`premium-card relative overflow-hidden group ${
                    offer.featured
                      ? "border-premium-violet/40 ring-1 ring-premium-violet/20"
                      : ""
                  }`}
                >
                  {offer.featured && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-premium-violet/10 rounded-bl-full" />
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="glass text-xs px-3 py-1 rounded-full text-green-400 border border-green-500/20">
                        {offer.discount}% OFF
                      </span>
                      {offer.featured && (
                        <span className="glass text-xs px-2 py-1 rounded-full text-premium-accent border border-premium-violet/20 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Destacada
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {offer.description}
                    </p>
                    <div className="flex items-center justify-between">
                      {offer.endDate && <Countdown endDate={offer.endDate} />}
                      {offer.service && (
                        <span className="text-xs text-gray-600">
                          {offer.service.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
