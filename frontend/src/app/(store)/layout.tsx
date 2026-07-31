import { CategoryNav } from '@/components/store/layout/CategoryNav';
import Footer from '@/components/store/layout/Footer';
import TopNav from '@/components/store/layout/TopNav';

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TopNav />
      <CategoryNav />
      {children}
      <Footer />
    </div>
  );
};

export default StoreLayout;
