import { useEffect, useState } from "react";

// Partner logo imports
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

// Partners from AWS Brandbook - Real company partners
const partners = [
  {
    name: "Saudi Aramco",
    nameAr: "أرامكو السعودية",
    description: "شريك الوقود الرئيسي",
    logo: aramcoLogo
  },
  {
    name: "Petromin",
    nameAr: "بترومين",
    description: "شريك خدمات السيارات",
    logo: petrominLogo
  },
  {
    name: "Ministry",
    nameAr: "وزارة البلديات والإسكان",
    description: "الجهة الرقابية",
    logo: ministryLogo
  },
  {
    name: "Emara",
    nameAr: "إمارة المنطقة",
    description: "الجهة الحكومية",
    logo: emaraLogo
  },
  {
    name: "Al Rajhi",
    nameAr: "مصرف الراجحي",
    description: "الشريك المصرفي",
    logo: alrajhiLogo
  },
  {
    name: "SNB",
    nameAr: "البنك الأهلي السعودي",
    description: "الشريك المصرفي",
    logo: snbLogo
  },
  {
    name: "Amazon",
    nameAr: "أمازون",
    description: "شريك التجارة",
    logo: amazonLogo
  },
  {
    name: "Mazaya",
    nameAr: "مجموعة مزايا",
    description: "شريك الاستثمار",
    logo: mazayaLogo
  },
  {
    name: "Seyaj",
    nameAr: "سيّاج",
    description: "الشريك المالي",
    logo: seyajLogo
  },
  {
    name: "Lucas",
    nameAr: "لوكاس",
    description: "مزودة الزيوت",
    logo: lucasLogo
  },
  {
    name: "Al Seraj",
    nameAr: "السراج للنقل",
    description: "شريك اللوجستيات",
    logo: alserajLogo
  },
  {
    name: "Mawakeb Al-Khair",
    nameAr: "موكب الخير للنقل",
    description: "شريك النقل",
    logo: mawakebLogo
  },
  {
    name: "Jeraisy",
    nameAr: "مجموعة الجريسي",
    description: "الشريك التجاري",
    logo: jeraisyLogo
  },
  {
    name: "BON",
    nameAr: "بون كافيه",
    description: "شريك المقاهي",
    logo: bonLogo
  },
  {
    name: "Barns",
    nameAr: "بارنز",
    description: "شريك المقاهي",
    logo: barnsLogo
  },
  {
    name: "Iskanfam Nayef",
    nameAr: "اسكانفام نايف",
    description: "شريك المأكولات",
    logo: iskanfamLogo
  },
  {
    name: "Masajid",
    nameAr: "جمعية العناية بمساجد الطرق",
    description: "شريك المسؤولية الاجتماعية",
    logo: masajidLogo
  },
  {
    name: "Alfredy",
    nameAr: "الفريدي",
    description: "شريك الخدمات",
    logo: alfredyLogo
  },
  {
    name: "Partner",
    nameAr: "شريك",
    description: "شريك استراتيجي",
    logo: partnerLogo9
  },
];

const Partners = () => {
  const [isVisible, setIsVisible] = useState(false);

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
    <section id="partners" className="py-24 bg-background">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            شركاؤنا
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            شركاء
            <span className="text-primary"> النجاح</span>
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نفخر بشراكاتنا الاستراتيجية مع أبرز الشركات والمؤسسات في المملكة
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className={`group bg-card rounded-2xl shadow-aws border border-border/50 hover:border-secondary hover:shadow-aws-lg transition-all duration-500 flex flex-col cursor-pointer hover:-translate-y-2 overflow-hidden ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Partner Logo - Full width image container */}
              <div className="relative w-full aspect-square overflow-hidden bg-white">
                <img
                  src={partner.logo}
                  alt={partner.nameAr}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-125"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {/* Partner Info */}
              <div className="p-4 text-center">
                <span className="text-sm font-bold text-primary group-hover:text-secondary transition-colors duration-300 line-clamp-2">
                  {partner.nameAr}
                </span>
                {/* Description - appears on hover */}
                <span className="block text-xs text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-4">
                  {partner.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Banner */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full px-8 py-4 border border-secondary/30">
            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
            <span className="text-foreground font-medium">
              نفخر بخدمة أكثر من <span className="text-primary font-bold">مليون</span> عميل سنوياً
            </span>
            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
