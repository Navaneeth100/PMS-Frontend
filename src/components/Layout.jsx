import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="container-fluid flex-grow-1">
        <div className="row">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`col px-4 py-3 ${sidebarOpen ? 'col-md-9 col-lg-10' : 'col-12'}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;