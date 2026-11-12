import { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  Building2,
  FileQuestion,
  ExternalLink,
} from 'lucide-react';
import './HelpSupport.css';

const FAQS = [
  {
    q: 'How long does it take for a complaint to be reviewed?',
    a: 'Complaints are typically assigned and reviewed by the relevant university department within 24 to 48 hours on working days. Urgent complaints (e.g. power outages or major water leaks) are prioritized immediately.',
  },
  {
    q: 'Can I edit or cancel my complaint after submitting?',
    a: 'Once a complaint is submitted and logged in the system, its core details cannot be altered to maintain data integrity and audit logs. However, university admins review the remarks, and you can file a follow-up complaint or reach out to department heads.',
  },
  {
    q: 'How will I be notified when my complaint status changes?',
    a: 'You receive instant in-app notifications whenever an administrator updates the status, assigns a department, or provides a resolution message. Check your Notifications bell regularly.',
  },
  {
    q: 'What types of issues should be marked as "Urgent"?',
    a: 'Only critical emergencies like complete power breakdown in a block, serious water contamination, safety hazards, or major facility malfunctions should be marked Urgent.',
  },
  {
    q: 'Who can view my submitted complaints?',
    a: 'Complaints are strictly confidential and protected by Row Level Security (RLS). Only you and authorized university administrators or assigned department coordinators have access to view your complaint records.',
  },
];

export default function HelpSupport() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="help-support-container">
      <div className="help-hero">
        <div className="help-hero-icon">
          <HelpCircle size={32} />
        </div>
        <h2>CampusCare Help & Support Desk</h2>
        <p>
          Find answers to commonly asked questions or connect with the university grievance office.
        </p>
      </div>

      <div className="help-grid">
        {/* FAQs */}
        <div className="faq-section-card">
          <div className="card-header-styled">
            <FileQuestion size={20} className="header-icon" />
            <h3>Frequently Asked Questions</h3>
          </div>

          <div className="accordion-list">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className={`accordion-item ${isOpen ? 'active' : ''}`}>
                  <button
                    className="accordion-trigger"
                    onClick={() => toggleAccordion(index)}
                  >
                    <span className="faq-question">{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className="accordion-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact info */}
        <div className="contact-section-column">
          <div className="contact-card">
            <h3 className="contact-card-title">Campus Grievance Cell</h3>
            <p className="contact-card-desc">
              For urgent or unaddressed complaints, contact the central student affairs desk directly.
            </p>

            <div className="contact-details-list">
              <div className="contact-detail-row">
                <Building2 size={18} className="detail-icon" />
                <div>
                  <strong>Location</strong>
                  <span>Admin Block B, Room 104</span>
                </div>
              </div>

              <div className="contact-detail-row">
                <Mail size={18} className="detail-icon" />
                <div>
                  <strong>Email Support</strong>
                  <span>campuscare@university.edu</span>
                </div>
              </div>

              <div className="contact-detail-row">
                <Phone size={18} className="detail-icon" />
                <div>
                  <strong>Helpline Number</strong>
                  <span>+91 (0) 1234 567890</span>
                </div>
              </div>

              <div className="contact-detail-row">
                <Clock size={18} className="detail-icon" />
                <div>
                  <strong>Working Hours</strong>
                  <span>Mon – Fri, 9:00 AM – 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="emergency-alert-card">
            <h4>Campus Emergency Contacts</h4>
            <p>For immediate medical, fire, or safety emergencies:</p>
            <ul>
              <li><strong>Campus Security:</strong> Ext. 100 / 9999</li>
              <li><strong>Medical Health Center:</strong> Ext. 108</li>
              <li><strong>Hostel Warden On-Duty:</strong> Ext. 204</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

