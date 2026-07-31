'use client';
import { CategoryNav } from '@/components/store/layout/CategoryNav';
import Footer from '@/components/store/layout/Footer';
import TopNav from '@/components/store/layout/TopNav';
import StoreQuickActions from '@/components/store/layout/StoreQuickActions';

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TopNav />
      <CategoryNav />
      {children}
      <StoreQuickActions />
      <Footer />
    </div>
  );
};

export default StoreLayout;
