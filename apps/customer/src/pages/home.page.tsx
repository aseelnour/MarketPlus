import { useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "../components/home/hero-section.home";
import StatsSection from "../components/home/stats-section.home";
import FeaturedStores from "../components/home/featured-stores.home";
import CategoryFilter from "../components/home/category-filter.home";
import ProductGrid from "../components/home/product-grid.home";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <HeroSection />
      <StatsSection />
      <FeaturedStores />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <ProductGrid selectedCategory={selectedCategory} />
    </motion.div>
  );
};

export default Home;
