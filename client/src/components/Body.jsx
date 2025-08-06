import "../styles/Body.css";

const Body = ({ onStartQuiz }) => {
  return (
    <main className="body-container">
      <h1 className="body-title">Bienvenue sur le Hackathon Quiz !</h1>
      <button className="body-btn" onClick={onStartQuiz}>
        Commencer le Quiz
      </button>
    </main>
  );
};

export default Body;
