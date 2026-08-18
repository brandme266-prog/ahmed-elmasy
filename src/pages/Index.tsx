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

const Index = () => {
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
