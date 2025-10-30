import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import * as Location from "expo-location";
import { Card } from "react-native-paper";

export default function App() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Checking...");
  const [errorMsg, setErrorMsg] = useState(null);

  // Apna geofence coordinates (example)
  const GEOFENCE = {
    latitude: 28.6139, // Delhi ke approx coords
    longitude: 77.2090,
    radius: 0.5, // km me
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      getLocation(); // initial check
      const interval = setInterval(() => {
        getLocation();
      }, 5 * 60 * 1000); // har 5 minute me

      return () => clearInterval(interval);
    })();
  }, []);

  const getLocation = async () => {
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);

    const distance = getDistanceFromLatLonInKm(
      loc.coords.latitude,
      loc.coords.longitude,
      GEOFENCE.latitude,
      GEOFENCE.longitude
    );

    if (distance > GEOFENCE.radius) {
      setStatus("🚨 Outside Geofence");
      // TODO: call backend API to send email here
    } else {
      setStatus("✅ Inside Geofence");
    }
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60",
      }}
      style={styles.bg}
    >
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>🌍 GeoFence Tracker</Text>
          {errorMsg ? (
            <Text style={styles.error}>{errorMsg}</Text>
          ) : (
            <>
              <Text style={styles.status}>{status}</Text>
              {location && (
                <Text style={styles.coords}>
                  Lat: {location.latitude.toFixed(4)}{"\n"}
                  Lon: {location.longitude.toFixed(4)}
                </Text>
              )}
            </>
          )}
          <TouchableOpacity style={styles.btn} onPress={getLocation}>
            <Text style={styles.btnText}>Check Now</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    padding: 25,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: 10,
  },
  status: {
    fontSize: 22,
    textAlign: "center",
    marginVertical: 10,
  },
  coords: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
});
