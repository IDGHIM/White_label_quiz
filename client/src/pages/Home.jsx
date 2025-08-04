import Body from "../components/Body";
import Footer from "../components/Footer";
import Navbar from "../components/navbar";

const Home = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Body />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
