import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, FileSpreadsheet, PenSquare, ChevronRight, Menu, X, ChevronLeftCircle, ChevronRightCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const links = [
    { path: '/', label: 'Dashboard', icon: <BarChart3 className="h-5 w-5" /> },
    { path: '/summary', label: 'Summary Sheet', icon: <FileSpreadsheet className="h-5 w-5" /> },
    { path: '/front-sheet', label: 'Front Sheet', icon: <PenSquare className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-white shadow-sm z-50 flex items-center px-4">
        <img 
          src="/logo.png" 
          alt="Company Logo" 
          className="h-12 w-auto mr-3"
        />
        <h1 className="text-2xl font-bold text-gray-800">Steel Estimation</h1>
      </div>

      {/* Sidebar for desktop */}
      <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 mt-20 ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}`}>
        <div className="flex flex-col w-full border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-2 bg-white space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors`}
                  title={sidebarCollapsed ? link.label : undefined}
                >
                  {link.icon}
                  {!sidebarCollapsed && <span className="ml-3">{link.label}</span>}
                  {!sidebarCollapsed && location.pathname === link.path && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
          {/* Collapse button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 m-2 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            {sidebarCollapsed ? (
              <ChevronRightCircle className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeftCircle className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden fixed top-20 left-0 right-0 bottom-0 z-40">
        <div className={`fixed inset-0 flex transform ease-in-out duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${
                      location.pathname === link.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md`}
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex-shrink-0 w-14"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none mt-20">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;