import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Activity, CheckCircle, Tag, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RCADetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rca, setRCA] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchRCA = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/rca/${id}`);
                setRCA(res.data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load RCA details.');
            } finally {
                setLoading(false);
            }
        };
        fetchRCA();
    }, [id]);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5001/api/rca/${id}`);
            toast.success('RCA deleted successfully');
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete RCA");
            setShowDeleteConfirm(false);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading RCA details...</div>;
    if (!rca) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>RCA not found.</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate(`/create?edit=${id}`)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Edit size={16} /> Edit RCA
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="btn"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'white',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            </div>

            <div className="card">
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h1 className="heading-1" style={{ marginBottom: 0 }}>{rca.problem}</h1>
                        <span className="badge" style={{ fontSize: '0.875rem' }}>{rca.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} /> Created: {new Date(rca.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={16} /> Impact: Medium
                        </span>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h2 className="heading-2">Description</h2>
                    <p style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
                        {rca.description}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <h2 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error-color)' }}>
                            <AlertTriangle size={24} /> Root Causes
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {rca.rootCauses?.map((cause, index) => (
                                <div key={index} style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--error-color)' }}>Why #{index + 1}?</div>
                                    {cause}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success-color)' }}>
                            <CheckCircle size={24} /> Corrective Actions
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {rca.actions?.map((action, index) => (
                                <div key={index} style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--success-color)' }}>Action #{index + 1}</div>
                                    {action}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {(rca.tags && rca.tags.length > 0) && (
                    <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {rca.tags.map(tag => (
                                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
                                    <Tag size={12} /> {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card animate-fade-in" style={{ width: '400px', padding: '2rem', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>!</div>
                        </div>
                        <h3 className="heading-2" style={{ marginBottom: '0.5rem' }}>Delete this RCA?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            This action cannot be undone. This will permanently delete the RCA and all associated data.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn"
                                style={{
                                    flex: 1,
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RCADetails;
