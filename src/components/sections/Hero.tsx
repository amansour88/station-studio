import { ArrowLeft, MapPin, Fuel, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import stationHero from "@/assets/station-hero.jpg";

const stats = [
  { number: "78", label: "محطة", icon: Fuel },
  { number: "5", label: "مناطق", icon: MapPin },
  { number: "1998", label: "سنة التأسيس", icon: Calendar },
];

const Hero = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={stationHero}
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
              شريكك الموثوق على الطريق منذ 1998
            </span>
          </div>

          {/* Main Heading - New Slogan */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            <span className="block">نحو رحلة</span>
            <span className="text-gradient-gold">بلا حدود</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            نقدم لك تجربة متكاملة من خدمات الوقود عالي الجودة، خدمات السيارات، 
            المتاجر، والمطاعم في جميع أنحاء المملكة العربية السعودية
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg px-8 py-6 shadow-gold transition-all duration-300 hover:scale-105"
              onClick={() => scrollToSection("#services")}
            >
              اكتشف خدماتنا
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
            {stats.map((stat, index) => (
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
