import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t("nav.home"), href: "#home" },
    { name: t("nav.about"), href: "#about" },
    { name: t("nav.services"), href: "#services" },
    { name: t("nav.stations"), href: "#stations" },
    { name: t("nav.contact"), href: "#contact" },
  ];

  const services = [
    t("service.fuel"),
    t("service.carWash"),
    t("service.oilChange"),
    t("service.supermarket"),
    t("service.restaurants"),
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="container px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Logo variant="white" size="lg" className="mb-6" />
            <p className="text-white/70 leading-relaxed mb-6">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-secondary">{t("footer.quickLinks")}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className={`text-white/70 hover:text-secondary transition-all duration-200 inline-block ${language === "ar" ? "hover:translate-x-2" : "hover:-translate-x-2"}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-secondary">{t("footer.ourServices")}</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-white/70 hover:text-secondary transition-colors duration-200 cursor-default">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-secondary">{t("footer.contactUs")}</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform duration-300" />
                <a href="tel:920008436" className="text-white/70 hover:text-secondary transition-colors" dir="ltr">
                  920008436
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform duration-300" />
                <a href="mailto:info@aws.sa" className="text-white/70 hover:text-secondary transition-colors">
                  info@aws.sa
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white/70 text-sm">
                  {t("contact.addressValue")}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Gold Line */}
      <div className="gold-line" />

      {/* Bottom Footer */}
      <div className="container px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {currentYear} {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a href="#" className="hover:text-secondary transition-colors">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:text-secondary transition-colors">
              {t("footer.terms")}
            </a>
            <Link 
              to="/admin/login" 
              className="flex items-center gap-1 hover:text-secondary transition-colors"
              title={t("footer.adminPanel")}
            >
              <Settings className="w-4 h-4" />
              <span>{t("footer.adminPanel")}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
