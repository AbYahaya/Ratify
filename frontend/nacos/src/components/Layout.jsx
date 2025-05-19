import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Pay', path: '/pay' },
    { name: 'Check Status', path: '/check' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-700 text-white py-4 shadow">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">NACOS Payment Portal</h1>
          <nav className="space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`hover:underline ${
                  location.pathname === item.path ? 'font-bold underline' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="bg-gray-200 text-center py-4 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} NACOS. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
// This code defines a Layout component that serves as a wrapper for the main content of the application.
// It includes a header with navigation links, a main content area, and a footer. The navigation links are dynamically generated based on the `navItems` array.
// The `useLocation` hook from `react-router-dom` is used to determine the current path, allowing for conditional styling of the active link.
// The layout is styled using Tailwind CSS classes for a responsive and modern design.