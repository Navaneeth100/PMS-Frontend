import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    subCategories: 0,
    products: 0,
    wishlistItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [Products, setProducts] = useState([])
  const { user } = useAuth();


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, subCategoriesRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/api/categories`),
          axios.get(`${API_URL}/api/categories/sub/all`),
          axios.get(`${API_URL}/api/products`)
        ]);

        let wishlistRes = { data: { products: [] } };
        if (user) {
          wishlistRes = await axios.get(`${API_URL}/api/wishlist`);
        }

        setStats({
          categories: categoriesRes.data.length,
          subCategories: subCategoriesRes.data.length,
          products: productsRes.data.pagination.total,
          wishlistItems: wishlistRes.data.products.length
        });
        setProducts(productsRes.data.products)
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 mt-4">Dashboard</h3>

      <div className="row">

        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card bg-light text-info hover-dark-card h-100">
            <div className="card-body">
              <h4 className="card-title fw-bold">Products</h4>
              <h1 className="display-4 text-dark fw-bold">{stats.products}</h1>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card bg-light text-warning hover-dark-card h-100">
            <div className="card-body">
              <h4 className="card-title fw-bold">Categories</h4>
              <h1 className="display-4 text-dark fw-bold">{stats.categories}</h1>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card bg-light text-success hover-dark-card h-100">
            <div className="card-body fw-bold">
              <h4 className="card-title fw-bold">Sub-Categories</h4>
              <h1 className="display-4 text-dark fw-bold">{stats.subCategories}</h1>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card bg-light text-danger hover-dark-card h-100">
            <div className="card-body">
              <h4 className="card-title fw-bold">Wishlist Items</h4>
              <h1 className="display-4 text-dark fw-bold">{stats.wishlistItems}</h1>
            </div>
          </div>
        </div>
      </div>

      <div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>My Products</h3>
        </div>

        {Products.length === 0 ? (
          <div className="alert alert-info">
            No Products Added
          </div>
        ) : (
          <div className="row">
            {Products.map(product => (
              <div key={product._id} className="col-md-3 col-lg-3 mb-4">
                <div className="card h-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="card-img-top"
                      style={{ height: '200px' }}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/300x200?text=No+Image"
                      alt="No Image"
                      className="card-img-top"
                      style={{ height: '200px' }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">
                      {product.category?.name} / {product.subCategory?.name}
                    </h6>

                    <h6>Variants:</h6>
                    <ul className="list-group mb-3">
                      <li className="list-group-item">
                        <strong>RAM: </strong> {product.variants.map(v => v.ram).join(', ')} <br />
                        <strong>Price: </strong> ₹
                        {(() => {
                          const prices = product.variants.map(v => v.price);
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          return min === max ? `${min}` : `${min} - ₹${max}`;
                        })()} <br />
                        <strong>Qty: </strong>{product.variants.reduce((total, v) => total + v.qty, 0)}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  );
};

export default Dashboard;