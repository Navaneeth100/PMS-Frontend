import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import SubCategories from './pages/SubCategories.jsx';
import Products from './pages/Products';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import { ToastContainer } from 'react-toastify';

const App = () => {
  const { user, loading } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="text-center p-5">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  // Admin route component
  const AdminRoute = ({ children }) => {
    if (loading) return <div className="text-center p-5">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="subcategories" element={<SubCategories />} />
          <Route path="products" element={<Products />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;