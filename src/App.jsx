// Brings in React's tools so we can build this component.
import React from "react";

// Lets us run code automatically when the component loads, and store values that update the screen.
import { useState, useEffect, useRef } from "react";

// Brings in the map pieces we need from react-leaflet.
import { MapContainer, TileLayer, Popup, Circle, Marker } from "react-leaflet";

import L from "leaflet";

// Brings in Leaflet's own visual styling, without it the map looks broken.
import "leaflet/dist/leaflet.css";

// Calculates the distance in meters between two GPS points.
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Creates a custom marker icon: a cow emoji sitting on a small red circle.
const cowIcon = L.divIcon({
  html: '<div style="background:red; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:16px;">🐄</div>',
  className: "",
  iconSize: [28, 28],
});

// Generates a short beep sound directly, no file or link needed.
function playBeep() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
}

function App() {
  // Stores every animal's latest position, as a list.
  const [animals, setAnimals] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Remembers each animal's outside/inside state separately, by animal_id.
  const outsideStatusRef = useRef({});

  useEffect(() => {
    const fetchLocations = () => {
      fetch("https://livestock-tracker-ucus.onrender.com/locations")
        .then((res) => res.json())
        .then((data) => {
          data.forEach((animal) => {
            const dist = getDistance(5.6037, -0.1870, animal.latitude, animal.longitude);
            const outsideNow = dist > 200;
            const wasOutside = outsideStatusRef.current[animal.animal_id] || false;

            if (outsideNow && !wasOutside && soundEnabled) {
              playBeep();
            }
            outsideStatusRef.current[animal.animal_id] = outsideNow;
            animal.distance = dist;
            animal.isOutside = outsideNow;
          });
          setAnimals(data);
        });
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 5000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  return (
    <div>
      {!soundEnabled && (
        <button onClick={() => setSoundEnabled(true)}>Enable Sound Alerts</button>
      )}
      <ul>
        {animals.map((animal) => (
          <li key={animal.animal_id}>
            {animal.animal_id}: {animal.isOutside ? "ALERT: Outside boundary" : "Status: Inside boundary"}
          </li>
        ))}
      </ul>
      <MapContainer center={[5.6037, -0.1870]} zoom={13} style={{ height: "90vh", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Circle
          center={[5.6037, -0.1870]}
          radius={200}
          pathOptions={{ color: "blue", fillOpacity: 0.1 }}
        />
        {animals.map((animal) => (
          <Marker key={animal.animal_id} position={[animal.latitude, animal.longitude]} icon={cowIcon}>
            <Popup>{animal.animal_id}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;