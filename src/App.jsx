// Brings in React's tools so we can build this component.
import React from "react";

// Lets us run code automatically when the component loads, and store values that update the screen.
import { useState, useEffect } from "react";

// Brings in the map pieces we need from react-leaflet.
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

// Brings in Leaflet's own visual styling, without it the map looks broken.
import "leaflet/dist/leaflet.css";

function App() {
  // Stores the cow's current position, starting as nothing until we fetch it.
  const [position, setPosition] = useState(null);

  // Runs once when the page loads, asking the backend for the cow's location.
  useEffect(() => {
    fetch("http://127.0.0.1:8000/location/cow001")
      .then((res) => res.json())
      .then((data) => setPosition([data.latitude, data.longitude]));
  }, []);

    return (
    <MapContainer center={[5.6037, -0.1870]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {position && (
        <CircleMarker center={position} radius={12} pathOptions={{ color: "red", fillColor: "red", fillOpacity: 1 }}>
          <Popup>Cow rgb(255, 0, 0)</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}

export default App;