import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PartnersSection from "@/components/PartnersSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import EventsSection from "@/components/EventsSection";
import QRSecuritySection from "@/components/QRSecuritySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "signup">("signup");

  const openModal = (tab: "login" | "signup") => {
    setModalTab(tab);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenModal={openModal} />
      <HeroSection onOpenModal={openModal} />
      <PartnersSection />
      <FeaturesSection />
      <HowItWorksSection />
      <EventsSection onOpenModal={openModal} />
      <QRSecuritySection />
      <TestimonialsSection />
      <PricingSection onOpenModal={openModal} />
      <CTASection onOpenModal={openModal} />
      <ContactSection />
      <Footer />
      <AuthModal
        open={modalOpen}
        tab={modalTab}
        onClose={() => setModalOpen(false)}
        onTabChange={setModalTab}
      />
    </div>
  );
};

export default Index;
