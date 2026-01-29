import { ArrowLeft, MapPin, Fuel, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client.safe";
import { Skeleton } from "@/components/ui/skeleton";
import stationHero from "@/assets/station-hero.jpg";

const defaultStats = [
  { number: "78", label: "محطة", icon: Fuel },
  { number: "5", label: "مناطق", icon: MapPin },
  { number: "1998", label: "سنة التأسيس", icon: Calendar },
];

const Hero = () => {
  const { data: heroData, isLoading } = useQuery({
    queryKey: ["hero-section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_section")
        .select("*")
        .eq("is_active", true)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Use database values or defaults
  const title = heroData?.title || "شريكك الموثوق على الطريق";
  const subtitle = heroData?.subtitle || "منذ 1998";
  const description = heroData?.description || "نقدم لك تجربة متكاملة من خدمات الوقود عالي الجودة، خدمات السيارات، المتاجر، والمطاعم في جميع أنحاء المملكة العربية السعودية";
  const ctaText = heroData?.cta_text || "اكتشف خدماتنا";
  const ctaLink = heroData?.cta_link || "#services";
  const backgroundImage = heroData?.background_image_url || stationHero;

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt="محطة اوس"
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
              {title} {subtitle}
            </span>
          </div>

          {/* Main Heading - New Slogan */}
          {isLoading ? (
            <Skeleton className="h-20 w-3/4 mx-auto mb-6 bg-white/10" />
          ) : (
            <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              <span>نحو رحلة </span>
              <span className="text-gradient-gold relative">
                بلا حدود
                {/* Decorative dots */}
                <span className="absolute -left-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-secondary/70 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-secondary/40 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                </span>
              </span>
            </h1>
          )}

          {/* Subtitle */}
          {isLoading ? (
            <Skeleton className="h-8 w-2/3 mx-auto mb-6 bg-white/10" />
          ) : (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {description}
            </p>
          )}

          {/* Million Customers Banner */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-secondary/30 via-secondary/20 to-secondary/30 backdrop-blur-sm rounded-full px-8 py-4 border border-secondary/50 mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Users className="w-6 h-6 text-secondary" />
            <span className="text-white font-medium">
              نفخر بخدمة أكثر من <span className="text-secondary font-bold">مليون</span> عميل سنوياً
            </span>
            <Users className="w-6 h-6 text-secondary" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg px-8 py-6 shadow-gold transition-all duration-300 hover:scale-105"
              onClick={() => scrollToSection(ctaLink)}
            >
              {ctaText}
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/50 text-white bg-white/10 hover:bg-white hover:text-primary font-bold text-lg px-8 py-6 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              onClick={() => scrollToSection("#contact")}
            >
              تواصل معنا
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            {defaultStats.map((stat, index) => (
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
            ))}
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
