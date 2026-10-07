import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import EventsSection from "@/components/EventsSection";
import QRSecuritySection from "@/components/QRSecuritySection";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [eventSearch, setEventSearch] = useState("");
  const openModal = (tab: "login" | "signup") => {
    navigate(tab === "signup" ? "/signup" : "/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div id="home"><HeroSection onOpenModal={openModal} onExplore={(query) => { setEventSearch(query); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }} /></div>
      <FeaturesSection />
      <EventsSection onOpenModal={openModal} searchTerm={eventSearch} />
      <HowItWorksSection />
      <QRSecuritySection />
      <PricingSection onOpenModal={openModal} />
      <CTASection onOpenModal={openModal} />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
