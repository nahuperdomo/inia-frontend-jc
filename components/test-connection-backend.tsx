"use client";

import { useEffect, useState } from "react";
import { getHello } from "@/app/services/hello-service"; 

export default function TestConnection() {
  const [mensaje, setMensaje] = useState("Cargando...");

  useEffect(() => {
    getHello()
      .then((data) => {
        if (typeof data === "string") {
          setMensaje(data); // texto plano
        } else if (data?.message) {
          setMensaje(data.message); // JSON con {message: "..."}
        } else {
          setMensaje(JSON.stringify(data)); // cualquier otro objeto
        }
      })
      .catch((err) => setMensaje("Error: " + err.message));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Prueba Conexión con Backend Java</h1>
      <p><strong>{mensaje}</strong></p>
    </div>
  );
}
