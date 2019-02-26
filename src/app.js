const express = require("express");
const { distance, bounds } = require("./core");

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/bounds", (req, res) => {
  console.log("\n-------------");
  const latQ = parseFloat(req.query["lat"]).toFixedNumber(4);
  const lngQ = parseFloat(req.query["lng"]).toFixedNumber(4);
  const inradius = parseFloat(req.query["inradius"]);
  const wrap = req.query["wrap"] ? req.query["wrap"] : false;

  const response = bounds(inradius, latQ, lngQ, wrap);

  res.send(response);
});

app.get("/distance", (req, res) => {
  const lat1 = req.query["lat1"];
  const lng1 = req.query["lng1"];
  const lat2 = req.query["lat2"];
  const lng2 = req.query["lng2"];

  const dist = distance(lat1, lng1, lat2, lng2);
  res.send({
    distance: dist
  });
});

app.listen(PORT, () => console.log("Server started"));
