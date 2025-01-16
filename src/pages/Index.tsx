import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Heart, ArrowRight } from "lucide-react";

const Index = () => {
  const location = useLocation();
  const { t } = useLanguage();

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
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t("surprise")} <span className="text-lovepink">{t("your_love")}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {t("create_counter")}
            </p>
            <Button
              className="bg-lovepink hover:bg-lovepink/90 text-white px-8 py-6 rounded-full text-lg font-semibold flex items-center gap-2 mx-auto"
            >
              {t("create_website")}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="bg-white/10 border-none p-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 * index }}
                  className="flex flex-col items-center text-center"
                >
                  <Heart className="w-12 h-12 text-lovepink mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t("how_it_works")}
                  </h3>
                  <p className="text-gray-300">
                    {t("share_love")}
                  </p>
                </motion.div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </motion.div>
  );
};

export default Index;