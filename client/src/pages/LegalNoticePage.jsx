import React from "react";
import '../styles/LegalNoticePage.css';

function MentionsLegales() {
  const currentYear = new Date().getFullYear();

  const siteInfo = {
    siteName: "Quiz App",
    siteUrl: "https://www.votre-site-exemple.fr", // <- à remplacer par ton vrai lien si besoin
    responsablePublication: "DGHIM Ichem", 
    emailContact: "ichemdghim@gmail.com", 
    hebergeur: {
      nom: "Render",
    },
    team: ["DGHIM Ichem"], 
  };

  return (
    <main className="mlq-main-container">
      <article className="mlq-article">
        <header className="mlq-header">
          <h1 className="mlq-title">Mentions légales</h1>
          <p className="mlq-subtitle">Informations légales pour le site <strong>{siteInfo.siteName}</strong></p>
        </header>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Éditeur du site</h2>
          <p className="mlq-text">
            Le site <strong>{siteInfo.siteName}</strong> est édité par <strong>{siteInfo.responsablePublication}</strong>.
            <br />
            Contact : <a href={`mailto:${siteInfo.emailContact}`} className="mlq-link">{siteInfo.emailContact}</a>
          </p>
        </section>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Hébergeur</h2>
          <p className="mlq-text">
            Hébergeur : <strong>{siteInfo.hebergeur.nom}</strong>
            <br />
          </p>
        </section>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Propriété intellectuelle</h2>
          <p className="mlq-text">
            L'ensemble des éléments présents sur ce site (textes, images, logos, codes, sons) sont protégés par le droit d'auteur et
            la propriété intellectuelle. Toute reproduction, représentation, modification ou diffusion totale ou partielle est interdite
            sauf autorisation écrite préalable du responsable de publication.
          </p>
        </section>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Limitation de responsabilité</h2>
          <p className="mlq-text">
            Les informations publiées sur ce site sont fournies à titre informatif. Nous mettons tout en œuvre pour assurer l'exactitude
            et la mise à jour des contenus, mais aucune garantie n'est donnée quant à l'exactitude, la complétude ou l'adéquation des
            informations. L'éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de l'accès ou de l'utilisation
            du site.
          </p>
        </section>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Traitement des données personnelles</h2>
          <p className="mlq-text">
            Les données personnelles éventuellement collectées via les formulaires de contact sont utilisées uniquement pour répondre aux
            demandes. Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression des
            données vous concernant. Pour exercer ces droits, contactez-nous à l'adresse : <a href={`mailto:${siteInfo.emailContact}`} className="mlq-link">{siteInfo.emailContact}</a>.
          </p>
        </section>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Cookies</h2>
          <p className="mlq-text">
            Le site peut utiliser des cookies pour améliorer l'expérience utilisateur. Vous pouvez gérer vos préférences en matière de
            cookies via les paramètres de votre navigateur.
          </p>
        </section>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Contributeurs</h2>
          <p className="mlq-text">
            Projet développé par :
          </p>
          <ul className="mlq-list">
            {siteInfo.team.map((dev, idx) => (
              <li key={idx}>{dev}</li>
            ))}
          </ul>
        </section>

        <footer className="mlq-footer">
          <p>
            Site : <a href={siteInfo.siteUrl} className="mlq-link">{siteInfo.siteUrl}</a>
            <br />
            © {currentYear} {siteInfo.siteName} — Tous droits réservés.
          </p>
        </footer>
      </article>
    </main>
  );
}

export default MentionsLegales;
