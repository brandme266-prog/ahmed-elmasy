import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import ArticlesSection from "@/components/ArticlesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SchemaMarkup from "@/components/SchemaMarkup";
import MetaTags from "@/components/MetaTags";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen">
      <MetaTags />
      <SchemaMarkup />
      <Navbar />
      <HeroSection />
      <FeaturedProducts />
      <FeaturesSection />
      <AboutSection />
      <ArticlesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
