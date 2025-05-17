import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist items
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/wishlist`);
      setWishlistItems(res.data.products);
    } catch (err) {
      toast.error('Failed to load wishlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = async (productId, name) => {
    const result = await Swal.fire({
      title: `Are you sure to Remove ${name} from Wishlist ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/wishlist/${productId}`);
        toast.success("Product Removed Successfully !")
        fetchWishlist();
      } catch (err) {
        toast.error(err.response?.data?.message || 'An error occurred');
      }
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    const result = await Swal.fire({
      title: `Are you sure to Clear All in Wishlist ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Clear All',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/wishlist`);
        toast.success("Wishlist Cleared Successfully !")
        fetchWishlist();
      } catch (err) {
        toast.error(err.response?.data?.message || 'An error occurred');
      }
    }
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-4 mt-4">My Wishlist</h3>
        {wishlistItems.length > 0 && (
          <button className="btn btn-danger" onClick={clearWishlist}>
            <i className="bi bi-trash me-2"></i>Clear Wishlist
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="alert alert-info">
          Your wishlist is empty. Browse products and add items to your wishlist.
        </div>
      ) : (
        <div className="row">
          {wishlistItems.map(product => (
            <div key={product._id} className="col-md-6 col-lg-4 mb-4">
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
                  <p className="card-text">{product.description}</p>

                  <h6>Variants:</h6>
                  <ul className="list-group mb-3">
                    {product.variants.map((variant, index) => (
                      <li key={index} className="list-group-item">
                        <strong>RAM:</strong> {variant.ram},&nbsp;
                        <strong>Price:</strong> ${variant.price},&nbsp;
                        <strong>Qty:</strong> {variant.qty}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-footer text-center">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => removeFromWishlist(product._id, product.name)}
                  >
                    <i className="bi bi-heart-fill me-2"></i>Remove from Wishlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;