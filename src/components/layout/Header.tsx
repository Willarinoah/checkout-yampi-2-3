import { Heart, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-loveblue/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Heart className="w-6 h-6 text-lovepink" fill="currentColor" />
          <span className="text-white text-xl font-bold">Memorys</span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{language.toUpperCase()}</span>
        </motion.button>
      </div>
    </header>
  );
};

export default Header;