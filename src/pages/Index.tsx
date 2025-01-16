import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Pricing from "@/components/home/Pricing";
import ViralSurprises from "@/components/home/ViralSurprises";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/layout/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      if (location.state.scrollTo === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-loveblue min-h-screen"
    >
      <Header />
      <Hero />
      <HowItWorks />
      <Pricing />
      <ViralSurprises />
      <FAQ />
      <Footer />
    </motion.div>
  );
};

export default Index;