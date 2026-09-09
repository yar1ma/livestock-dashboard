// Brings in React's tools so we can build this component.
import React from "react";

// Brings in the map pieces we need from react-leaflet.
import { MapContainer, TileLayer } from "react-leaflet";

// Brings in Leaflet's own visual styling, without it the map looks broken.
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <MapContainer center={[5.6037, -0.1870]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    </MapContainer>
  );
}

export default App;