import { useState, useEffect } from "react";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "الرئيسية", href: "#home" },
  { name: "من نحن", href: "#about" },
  { name: "خدماتنا", href: "#services" },
  { name: "محطاتنا", href: "#stations" },
  { name: "شركاؤنا", href: "#partners" },
  { name: "تواصل معنا", href: "#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-aws py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <Logo 
              variant={isScrolled ? "default" : "white"} 
              size="md" 
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className={cn(
                  "font-medium transition-colors duration-200 hover:text-secondary",
                  isScrolled ? "text-foreground" : "text-white"
                )}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="tel:920008436" 
              className={cn(
                "flex items-center gap-2 font-semibold transition-colors",
                isScrolled ? "text-primary" : "text-white"
              )}
            >
              <Phone className="w-5 h-5" />
              <span dir="ltr">920008436</span>
            </a>
            <Button 
              variant="secondary"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-gold"
              onClick={() => scrollToSection("#contact")}
            >
              احصل على الامتياز
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              isScrolled ? "text-primary" : "text-white"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-screen opacity-100 mt-4" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-card rounded-xl shadow-aws-lg p-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="block w-full text-right py-3 px-4 text-foreground font-medium hover:bg-muted rounded-lg transition-colors"
              >
                {link.name}
              </button>
            ))}
            <div className="pt-4 border-t border-border">
              <a 
                href="tel:920008436" 
                className="flex items-center justify-center gap-2 text-primary font-semibold py-2"
              >
                <Phone className="w-5 h-5" />
                <span dir="ltr">920008436</span>
              </a>
              <Button 
                className="w-full mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                onClick={() => scrollToSection("#contact")}
              >
                احصل على الامتياز
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
