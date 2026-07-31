import { MapPinCheck, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white mb-12 xl:mb-0 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="flex flex-col gap-6 py-4">
              <h1 className="text-2xl font-semibold">support</h1>
              <div className="flex items-center gap-3 border-l-2 border-gray-600 pl-2 rounded-md">
                <Phone className="w-5 h-5" />
                <Separator className="my-2 h-9" orientation="vertical" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">
                    9:00 AM - 8:00 PM
                  </span>
                  <span className="text-2xl font-bold text-gray-300">
                    ab-net 😍
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 border-l-2 border-gray-600 pl-2 rounded-md">
                <MapPinCheck className="w-5 h-5" />
                <Separator className="my-2 h-9" orientation="vertical" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Store Locator</span>
                  <span className="text-lg font-extrabold text-gray-300">
                    Find us
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-6 py-4">
              <h1 className="text-2xl font-semibold">About Us</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                <div>
                  <ul>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Affiliate Program
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Online Delivery
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Refund and Returns policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Blog
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <ul>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        EMI Terms
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Refund and Returns policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <ul>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Terms and Conditions
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Career
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        Brands
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-6 py-4">
              <h1 className="text-2xl font-semibold">Stay Connected</h1>
              <div>
                <h2 className="text-lg font-bold text-gray-300">
                  Apple IT Zone
                </h2>
                <p className="text-sm text-gray-400">
                  Head Office: 28 Kazi Nazrul Islam Ave,Navana Zohura Square,
                  Dhaka 1000
                </p>
                <p className="text-sm text-gray-400">Phone: +8801712345678</p>
                <p className="text-sm text-gray-400">
                  Email: info@appleitzone.com
                </p>
              </div>
            </div>
          </div>
        </div>
        <Separator className="h-0.5 bg-gray-700" />
        <div className="flex justify-center my-4">
          <ul className="flex flex-wrap gap-4">
            <li className="transition duration-200 ease-in-out hover:scale-105">
              <Link href="/" className="text-gray-400 hover:text-blue-600">
                <FaWhatsapp size={24} />
              </Link>
            </li>
            <li className="transition duration-200 ease-in-out hover:scale-105">
              <Link href="/" className="text-gray-400 hover:text-blue-600">
                <FaFacebook size={24} />
              </Link>
            </li>
            <li className="transition duration-200 ease-in-out hover:scale-105">
              <Link href="/" className="text-gray-400 hover:text-blue-600">
                <FaYoutube size={24} />
              </Link>
            </li>
            <li className="transition duration-200 ease-in-out hover:scale-105">
              <Link href="/" className="text-gray-400 hover:text-blue-600">
                <FaInstagram size={24} />
              </Link>
            </li>
          </ul>
        </div>
        <Separator className="h-0.5 bg-gray-700" />
        <div className="py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} Apple IT Zone. All rights reserved.
          </p>
          <p className="text-center lg:text-right">
            Powered by:{' '}
            <span className="text-blue-600 font-semibold italic">
              Apple IT Zone
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
