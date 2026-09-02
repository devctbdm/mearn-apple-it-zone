import { cn } from '@/lib/utils';

interface LiquidBlobProps {
  className?: string;
  size?: number;
}

export function LiquidBlob({ className, size = 56 }: LiquidBlobProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary via-secondary to-accent opacity-90 animate-loader-blob blur-[2px]" />
      <div
        className="absolute inset-[15%] bg-background rounded-full animate-loader-blob"
        style={{ animationDirection: 'reverse', animationDuration: '3s' }}
      />
    </div>
  );
}
