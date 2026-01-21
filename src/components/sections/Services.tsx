import { Fuel, Car, ShoppingBag, Wrench, Coffee, Pill } from "lucide-react";
import stationPumps from "@/assets/station-pumps.jpg";
import carService from "@/assets/car-service.jpg";
import supermarket from "@/assets/supermarket.jpg";

const services = [
  {
    icon: Fuel,
    title: "تعبئة الوقود",
    description: "وقود عالي الجودة (91، 95، ديزل) بأحدث معدات التعبئة",
    image: stationPumps,
    color: "bg-primary",
  },
  {
    icon: Car,
    title: "غسيل السيارات",
    description: "خدمات غسيل متكاملة للحفاظ على سيارتك نظيفة ولامعة",
    image: carService,
    color: "bg-secondary",
  },
  {
    icon: Wrench,
    title: "غيار الزيت والإطارات",
    description: "صيانة سريعة وموثوقة لسيارتك بأيدي فنيين محترفين",
    image: carService,
    color: "bg-primary",
  },
  {
    icon: ShoppingBag,
    title: "سوبر ماركت",
    description: "متجر متكامل يوفر كل ما تحتاجه في رحلتك",
    image: supermarket,
    color: "bg-secondary",
  },
  {
    icon: Coffee,
    title: "مطاعم ومقاهي",
    description: "مطاعم ومقاهي متنوعة لراحتك واستمتاعك",
    image: supermarket,
    color: "bg-primary",
  },
  {
    icon: Pill,
    title: "صيدلية",
    description: "خدمات صيدلانية لتلبية احتياجاتك الصحية",
    image: supermarket,
    color: "bg-secondary",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            خدماتنا
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            خدمات متكاملة
            <span className="text-primary"> تحت سقف واحد</span>
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نقدم مجموعة شاملة من الخدمات لضمان راحتك وسلامة مركبتك
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-3xl overflow-hidden shadow-aws hover-lift border border-border/50"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative p-6 -mt-8">
                {/* Icon */}
                <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          ))}
        </div>

        {/* Additional Services Banner */}
        <div className="mt-16 bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              خدمات للمستثمرين
            </h3>
            <p className="text-white/80 max-w-2xl mx-auto mb-6">
              نقدم أيضاً خدمات مميزة للمستثمرين تشمل إدارة وتشغيل المحطات، 
              الامتياز التجاري، وتأجير المرافق بالمحطات
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium">
                إدارة المحطات
              </span>
              <span className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium">
                الامتياز التجاري
              </span>
              <span className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium">
                تأجير المرافق
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
