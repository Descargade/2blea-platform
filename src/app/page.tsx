"use client";
import { LenisProvider } from "@/components/landing/lenis-provider";
import { HeroSection } from "@/components/landing/hero";
import { ServicesSection } from "@/components/landing/services";
import { OffersSection } from "@/components/landing/offers";
import { BudgetCalculator } from "@/components/landing/budget-calculator";
import { CTASection } from "@/components/landing/cta";
import { ContactSection } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <LenisProvider>
      <div className="min-h-screen bg-premium-black text-white">
        <HeroSection />
        <ServicesSection />
        <OffersSection />
        <BudgetCalculator />
        <CTASection />
        <ContactSection />
        <Footer />
      </div>
    </LenisProvider>
  );
}
