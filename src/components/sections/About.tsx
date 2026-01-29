import { Award, Users, Target, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client.safe";
import { Skeleton } from "@/components/ui/skeleton";
import stationDay from "@/assets/station-day.jpg";

const defaultValues = [
  {
    icon: Award,
    title: "التميز",
    description: "نلتزم بأعلى معايير الجودة في كل قطرة وقود وكل خدمة نقدمها",
  },
  {
    icon: Target,
    title: "الابتكار",
    description: "نستخدم أحدث التقنيات لتحسين تجربة عملائنا وكفاءة خدماتنا",
  },
  {
    icon: Users,
    title: "المجتمع",
    description: "شريك فاعل في تنمية المجتمع السعودي ودعم رؤية 2030",
  },
  {
    icon: Shield,
    title: "النزاهة",
    description: "الشفافية والأمانة هي أساس تعاملنا مع جميع شركائنا وعملائنا",
  },
];

const About = () => {
  const { data: aboutData, isLoading } = useQuery({
    queryKey: ["about-section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_section")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Parse content into paragraphs
  const content = aboutData?.content || "";
  const paragraphs = content.split("\n\n").filter(Boolean);
  const title = aboutData?.title || "من نحن";
  const imageUrl = aboutData?.image_url || stationDay;

  // Default paragraphs if no content
  const defaultParagraphs = [
    'تعتبر شركة <strong class="text-primary">اوس للخدمات البترولية</strong> شركة رائدة في مجالات الطاقة، وتتمتع بالخبرة والكفاءة في تقديم وترويج الخدمات البترولية ومراكز الخدمة على الطريق.',
    'نشأت الشركة عام <strong class="text-secondary">1998</strong> بفرع واحد في محافظة الأسياح بمنطقة القصيم، واليوم تمتلك الشركة أكثر من <strong class="text-secondary">78 محطة</strong> في خمسة مناطق وأكثر من ثلاثين مدينة ومحافظة.',
    'تهدف الشركة دائماً إلى تحقيق أعلى معايير الجودة والكفاءة المتسارعة، مع الالتزام برؤية المملكة 2030 في تطوير البنية التحتية.',
  ];

  const displayParagraphs = paragraphs.length > 0 ? paragraphs : defaultParagraphs;

  return (
    <section id="about" className="py-24 bg-muted/50">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            عن اوس
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            قصة نجاح سعودية
            <span className="text-primary"> منذ 1998</span>
          </h2>
          <div className="section-divider mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image */}
          <div className="relative">
            {isLoading ? (
              <Skeleton className="w-full h-[400px] rounded-3xl" />
            ) : (
              <div className="relative rounded-3xl overflow-hidden shadow-aws-lg">
                <img
                  src={imageUrl}
                  alt="محطة اوس"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </div>
            )}
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 bg-card rounded-2xl shadow-aws-lg p-6 max-w-xs">
              <div className="text-4xl font-bold text-primary mb-2">+25</div>
              <div className="text-muted-foreground">عاماً من الخبرة والتميز في خدمة المملكة</div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:pr-8">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : (
              displayParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg text-muted-foreground leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))
            )}
          </div>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {defaultValues.map((value, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 shadow-aws card-hover border border-border/50"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                <value.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
