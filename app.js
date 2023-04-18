const express = require("express");
const bodyParser = require("body-parser");
const NodeGeocoder = require("node-geocoder");
const geolib = require("geolib");
const models = require("./models");
const Geolocation = models.Geocode;
const app = express();
require("dotenv").config();


// Set up NodeGeocoder
const options = {
  provider: "opencage",
  httpAdapter: "https",
  apiKey: process.env.API_KEY,
  formatter: null,
};
const geocoder = NodeGeocoder(options);

// Set up bodyParser
app.use(bodyParser.json());

// Set up routes
app.post("/geocode", async (req, res) => {
  const { address } = req.body;
  const result = await geocoder.geocode(address);
  const { latitude, longitude } = result[0];
  // console.log(result);
  const geolocation = await Geolocation.create({
    address,
    latitude,
    longitude,
  });
  res.json(geolocation);
});

app.post("/reverse-geocode", async (req, res) => {
  const { latitude, longitude } = req.body;
  // console.log(latitude);
  const result = await geocoder.reverse({ lat: latitude, lon: longitude });
  // console.log(result);
  const address = result[0].formatted
    ? result[0].formatted
    : result[0].streetName + ", " + result[0].city;
  console.log(address);
  res.json({ address });
});

app.post("/distance", async (req, res) => {
  const { lat1, lon1, lat2, lon2 } = req.body;
  const distance = geolib.getDistance(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 }
  );
  res.json({ distance });
});

app.post("/nearby", async (req, res) => {
  const { latitude, longitude, distance } = req.body;
  const allLocations = await Geolocation.findAll();
  const nearbyLocations = allLocations.filter((location) => {
    const locationDistance = geolib.getDistance(
      { latitude: latitude, longitude: longitude },
      { latitude: location.latitude, longitude: location.longitude }
    );
    // console.log(locationDistance);
    console.log(locationDistance <= distance);
    return locationDistance <= distance;
  });
  console.log(nearbyLocations);
  res.json(nearbyLocations);
});

// Set up server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

