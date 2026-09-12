// Brings in React's tools so we can build this component.
import React from "react";

// Lets us run code automatically when the component loads, and store values that update the screen.
import { useState, useEffect, useRef } from "react";

// Brings in the map pieces we need from react-leaflet.
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, Marker } from "react-leaflet";

import L from "leaflet";

// Brings in Leaflet's own visual styling, without it the map looks broken.
import "leaflet/dist/leaflet.css";

// Calculates the distance in meters between two GPS points.
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
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
  // Stores the cow's current position, starting as nothing until we fetch it.
  const [position, setPosition] = useState(null);
  const [distanceFromCenter, setDistanceFromCenter] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const isOutsideRef = useRef(false);

  // Runs when the page loads, and repeats every 5 seconds after that.
  useEffect(() => {
    const fetchLocation = () => {
      fetch("http://127.0.0.1:8000/location/cow001")
        .then((res) => res.json())
        .then((data) => {
          setPosition([data.latitude, data.longitude]);
          const dist = getDistance(5.6037, -0.1870, data.latitude, data.longitude);
          setDistanceFromCenter(dist);

          const outsideNow = dist > 200;
          if (outsideNow && !isOutsideRef.current && soundEnabled) {
            playBeep();
          }
          isOutsideRef.current = outsideNow;
        });
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  return (
    <div>
      {!soundEnabled && (
        <button onClick={() => setSoundEnabled(true)}>Enable Sound Alerts</button>
      )}
      <h2>
        {distanceFromCenter !== null &&
          (distanceFromCenter < 200 ? "Status: Inside boundary" : "ALERT: Outside boundary")}
      </h2>
      <MapContainer center={[5.6037, -0.1870]} zoom={13} style={{ height: "90vh", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Circle
          center={[5.6037, -0.1870]}
          radius={200}
          pathOptions={{ color: "blue", fillOpacity: 0.1 }}
        />
        {position && (
          <Marker position={position} icon={cowIcon}>
            <Popup>Cow #001</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default App;