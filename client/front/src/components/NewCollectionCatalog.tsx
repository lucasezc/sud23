

const NewCollectionCatalog = () => {


    //Traer de la base de datos a través de la api
    const newClothes = [{
        id: 1,
        name: "Buzo SÜD23",
        description: "Buzo negro unisex",
        price: 25000,
        stock: 10,
        img: "https://focus.ar/cdn/shop/files/BuzoLebronProducto1_2000x2000.png?v=1744146460"
    }, {
        id: 2,
        name: "Remera SÜD23",
        description: "Remera negra unisex",
        price: 25000,
        stock: 10,
        img: "https://focus.ar/cdn/shop/files/MuskNegraFrenteLogo_8f985f03-68b6-4523-9249-80a2a1e06217_2000x2000.png?v=1744077279"
    },
    {
        id: 3,
        name: "Short SÜD23",
        description: "Short negro unisex",
        price: 25000,
        stock: 10,
        img: "https://focus.ar/cdn/shop/files/short-bryant-producto-1_2000x2000.png?v=1782402177"
    },
    {
        id: 4,
        name: "Gorro SÜD23",
        description: "Gorro negro unisex",
        price: 25000,
        stock: 10,
        img: "https://focus.ar/cdn/shop/products/CapFocusFrenteCuadrada_2000x2000.jpg?v=1610054373"
    },
    ];

    console.log(newClothes.map((c) => {
        console.log("RESULTADO", c.description);
    }))

    return (
        <>
            <h2 className="font-bold text-center m-5">New Collection Catalog</h2>
            {newClothes.map((c) => {
                return (
                    <>
                        <article key={c.id} className="md:flex md:w-50 md:h-10 md:items-center shadow w-60 h-105 grid text-center">
                            <img src={c.img} className="md:flex mix-blend-multiply h-60 m-auto object-contain"></img>
                            <div className="flex flex-col relative bottom-2 gap-1">
                                <span className="font-medium">{c.name}</span>
                                <span className="font-extralight">{c.description}</span>
                                <span className="font-bold">${c.price}</span>
                            </div>
                        </article>
                    </>
                )
            }
            )}
        </>
    )
};

export default NewCollectionCatalog;