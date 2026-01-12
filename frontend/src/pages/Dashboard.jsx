import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, ArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [rcas, setRCAs] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    // Load initial state from localStorage if available
    const [showDebugPanel, setShowDebugPanel] = useState(() => JSON.parse(localStorage.getItem('showDebugPanel')) || false);
    const [debugQuery, setDebugQuery] = useState(() => localStorage.getItem('debugQuery') || '');
    const [debugResult, setDebugResult] = useState(() => localStorage.getItem('debugResult') || '');
    const [relatedRCAs, setRelatedRCAs] = useState(() => JSON.parse(localStorage.getItem('relatedRCAs')) || []);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchRCAs();
    }, []);

    // Persist debug state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('showDebugPanel', JSON.stringify(showDebugPanel));
        localStorage.setItem('debugQuery', debugQuery);
        localStorage.setItem('debugResult', debugResult);
        localStorage.setItem('relatedRCAs', JSON.stringify(relatedRCAs));
    }, [showDebugPanel, debugQuery, debugResult, relatedRCAs]);

    const fetchRCAs = async (query = '') => {
        try {
            const res = await axios.get(`http://localhost:5001/api/rca?search=${query}`);
            setRCAs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchRCAs(val);
    };

    const handleSmartDebug = async () => {
        if (!debugQuery.trim()) return;
        setAnalyzing(true);
        setDebugResult('');
        setRelatedRCAs([]);
        try {
            const res = await axios.post('http://localhost:5001/api/rca/smart-debug', { query: debugQuery });
            setDebugResult(res.data.analysis);
            if (res.data.relatedRCAs) {
                setRelatedRCAs(res.data.relatedRCAs);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to analyze. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="heading-1">Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and analyze your root cause investigations.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
            </div>

            {/* AI Smart Debug Section */}
            <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary-color)', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent)' }}>
                <div
                    onClick={() => setShowDebugPanel(!showDebugPanel)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                    <h2 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                        <Clock size={20} /> AI Smart Debug Assistant
                    </h2>
                    <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>{showDebugPanel ? '−' : '+'}</span>
                </div>

                {showDebugPanel && (
                    <div className="animate-fade-in" style={{ marginTop: '1rem' }}>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Paste your error log or describe the issue. Our AI will analyze the knowledge base to find a fix and similar past incidents.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                            <textarea
                                className="input"
                                rows="3"
                                placeholder="E.g., Getting 'Connection Refused' on port 5001..."
                                value={debugQuery}
                                onChange={(e) => setDebugQuery(e.target.value)}
                                style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}
                            />
                            <button
                                onClick={handleSmartDebug}
                                disabled={analyzing}
                                className="btn btn-primary"
                                style={{ height: 'fit-content', whiteSpace: 'nowrap' }}
                            >
                                {analyzing ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>

                        {debugResult && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Analysis Result:</h3>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    {debugResult}
                                </div>

                                {relatedRCAs.length > 0 && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Related Past Incidents</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {relatedRCAs.map(rca => (
                                                <div key={rca._id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--surface-color)' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{rca.problem}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                        {rca.description ? rca.description.substring(0, 60) + '...' : ''}
                                                    </div>
                                                    <Link to={`/rca/${rca._id}`} style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
                                                        View Solution &rarr;
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
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
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Link to={`/rca/${rca._id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', textDecoration: 'none' }}>
                                    View Details
                                </Link>
                            </div>
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
