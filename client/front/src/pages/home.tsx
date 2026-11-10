import NavBar from "../components/NavBar";
import Carrusel from "../components/Carrusel";
import NewCollectionCatalog from "../components/NewCollectionCatalog";
import FeatureBanners from "../components/Featurebanners";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50">
        <NavBar />
      </header>

      <main>
        <Carrusel />
        <NewCollectionCatalog />
        <FeatureBanners />
      </main>

      <Footer />
    </div>
  );
};

export default Home;