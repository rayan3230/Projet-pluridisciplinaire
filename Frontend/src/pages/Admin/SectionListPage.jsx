import React, { useState, useEffect } from 'react';
import {
  getSections,
  deleteSection,
  getPromos,
  createSection,
  updateSection,
} from '../../services/academicService';
import SectionForm from '../../components/Admin/SectionForm';
import './SectionListPage.css';

const SectionListPage = () => {
  const [sections, setSections] = useState([]);
  const [promos, setPromos] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsData, promosData] = await Promise.all([
        getSections(selectedPromo ? { promo: selectedPromo } : {}),
        getPromos()
      ]);
      setSections(sectionsData);
      setPromos(promosData);
      setError(null);
    } catch (err) {
      setError('Failed to load sections and promos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPromo]);

  const handleCreate = async (sectionData) => {
    try {
      await createSection(sectionData);
      await fetchData();
      setIsFormOpen(false);
    } catch (err) {
      setError('Failed to create section');
      console.error('Error creating section:', err);
      throw err;
    }
  };

  const handleUpdate = async (sectionData) => {
    try {
      await updateSection(editingSection.id, sectionData);
      await fetchData();
      setIsFormOpen(false);
      setEditingSection(null);
    } catch (err) {
      setError('Failed to update section');
      console.error('Error updating section:', err);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteSection(id);
        await fetchData();
      } catch (err) {
        setError('Failed to delete section');
        console.error('Error deleting section:', err);
      }
    }
  };

  const getPromoDisplayName = (promo) => {
    if (!promo) return '';
    return `${promo.name} (${promo.speciality?.name || 'No Speciality'})`;
  };

  return (
    <div className="admin-page-container">
      <div className="sections-header">
        <h2>Existing Sections</h2>
        <div className="filter-control">
          <label htmlFor="promo-filter">Filter by Promo:</label>
          <select
            id="promo-filter"
            className="admin-select"
            value={selectedPromo}
            onChange={(e) => setSelectedPromo(e.target.value)}
          >
            <option value="">All Promos</option>
            {promos.map((promo) => (
              <option key={promo.id} value={promo.id}>
                {getPromoDisplayName(promo)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">Loading sections...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Promo</th>
                <th>Speciality</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id}>
                  <td>{section.name}</td>
                  <td>{section.promo?.name || 'No Promo'}</td>
                  <td>{section.promo?.speciality?.name || 'No Speciality'}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="admin-button edit-button"
                        onClick={() => {
                          setEditingSection(section);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-button delete-button"
                        onClick={() => handleDelete(section.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        className="admin-button add-button"
        onClick={() => {
          setEditingSection(null);
          setIsFormOpen(true);
        }}
      >
        Add New Section
      </button>

      {isFormOpen && (
        <SectionForm
          onSubmit={editingSection ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingSection(null);
          }}
          initialData={editingSection}
          promos={promos}
        />
      )}
    </div>
  );
};

export default SectionListPage; 