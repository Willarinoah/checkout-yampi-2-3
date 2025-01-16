import { motion } from "framer-motion";
import { ArrowRight, Instagram, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom"; // Importando o hook de navegação

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate(); // Adicionando a navegação

  const handleCreateSite = () => {
    navigate('/create'); // Redireciona para a página de criação de memorial
  };

  return (
    <div className="min-h-screen pt-32 bg-loveblue">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl lg:text-7xl font-bold mb-6 text-white">
              {t("surprise")} <br />
              <span className="text-lovepink">{t("your_love")}</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              {t("create_counter")} {t("share_love")} {t("scan_qr")}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleCreateSite} // Adicionando o evento de clique
              className="bg-lovepink text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-colors"
            >
              {t("create_website")}
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <div className="flex flex-col text-center lg:flex-row gap-6 mt-12">
              <div className="text-gray-400">{t("featured_on")}</div>
              <div className="flex justify-center gap-6">
                <Instagram className="w-6 h-6 text-gray-400 hover:text-lovepink cursor-pointer transition-colors" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="w-6 h-6 text-gray-400 hover:text-lovepink cursor-pointer transition-colors"
                >
                  <path
                    fill="currentColor"
                    d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  className="w-6 h-6 text-gray-400 hover:text-lovepink cursor-pointer transition-colors"
                >
                  <path
                    fill="currentColor"
                    d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"
                  />
                </svg>
              </div>
              <div className="text-gray-400 text-center lg:text-left">
                {t("happy_couples")}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-[300px] h-[600px] mx-auto">
              <div className="absolute inset-0 bg-lovepink/20 blur-[100px] animate-pulse" />
              <div className="relative z-10 w-full h-full bg-gray-900 rounded-[3rem] border-8 border-gray-800 overflow-hidden">
                <img
                  src="/images/how-it-works/mockup-phone.png"
                  alt="Phone Mockup"
                  className="w-[300px] h-[300px] object-cover mx-auto"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  >
                  <div className="w-60 h-60 bg-white rounded-lg flex items-center justify-center relative">
                    <div className="absolute -top-2 -right-2">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Heart
                          className="w-8 h-8 text-lovepink"
                          fill="currentColor"
                        />
                      </motion.div>
                    </div>
                    <img
                      src="/images/how-it-works/qr-code.png.svg"
                      alt="QR Code"
                      className="w-360 h-360 object-cover mx-auto"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
