import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    categoryId: '',
    subCategoryId: '',
    variants: [{ ram: '', price: '', qty: '' }]
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    subCategoryId: ''
  });
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const { isAdmin } = useAuth();

  // Fetch products, categories, and subcategories
  const fetchData = async () => {
    try {
      if (!filters.search) {
        setLoading(true);
      }

      // Build query string for filtering
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.subCategoryId && { subCategoryId: filters.subCategoryId })
      });

      const [productsRes, categoriesRes, subCategoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/products?${queryParams}`),
        axios.get(`${API_URL}/api/categories`),
        axios.get(`${API_URL}/api/categories/sub/all`)
      ]);

      setProducts(productsRes.data.products);
      setPagination(productsRes.data.pagination);
      setCategories(categoriesRes.data);
      setSubCategories(subCategoriesRes.data);
    } catch (err) {
      toast.error('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, filters]);

  // Update filtered subcategories when category changes
  useEffect(() => {
    if (filters.categoryId) {
      const filtered = subCategories.filter(
        subCat => subCat.category._id === filters.categoryId
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories(subCategories);
    }
  }, [filters.categoryId, subCategories]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'categoryId') {
      // When category changes, reset subcategory
      setFormData({
        ...formData,
        categoryId: value,
        subCategoryId: ''
      });

      // Update filtered subcategories
      const filtered = subCategories.filter(
        subCat => subCat.category._id === value
      );
      setFilteredSubCategories(filtered);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle variant input changes
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };

    setFormData({
      ...formData,
      variants: updatedVariants
    });
  };

  // Add new variant
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { ram: '', price: '', qty: '' }]
    });
  };

  // Remove variant
  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        variants: updatedVariants
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await axios.put(`${API_URL}/api/products/${currentId}`, formData);
        toast.success("Product Updated Successfully !")
      } else {
        await axios.post(`${API_URL}/api/products`, formData);
        toast.success("Product Added Successfully !")
      }

      // Reset form and fetch updated products
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      categoryId: '',
      subCategoryId: '',
      variants: [{ ram: '', price: '', qty: '' }]
    });
    setEditMode(false);
    setCurrentId(null);
    setShowModal(false);
  };

  // Handle edit button click
  const handleEdit = (product) => {
    // Update filtered subcategories based on product's category
    const filtered = subCategories.filter(
      subCat => subCat.category._id === product.category._id
    );
    setFilteredSubCategories(filtered);

    setFormData({
      name: product.name,
      description: product.description,
      image: product.image,
      categoryId: product.category._id,
      subCategoryId: product.subCategory._id,
      variants: product.variants
    });
    setEditMode(true);
    setCurrentId(product._id);
    setShowModal(true);
  };

  // Handle delete button click
  const handleDelete = async (id,name) => {
    const result = await Swal.fire({
      title: `Are you sure to delete ${name} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/products/${id}`);
        toast.success("Product Deleted Successfully !")
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'An error occurred');
      }
    }
  };

  // Open modal for adding new product
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'categoryId') {
      // When category filter changes, reset subcategory filter
      setFilters({
        ...filters,
        categoryId: value,
        subCategoryId: ''
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }

    // Reset to first page when filters change
    if (pagination.page !== 1) {
      setPagination({
        ...pagination,
        page: 1
      });
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when search is performed
    if (pagination.page !== 1) {
      setPagination({
        ...pagination,
        page: 1
      });
    } else {
      // If already on page 1, manually fetch data
      fetchData();
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({
        ...pagination,
        page: newPage
      });
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    try {
      await axios.post(`${API_URL}/api/wishlist`, { productId });
      toast.success('Product added to wishlist');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message === 'Product already in wishlist') {
        toast.error('Product is already in your wishlist');
      } else {
        toast.error(err.response?.data?.message || 'An error occurred');
      }
    }
  };

  if (loading && products.length === 0) {
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
        <h3 className="mb-4 mt-4">Products</h3>
        {isAdmin() && (
          <button className="btn btn-success" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-2"></i>Add Product
          </button>
        )}
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  name="subCategoryId"
                  value={filters.subCategoryId}
                  onChange={handleFilterChange}
                  disabled={!filters.categoryId}
                >
                  <option value="">All Subcategories</option>
                  {filteredSubCategories.map(subCategory => (
                    <option key={subCategory._id} value={subCategory._id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-search me-2"></i>Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover text-center">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Variants</th>
                  <th>Wishlist</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">No products found</td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product._id}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td>{product.name}</td>
                      <td>{product.category?.name || '-'}</td>
                      <td>{product.subCategory?.name || '-'}</td>
                      <td>
                        {product.variants.length} variant(s)
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => addToWishlist(product._id)}
                        >
                          <i className="bi bi-heart me-2"></i>Add to Wishlist
                        </button>
                      </td>
                      <td>
                        {isAdmin() && (
                          <>
                            <button
                              className="btn btn-md btn-outline-primary me-2"
                              onClick={() => handleEdit(product)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-md btn-outline-danger me-2"
                              onClick={() => handleDelete(product._id,product.name)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <nav aria-label="Product pagination">
              <ul className="pagination justify-content-center mt-4">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(pagination.pages).keys()].map(page => (
                  <li
                    key={page + 1}
                    className={`page-item ${pagination.page === page + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Product' : 'Add Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="categoryId" className="form-label">Category</label>
                      <select
                        className="form-select"
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="subCategoryId" className="form-label">Subcategory</label>
                      <select
                        className="form-select"
                        id="subCategoryId"
                        name="subCategoryId"
                        value={formData.subCategoryId}
                        onChange={handleChange}
                        required
                        disabled={!formData.categoryId}
                      >
                        <option value="">Select Subcategory</option>
                        {filteredSubCategories.map(subCategory => (
                          <option key={subCategory._id} value={subCategory._id}>
                            {subCategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label">Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="Enter image URL or leave blank for default"
                    />
                  </div>

                  <h5 className="mt-4 mb-3">Variants</h5>
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-4">
                            <label htmlFor={`ram-${index}`} className="form-label">RAM</label>
                            <input
                              type="text"
                              className="form-control"
                              id={`ram-${index}`}
                              value={variant.ram}
                              onChange={(e) => handleVariantChange(index, 'ram', e.target.value)}
                              required
                              placeholder="e.g., 4GB, 8GB"
                            />
                          </div>
                          <div className="col-md-4">
                            <label htmlFor={`price-${index}`} className="form-label">Price</label>
                            <input
                              type="number"
                              className="form-control"
                              id={`price-${index}`}
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                              required
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="col-md-4">
                            <label htmlFor={`qty-${index}`} className="form-label">Quantity</label>
                            <input
                              type="number"
                              className="form-control"
                              id={`qty-${index}`}
                              value={variant.qty}
                              onChange={(e) => handleVariantChange(index, 'qty', e.target.value)}
                              required
                              min="0"
                            />
                          </div>
                        </div>
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger mt-3"
                            onClick={() => removeVariant(index)}
                          >
                            Remove Variant
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addVariant}
                  >
                    Add Variant
                  </button>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;