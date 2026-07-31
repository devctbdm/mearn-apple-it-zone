'use client';
import Link from 'next/link';
import { Search, Gift, Sparkles, User, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/store';

import { useState, useEffect } from 'react';
import Logo from '@/components/store/logo/Logo';

const TopNav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('mobile_token'));
  }, []);

  return (
    <header className="w-full border-b border-white/10 bg-slate-900 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 lg:h-20 px-2">
        {/* Mobile Menu Toggle
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-9 w-9 rounded-xl text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white xl:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button> */}
        <Logo />

        <div className="xl:hidden items-center justify-center flex flex-row gap-x-2">
          {/* Search button */}
          <Button
            type="button"
            className="h-10 w-10 rounded-full p-0 hover:scale-105 transition-transform"
            onClick={() => console.log('Open search')}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Cart button with badge */}
          <Button
            type="button"
            className="relative h-10 w-10 rounded-full p-0 hover:scale-105 transition-transform"
            onClick={() => console.log('Open cart')}
          >
            <ShoppingCart className="h-4 w-4" />

            <Badge
              variant="secondary"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 px-0 text-xs text-white dark:bg-red-600"
            >
              {totalItems}
            </Badge>
          </Button>
        </div>

        {/* Search Bar - Desktop (unchanged) */}
        <div className="hidden flex-1 max-w-xl xl:block">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-purple-400" />
            <Input
              type="text"
              placeholder="Search for products, brands & more..."
              className="h-10 w-full rounded-xl border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 transition-all duration-300 focus:border-purple-500/50 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 hover:border-white/20"
            />
            <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 hidden items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 sm:flex">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="hidden xl:flex items-center gap-1 sm:gap-2">
          {/* Offers */}
          <Link
            href="/offers"
            className="group relative hidden items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white sm:flex"
          >
            <div className="relative">
              <Gift className="h-4.5 w-4.5" />
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
              </span>
            </div>
            <span className="hidden lg:inline">Offers</span>
            <Badge
              variant="secondary"
              className="hidden border-green-500/30 bg-green-500/10 px-1.5 py-0 text-[10px] font-medium text-green-400 lg:inline-flex"
            >
              New
            </Badge>
          </Link>

          {/* Holiday Special */}
          <Link
            href="/holiday"
            className="group hidden items-center gap-2 rounded-xl bg-linear-to-r from-amber-500/10 to-orange-500/10 px-3.5 py-2 text-sm font-medium text-amber-400 transition-all duration-300 hover:from-amber-500/20 hover:to-orange-500/20 hover:text-amber-300 sm:flex"
          >
            <Sparkles className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:rotate-12" />
            <span className="hidden lg:inline">Holiday</span>
            <span className="hidden text-[10px] font-light text-amber-400/70 lg:inline">
              Special
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden items-center gap-2 sm:flex">
            <User className="h-5 w-5 text-slate-400" />

            {isLoggedIn ? (
              <div className="flex flex-col">
                <h1 className="text-sm font-medium text-slate-300">Account</h1>
                <div className="flex gap-2 text-xs">
                  <Link
                    href="/accounts"
                    className="text-slate-400 hover:text-amber-400"
                  >
                    Profile
                  </Link>
                  <span className="text-slate-400">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('mobile_token');
                      document.cookie = 'token=; path=/; max-age=0';
                      window.location.reload();
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <h1 className="text-sm font-medium text-slate-300">Accounts</h1>
                <div className="flex gap-2 text-xs">
                  <Link
                    href="/login"
                    className="text-slate-400 hover:text-amber-400"
                  >
                    Login
                  </Link>
                  <span className="text-slate-400">|</span>
                  <Link
                    href="/register"
                    className="text-slate-400 hover:text-amber-400"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
