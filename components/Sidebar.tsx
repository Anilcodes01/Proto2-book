"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuNotebook, LuMenu, LuX } from "react-icons/lu";
import { RiGeminiFill } from "react-icons/ri";
import { MdOutlineAnalytics } from "react-icons/md";
import { Book } from 'lucide-react';
import { TbLayoutDashboard } from "react-icons/tb";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: TbLayoutDashboard },
  { name: "Book Info", href: "/step1", icon: Book },
  { name: "Book Content & Design", href: "/step2", icon: LuNotebook },
  { name: "Distribution & Pricing", href: "/step3", icon: RiGeminiFill },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on mobile based on screen width
  const [isMobile, setIsMobile] = useState(false);

  // Effect to handle window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Set up listener
    window.addEventListener('resize', checkIsMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Load collapsed state from localStorage (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const storedCollapsedState = localStorage.getItem("sidebarCollapsed");
      if (storedCollapsedState !== null) {
        setIsCollapsed(JSON.parse(storedCollapsedState));
      }
    }
  }, [isMobile]);

  // Save collapsed state to localStorage (desktop only)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMobile]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Mobile menu toggle button (always visible on mobile)
  const MobileMenuButton = () => (
    <button
      className="fixed top-4 left-4 z-50 md:hidden bg-sky-100 p-2 rounded-lg shadow-md"
      onClick={toggleSidebar}
      aria-label={isMobileOpen ? "Close menu" : "Open menu"}
    >
      {isMobileOpen ? <LuX size={24} /> : <LuMenu size={24} />}
    </button>
  );

  return (
    <>
      <MobileMenuButton />
      
      {/* Desktop sidebar */}
      <aside
        className={`
          fixed top-0 bg-sky-100 mt-16 left-0 z-40 h-screen 
          backdrop-blur-md
          border-r border-white/40
          transition-all duration-300 ease-in-out
          hidden md:block
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="px-3 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center p-3 rounded-xl group transition-all duration-200
                    ${isCollapsed ? "justify-center" : ""}
                    ${
                      isActive
                        ? "bg-white text-gray-800"
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-800"
                    }
                  `}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon
                    className={`
                      h-5 w-5 flex-shrink-0
                      transition-colors duration-200
                      ${isCollapsed ? "" : "mr-3"}
                    `}
                    aria-hidden="true"
                  />
                  <span
                    className={`${
                      isCollapsed ? "sr-only" : "block"
                    } font-medium`}
                  >
                    {item.name}
                  </span>
                  {!isCollapsed && isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-white"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-white/20"></div>
        </div>
      </aside>

      {/* Mobile sidebar (overlay) */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300
          ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />
      
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen 
          w-64 bg-sky-100 backdrop-blur-md
          border-r border-white/40
          transition-all duration-300 ease-in-out
          md:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="pt-16 flex flex-col justify-between h-full">
          <nav className="px-3 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center p-3 rounded-xl group transition-all duration-200
                    ${
                      isActive
                        ? "bg-white text-gray-800"
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-800"
                    }
                  `}
                >
                  <item.icon
                    className="h-5 w-5 flex-shrink-0 mr-3 transition-colors duration-200"
                    aria-hidden="true"
                  />
                  <span className="font-medium">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-white"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-white/20 mb-4"></div>
        </div>
      </aside>
    </>
  );
}