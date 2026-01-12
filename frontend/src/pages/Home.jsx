import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, FileText, Search, ShieldCheck } from 'lucide-react';

const Home = () => {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section style={{ textAlign: 'center', padding: '4rem 1rem', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    RCA(Root Cause Analysis)
                </h1>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(224, 122, 95, 0.1)',
                    borderRadius: '9999px',
                    color: 'var(--primary-color)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem'
                }}>
                    <BrainCircuit size={16} /> AI-Powered Incident Management
                </div>
                <h1 className="heading-1" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                    Master Root Cause<br />
                    <span style={{ color: 'var(--primary-color)' }}>Analysis with AI</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
                    Streamline your incident response, find root causes faster, and build a smarter knowledge base.
                    Stop solving the same problems twice.
                </p>

            </section>

            {/* Features Grid */}
            <section className="container" style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="card" style={{ transition: 'transform 0.2s' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(224, 122, 95, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                            <FileText size={24} />
                        </div>
                        <h3 className="heading-2">Smart PDF Import</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Upload your existing RCA reports. Our AI automatically extracts the problem, root causes, and corrective actions, filling out the database for you.
                        </p>
                    </div>

                    <div className="card" style={{ transition: 'transform 0.2s' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(224, 122, 95, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                            <Search size={24} />
                        </div>
                        <h3 className="heading-2">Intelligent Debugging</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Stuck on an error? Paste your logs into our AI Assistant. It analyzes your query against the entire knowledge base to suggest immediate fixes.
                        </p>
                    </div>

                    <div className="card" style={{ transition: 'transform 0.2s' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(224, 122, 95, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="heading-2">Proactive Prevention</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Link similar incidents automatically. Identify recurring patterns and implement long-term fixes to improve system reliability.
                        </p>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Home;
