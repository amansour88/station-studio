import { useEffect, useState } from "react";

// Partners from AWS Brandbook - Real company partners
const partners = [
  { 
    name: "Saudi Aramco", 
    nameAr: "أرامكو السعودية",
    description: "شريك الوقود الرئيسي"
  },
  { 
    name: "Petromin", 
    nameAr: "بترومين",
    description: "شريك خدمات السيارات"
  },
  { 
    name: "Ministry of Municipalities", 
    nameAr: "وزارة البلديات",
    description: "الجهة الرقابية"
  },
  { 
    name: "Bank Al Bilad", 
    nameAr: "بنك البلاد",
    description: "الشريك المصرفي"
  },
  { 
    name: "Jeraisy Group", 
    nameAr: "مجموعة الجريسي",
    description: "شريك التطوير"
  },
  { 
    name: "Mazaya Group", 
    nameAr: "مجموعة مزايا",
    description: "شريك الاستثمار"
  },
  { 
    name: "BON Oil", 
    nameAr: "بون للزيوت",
    description: "مورد الزيوت"
  },
  { 
    name: "AL Seraj Transport", 
    nameAr: "السراج للنقل",
    description: "شريك اللوجستيات"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className={`group bg-card rounded-2xl p-8 shadow-aws border border-border/50 hover:border-secondary hover:shadow-aws-lg transition-all duration-500 flex flex-col items-center justify-center min-h-[160px] cursor-pointer hover:-translate-y-2 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Partner Name */}
              <span className="text-xl font-bold text-primary group-hover:text-secondary transition-colors duration-300 text-center mb-2">
                {partner.nameAr}
              </span>
              {/* English Name */}
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 text-center">
                {partner.name}
              </span>
              {/* Description - appears on hover */}
              <span className="text-xs text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {partner.description}
              </span>
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
