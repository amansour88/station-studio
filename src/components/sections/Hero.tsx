import { ArrowLeft, ArrowRight, MapPin, Fuel, Calendar, Users, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import stationHero from "@/assets/station-hero.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import type { HeroSection as HeroSectionType } from "@/types/api";

// Icon mapping for dynamic icons from database
const iconMap: Record<string, LucideIcon> = {
  Fuel,
  MapPin,
  Calendar,
  Users,
};

const Hero = () => {
  const { t, language } = useLanguage();
  
  const { data: heroData } = useQuery({
    queryKey: ["hero-section"],
    queryFn: async () => {
      return api.get<HeroSectionType | null>("/hero/get.php");
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Default stats from translations if no API data
  const defaultStats = [
    { number: "78", label: t("hero.stations"), icon: "Fuel" },
    { number: "5", label: t("hero.regions"), icon: "MapPin" },
    { number: "1998", label: t("hero.founded"), icon: "Calendar" },
  ];

  // Use API stats if available, otherwise defaults
  const stats = heroData?.stats?.length ? heroData.stats : defaultStats;

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Use database values if available, otherwise fall back to translations
  const title = heroData?.title || t("hero.title");
  const subtitle = heroData?.subtitle || t("hero.titleHighlight");
  const description = heroData?.description || t("hero.description");
  const ctaText = heroData?.cta_text || t("hero.cta");
  const ctaLink = heroData?.cta_link || "#services";
  const backgroundImage = heroData?.background_image_url || stationHero;

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={language === "ar" ? "محطة اوس" : "AWS Station"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />

      {/* Content */}
      <div className="container relative z-10 px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-white/90 font-medium">
              {t("hero.badge")}
            </span>
          </div>

          {/* Main Heading - Use database title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            <span>{title} </span>
            <span className="text-gradient-gold">{subtitle}</span>
            {/* Animated arrows - car path effect */}
            <span className={`inline-flex items-center ${language === "ar" ? "mr-6" : "ml-6"} align-baseline translate-y-0.5`}>
              <span className={`flex text-secondary text-xl md:text-3xl lg:text-4xl font-black ${language === "en" ? "flex-row-reverse" : ""}`}>
                <span className="animate-pulse opacity-100" style={{ animationDelay: "0s" }}>›</span>
                <span className={`animate-pulse opacity-80 ${language === "ar" ? "mr-1 md:mr-2" : "ml-1 md:ml-2"}`} style={{ animationDelay: "0.15s" }}>›</span>
                <span className={`animate-pulse opacity-60 ${language === "ar" ? "mr-1 md:mr-2" : "ml-1 md:ml-2"}`} style={{ animationDelay: "0.3s" }}>›</span>
                <span className={`animate-pulse opacity-45 ${language === "ar" ? "mr-1 md:mr-2" : "ml-1 md:ml-2"}`} style={{ animationDelay: "0.4s" }}>›</span>
                <span className={`animate-pulse opacity-30 ${language === "ar" ? "mr-1 md:mr-2" : "ml-1 md:ml-2"}`} style={{ animationDelay: "0.5s" }}>›</span>
                <span className={`animate-pulse opacity-20 ${language === "ar" ? "mr-1 md:mr-2" : "ml-1 md:ml-2"}`} style={{ animationDelay: "0.6s" }}>›</span>
              </span>
            </span>
          </h1>

          {/* Subtitle/Description - Use database description */}
          <p 
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 animate-fade-in-up" 
            style={{ animationDelay: "0.2s" }}
            dangerouslySetInnerHTML={{ __html: description }}
          />

          {/* Million Customers Banner */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-secondary/30 via-secondary/20 to-secondary/30 backdrop-blur-sm rounded-full px-8 py-4 border border-secondary/50 mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Users className="w-6 h-6 text-secondary" />
            <span className="text-white font-medium">
              {t("hero.millionCustomers")} <span className="text-secondary font-bold">{t("hero.million")}</span> {t("hero.customersYearly")}
            </span>
            <Users className="w-6 h-6 text-secondary" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg px-8 py-6 shadow-gold transition-all duration-300 hover:scale-105"
              onClick={() => scrollToSection(ctaLink)}
            >
              {ctaText}
              <ArrowIcon className={`w-5 h-5 ${language === "ar" ? "mr-2" : "ml-2"}`} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-bold text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
              onClick={() => scrollToSection("#contact")}
            >
              {t("nav.contact")}
            </Button>
          </div>

          {/* Stats - Now dynamic from database */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            {stats.map((stat, index) => {
              const IconComponent = iconMap[stat.icon] || Fuel;
              return (
                <div 
                  key={index}
                  className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-secondary/50 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-3xl md:text-4xl font-bold text-secondary mb-1 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-white/70 text-sm md:text-base">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
