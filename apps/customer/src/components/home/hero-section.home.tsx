import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-violet-700 via-violet-600 to-violet-500 p-4 md:p-6 mb-5 shadow-[0_24px_48px_rgba(109,28,217,0.12)] min-h-[200px] max-h-[280px]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,_rgba(255,255,255,0.35),_transparent_45%)]" />
      <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_auto] items-center">
        <div className="max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white/90 mb-4">
            <Sparkles className="w-4 h-4" />
            {t("hero.badge") || "Summer Sale — up to 50% off"}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {t("hero.title") || "Discover Every Store & Product"}
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl">
            {t("hero.subtitle") || "Thousands of products from verified stores"}
          </p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white text-violet-700 px-4 py-2 text-sm font-semibold shadow-md shadow-white/15 transition hover:scale-[1.01]">
            {t("hero.button") || "Browse Stores"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden lg:block relative w-[260px] h-[160px] rounded-[16px] overflow-hidden shadow-lg shadow-violet-900/10 border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_50%)]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512428559087-a4c1f8f1c4af?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
