// app/page.tsx
import Marquee from '@/components/homeComponents/Marquee';

const notifications = [
  'New iPhone 15 Pro Max available in-store',
  '20% off on all MacBooks this week',
  'Free shipping on orders over $100',
  'Latest iPad Pro now on sale',
  'Apple Watch Series 9 discount ends soon',
];

export default function NotifidText() {
  return (
    <div className="bg-gray-100 rounded-md py-2">
      <Marquee speed="slow">
        {notifications.map((notification, index) => (
          <span key={index}>{notification}</span>
        ))}
      </Marquee>
    </div>
  );
}
