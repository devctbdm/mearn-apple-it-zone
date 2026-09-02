import { LiquidBlob } from '@/components/LiquidBlob';

const loading = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <LiquidBlob size={128} />
    </div>
  );
};

export default loading;
