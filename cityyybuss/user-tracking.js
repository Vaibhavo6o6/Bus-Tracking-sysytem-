let map;
let userMarker = null;
let busMarkers = {};
let routeLines = {};
let userPosition = null;

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 19.8762, lng: 75.3433 },
    zoom: 13,
  });

  trackUser();
  loadAllBuses();
}

// Track user's live location
function trackUser() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        userPosition = { lat: latitude, lng: longitude };

        if (!userMarker) {
          userMarker = new google.maps.Marker({
            position: userPosition,
            map,
            title: "You are here",
            icon: {
              url: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
              scaledSize: new google.maps.Size(40, 40),
            },
          });
        } else {
          userMarker.setPosition(userPosition);
        }

        updateDistances();
      },
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// Load all active buses from Firebase
function loadAllBuses() {
  const busesRef = db.ref("buses");

  busesRef.on("value", (snapshot) => {
    const buses = snapshot.val();
    if (!buses) return;

    for (let id in buses) {
      const bus = buses[id];
      const pos = { lat: bus.latitude, lng: bus.longitude };

      // Create or update marker
      if (!busMarkers[id]) {
        busMarkers[id] = new google.maps.Marker({
          position: pos,
          map,
          title: `Bus ${bus.id}`,
          icon: {
            url: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
            scaledSize: new google.maps.Size(40, 40),
          },
        });
      } else {
        busMarkers[id].setPosition(pos);
      }

      // Draw/update route line
      if (userPosition) {
        drawLineBetween(userPosition, pos, id);
      }
    }

    updateDistances();
  });
}

// Draw blue polyline between user and each bus
function drawLineBetween(userPos, busPos, busId) {
  if (routeLines[busId]) {
    routeLines[busId].setMap(null);
  }

  routeLines[busId] = new google.maps.Polyline({
    path: [userPos, busPos],
    geodesic: true,
    strokeColor: "#4285F4", // Google blue
    strokeOpacity: 0.8,
    strokeWeight: 4,
  });

  routeLines[busId].setMap(map);
}

// Update distances + ETA for all buses
function updateDistances() {
  if (!userPosition) return;

  const listDiv = document.getElementById("bus-list");
  listDiv.innerHTML = "";

  for (let id in busMarkers) {
    const busMarker = busMarkers[id];
    const busPos = busMarker.getPosition();

    const distance = getDistanceKm(
      userPosition.lat,
      userPosition.lng,
      busPos.lat(),
      busPos.lng()
    );

    const speedKmHr = 30; // average bus speed
    const etaMinutes = (distance / speedKmHr) * 60;

    // Draw line between user and bus
    drawLineBetween(userPosition, busPos, id);

    // Create sidebar display
    const div = document.createElement("div");
    div.className = "bus-item";
    div.innerHTML = `
      🚌 <strong>${id}</strong><br>
      📍 <b>Distance:</b> ${distance.toFixed(2)} km<br>
      ⏱️ <b>ETA:</b> ${etaMinutes.toFixed(1)} min
    `;

    div.addEventListener("click", () => {
      map.setCenter(busPos);
      map.setZoom(15);
    });

    listDiv.appendChild(div);
  }
}

// Distance calculator (Haversine formula)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
