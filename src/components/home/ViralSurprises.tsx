import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const surprises = [
  {
    image: "/surpresa-1.jpg.PNG",
    username: "@zoemeireles",
    views: "11,4 mil",
    comments: "104",
    likes: "8.431",
    description: "Surpreenda seu amor"
  },
  {
    image: "/surpresa-2.jpg.PNG",
    username: "Lucas Lima",
    views: "18,3 mil",
    comments: "857",
    likes: "570 mil",
    description: "POV: achei um presente fofo e criativo para minha namorada"
  },
  {
    image: "/surpresa-3.jpg.PNG",
    username: "Tata & Diogo",
    views: "60",
    comments: "19",
    likes: "3.380",
    description: "POV: você achou o presente perfeito para o seu par"
  },
  {
    image: "/surpresa-4.jpg.PNG",
    username: "@zoemeireles",
    views: "3.412",
    comments: "312",
    likes: "87 mil",
    description: "Contando o tempo juntos p/ sempre"
  }
];

const ViralSurprises = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-1">
      <div className="container mx-auto px-2 md:px-24 lg:px-31 xl:max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-center text-white mb-3"
        >
          {t("surprises_that")}
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-8 text-center text-lovepink"
        >
          {t("went_viral")}
        </motion.h2>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide" style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {surprises.map((surprise, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-none w-72"
            >
              <div className="bg-gray-900/50 rounded-2xl overflow-hidden">
                <div className="relative aspect-[9/16] w-full">
                  <img
                    src={surprise.image}
                    alt={surprise.description}
                    className="object-cover h-full w-full"
                  />
                </div>
              </div>
              <p className="text-center text-white mt-2 bg-gray-900/50 py-2 rounded-lg">
                {surprise.username}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ViralSurprises;