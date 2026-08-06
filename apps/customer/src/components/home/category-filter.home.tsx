import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categoryEmojis: Record<string, string> = {
  All: "✨",
  Electronics: "📱",
  Fashion: "👗",
  Home: "🏠",
  Beauty: "💄",
  Sports: "⚽",
  Food: "🍕",
  Books: "📚",
  Cars: "🚗",
  Clothing: "👕",
  Furniture: "🛋️",
  Health: "💊",
  Makeup: "💋",
  Toys: "🧸",
};

const getCategoryDisplay = (category: string, t: any): string => {
  const emoji = categoryEmojis[category] || "📌";

  if (category === "All") {
    return `${emoji} ${t("categories.all") || "All"}`;
  }

  const translated = t(`categories.${category.toLowerCase()}`) || category;
  return `${emoji} ${translated}`;
};

const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setLoading(true);
      try {
        const res = await api.get("/customers/products/categories");
        if (mounted) {
          setCategories(["All", ...(res.data.categories || [])]);
        }
      } catch (error) {
        console.error("Failed to fetch product categories", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        {t("home.browseByCategory") || "Browse by Category"}
      </h2>
      <div className="flex flex-wrap gap-3">
        {(loading ? ["All"] : categories).map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectCategory(category)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition-all ${
              selectedCategory === category
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "bg-white text-slate-600 border border-violet-100 hover:border-violet-200 hover:text-violet-700"
            }`}
          >
            {getCategoryDisplay(category, t)}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
