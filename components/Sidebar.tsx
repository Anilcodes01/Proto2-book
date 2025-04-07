"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuNotebook, LuMenu, LuX } from "react-icons/lu";
import { RiGeminiFill } from "react-icons/ri";
// MdOutlineAnalytics was not used, removed import
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
      // Use innerWidth as it's more reliable for layout checks
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
    } else {
       // Ensure mobile sidebar is closed if screen size changes to mobile
       setIsMobileOpen(false);
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
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [pathname]); // Removed isMobileOpen dependency to avoid potential loops

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
      // Note: You might want a separate button for desktop toggle
      // This current toggleSidebar function is primarily triggered by the mobile button
    }
  };

  // Mobile menu toggle button (always visible on mobile, top-right)
  const MobileMenuButton = () => (
    <button
      className="fixed top-4 right-4 z-50 md:hidden bg-sky-100 p-2 rounded-lg shadow-md" // Changed left-4 to right-4
      onClick={toggleSidebar}
      aria-label={isMobileOpen ? "Close menu" : "Open menu"}
    >
      {isMobileOpen ? <LuX size={24} /> : <LuMenu size={24} />}
    </button>
  );

  return (
    <>
      {/* Render mobile button only on mobile */}
      {isMobile && <MobileMenuButton />}

      {/* --- Desktop Sidebar (Left Aligned) --- */}
      <aside
        className={`
          fixed top-0 bg-sky-100 mt-16 left-0 z-30 h-screen /* Lower z-index than mobile */
          backdrop-blur-md
          border-r border-white/40
          transition-all duration-300 ease-in-out
          hidden md:block /* Hide on mobile, block on medium+ */
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* Consider adding a desktop toggle button here if needed */}
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
                        ? "bg-white text-gray-800 shadow-sm" // Added shadow for active
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
                      isCollapsed ? "sr-only" : "block" // Using sr-only is better for accessibility
                    } font-medium whitespace-nowrap`} // Added whitespace-nowrap
                  >
                    {item.name}
                  </span>
                  {/* Indicator dot - consider removing if using background color */}
                  {/* {!isCollapsed && isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-blue-500"></div>
                  )} */}
                </Link>
              );
            })}
          </nav>

          {/* Optional Footer Area */}
          <div className="px-3 py-4 border-t border-white/20">
             {/* Add collapse button or other footer items here */}
          </div>
        </div>
      </aside>

      {/* --- Mobile Sidebar (Right Aligned Overlay) --- */}

      {/* Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300
          ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar Content */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-screen /* Positioned top-right, highest z-index */
          w-64 bg-sky-100 backdrop-blur-md
          border-l border-white/40 /* Border on the left edge */
          transition-transform duration-300 ease-in-out /* Changed transition property */
          md:hidden /* Hidden on medium+ screens */
          ${isMobileOpen ? "translate-x-0" : "translate-x-full"} /* Slide in/out from right */
        `}
        aria-label="Mobile navigation" // Added aria-label
      >
        {/* Optional: Add a close button inside the sidebar itself */}
         <button
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
         >
            <LuX size={24} />
         </button>

        <div className="pt-16 flex flex-col justify-between h-full"> {/* Added padding-top */}
          <nav className="px-3 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  // onClick={() => setIsMobileOpen(false)} // Optionally close on link click
                  className={`
                    flex items-center p-3 rounded-xl group transition-all duration-200
                    ${
                      isActive
                        ? "bg-white text-gray-800 shadow-sm" // Added shadow for active
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-800"
                    }
                  `}
                >
                  <item.icon
                    className="h-5 w-5 flex-shrink-0 mr-3 transition-colors duration-200"
                    aria-hidden="true"
                  />
                  <span className="font-medium whitespace-nowrap"> {/* Added whitespace-nowrap */}
                    {item.name}
                  </span>
                   {/* Indicator dot - consider removing */}
                  {/* {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-blue-500"></div>
                  )} */}
                </Link>
              );
            })}
          </nav>

          {/* Optional Footer Area */}
          <div className="px-3 py-4 border-t border-white/20 mb-4">
             {/* Footer content if needed */}
          </div>
        </div>
      </aside>
    </>
  );
}