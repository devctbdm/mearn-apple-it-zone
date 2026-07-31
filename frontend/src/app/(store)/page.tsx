import HomeSlider from '@/components/homeComponents/HomeSlider';
import NotifidText from '@/components/homeComponents/NotifidText';
import FeaturedCategory from '@/components/homeComponents/FeaturedCategory';
import ServiceBox from '@/components/homeComponents/ServiceBox';
import PhysicalStores from '@/components/homeComponents/PhysicalStores';
import FeaturedProducts from '@/components/homeComponents/FeaturedProducts';
import { ScrollReveal } from '@/components/animations';

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <ScrollReveal delay={0}>
        <HomeSlider />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <NotifidText />
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <ServiceBox />
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <FeaturedCategory />
      </ScrollReveal>
      <ScrollReveal delay={0.4}>
        <PhysicalStores />
      </ScrollReveal>

      <ScrollReveal delay={0.5}>
        <FeaturedProducts />
      </ScrollReveal>
    </div>
  );
};

export default HomePage;
