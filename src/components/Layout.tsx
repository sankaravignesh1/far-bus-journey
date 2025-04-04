import React from 'react';
import Navbar from './Navbar';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-far-black text-far-cream py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-serif mb-4">FAR</h3>
              <p className="text-sm text-far-cream/80 max-w-xs">Reliable bus booking service for all your journey needs.</p>
            </div>
            
            <div className="py-0">
              <h4 className="text-lg font-serif mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@farbuses.com</li>
                <li>Phone: 1800-123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-far-cream/20 text-center text-sm text-far-cream/60">
            <p>© {new Date().getFullYear()} FAR Bus Service. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Layout;