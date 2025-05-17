import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { isAdmin } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              to="/dashboard"
            >
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              to="/categories"
            >
              <i className="bi bi-grid me-2"></i>
              Categories
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              to="/subcategories"
            >
              <i className="bi bi-diagram-3 me-2"></i>
              Sub-Categories
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              to="/products"
            >
              <i className="bi bi-box me-2"></i>
              Products
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              to="/wishlist"
            >
              <i className="bi bi-heart me-2"></i>
              Wishlist
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;