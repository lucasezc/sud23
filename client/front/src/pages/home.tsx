import NavBar from "../components/NavBar";
import Carrusel from "../components/Carrusel";
import NewCollectionCatalog from "../components/NewCollectionCatalog";

const Home = () => {
    return (
        <>
            <header className="w-11/12 m-auto">
                <NavBar></NavBar>
            </header>
            <main className="w-11/12 m-auto">
                <div className="">
                    <Carrusel></Carrusel>
                </div>
                <section className="md:flex md:justify-between bg-gray-50 flex flex-col items-center relative top-5">
                    <NewCollectionCatalog></NewCollectionCatalog>
                </section>
            </main>
        </>
    )
};

export default Home;