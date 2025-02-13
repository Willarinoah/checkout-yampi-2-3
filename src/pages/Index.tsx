
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
import { trackPageView } from "@/lib/analytics/events";
import { detectUserLocation } from "@/lib/location-detector";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view with location
    const initializeAnalytics = async () => {
      try {
        const locationInfo = await detectUserLocation();
        trackPageView('Homepage', locationInfo ? {
          country: locationInfo.country_code,
          region: locationInfo.region,
          city: locationInfo.city
        } : undefined);
      } catch (error) {
        console.error('Error in analytics initialization:', error);
        // Still track page view without location data
        trackPageView('Homepage');
      }
    };

    initializeAnalytics();

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
