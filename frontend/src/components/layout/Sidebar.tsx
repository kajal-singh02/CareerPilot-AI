import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  GitCompare,
  Briefcase,
  Milestone,
  FileEdit,
  Video,
  CheckSquare,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Resume Analyzer', to: '/resumes', icon: FileText },
  { name: 'Job Matcher', to: '/job-matcher', icon: GitCompare },
  { name: 'Recommended Jobs', to: '/jobs', icon: Briefcase },
  { name: 'Skill Gap & Roadmap', to: '/roadmap', icon: Milestone },
  { name: 'Resume Builder', to: '/resume-builder', icon: FileEdit },
  { name: 'AI Mock Interview', to: '/interviews', icon: Video, badge: 'AI' },
  { name: 'Application Tracker', to: '/applications', icon: CheckSquare },
  { name: 'Career Assistant', to: '/chat', icon: MessageSquare, badge: 'Claude' },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-black/85 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-[#ef233c] rotate-45 rounded-xs shadow-md shadow-[#ef233c]/50 transition-transform duration-300 hover:rotate-90"></div>
            <div>
              <span className="font-manrope font-bold text-white text-base tracking-tight">CareerPilot</span>
              <span className="text-[#ef233c] font-bold text-xs ml-1 font-mono">AI</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-5 h-5 bg-[#ef233c] rotate-45 rounded-xs shadow-md shadow-[#ef233c]/50"></div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition ${collapsed ? 'hidden' : 'block'}`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-[#ef233c] text-white shadow-lg shadow-[#ef233c]/30 font-bold'
                    : 'text-zinc-200 hover:bg-white/10 hover:text-white font-medium'
                } ${collapsed ? 'justify-center' : 'justify-between'}`
              }
              title={collapsed ? item.name : undefined}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </div>
              {!collapsed && item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ef233c]/20 text-[#ff4d6d] border border-[#ef233c]/40 font-mono">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer with Collapse Toggle on Small View */}
      {collapsed && (
        <div className="p-3 border-t border-white/10 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
