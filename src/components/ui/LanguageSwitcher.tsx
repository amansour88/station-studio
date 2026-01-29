import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  isScrolled?: boolean;
}

const LanguageSwitcher = ({ isScrolled = false }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 font-semibold",
        isScrolled
          ? "text-foreground hover:bg-muted"
          : "text-white hover:bg-white/10"
      )}
      title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Globe className="w-5 h-5" />
      <span className="text-sm">{language === "ar" ? "EN" : "عربي"}</span>
    </button>
  );
};

export default LanguageSwitcher;
