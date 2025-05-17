import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary" style={{minHeight:"70px"}}>
      <div className="container-fluid">
        <button
          className="btn btn-primary me-2"
          onClick={toggleSidebar}
        >
          <i className="bi bi-list"></i>
        </button>
        <Link className="navbar-brand" to="/dashboard">
          Product Management System
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <button
                    className="btn btn-light"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;