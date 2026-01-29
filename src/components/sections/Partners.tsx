import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client.safe";
import { Skeleton } from "@/components/ui/skeleton";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useLanguage } from "@/contexts/LanguageContext";

// Partner logo imports (fallback)
import aramcoLogo from "@/assets/aws_broshure_v4_page13_image17.jpg";
import seyajLogo from "@/assets/aws_broshure_v4_page13_image2.jpg";
import ministryLogo from "@/assets/aws_broshure_v4_page13_image3.jpg";
import jeraisyLogo from "@/assets/aws_broshure_v4_page13_image4.jpg";
import mawakebLogo from "@/assets/aws_broshure_v4_page13_image5.jpg";
import lucasLogo from "@/assets/aws_broshure_v4_page13_image6.jpg";
import alrajhiLogo from "@/assets/aws_broshure_v4_page13_image7.jpg";
import emaraLogo from "@/assets/aws_broshure_v4_page13_image8.jpg";
import alserajLogo from "@/assets/aws_broshure_v4_page13_image10.jpg";
import bonLogo from "@/assets/aws_broshure_v4_page13_image11.jpg";
import snbLogo from "@/assets/aws_broshure_v4_page13_image12.jpg";
import petrominLogo from "@/assets/aws_broshure_v4_page13_image13.jpg";
import masajidLogo from "@/assets/aws_broshure_v4_page13_image14.jpg";
import iskanfamLogo from "@/assets/aws_broshure_v4_page13_image15.jpg";
import barnsLogo from "@/assets/aws_broshure_v4_page13_image16.jpg";
import amazonLogo from "@/assets/aws_broshure_v4_page13_image18.jpg";
import mazayaLogo from "@/assets/aws_broshure_v4_page13_image19.jpg";
import alfredyLogo from "@/assets/aws_broshure_v4_page13_image1.jpg";
import partnerLogo9 from "@/assets/aws_broshure_v4_page13_image9.jpg";

// Fallback partners data
const fallbackPartners = [
  { name: "Saudi Aramco", nameAr: "أرامكو السعودية", description: "شريك الوقود الرئيسي", logo: aramcoLogo },
  { name: "Petromin", nameAr: "بترومين", description: "شريك خدمات السيارات", logo: petrominLogo },
  { name: "Ministry", nameAr: "وزارة البلديات والإسكان", description: "الجهة الرقابية", logo: ministryLogo },
  { name: "Emara", nameAr: "إمارة المنطقة", description: "الجهة الحكومية", logo: emaraLogo },
  { name: "Al Rajhi", nameAr: "مصرف الراجحي", description: "الشريك المصرفي", logo: alrajhiLogo },
  { name: "SNB", nameAr: "البنك الأهلي السعودي", description: "الشريك المصرفي", logo: snbLogo },
  { name: "Amazon", nameAr: "أمازون", description: "شريك التجارة", logo: amazonLogo },
  { name: "Mazaya", nameAr: "مجموعة مزايا", description: "شريك الاستثمار", logo: mazayaLogo },
  { name: "Seyaj", nameAr: "سيّاج", description: "الشريك المالي", logo: seyajLogo },
  { name: "Lucas", nameAr: "لوكاس", description: "مزودة الزيوت", logo: lucasLogo },
  { name: "Al Seraj", nameAr: "السراج للنقل", description: "شريك اللوجستيات", logo: alserajLogo },
  { name: "Mawakeb Al-Khair", nameAr: "موكب الخير للنقل", description: "شريك النقل", logo: mawakebLogo },
  { name: "Jeraisy", nameAr: "مجموعة الجريسي", description: "الشريك التجاري", logo: jeraisyLogo },
  { name: "BON", nameAr: "بون كافيه", description: "شريك المقاهي", logo: bonLogo },
  { name: "Barns", nameAr: "بارنز", description: "شريك المقاهي", logo: barnsLogo },
  { name: "Iskanfam Nayef", nameAr: "اسكانفام نايف", description: "شريك المأكولات", logo: iskanfamLogo },
  { name: "Masajid", nameAr: "جمعية العناية بمساجد الطرق", description: "شريك المسؤولية الاجتماعية", logo: masajidLogo },
  { name: "Alfredy", nameAr: "الفريدي", description: "شريك الخدمات", logo: alfredyLogo },
  { name: "Partner", nameAr: "شريك", description: "شريك استراتيجي", logo: partnerLogo9 },
];

const Partners = () => {
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch partners from database
  const { data: dbPartners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Use database partners or fallback
  const partners = dbPartners && dbPartners.length > 0 
    ? dbPartners.map(p => ({
        name: p.name,
        nameAr: p.name,
        description: p.description || "",
        logo: p.logo_url || fallbackPartners[0].logo,
      }))
    : fallbackPartners;

  // Embla Carousel with autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start",
      direction: "rtl",
      dragFree: true,
    },
    [
      Autoplay({
        delay: 2000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
    if (emblaApi) {
      const autoplayPlugin = emblaApi.plugins()?.autoplay as { stop?: () => void } | undefined;
      if (autoplayPlugin?.stop) autoplayPlugin.stop();
    }
  }, [emblaApi]);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
    if (emblaApi) {
      const autoplayPlugin = emblaApi.plugins()?.autoplay as { play?: () => void } | undefined;
      if (autoplayPlugin?.play) autoplayPlugin.play();
    }
  }, [emblaApi]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("partners");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="partners" className="py-24 bg-background overflow-hidden">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            {t("partners.label")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t("partners.title")}
            <span className="text-primary"> {t("partners.titleHighlight")}</span>
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("partners.description")}
          </p>
        </div>

        {/* Partners Slider */}
        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-48 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div 
            className="overflow-hidden" 
            ref={emblaRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex gap-6" style={{ direction: "ltr" }}>
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className={`group flex-shrink-0 w-48 bg-card rounded-2xl shadow-aws border border-border/50 hover:border-secondary hover:shadow-aws-lg transition-all duration-500 flex flex-col cursor-pointer hover:-translate-y-2 overflow-hidden ${
                    isVisible ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${(index % 5) * 0.1}s` }}
                >
                  {/* Partner Logo */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-white flex items-center justify-center p-4">
                    <img
                      src={partner.logo}
                      alt={partner.nameAr}
                      className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {/* Partner Info */}
                  <div className="p-4 text-center">
                    <span className="text-sm font-bold text-primary group-hover:text-secondary transition-colors duration-300 line-clamp-2">
                      {partner.nameAr}
                    </span>
                    <span className="block text-xs text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-4">
                      {partner.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${!isPaused ? 'bg-secondary animate-pulse' : 'bg-muted'}`} />
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${isPaused ? 'bg-secondary' : 'bg-muted'}`} />
        </div>
      </div>
    </section>
  );
};

export default Partners;
