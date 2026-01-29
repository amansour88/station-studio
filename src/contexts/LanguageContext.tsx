import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navbar
    "nav.home": "الرئيسية",
    "nav.about": "من نحن",
    "nav.services": "خدماتنا",
    "nav.stations": "محطاتنا",
    "nav.partners": "شركاؤنا",
    "nav.contact": "تواصل معنا",

    // Hero
    "hero.badge": "شريكك الموثوق على الطريق منذ 1998",
    "hero.title": "نحو رحلة",
    "hero.titleHighlight": "بلا حدود",
    "hero.description": "نقدم لك تجربة متكاملة من خدمات الوقود عالي الجودة، خدمات السيارات، المتاجر، والمطاعم في جميع أنحاء المملكة العربية السعودية",
    "hero.cta": "اكتشف خدماتنا",
    "hero.millionCustomers": "نفخر بخدمة أكثر من",
    "hero.million": "مليون",
    "hero.customersYearly": "عميل سنوياً",
    "hero.stations": "محطة",
    "hero.regions": "مناطق",
    "hero.founded": "سنة التأسيس",

    // About
    "about.label": "عن اوس",
    "about.title": "قصة نجاح سعودية",
    "about.titleHighlight": "منذ 1998",
    "about.experience": "+25",
    "about.experienceText": "عاماً من الخبرة والتميز في خدمة المملكة",
    "about.paragraph1": "تعتبر شركة <strong class=\"text-primary\">اوس للخدمات البترولية</strong> شركة رائدة في مجالات الطاقة، وتتمتع بالخبرة والكفاءة في تقديم وترويج الخدمات البترولية ومراكز الخدمة على الطريق.",
    "about.paragraph2": "نشأت الشركة عام <strong class=\"text-secondary\">1998</strong> بفرع واحد في محافظة الأسياح بمنطقة القصيم، واليوم تمتلك الشركة أكثر من <strong class=\"text-secondary\">78 محطة</strong> في خمسة مناطق وأكثر من ثلاثين مدينة ومحافظة.",
    "about.paragraph3": "تهدف الشركة دائماً إلى تحقيق أعلى معايير الجودة والكفاءة المتسارعة، مع الالتزام برؤية المملكة 2030 في تطوير البنية التحتية.",
    "about.excellence": "التميز",
    "about.excellenceDesc": "نلتزم بأعلى معايير الجودة في كل قطرة وقود وكل خدمة نقدمها",
    "about.innovation": "الابتكار",
    "about.innovationDesc": "نستخدم أحدث التقنيات لتحسين تجربة عملائنا وكفاءة خدماتنا",
    "about.community": "المجتمع",
    "about.communityDesc": "شريك فاعل في تنمية المجتمع السعودي ودعم رؤية 2030",
    "about.integrity": "النزاهة",
    "about.integrityDesc": "الشفافية والأمانة هي أساس تعاملنا مع جميع شركائنا وعملائنا",

    // Services
    "services.label": "خدماتنا",
    "services.title": "خدمات متكاملة",
    "services.titleHighlight": "على الطريق",
    "services.description": "نقدم لك مجموعة شاملة من الخدمات لتلبية جميع احتياجاتك في مكان واحد",

    // Stations
    "stations.label": "محطاتنا",
    "stations.title": "شبكة محطاتنا",
    "stations.titleHighlight": "في المملكة",
    "stations.description": "نغطي خمسة مناطق رئيسية بأكثر من 78 محطة لخدمتك أينما كنت",
    "stations.station": "محطة",
    "stations.viewOnMap": "عرض على الخريطة",
    "stations.stationCount": "محطة وقود",
    "stations.regionCount": "مناطق",
    "stations.cityCount": "مدينة ومحافظة",
    "stations.alwaysOpen": "خدمة مستمرة",
    "stations.allRegions": "جميع المناطق",
    "stations.ourStations": "محطاتنا",
    "stations.stationsIn": "محطات",
    "stations.noStations": "لا توجد محطات في هذه المنطقة حالياً",
    "stations.selectStation": "اختر محطة",
    "stations.selectStationDesc": "اختر محطة من القائمة لعرض موقعها على الخريطة",
    "stations.directions": "الاتجاهات",

    // Partners
    "partners.label": "شركاؤنا",
    "partners.title": "شراكات",
    "partners.titleHighlight": "استراتيجية",
    "partners.description": "نفخر بشراكاتنا مع أفضل العلامات التجارية العالمية والمحلية",

    // Franchise CTA
    "franchise.title": "انضم لعائلة اوس",
    "franchise.description": "هل تبحث عن فرصة استثمارية ناجحة؟ كن جزءاً من شبكة محطات اوس المتنامية",
    "franchise.cta": "تواصل معنا للاستثمار",

    // Contact
    "contact.label": "تواصل معنا",
    "contact.title": "نحن هنا",
    "contact.titleHighlight": "لمساعدتك",
    "contact.description": "سواء كنت ترغب في الاستثمار معنا أو لديك استفسار، نحن سعداء بالتواصل معك",
    "contact.info": "معلومات التواصل",
    "contact.phone": "الهاتف",
    "contact.email": "البريد الإلكتروني",
    "contact.address": "العنوان",
    "contact.addressValue": "طريق الملك عبدالله، المدينة المنورة، أبراج غوث، برج 2، الطابق السابع",
    "contact.mapTitle": "موقعنا على الخريطة",
    "contact.sendMessage": "أرسل لنا رسالة",
    "contact.messageType": "نوع الرسالة",
    "contact.messageTypePlaceholder": "اختر نوع الرسالة",
    "contact.general": "استفسار عام",
    "contact.complaint": "شكوى",
    "contact.job": "التقديم على وظيفة",
    "contact.investor": "خدمات المستثمرين",
    "contact.serviceType": "نوع الخدمة المطلوبة",
    "contact.stationManagement": "إدارة المحطات",
    "contact.franchise": "الامتياز التجاري",
    "contact.facilityRental": "تأجير المرافق",
    "contact.fullName": "الاسم الكامل",
    "contact.emailLabel": "البريد الإلكتروني",
    "contact.phoneLabel": "رقم الجوال",
    "contact.city": "المدينة",
    "contact.message": "رسالتك",
    "contact.messagePlaceholder": "اكتب رسالتك هنا...",
    "contact.attachment": "إرفاق ملف (اختياري)",
    "contact.submit": "إرسال الرسالة",
    "contact.submitting": "جاري الإرسال...",
    "contact.successTitle": "تم إرسال رسالتك بنجاح!",
    "contact.successDesc": "سنتواصل معك في أقرب وقت ممكن",

    // Footer
    "footer.description": "شركة اوس للخدمات البترولية - شريكك الموثوق على الطريق منذ عام 1998. نقدم خدمات متكاملة بأعلى معايير الجودة.",
    "footer.quickLinks": "روابط سريعة",
    "footer.ourServices": "خدماتنا",
    "footer.contactUs": "تواصل معنا",
    "footer.copyright": "شركة اوس للخدمات البترولية. جميع الحقوق محفوظة.",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "الشروط والأحكام",
    "footer.adminPanel": "لوحة التحكم",

    // Services list
    "service.fuel": "تعبئة الوقود",
    "service.carWash": "غسيل السيارات",
    "service.oilChange": "غيار الزيت",
    "service.supermarket": "سوبر ماركت",
    "service.restaurants": "مطاعم ومقاهي",
  },
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.services": "Services",
    "nav.stations": "Stations",
    "nav.partners": "Partners",
    "nav.contact": "Contact Us",

    // Hero
    "hero.badge": "Your trusted partner on the road since 1998",
    "hero.title": "Towards a journey",
    "hero.titleHighlight": "without limits",
    "hero.description": "We offer you an integrated experience of high-quality fuel services, car services, stores, and restaurants across the Kingdom of Saudi Arabia",
    "hero.cta": "Discover Our Services",
    "hero.millionCustomers": "Proudly serving over",
    "hero.million": "1 million",
    "hero.customersYearly": "customers annually",
    "hero.stations": "Stations",
    "hero.regions": "Regions",
    "hero.founded": "Year Founded",

    // About
    "about.label": "About AWS",
    "about.title": "A Saudi Success Story",
    "about.titleHighlight": "Since 1998",
    "about.experience": "+25",
    "about.experienceText": "Years of excellence serving the Kingdom",
    "about.paragraph1": "<strong class=\"text-primary\">AWS Petroleum Services</strong> is a leading company in the energy sector, with expertise and efficiency in providing and promoting petroleum services and roadside service centers.",
    "about.paragraph2": "The company was established in <strong class=\"text-secondary\">1998</strong> with a single branch in Al-Asyah, Qassim region. Today, the company owns more than <strong class=\"text-secondary\">78 stations</strong> across five regions and more than thirty cities and governorates.",
    "about.paragraph3": "The company always aims to achieve the highest standards of quality and accelerated efficiency, while committing to the Kingdom's Vision 2030 in developing infrastructure.",
    "about.excellence": "Excellence",
    "about.excellenceDesc": "We commit to the highest quality standards in every drop of fuel and every service we provide",
    "about.innovation": "Innovation",
    "about.innovationDesc": "We use the latest technologies to improve our customers' experience and service efficiency",
    "about.community": "Community",
    "about.communityDesc": "An active partner in developing Saudi society and supporting Vision 2030",
    "about.integrity": "Integrity",
    "about.integrityDesc": "Transparency and honesty are the foundation of our dealings with all partners and customers",

    // Services
    "services.label": "Our Services",
    "services.title": "Integrated Services",
    "services.titleHighlight": "On the Road",
    "services.description": "We offer a comprehensive range of services to meet all your needs in one place",

    // Stations
    "stations.label": "Our Stations",
    "stations.title": "Our Station Network",
    "stations.titleHighlight": "in the Kingdom",
    "stations.description": "We cover five main regions with over 78 stations to serve you wherever you are",
    "stations.station": "Station",
    "stations.viewOnMap": "View on Map",
    "stations.stationCount": "Fuel Stations",
    "stations.regionCount": "Regions",
    "stations.cityCount": "Cities & Governorates",
    "stations.alwaysOpen": "Always Open",
    "stations.allRegions": "All Regions",
    "stations.ourStations": "Our Stations",
    "stations.stationsIn": "Stations in",
    "stations.noStations": "No stations in this region currently",
    "stations.selectStation": "Select a Station",
    "stations.selectStationDesc": "Choose a station from the list to view its location on the map",
    "stations.directions": "Directions",

    // Partners
    "partners.label": "Our Partners",
    "partners.title": "Strategic",
    "partners.titleHighlight": "Partnerships",
    "partners.description": "We take pride in our partnerships with the best international and local brands",

    // Franchise CTA
    "franchise.title": "Join the AWS Family",
    "franchise.description": "Looking for a successful investment opportunity? Become part of the growing AWS station network",
    "franchise.cta": "Contact Us for Investment",

    // Contact
    "contact.label": "Contact Us",
    "contact.title": "We're Here",
    "contact.titleHighlight": "to Help You",
    "contact.description": "Whether you want to invest with us or have an inquiry, we're happy to connect with you",
    "contact.info": "Contact Information",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.address": "Address",
    "contact.addressValue": "King Abdullah Road, Madinah, Ghawth Towers, Tower 2, 7th Floor",
    "contact.mapTitle": "Our Location on Map",
    "contact.sendMessage": "Send Us a Message",
    "contact.messageType": "Message Type",
    "contact.messageTypePlaceholder": "Select message type",
    "contact.general": "General Inquiry",
    "contact.complaint": "Complaint",
    "contact.job": "Job Application",
    "contact.investor": "Investor Services",
    "contact.serviceType": "Required Service Type",
    "contact.stationManagement": "Station Management",
    "contact.franchise": "Franchise",
    "contact.facilityRental": "Facility Rental",
    "contact.fullName": "Full Name",
    "contact.emailLabel": "Email",
    "contact.phoneLabel": "Phone Number",
    "contact.city": "City",
    "contact.message": "Your Message",
    "contact.messagePlaceholder": "Write your message here...",
    "contact.attachment": "Attach File (Optional)",
    "contact.submit": "Send Message",
    "contact.submitting": "Sending...",
    "contact.successTitle": "Message sent successfully!",
    "contact.successDesc": "We will contact you as soon as possible",

    // Footer
    "footer.description": "AWS Petroleum Services - Your trusted partner on the road since 1998. We provide integrated services with the highest quality standards.",
    "footer.quickLinks": "Quick Links",
    "footer.ourServices": "Our Services",
    "footer.contactUs": "Contact Us",
    "footer.copyright": "AWS Petroleum Services. All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms & Conditions",
    "footer.adminPanel": "Admin Panel",

    // Services list
    "service.fuel": "Fuel Filling",
    "service.carWash": "Car Wash",
    "service.oilChange": "Oil Change",
    "service.supermarket": "Supermarket",
    "service.restaurants": "Restaurants & Cafes",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("aws_language");
    return (saved as Language) || "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("aws_language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.className = language === "ar" ? "font-cairo" : "font-sans";
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
