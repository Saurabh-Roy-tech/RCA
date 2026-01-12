import React from 'react';
import { Lightbulb, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', paddingTop: '3rem', paddingBottom: '3rem', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.4rem', backgroundColor: 'rgba(224, 122, 95, 0.1)', borderRadius: '8px' }}>
                            <Lightbulb color="var(--primary-color)" size={20} />
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>RCA System</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Empowering engineering teams to solve incidents faster and prevent recurrence through AI-driven Root Cause Analysis.
                    </p>
                </div>

                <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-primary)' }}>Product</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'default' }}>Features</span></li>
                        <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'default' }}>Integrations</span></li>
                        <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'default' }}>Pricing</span></li>
                        <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'default' }}>Changelog</span></li>
                    </ul>
                </div>

                <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-primary)' }}>Resources</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'default' }}>Documentation</span></li>
                        <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'default' }}>API Reference</span></li>
                        <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'default' }}>Community</span></li>
                        <li><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'default' }}>Blog</span></li>
                    </ul>
                </div>

                <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-primary)' }}>Connect</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ color: 'var(--text-secondary)', cursor: 'default' }}><Github size={20} /></span>
                        <span style={{ color: 'var(--text-secondary)', cursor: 'default' }}><Twitter size={20} /></span>
                        <span style={{ color: 'var(--text-secondary)', cursor: 'default' }}><Linkedin size={20} /></span>
                    </div>
                </div>
            </div>
            <div className="container" style={{ borderTop: '1px solid var(--border-color)', marginTop: '3rem', paddingTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <p>&copy; {new Date().getFullYear()} RCA Intelligence. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
