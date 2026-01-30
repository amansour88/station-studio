import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/components/ui/Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";

// Default settings fallback
const defaultSettings = {
  facebook_url: "#",
  twitter_url: "#",
  instagram_url: "#",
  linkedin_url: "#",
  phone: "920008436",
  email: "info@aws.sa",
  address: "المملكة العربية السعودية - القصيم - بريدة",
};

const Footer = () => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Fetch site settings
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => api.get<Record<string, string>>("/settings/get.php"),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,     // 30 minutes in cache
  });

  // Merge with defaults
  const siteSettings = {
    ...defaultSettings,
    ...settings,
  };

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

  // Social media links with settings
  const socialLinks = [
    { icon: Facebook, url: siteSettings.facebook_url, label: "Facebook" },
    { icon: Twitter, url: siteSettings.twitter_url, label: "Twitter" },
    { icon: Instagram, url: siteSettings.instagram_url, label: "Instagram" },
    { icon: Linkedin, url: siteSettings.linkedin_url, label: "LinkedIn" },
  ];

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="container px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Logo variant="white" size="xl" className="mb-6" />
            <p className="text-white/70 leading-relaxed mb-6">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url || "#"}
                  target={social.url && social.url !== "#" ? "_blank" : undefined}
                  rel={social.url && social.url !== "#" ? "noopener noreferrer" : undefined}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
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
                <a 
                  href={`tel:${siteSettings.phone}`} 
                  className="text-white/70 hover:text-secondary transition-colors" 
                  dir="ltr"
                >
                  {siteSettings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform duration-300" />
                <a 
                  href={`mailto:${siteSettings.email}`} 
                  className="text-white/70 hover:text-secondary transition-colors"
                >
                  {siteSettings.email}
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white/70 text-sm">
                  {siteSettings.address || t("contact.addressValue")}
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
              className="hover:text-secondary transition-colors"
              title={t("footer.adminPanel")}
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
