import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Save, Plus, X, BrainCircuit, AlertTriangle, CheckCircle } from 'lucide-react';

const CreateRCA = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const [formData, setFormData] = useState({
        problem: '',
        description: '',
        rootCauses: [''],
        actions: [''],
        tags: ''
    });

    const [similarRCAs, setSimilarRCAs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load data if editing
    useEffect(() => {
        if (editId) {
            setLoading(true);
            axios.get(`http://localhost:5001/api/rca/${editId}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        problem: data.problem || '',
                        description: data.description || '',
                        rootCauses: (data.rootCauses && data.rootCauses.length) ? data.rootCauses : [''],
                        actions: (data.actions && data.actions.length) ? data.actions : [''],
                        tags: data.tags ? data.tags.join(', ') : ''
                    });
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [editId]);

    // Intelligence Engine: Real-time similarity check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.problem && formData.problem.length > 3) {
                checkSimilarRCAs(formData.problem);
            } else {
                setSimilarRCAs([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.problem]);

    const checkSimilarRCAs = async (text) => {
        try {
            const res = await axios.get(`http://localhost:5001/api/rca?search=${text}`);
            // Filter out current RCA if editing
            const filtered = res.data.filter(item => item._id !== editId);
            setSimilarRCAs(filtered);
        } catch (err) {
            console.error("Intelligence Engine Offline:", err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:5001/api/rca/upload-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update URL to edit mode with the new ID, which will trigger the useEffect to load data
            navigate(`/create?edit=${res.data._id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to upload PDF and extract data.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleArrayChange = (index, field, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (index, field) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArray });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(t => t);
        const payload = {
            ...formData,
            tags: tagsArray,
            rootCauses: formData.rootCauses.filter(r => r.trim()),
            actions: formData.actions.filter(a => a.trim())
        };

        try {
            if (editId) {
                await axios.put(`http://localhost:5001/api/rca/${editId}`, payload);
                navigate(`/rca/${editId}`);
            } else {
                await axios.post('http://localhost:5001/api/rca', payload);
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating/updating RCA. Ensure backend is running on port 5001.');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="heading-1">{editId ? 'Edit RCA' : 'Create New RCA'}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {editId ? 'Update the details of this incident.' : 'Document a new incident manualy or import from PDF.'}
                </p>

                {!editId && (
                    <div className="card" style={{ border: '1px dashed var(--primary-color)', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.05)' }}>
                        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Have an existing RCA Report?</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Upload your PDF report and our AI-powered engine will extract the problem, root causes, and actions for you.
                        </p>
                        <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Import PDF & Auto-fill
                            </span>
                            <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
                        </label>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Main Form */}
                <form onSubmit={handleSubmit} className="card">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Problem Statement</label>
                        <input
                            name="problem"
                            value={formData.problem}
                            onChange={handleChange}
                            className="input"
                            placeholder="E.g., Production API Latency Spike"
                            required
                            style={{ fontSize: '1.1rem', fontWeight: '500' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="input"
                            rows="4"
                            placeholder="Detailed description of the incident..."
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Root Causes (5 Whys)
                            <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-secondary)' }}>Drill down to the root cause</span>
                        </label>
                        {formData.rootCauses.map((cause, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface-hover)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {index + 1}
                                </div>
                                <input
                                    value={cause}
                                    onChange={(e) => handleArrayChange(index, 'rootCauses', e.target.value)}
                                    className="input"
                                    placeholder="Why did this happen?"
                                />
                                {formData.rootCauses.length > 1 && (
                                    <button type="button" onClick={() => removeArrayItem(index, 'rootCauses')} className="btn btn-secondary" style={{ color: 'var(--error-color)', padding: '0.5rem' }}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem('rootCauses')} className="btn btn-secondary" style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginLeft: '2rem' }}>
                            <Plus size={14} /> Add Cause
                        </button>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Corrective Actions</label>
                        {formData.actions.map((action, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', fontSize: '0.75rem', color: 'var(--success-color)' }}>
                                    <CheckCircle size={14} />
                                </div>
                                <input
                                    value={action}
                                    onChange={(e) => handleArrayChange(index, 'actions', e.target.value)}
                                    className="input"
                                    placeholder="What will be done to prevent recurrence?"
                                />
                                {formData.actions.length > 1 && (
                                    <button type="button" onClick={() => removeArrayItem(index, 'actions')} className="btn btn-secondary" style={{ color: 'var(--error-color)', padding: '0.5rem' }}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem('actions')} className="btn btn-secondary" style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginLeft: '2rem' }}>
                            <Plus size={14} /> Add Action
                        </button>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label className="label">Tags</label>
                        <input
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="input"
                            placeholder="Comma separated tags (e.g., db, network, p1)"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} /> {editId ? 'Update RCA' : 'Save RCA'}
                        </button>
                    </div>
                </form>

                {/* Intelligence Side Panel */}
                <div>
                    {similarRCAs.length > 0 && (
                        <div className="card animate-fade-in" style={{ border: '1px solid var(--primary-color)', backgroundColor: 'rgba(99, 102, 241, 0.05)', position: 'sticky', top: '1rem' }}>
                            <h3 className="heading-2" style={{ fontSize: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BrainCircuit size={18} /> Similar Incidents Found
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                The intelligence engine found {similarRCAs.length} similar past RCAs. Check them for solution ideas.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {similarRCAs.slice(0, 3).map(rca => (
                                    <div key={rca._id} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.875rem' }}>{rca.problem}</div>
                                        {rca.rootCauses.length > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                <strong>Cause:</strong> {rca.rootCauses[0]}
                                            </div>
                                        )}
                                        {rca.actions.length > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--success-color)' }}>
                                                <strong>Fix:</strong> {rca.actions[0]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {similarRCAs.length === 0 && formData.problem.length > 3 && (
                        <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic', borderLeft: '2px solid var(--border-color)' }}>
                            <AlertTriangle size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                            No similar incidents found in knowledge base.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateRCA;
