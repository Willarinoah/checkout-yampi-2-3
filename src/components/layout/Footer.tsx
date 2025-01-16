import { Heart, Share2, Instagram, FileHeart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };
  
  return (
    <footer className="bg-loveblue border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-lovepink" fill="currentColor" />
              <span className="text-white text-xl font-bold">Memorys</span>
            </div>
            <p className="text-gray-400">
              {t("create_beautiful")}
            </p>
            <div className="space-y-2">
              <p className="text-gray-400">{t("contact_phone")}: +5524992684832</p>
              <p className="text-gray-400">{t("contact_email")}: contact@memoryys.com</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">{t("product")}</h3>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-lovepink">{t("how_it_works_title")}</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-lovepink">{t("pricing_title")}</button></li>
              <li><button onClick={() => scrollToSection('top')} className="text-gray-400 hover:text-lovepink">{t("home_title")}</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">{t("legal")}</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-lovepink">{t("privacy_policy")}</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-lovepink">{t("terms_of_service")}</Link></li>
              <li><span className="text-gray-400">CNPJ: 49.595.923/0001-22</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">{t("share")}</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-lovepink">
                <Share2 className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-lovepink">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-lovepink">
                <FileHeart className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Memorys. {t("all_rights_reserved")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;