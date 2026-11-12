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
  AlertCircle,
  TrendingUp,
  MapPin,
  ChevronRight,
  Sparkle,
} from 'lucide-react';
import { neonSql } from '../../services/neon';
import './Landing.css';

const CATEGORIES = [
  { name: 'Hostel', icon: Building2, desc: 'Room, furniture & hostel maintenance issues' },
  { name: 'Water Supply', icon: Droplets, desc: 'Drinking water, plumbing & washroom supply' },
  { name: 'Cleaning', icon: Sparkles, desc: 'Campus, corridor & sanitation cleanliness' },
  { name: 'Pest Control', icon: Bug, desc: 'Insects, fumigation & pest eradication' },
  { name: 'Electricity', icon: Zap, desc: 'Power failures, fans, lights & switchboards' },
  { name: 'Wi-Fi & Internet', icon: Wifi, desc: 'Campus network, speed & router connectivity' },
  { name: 'Canteen', icon: UtensilsCrossed, desc: 'Food quality, kitchen hygiene & cafeteria service' },
  { name: 'Classroom', icon: BookOpen, desc: 'Projectors, AC, whiteboards & seating repairs' },
  { name: 'Transport', icon: Bus, desc: 'University bus routes, timings & maintenance' },
  { name: 'Maintenance', icon: Wrench, desc: 'Carpentry, masonry & general campus repairs' },
  { name: 'Other', icon: MoreHorizontal, desc: 'Any other university-related grievances' },
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
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-navbar">
        <div className="landing-container nav-flex">
          <Link to="/" className="navbar-brand">
            <div className="brand-icon-box">
              <Shield className="brand-shield" size={22} />
              <GraduationCap className="brand-cap" size={13} />
            </div>
            <div className="brand-text-wrap">
              <span className="brand-name">CampusCare</span>
              <span className="brand-portal-tag">University Portal</span>
            </div>
          </Link>

          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className={`navbar-menu ${menuOpen ? 'is-open' : ''}`}>
            <div className="nav-links-center">
              <a href="#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
              <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
              <a href="#categories" className="nav-link" onClick={() => setMenuOpen(false)}>Categories</a>
              <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>Why CampusCare</a>
            </div>

            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-nav-login" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn-nav-register" onClick={() => setMenuOpen(false)}>
                <span>Student Register</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="landing-container hero-grid">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              <Building2 size={14} className="badge-icon" />
              <span>Official University Grievance Platform</span>
            </div>

            <h1 className="hero-heading">
              Raise Your Voice.<br />
              <span className="hero-heading-gradient">Improve Your Campus.</span>
            </h1>

            <p className="hero-lead">
              Your campus, your voice. Report issues, track resolutions, and help make university life better with CampusCare — the centralized platform connecting students directly with university administrative departments.
            </p>

            <div className="hero-actions-row">
              <Link to="/login" className="hero-btn-primary">
                <span>Raise a Complaint</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="hero-btn-secondary">
                <Search size={18} />
                <span>Track Complaint</span>
              </Link>
            </div>

            <div className="hero-trust-badges">
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-check" />
                <span>Transparent Tracking</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-check" />
                <span>Direct Dept Assignment</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-check" />
                <span>Real-Time Updates</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-dashboard-preview">
              {/* Window Header */}
              <div className="preview-window-bar">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="window-address">
                  <Shield size={12} />
                  <span>campuscare.university.edu/track</span>
                </div>
                <div className="window-tag">LIVE DEMO</div>
              </div>

              {/* Window Body */}
              <div className="preview-window-body">
                {/* Active Complaint Ticket Card */}
                <div className="preview-ticket-card">
                  <div className="ticket-top">
                    <span className="ticket-id">#CC-20261112-8821</span>
                    <span className="ticket-priority-pill priority-high">High Priority</span>
                  </div>
                  <h4 className="ticket-title">Wi-Fi Router Signal Down in Hostel Block B, 3rd Floor</h4>
                  <div className="ticket-meta">
                    <span className="meta-item"><MapPin size={13} /> Hostel B-304</span>
                    <span className="meta-item"><Building2 size={13} /> IT & Networking</span>
                  </div>
                </div>

                {/* Realtime Workflow Steps Tracker */}
                <div className="workflow-preview-tracker">
                  <div className="workflow-step completed">
                    <div className="step-circle">
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="step-details">
                      <div className="step-label-row">
                        <span className="step-name">Complaint Submitted</span>
                        <span className="step-time">09:15 AM</span>
                      </div>
                      <span className="step-sub">Logged by Student • Enrollment #ENR202488</span>
                    </div>
                  </div>

                  <div className="workflow-connector done"></div>

                  <div className="workflow-step completed">
                    <div className="step-circle">
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="step-details">
                      <div className="step-label-row">
                        <span className="step-name">Assigned to IT Department</span>
                        <span className="step-time">10:30 AM</span>
                      </div>
                      <span className="step-sub">Admin reviewed & forwarded to Head Engineer</span>
                    </div>
                  </div>

                  <div className="workflow-connector active"></div>

                  <div className="workflow-step in-progress">
                    <div className="step-circle pulse">
                      <Clock size={14} />
                    </div>
                    <div className="step-details">
                      <div className="step-label-row">
                        <span className="step-name">Technician On-Site</span>
                        <span className="step-status-tag status-progress">In Progress</span>
                      </div>
                      <span className="step-sub">Replacing access point hardware & re-testing</span>
                    </div>
                  </div>

                  <div className="workflow-connector"></div>

                  <div className="workflow-step pending">
                    <div className="step-circle">
                      <CheckCircle size={14} />
                    </div>
                    <div className="step-details">
                      <div className="step-label-row">
                        <span className="step-name">Resolution & Verification</span>
                        <span className="step-status-tag status-pending">Pending</span>
                      </div>
                      <span className="step-sub">Resolution report & student confirmation</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Metric Bar */}
                <div className="preview-bottom-metric">
                  <div className="p-metric">
                    <span className="p-metric-val">100%</span>
                    <span className="p-metric-lbl">Audited</span>
                  </div>
                  <div className="p-divider"></div>
                  <div className="p-metric">
                    <span className="p-metric-val">&lt; 24h</span>
                    <span className="p-metric-lbl">Avg Response</span>
                  </div>
                  <div className="p-divider"></div>
                  <div className="p-metric">
                    <span className="p-metric-val">SSL/TLS</span>
                    <span className="p-metric-lbl">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="landing-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-box stat-blue">
                <FileText size={22} />
              </div>
              <div className="stat-data">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Complaints Lodged</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-box stat-green">
                <CheckCircle size={22} />
              </div>
              <div className="stat-data">
                <div className="stat-value">{stats.resolved}</div>
                <div className="stat-label">Complaints Resolved</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-box stat-orange">
                <Clock size={22} />
              </div>
              <div className="stat-data">
                <div className="stat-value">{stats.inProgress}</div>
                <div className="stat-label">Active In Progress</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-box stat-purple">
                <Building2 size={22} />
              </div>
              <div className="stat-data">
                <div className="stat-value">{stats.departments}</div>
                <div className="stat-label">Active Departments</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-pill">Simple 3-Step Process</span>
            <h2 className="section-heading">How CampusCare Works</h2>
            <p className="section-subheading">
              A transparent, end-to-end complaint resolution process that keeps everyone accountable.
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-top-row">
                <div className="step-badge">01</div>
                <div className="step-icon-bg">
                  <FileText size={22} />
                </div>
              </div>
              <h3 className="step-title">Submit a Complaint</h3>
              <p className="step-description">
                Students report campus issues using an intuitive form. Select category, add exact location, choose priority, and attach an optional photo for evidence.
              </p>
              <div className="step-highlight-tag">Effortless Submission</div>
            </div>

            <div className="step-arrow-divider">
              <ArrowRight size={20} />
            </div>

            <div className="step-card">
              <div className="step-top-row">
                <div className="step-badge">02</div>
                <div className="step-icon-bg">
                  <Clock size={22} />
                </div>
              </div>
              <h3 className="step-title">Track Progress Live</h3>
              <p className="step-description">
                Monitor status updates from "Submitted" to "Under Review" and "In Progress" with transparent audit history logs and automated notifications.
              </p>
              <div className="step-highlight-tag">Complete Visibility</div>
            </div>

            <div className="step-arrow-divider">
              <ArrowRight size={20} />
            </div>

            <div className="step-card">
              <div className="step-top-row">
                <div className="step-badge">03</div>
                <div className="step-icon-bg">
                  <CheckCircle2 size={22} />
                </div>
              </div>
              <h3 className="step-title">Get It Resolved</h3>
              <p className="step-description">
                University departments execute repairs, provide detailed resolution remarks, and close the complaint with verifiable completion logs.
              </p>
              <div className="step-highlight-tag">Verified Resolution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint Categories Section */}
      <section id="categories" className="categories-section">
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-pill">Campus Coverage</span>
            <h2 className="section-heading">Complaint Categories</h2>
            <p className="section-subheading">
              Comprehensive categorization ensures complaints are immediately routed to the right administrative department.
            </p>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="category-card">
                  <div className="category-icon-box">
                    <Icon size={22} />
                  </div>
                  <div className="category-info">
                    <h4 className="category-title">{cat.name}</h4>
                    <p className="category-desc">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why CampusCare Section */}
      <section id="about" className="why-section">
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-pill">University Benefits</span>
            <h2 className="section-heading">Why CampusCare?</h2>
            <p className="section-subheading">
              Built to replace chaotic WhatsApp groups and paper registers with an enterprise-grade digital portal.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Search size={24} />
              </div>
              <h3 className="feature-title">Transparent Complaint Tracking</h3>
              <p className="feature-desc">
                Clear timestamps, transparent change logs, and real-time status progression ensure students never feel ignored and administrators stay accountable.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-title">Faster Issue Resolution</h3>
              <p className="feature-desc">
                Direct assignment to concerned campus departments eliminates administrative delays and routes issues directly to field technicians.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <FileText size={24} />
              </div>
              <h3 className="feature-title">Easy Complaint Submission</h3>
              <p className="feature-desc">
                Clean, mobile-optimized submission forms with smart category pickers, urgency priority levels, and photo attachments make reporting effortless.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <BarChart3 size={24} />
              </div>
              <h3 className="feature-title">Better Campus Management</h3>
              <p className="feature-desc">
                Comprehensive administrator analytics, department workload tracking, and CSV export capabilities allow management to detect recurring infrastructure issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top-grid">
            {/* Brand column */}
            <div className="footer-brand-col">
              <Link to="/" className="footer-brand">
                <div className="brand-icon-box">
                  <Shield size={20} className="brand-shield" />
                  <GraduationCap size={12} className="brand-cap" />
                </div>
                <span className="brand-name">CampusCare</span>
              </Link>
              <p className="footer-tagline">
                Raise Your Voice. Improve Your Campus.
              </p>
              <p className="footer-bio">
                A centralized, transparent university complaint management portal engineered to streamline communication between students and campus administration.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Platform</h4>
              <ul className="footer-links-list">
                <li><a href="#home">Home</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#categories">Categories</a></li>
                <li><a href="#about">Why CampusCare</a></li>
              </ul>
            </div>

            {/* Portals */}
            <div className="footer-col">
              <h4 className="footer-heading">Portals</h4>
              <ul className="footer-links-list">
                <li><Link to="/login">Student Sign In</Link></li>
                <li><Link to="/register">Student Registration</Link></li>
                <li><Link to="/login">Admin Management</Link></li>
                <li><Link to="/forgot-password">Password Recovery</Link></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="footer-col">
              <h4 className="footer-heading">Support & Legal</h4>
              <ul className="footer-links-list">
                <li><a href="#about">Help & Support</a></li>
                <li><a href="#about">Privacy Policy</a></li>
                <li><a href="#about">Terms of Service</a></li>
                <li><a href="#about">Campus Security</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-row">
            <p className="copyright-text">
              &copy; {new Date().getFullYear()} CampusCare – University Complaint Management Portal. All rights reserved.
            </p>
            <div className="footer-bottom-badges">
              <span className="footer-badge">Light Theme Enterprise</span>
              <span className="footer-badge">Powered by Neon Serverless</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
