import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, ArrowRight, Clock } from 'lucide-react';

const Dashboard = () => {
    const [rcas, setRCAs] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRCAs();
    }, []);

    const fetchRCAs = async (query = '') => {
        try {
            const res = await axios.get(`http://localhost:5001/api/rca?search=${query}`);
            setRCAs(res.data);
        } catch (err) {
            console.error(err);
            // Fallback for demo if no backend connectivity
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchRCAs(val);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const res = await axios.post('http://localhost:5001/api/rca/upload-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Redirect to edit page with the new RCA ID
            navigate(`/create?edit=${res.data._id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to upload PDF.');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="heading-1">Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>manage and analyze your root cause investigations.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search RCAs..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {rcas.map((rca) => (
                    <div key={rca._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <h3 className="heading-2" style={{ fontSize: '1.25rem', marginBottom: 0 }}>{rca.problem}</h3>
                            <span className="badge">{rca.status}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flex: 1 }}>
                            {rca.description?.length > 100 ? rca.description.substring(0, 100) + '...' : rca.description}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {rca.tags?.map(tag => (
                                <span key={tag} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px' }}>#{tag}</span>
                            ))}
                        </div>
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {new Date(rca.createdAt).toLocaleDateString()}
                            </span>
                            <Link to={`/rca/${rca._id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', textDecoration: 'none' }}>
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {rcas.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                    <p>No RCAs found.</p>
                    <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>
                        Create your first RCA
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
