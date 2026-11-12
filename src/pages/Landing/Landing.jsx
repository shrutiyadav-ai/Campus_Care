import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  FileText,
  Clock,
  CheckCircle2,
  Building2,
  Droplets,
  Sparkles,
  Bug,
  Zap,
  Wifi,
  UtensilsCrossed,
  BookOpen,
  Bus,
  Wrench,
  MoreHorizontal,
  ArrowRight,
  Menu,
  X,
  Users,
  BarChart3,
  Search,
  CheckCircle,
} from 'lucide-react';
import { neonSql } from '../../services/neon';
import './Landing.css';

const CATEGORIES = [
  { name: 'Hostel', icon: Building2, desc: 'Room, furniture & hostel issues' },
  { name: 'Water Supply', icon: Droplets, desc: 'Drinking water & plumbing issues' },
  { name: 'Cleaning', icon: Sparkles, desc: 'Campus & washroom cleanliness' },
  { name: 'Pest Control', icon: Bug, desc: 'Insects, rodents & pest issues' },
  { name: 'Electricity', icon: Zap, desc: 'Power cuts, fans, lights & switches' },
  { name: 'Wi-Fi & Internet', icon: Wifi, desc: 'Network & connectivity problems' },
  { name: 'Canteen', icon: UtensilsCrossed, desc: 'Food quality & hygiene issues' },
  { name: 'Classroom', icon: BookOpen, desc: 'Projectors, AC & seating problems' },
  { name: 'Transport', icon: Bus, desc: 'Bus routes, timings & maintenance' },
  { name: 'Maintenance', icon: Wrench, desc: 'General campus repairs' },
  { name: 'Other', icon: MoreHorizontal, desc: 'Any other campus-related concerns' },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    departments: 8,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        if (neonSql) {
          const totalRes = await neonSql`SELECT count(*) FROM complaints;`;
          const resolvedRes = await neonSql`SELECT count(*) FROM complaints WHERE status = 'resolved';`;
          const inProgressRes = await neonSql`SELECT count(*) FROM complaints WHERE status IN ('in_progress', 'under_review');`;
          const deptsRes = await neonSql`SELECT count(*) FROM departments WHERE is_active = true;`;
          setStats({
            total: Number(totalRes[0]?.count) || 0,
            resolved: Number(resolvedRes[0]?.count) || 0,
            inProgress: Number(inProgressRes[0]?.count) || 0,
            departments: Number(deptsRes[0]?.count) || 8,
          });
        }
      } catch (err) {
        console.error('Error fetching landing stats from Neon:', err);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="landing">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <Shield className="shield-icon" size={24} />
              <GraduationCap className="cap-icon" size={14} />
            </div>
            <span className="brand-text">CampusCare</span>
          </Link>

          <button
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-tag">University Complaint Management Portal</span>
            <h1 className="hero-title">
              Raise Your Voice.<br />
              <span className="highlight-text">Improve Your Campus.</span>
            </h1>
            <p className="hero-description">
              Your campus, your voice. Report issues, track resolutions, and help make university life better with CampusCare. A simple and transparent platform for students and administration.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg">
                Raise a Complaint <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                <Search size={18} /> Track Complaint
              </Link>
            </div>
            <div className="hero-trust">
              <span>Trusted across university departments</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-preview-card">
              <div className="card-header-mock">
                <div className="dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="mock-title">CampusCare Live Tracker</span>
              </div>
              <div className="mock-content">
                <div className="mock-stat-item">
                  <div className="mock-stat-icon submitted">
                    <FileText size={18} />
                  </div>
                  <div className="mock-stat-text">
                    <span className="label">Complaint Submitted</span>
                    <span className="status-pill status-blue">Received</span>
                  </div>
                </div>

                <div className="mock-connector"></div>

                <div className="mock-stat-item">
                  <div className="mock-stat-icon progress">
                    <Clock size={18} />
                  </div>
                  <div className="mock-stat-text">
                    <span className="label">Under Investigation</span>
                    <span className="status-pill status-orange">In Progress</span>
                  </div>
                </div>

                <div className="mock-connector"></div>

                <div className="mock-stat-item">
                  <div className="mock-stat-icon resolved">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="mock-stat-text">
                    <span className="label">Issue Addressed</span>
                    <span className="status-pill status-green">Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper total">
              <FileText size={24} />
            </div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper resolved">
              <CheckCircle size={24} />
            </div>
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Complaints Resolved</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper progress">
              <Clock size={24} />
            </div>
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper departments">
              <Building2 size={24} />
            </div>
            <div className="stat-number">{stats.departments}</div>
            <div className="stat-label">Active Departments</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Workflow</span>
            <h2 className="section-title">How CampusCare Works</h2>
            <p className="section-desc">A transparent 3-step process to get campus issues addressed efficiently.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Submit a Complaint</h3>
              <p className="step-desc">
                Fill in the details about the issue, select a category, add a location, set the priority, and optionally attach an image.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Track Progress</h3>
              <p className="step-desc">
                Follow real-time status updates from "Submitted" to "Under Review" and "In Progress" with transparent history logs.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Get It Resolved</h3>
              <p className="step-desc">
                University departments take action, provide resolution remarks, and close the issue once satisfactorily addressed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint Categories Section */}
      <section id="categories" className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Coverage</span>
            <h2 className="section-title">Complaint Categories</h2>
            <p className="section-desc">We cover all major aspects of campus life and infrastructure.</p>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="category-card">
                  <div className="category-icon">
                    <Icon size={24} />
                  </div>
                  <h4 className="category-name">{cat.name}</h4>
                  <p className="category-desc">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why CampusCare Section */}
      <section id="about" className="why-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Benefits</span>
            <h2 className="section-title">Why CampusCare?</h2>
            <p className="section-desc">Engineered to bridge communication between students and administration.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Search size={24} />
              </div>
              <h3 className="feature-title">Transparent Tracking</h3>
              <p className="feature-desc">
                Real-time updates, clear timestamps, and detailed complaint status logs so you always know where things stand.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={24} />
              </div>
              <h3 className="feature-title">Faster Resolution</h3>
              <p className="feature-desc">
                Direct assignment to concerned university departments ensures complaints reach the right people instantly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FileText size={24} />
              </div>
              <h3 className="feature-title">Easy Submission</h3>
              <p className="feature-desc">
                Intuitive mobile-first interface designed for effortless reporting with category selection and photo attachments.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={24} />
              </div>
              <h3 className="feature-title">Better Management</h3>
              <p className="feature-desc">
                Comprehensive admin dashboards with analytics, department assignment, and reporting to drive continuous improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="brand">
              <div className="brand-icon">
                <Shield className="shield-icon" size={20} />
                <GraduationCap className="cap-icon" size={12} />
              </div>
              <span className="brand-text">CampusCare</span>
            </div>
            <p className="footer-tagline">
              Raise Your Voice. Improve Your Campus.
            </p>
            <p className="footer-desc">
              A university complaint management portal designed to streamline communication and resolve student concerns effectively.
            </p>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Platform</h4>
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#categories">Categories</a>
            <a href="#about">About</a>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Portals</h4>
            <Link to="/login">Student Portal</Link>
            <Link to="/login">Admin Portal</Link>
            <Link to="/register">Student Registration</Link>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Support</h4>
            <a href="#about">Help & Support</a>
            <a href="#about">Privacy Policy</a>
            <a href="#about">Terms of Service</a>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>&copy; {new Date().getFullYear()} CampusCare. All rights reserved. University Complaint Management Portal.</p>
        </div>
      </footer>
    </div>
  );
}
