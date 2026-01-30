import { Award, Users, Target, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import stationDay from "@/assets/station-day.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client.safe";
import api, { USE_SUPABASE } from "@/lib/api";
import type { AboutSection } from "@/types/api";

const About = () => {
  const { t, language } = useLanguage();

  const defaultValues = [
    {
      icon: Award,
      title: t("about.excellence"),
      description: t("about.excellenceDesc"),
    },
    {
      icon: Target,
      title: t("about.innovation"),
      description: t("about.innovationDesc"),
    },
    {
      icon: Users,
      title: t("about.community"),
      description: t("about.communityDesc"),
    },
    {
      icon: Shield,
      title: t("about.integrity"),
      description: t("about.integrityDesc"),
    },
  ];

  const { data: aboutData, isLoading } = useQuery({
    queryKey: ["about-section"],
    queryFn: async () => {
      if (USE_SUPABASE) {
        const { data, error } = await supabase
          .from("about_section")
          .select("*")
          .single();
        if (error) throw error;
        return data as AboutSection;
      } else {
        return api.get<AboutSection | null>("/about/get.php");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes in cache
  });

  // Parse content into paragraphs
  const content = aboutData?.content || "";
  const paragraphs = content.split("\n\n").filter(Boolean);
  const imageUrl = aboutData?.image_url || stationDay;

  // Default paragraphs if no content - use translations
  const defaultParagraphs = [
    t("about.paragraph1"),
    t("about.paragraph2"),
    t("about.paragraph3"),
  ];

  const displayParagraphs = paragraphs.length > 0 ? paragraphs : defaultParagraphs;

  return (
    <section id="about" className="py-24 bg-muted/50">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            {t("about.label")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t("about.title")}
            <span className="text-primary"> {t("about.titleHighlight")}</span>
          </h2>
          <div className="section-divider mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image */}
          <div className="relative">
            {isLoading ? (
              <Skeleton className="w-full h-[380px] rounded-3xl" />
            ) : (
              <div className="relative rounded-3xl overflow-hidden shadow-aws-lg scale-[0.95] origin-center">
                <img
                  src={imageUrl}
                  alt={language === "ar" ? "محطة اوس" : "AWS Station"}
                  className="w-full h-[380px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </div>
            )}
            {/* Floating Card */}
            <div className={`absolute -bottom-6 ${language === "ar" ? "-left-6" : "-right-6"} bg-card rounded-2xl shadow-aws-lg p-5 max-w-[280px] scale-95`}>
              <div className="text-3xl font-bold text-primary mb-1">{t("about.experience")}</div>
              <div className="text-muted-foreground text-sm">{t("about.experienceText")}</div>
            </div>
          </div>

          {/* Content */}
          <div className={language === "ar" ? "lg:pr-8" : "lg:pl-8"}>
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
