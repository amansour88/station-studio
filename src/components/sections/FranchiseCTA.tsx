import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const FranchiseCTA = () => {
  const { t, language } = useLanguage();
  
  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const benefits = language === "ar" 
    ? ["دعم فني متكامل", "تدريب وتأهيل شامل", "علامة تجارية موثوقة"]
    : ["Complete Technical Support", "Comprehensive Training", "Trusted Brand"];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container px-4">
        <div className="bg-primary rounded-3xl p-8 md:p-12 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                {t("franchise.title")}
              </h3>
              <p className="text-white/80 text-lg">
                {t("franchise.description")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-secondary">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={scrollToContact}
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold font-semibold px-8"
            >
              {t("franchise.cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FranchiseCTA;
