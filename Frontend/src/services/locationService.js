// Wraps navigator.geolocation with promise-based helpers
// and provides distance/location utilities.

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error("Geolocation is not supported by this browser.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Calculate distance in kilometers between two coordinates
 * using the Haversine formula.
 */
export function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Create approximate coordinates for privacy.
 * This should only be used when the user chooses
 * approximate location sharing.
 */
export function toApproximateCoords(latitude, longitude) {
  const jitter = () => (Math.random() - 0.5) * 0.02;

  return {
    latitude: latitude + jitter(),
    longitude: longitude + jitter(),
  };
}