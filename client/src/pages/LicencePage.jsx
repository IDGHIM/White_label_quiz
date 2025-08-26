import React from "react";

export default function LicencePage() {
  const currentYear = new Date().getFullYear();

  const siteInfo = {
    siteName: "Quiz App",
    siteUrl: "https://www.votre-site-exemple.fr", // <- à remplacer par ton vrai lien si besoin
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
          <h1 className="mlq-title">Licence</h1>
          <p className="mlq-subtitle">Informations de licence pour <strong>{siteInfo.siteName}</strong></p>
        </header>

        <section className="mlq-section">
          <p className="mlq-text">
            Ce projet a été développé dans le cadre d’un TP de développeur web. 
            Par la suite, je souhaite le commercialiser auprès de professionnels et de particuliers.
            Il est actuellement mis à disposition sous licence MIT, ce qui signifie que vous êtes libre de l'utiliser, de le copier, de le modifier et de le distribuer,
            à condition de conserver la mention du droit d'auteur et de la licence dans toutes les copies ou parties substantielles du projet.
          </p>
        </section>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Texte de la licence MIT (traduction française)</h2>
          <pre className="mlq-pre">{`Licence MIT

Copyright (c) ${currentYear} ${siteInfo.team}

Permission est accordée, gratuitement, à toute personne obtenant une copie
de ce logiciel et des fichiers de documentation associés (le "Logiciel"),
pour utiliser le Logiciel sans restriction, y compris, sans limitation, les
droits d'utiliser, de copier, de modifier, de fusionner, de publier, de
distribuer, de sous-licencier et/ou de vendre des copies du Logiciel, et
de permettre aux personnes auxquelles le Logiciel est fourni de le faire,
sous réserve des conditions suivantes :

L'avis de droit d'auteur ci-dessus et le présent avis de permission doivent
être inclus dans toutes les copies ou parties substantielles du Logiciel.

LE LOGICIEL EST FOURNI "TEL QUEL", SANS GARANTIE D'AUCUNE SORTE, EXPRESSE
OU IMPLICITE, Y COMPRIS MAIS SANS S'Y LIMITER LES GARANTIES DE QUALITÉ
MARCHANDE, D'ADÉQUATION À UN USAGE PARTICULIER ET D'ABSENCE DE
CONTREFAÇON. EN AUCUN CAS LES AUTEURS OU TITULAIRES DU DROIT D'AUTEUR NE
SERONT RESPONSABLES DE TOUTE RÉCLAMATION, DOMMAGE OU AUTRE RESPONSABILITÉ,
QU'ELLE SOIT CONTRACTUELLE, DÉLICTUELLE OU AUTRE, RÉSULTANT DE, OU EN
RAPPORT AVEC LE LOGICIEL OU L'UTILISATION OU D'AUTRES INTERACTIONS AVEC LE
LOGICIEL.`}</pre>
        </section>

        <section className="mlq-section">
          <h2 className="mlq-section-title">Contributeurs</h2>
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
            Contact : <a href={`mailto:${siteInfo.emailContact}`} className="mlq-link">{siteInfo.emailContact}</a>
            <br />
            © {currentYear} {siteInfo.siteName} — Licence MIT.
          </p>
        </footer>
      </article>
    </main>
  );
}
