import { Outlet } from 'react-router-dom';

export default function MainLayout() {
    return (
        <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-50">

            {/* Panneau Gauche (Planning) : 
          - Sur mobile : Tiroir coulissant en bas (simulé pour l'instant avec une hauteur fixe en bas)
          - Sur PC : Panneau fixe à gauche (1/3 de l'écran) */}
            <div className="order-2 md:order-1 w-full md:w-1/3 h-2/5 md:h-full bg-white shadow-xl z-10 flex flex-col rounded-t-2xl md:rounded-none transition-all duration-300">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold">Mon Date</h1>
                </div>

                {/* C'est ici que viendra s'injecter la Timeline */}
                <div className="flex-1 overflow-y-auto p-4">
                    <Outlet context={{ area: 'sidebar' }} />
                </div>
            </div>

            {/* Panneau Droit (Carte Google Maps) :
          - Sur mobile : Prend le reste de l'écran en haut
          - Sur PC : Prend les 2/3 restants */}
            <div className="order-1 md:order-2 flex-1 relative bg-gray-200">
                {/* C'est ici que viendra s'injecter la Carte */}
                <Outlet context={{ area: 'map' }} />
            </div>

        </div>
    );
}