"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function AccesoDenegadoPage() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-orange-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-600">
                        Acceso Denegado
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        No tienes permisos para acceder a esta página
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 mb-2">
                            <strong>Tu rol actual:</strong> {user?.role === 'administrador' ? 'Administrador' : user?.role === 'analista' ? 'Analista' : 'Observador'}
                        </p>
                        <p className="text-sm text-red-700">
                            Esta página requiere permisos especiales que tu rol no posee.
                        </p>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="flex-1"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver Atrás
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="flex-1"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Ir al Inicio
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
