import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Stations from "@/components/sections/Stations";
import Partners from "@/components/sections/Partners";
import FranchiseCTA from "@/components/sections/FranchiseCTA";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-cairo">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Stations />
        <Partners />
        <FranchiseCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
