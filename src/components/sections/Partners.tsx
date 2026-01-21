const partners = [
  { name: "Saudi Aramco", logo: "سعودي أرامكو" },
  { name: "Petromin", logo: "بترومين" },
  { name: "Bank Al Bilad", logo: "بنك البلاد" },
  { name: "Jeraisy", logo: "الجريسي" },
  { name: "Mazaya Group", logo: "مجموعة مزايا" },
  { name: "Ministry of Municipalities", logo: "وزارة البلديات" },
  { name: "BON Oil", logo: "بون للزيوت" },
  { name: "AL Seraj Transport", logo: "السراج للنقل" },
];

const Partners = () => {
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
              className="group bg-card rounded-2xl p-8 shadow-aws border border-border/50 hover:border-secondary hover:shadow-aws-lg transition-all duration-300 flex items-center justify-center min-h-[120px]"
            >
              <span className="text-xl font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300 text-center">
                {partner.logo}
              </span>
            </div>
          ))}
        </div>

        {/* Trust Banner */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-muted rounded-full px-8 py-4">
            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
            <span className="text-muted-foreground font-medium">
              موثوق من قبل أكثر من <span className="text-primary font-bold">1000+</span> شريك تجاري
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
