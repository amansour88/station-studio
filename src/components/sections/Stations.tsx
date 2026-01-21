import stationDay from "@/assets/station-day.jpg";
import stationNight from "@/assets/station-night.jpg";
import serviceCenter from "@/assets/service-center.jpg";
import hotel from "@/assets/hotel.jpg";

const stations = [
  {
    image: stationDay,
    title: "محطة متكاملة",
    description: "تصميم عصري مع جميع الخدمات",
  },
  {
    image: stationNight,
    title: "خدمة على مدار الساعة",
    description: "نعمل ليلاً ونهاراً لخدمتكم",
  },
  {
    image: serviceCenter,
    title: "مركز خدمة السيارات",
    description: "صيانة متكاملة وغيار زيت وإطارات",
  },
  {
    image: hotel,
    title: "فنادق ومرافق",
    description: "راحة المسافرين أولويتنا",
  },
];

const regions = [
  "منطقة القصيم",
  "منطقة الرياض",
  "المنطقة الشرقية",
  "منطقة المدينة المنورة",
  "منطقة حائل",
];

const Stations = () => {
  return (
    <section id="stations" className="py-24 bg-muted/50">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            محطاتنا
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            انتشارنا
            <span className="text-primary"> الجغرافي</span>
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نغطي كافة مناطق المملكة الرئيسية لخدمتكم أينما كنتم
          </p>
        </div>

        {/* Regions */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {regions.map((region, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-full px-6 py-3 shadow-sm hover:shadow-aws hover:border-secondary transition-all duration-300 cursor-pointer"
            >
              <span className="text-foreground font-medium">{region}</span>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="bg-primary rounded-3xl p-8 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-aws-burgundy-dark opacity-90" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">95+</div>
              <div className="text-white/80">محطة وقود</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">5</div>
              <div className="text-white/80">مناطق</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">30+</div>
              <div className="text-white/80">مدينة ومحافظة</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-white/80">خدمة مستمرة</div>
            </div>
          </div>
        </div>

        {/* Stations Gallery */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stations.map((station, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden shadow-aws hover-lift"
            >
              <img
                src={station.image}
                alt={station.title}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-lg font-bold mb-1">{station.title}</h3>
                <p className="text-white/80 text-sm">{station.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stations;
