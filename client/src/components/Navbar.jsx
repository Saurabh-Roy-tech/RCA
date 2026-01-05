import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BrainCircuit } from 'lucide-react';

const Navbar = () => {
    return (
        <nav style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem 0', marginBottom: '2rem', backgroundColor: 'var(--surface-color)' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                        <BrainCircuit color="var(--primary-color)" size={24} />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>RCA Intelligence</span>
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                    <Link to="/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        <PlusCircle size={18} />
                        New RCA
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
