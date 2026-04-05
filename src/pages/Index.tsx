import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TickerBar from "@/components/TickerBar";
import FeaturesSection from "@/components/FeaturesSection";
import EventsSection from "@/components/EventsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PartnersSection from "@/components/PartnersSection";
import CTASection from "@/components/CTASection";
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
      <TickerBar />
      <FeaturesSection />
      <EventsSection onOpenModal={openModal} />
      <HowItWorksSection />
      <TestimonialsSection />
      <PartnersSection />
      <CTASection onOpenModal={openModal} />
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
