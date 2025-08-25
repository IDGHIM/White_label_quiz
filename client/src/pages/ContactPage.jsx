import React from "react";
import '../styles/ContactPage.css'; 
import { FaLinkedin, FaGithub, FaGlobe } from "react-icons/fa";

const teamMembers = [
  {
    name: "DGHIM Ichem",
    role: "Développeur Frontend & Backend",
    description: "J’ai une imagination sans limite qui me pousse à transformer chaque idée en réalité.",
    links: {
      portfolio: "https://idghim.github.io/fcc-Portofolio-Webpage/",
      linkedin: "https://www.linkedin.com/in/ichem-dghim/",
      github: "https://github.com/IDGHIM",
    },
  },
];

const ContactCard = ({ member }) => (
  <div className="contact-card">
    <h2 className="contact-person-name">{member.name}</h2>
    <p className="contact-person-role">{member.role}</p>
    <p className="contact-person-description">{member.description}</p>
    <div className="contact-links">
      {member.links.portfolio && (
        <a
          href={member.links.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link-icon"
        >
          <FaGlobe />
        </a>
      )}
      {member.links.linkedin && (
        <a
          href={member.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link-icon"
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
        >
          <FaGithub />
        </a>
      )}
    </div>
  </div>
);

const ContactPage = () => (
  <div className="contact-card-container">
    {teamMembers.map((member, index) => (
      <ContactCard key={index} member={member} />
    ))}
  </div>
);

export default ContactPage;
