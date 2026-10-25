import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { LogOut, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  pageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    logout();
    try {
      await signOut();
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 bg-black/75 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-white tracking-tight font-manrope">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Active AI Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-mono font-semibold border border-white/20 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#ef233c] animate-pulse shadow-sm shadow-[#ef233c]"></span>
          <Bot className="w-3.5 h-3.5 text-[#ef233c]" />
          <span>Claude 3.5 Engine</span>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3 pl-3 border-l border-white/15">
          <Link
            to="/settings"
            className="flex items-center space-x-2.5 text-zinc-200 hover:text-white transition group"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-[#ef233c]/50 flex items-center justify-center font-bold text-xs text-[#ef233c] group-hover:border-[#ef233c] transition-colors shadow-sm">
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'CP'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-white leading-none font-manrope">{user?.full_name || 'Candidate'}</p>
              <p className="text-zinc-300 text-[11px] font-mono font-medium leading-tight mt-1">{user?.profile?.preferred_role || 'Developer'}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-zinc-300 hover:text-[#ef233c] hover:bg-[#ef233c]/10 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
