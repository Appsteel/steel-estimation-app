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
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-blue-100 shadow-sm z-50">
        <div className="flex items-center h-full px-4">
          <img 
            src="/logo.png" 
            alt="Company Logo" 
            className="h-12 w-auto mr-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Steel Estimation</h1>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 bg-blue-100 border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } hidden md:block`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'bg-white text-blue-600'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
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
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 m-2 rounded-lg hover:bg-white flex items-center justify-center"
          >
            {sidebarCollapsed ? (
              <ChevronRightCircle className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeftCircle className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity duration-300 ${
        mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <aside className={`fixed inset-y-0 left-0 w-64 bg-blue-100 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${
                    location.pathname === link.path
                      ? 'bg-white text-blue-600'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  } group flex items-center px-2 py-3 text-base font-medium rounded-md`}
                >
                  {link.icon}
                  <span className="ml-3">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="md:hidden px-4 py-2 bg-blue-100 border-b border-gray-200">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
