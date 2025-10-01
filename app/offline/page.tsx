// Página de fallback para cuando la aplicación está offline
// Esta página se mostrará cuando no haya conexión y no exista caché

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="py-8">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sin conexión
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Actualmente estás sin conexión. Por favor, verifica tu conexión a internet e inténtalo nuevamente.
                    </p>
                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}