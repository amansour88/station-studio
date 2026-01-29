import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FranchiseCTA = () => {
  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 bg-muted/50">
      <div className="container px-4">
        <div className="bg-primary rounded-3xl p-8 md:p-12 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                هل تريد الانضمام لعائلة اوس؟
              </h3>
              <p className="text-white/80 text-lg">
                احصل على امتياز تجاري وابدأ رحلة نجاحك معنا
              </p>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div className="flex items-center gap-3 text-secondary">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>دعم فني متكامل</span>
              </div>
              <div className="flex items-center gap-3 text-secondary">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>تدريب وتأهيل شامل</span>
              </div>
              <div className="flex items-center gap-3 text-secondary">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>علامة تجارية موثوقة</span>
              </div>
            </div>

            <Button
              onClick={scrollToContact}
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold font-semibold px-8"
            >
              تواصل معنا
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FranchiseCTA;
