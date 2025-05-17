import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await axios.put(`${API_URL}/api/categories/${currentId}`, formData);
        toast.success("Category Updated Successfully !")
      } else {
        await axios.post(`${API_URL}/api/categories`, formData);
        toast.success("Category Added Successfully !")
      }

      // Reset form and fetch updated categories
      setFormData({ name: '', description: '' });
      setEditMode(false);
      setCurrentId(null);
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    }
  };

  // Handle edit button click
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditMode(true);
    setCurrentId(category._id);
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
          await axios.delete(`${API_URL}/api/categories/${id}`);
          toast.success("Category Deleted Successfully !")
          fetchCategories();
        } catch (err) {
          toast.error(err.response?.data?.message || 'An error occurred');
        }
    }
  };

    // Open modal for adding new category
    const openAddModal = () => {
      setFormData({ name: '', description: '' });
      setEditMode(false);
      setCurrentId(null);
      setShowModal(true);
    };

    if (loading && categories.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center mt-5" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-4 mt-4">Categories</h3>
          <button className="btn btn-success" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-2"></i>Add Category
          </button>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover text-center">
                <thead>
                  <tr>
                    <th>SN</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">No categories found</td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr key={category._id}>
                        <td>{index + 1}</td>
                        <td>{category.name}</td>
                        <td>{category.description || '-'}</td>
                        <td>
                          <button
                            className="btn btn-md btn-outline-primary me-2"
                            onClick={() => handleEdit(category)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-md btn-outline-danger"
                            onClick={() => handleDelete(category._id,category.name)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal for Add/Edit Category */}
        {showModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editMode ? 'Edit Category' : 'Add Category'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
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
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                      ></textarea>
                    </div>
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

  export default Categories;