import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Activity, CheckCircle, Tag, AlertTriangle, Edit } from 'lucide-react';

const RCADetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rca, setRCA] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRCA = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/rca/${id}`);
                setRCA(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load RCA details.');
            } finally {
                setLoading(false);
            }
        };
        fetchRCA();
    }, [id]);

    if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading RCA details...</div>;
    if (error) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', color: 'var(--error-color)' }}>{error}</div>;
    if (!rca) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>RCA not found.</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate(`/create?edit=${id}`)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Edit size={16} /> Edit RCA
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
        </div>
    );
};

export default RCADetails;
