// server/utils/reverseGeocode.js
import axios from "axios";

export async function reverseGeocode(lat, lng) {
  const res = await axios.get(
    "https://nominatim.openstreetmap.org/reverse",
    {
      params: {
        lat,
        lon: lng,
        format: "json",
      },
      headers: {
        "User-Agent": "sos-prototype",
      },
    }
  );

  const address = res.data.address || {};
  return {
    street: address.road || "",
    city: address.city || address.town || address.village || "",
  };
}
