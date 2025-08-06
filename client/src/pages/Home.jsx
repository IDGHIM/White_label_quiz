import { useNavigate } from "react-router-dom";
import Body from "../components/Body";

const Home = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate("/quiz");
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <Body onStartQuiz={handleStartQuiz} />
      </main>
    </div>
  );
};

export default Home;
