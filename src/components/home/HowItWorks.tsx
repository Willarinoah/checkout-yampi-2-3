import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      image: "/images/how-it-works/form.png",
      title: t("fill_details"),
      number: "1",
    },
    {
      image: "/images/how-it-works/payment.png",
      title: t("make_payment"),
      number: "2",
    },
    {
      image: "/images/how-it-works/email.png",
      title: t("receive_site_qr"),
      number: "3",
    },
    {
      image: "/images/how-it-works/surprise.png",
      title: t("surprise_loved_one"),
      number: "4",
    }
  ];

  return (
    <div id="how-it-works" className="py-20 bg-loveblue">
      <section className="py-16 bg-[#0b1221]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-start gap-12 md:gap-24">
            {/* Left side - Title and decorations */}
            <div className="md:w-1/3 w-full text-center md:text-left">
              <div className="relative">
                <div className="flex justify-between items-start">
                  <h2 className="text-5xl font-bold text-white leading-tight">
                    <span className="block">{t("how")}</span>
                    <span className="block">{t("it_works")}</span>
                  </h2>
                  <img 
                    src="/images/how-it-works/heart-bubble.png" 
                    alt="Heart bubble" 
                    className="w-24 h-24"
                  />
                </div>
                <img 
                  src="/images/how-it-works/arrow.svg" 
                  alt="Arrow" 
                  className="mt-12 w-48 md:block hidden"
                />
              </div>
            </div>

            {/* Right side - Steps grid */}
            <div className="grid grid-cols-1 gap-6 md:w-2/3 md:grid-cols-2 w-full">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#00112B] rounded-2xl overflow-hidden"
                >
                  <div className="p-8 flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-white mb-8 text-center">
                      {step.number}. {step.title}
                    </h3>
                    <div className="relative w-full flex items-center justify-center min-h-[300px]">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="max-w-[80%] h-auto object-contain mx-auto"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;