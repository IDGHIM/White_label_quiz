import "../styles/Body.css";

const Body = ({ onStartQuiz }) => {
  return (
    <main className="body-container">
      <h1 className="body-title">Bienvenue sur le Quiz !</h1>
     
      <section className="body-info">
        <div className="objective-section">
          <h2 className="objective-title">Objectif du questionnaire :</h2>
          <p className="objective-text">
            {/* Objectif à personnaliser selon les besoins */}
          </p>
        </div>
       
        <div className="compatibility-section">
          <p className="compatibility-text">
           Optimisé pour mobile & tablette
          </p>
        </div>

        <div className="accessibility-section">
          <h3 className="accessibility-title">Accessibilité :</h3>
          <p className="accessibility-text">
            Compatible avec les lecteurs d'écran et les technologies d'assistance.
            Navigation au clavier disponible.
          </p>
        </div>
      </section>
     
      <button className="body-btn" onClick={onStartQuiz}>
        Commencer le Quiz
      </button>
    </main>
  );
};

export default Body;