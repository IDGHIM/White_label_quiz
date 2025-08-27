import React from "react";
import '../styles/ContactPage.css';
import { FaLinkedin, FaGithub, FaBriefcase , FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const teamMembers = [
  {
    name: "DGHIM Ichem",
    role: "Développeur Frontend & Backend",
    description: "J'ai une imagination sans limite qui me pousse à transformer chaque idée en réalité.",
    email: "ichemdghim@gmail.com",
    location: "Agen, France",
    links: {
      portfolio: "https://idghim.github.io/fcc-Portofolio-Webpage/",
      linkedin: "https://www.linkedin.com/in/ichem-dghim/",
      github: "https://github.com/IDGHIM",
    },
  },
];

const ContactCard = ({ member }) => (
  <div className="contact-card">
    <div className="contact-header">
      <h2 className="contact-person-name">{member.name}</h2>
      <p className="contact-person-role">{member.role}</p>
    </div>
    
    <p className="contact-person-description">{member.description}</p>
    
    <div className="contact-info">
      {member.email && (
        <div className="contact-info-item">
          <FaEnvelope className="contact-info-icon" />
          <a href={`mailto:${member.email}`} className="contact-info-link">
            {member.email}
          </a>
        </div>
      )}
      
      {member.location && (
        <div className="contact-info-item">
          <FaMapMarkerAlt className="contact-info-icon" />
          <span className="contact-info-text">{member.location}</span>
        </div>
      )}
    </div>
    
    <div className="contact-links">
      {member.links.portfolio && (
        <a
          href={member.links.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link-icon"
          title="Portfolio"
        >
          <FaBriefcase  />
        </a>
      )}
      
      {member.links.linkedin && (
        <a
          href={member.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link-icon"
          title="LinkedIn"
        >
          <FaLinkedin />
        </a>
      )}
      
      {member.links.github && (
        <a
          href={member.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link-icon"
          title="GitHub"
        >
          <FaGithub />
        </a>
      )}
    </div>
  </div>
);

const ContactPage = () => (
  <div className="contact-page">
    <div className="contact-page-header">
      <h1 className="contact-page-title">Contactez-moi</h1>
      <p className="contact-page-subtitle">
        N'hésitez pas à me contacter pour vos projets
      </p>
    </div>
    
    <div className="contact-card-container">
      {teamMembers.map((member, index) => (
        <ContactCard key={index} member={member} />
      ))}
    </div>
    
    <div className="contact-footer">
      <h3>Vous avez un projet en tête ?</h3>
      <p>N'hésitez pas à me contacter directement via les moyens de communication ci-dessus.</p>
    </div>
  </div>
);

export default ContactPage;