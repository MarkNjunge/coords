// Radius of earth in km
const R = 6371;
// The distance(km) of 1 degree of latitude is approximately 111km
// The distance(km) of 1 degree of longitude **at the equator** is approximately 111km
const distanceOfDegree = 111;

/**
 *
 *
 */
/**
 * Get the distance in km.
 * lat1, lng1, lat2 and lng2 should be in decimal degrees.
 * @param {Number} lat1
 * @param {Number} lng1
 * @param {Number} lat2
 * @param {Number} lng2
 *
 * @returns {Number}
 */
function distance(lat1, lng1, lat2, lng2) {
  const rLat1 = radians(lat1);
  const rLng1 = radians(lng1);
  const rLat2 = radians(lat2);
  const rLng2 = radians(lng2);

  const dLat = rLat2 - rLat1;
  const dLng = rLng2 - rLng1;

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.pow(Math.sin(dLng / 2), 2);

  const c = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 2;

  return (R * c).toFixedNumber(4);
}

/**
 *
 *
 */
/**
 * Get the bounding box of the coordinates and the distance.
 * latQ and lngQ should be in decimal degrees.
 * @param {Number} distance
 * @param {Number} latQ
 * @param {Number} lngQ
 * @param {Boolean} wrap
 */
function bounds(distance, latQ, lngQ, wrap) {
  console.log(`latQ: ${latQ}, lngQ: ${lngQ}, distance: ${distance}`);

  if (distance == 0) {
    return {
      lat: 0,
      lng: 0
    };
  }

  const cLat = distance / distanceOfDegree;

  // Because of the earth's shape, the distance(km) of 1 degree of longitude varies greatly depending on how far away from the equator you are.
  // At the equator it's approximately 111km and decreases to 0 at the poles
  // Therefore, we need to calculate the distance at the given latitude.
  // https://www.thoughtco.com/degree-of-latitude-and-longitude-distance-4070616
  // https://gis.stackexchange.com/questions/251643/approx-distance-between-any-2-longitudes-at-a-given-latitude
  // http://www.csgnetwork.com/degreelenllavcalc.html
  var cLng = 0;
  if (latQ == 90 || latQ == -90) {
    // At the poles, the distance(degrees) is 0
    cLng = 0;
  } else {
    // Calculate the distance(km) at the latitude
    const latRadians = latQ * (Math.PI / 180);
    const lngDist = radians(R * Math.cos(latRadians));
    console.log(`lngDist: ${lngDist.toFixedNumber(4)}`);

    // Calculate the distance(degrees)
    cLng = distance / lngDist;
  }

  const lat = parseFloat(cLat).toFixedNumber(4);
  const lng = parseFloat(cLng).toFixedNumber(4);

  console.log(`lat: ${lat}, lng: ${lng}`);

  return createBounds(latQ, lngQ, lat, lng, wrap);
}

function createBounds(latQ, lngQ, lat, lng, wrap) {
  var latMax = (latQ + Math.abs(lat)).toFixedNumber(4);
  var latMin = (latQ - Math.abs(lat)).toFixedNumber(4);
  var lngMax = (lngQ + Math.abs(lng)).toFixedNumber(4);
  var lngMin = (lngQ - Math.abs(lng)).toFixedNumber(4);

  // Latitude degrees only range between -90 and 90.
  if (latMax > 90) latMax = 90;
  if (latMin < -90) latMin = -90;

  if (wrap == "true") {
    return wrappingBounds(latMax, latMin, lngMax, lngMin);
  } else {
    return nonWrappingBounds(latMax, latMin, lngMax, lngMin);
  }
}

function nonWrappingBounds(latMax, latMin, lngMax, lngMin) {
  // Longitude degrees only range between -180 and 180.
  if (lngMax > 180) lngMax = 180;
  if (lngMin < -180) lngMin = -180;

  console.log(`latMax: ${latMax}, latMin: ${latMin}`);
  console.log(`lngMax: ${lngMax}, lngMin: ${lngMin}`);

  const response = createResponseObject(latMax, latMin, lngMax, lngMin);
  console.log(JSON.stringify(response));

  return response;
}

function wrappingBounds(latMax, latMin, lngMax, lngMin) {
  const bounds = [];
  // Longitude degrees only range between -180 and 180.
  // To allow for wrapping around, we subtract and add instead of reducing
  if (lngMax > 180) {
    lngMax = lngMax - 180;
  }

  if (lngMin < -180) {
    // Get postition to the left of 0 degree
    const pos = 180 - (Math.abs(lngMin) - 180);
    bounds.push(createResponseObject(latMax, latMin, 180, pos));

    lngMin = -180;
  }

  // If it wraps around, lngMin will be greater than lngMax, so we switch them
  if (lngMin > lngMax) {
    const t = lngMax;
    lngMax = lngMin;
    lngMin = t;
  }

  console.log(`latMax: ${latMax}, latMin: ${latMin}`);
  console.log(`lngMax: ${lngMax}, lngMin: ${lngMin}`);

  const response = createResponseObject(latMax, latMin, lngMax, lngMin);
  bounds.push(response);

  console.log(JSON.stringify(bounds));
  return bounds;
}

function createResponseObject(latMax, latMin, lngMax, lngMin) {
  return {
    extremes: {
      lat: {
        max: latMax,
        min: latMin
      },
      lng: {
        max: lngMax,
        min: lngMin
      }
    },
    bounds: {
      topRight: {
        lat: latMax,
        lng: lngMax
      },
      bottomRight: {
        lat: latMin,
        lng: lngMax
      },
      bottomLeft: {
        lat: latMin,
        lng: lngMin
      },
      topLeft: {
        lat: latMax,
        lng: lngMin
      }
    }
  };
}

function radians(i) {
  return i * (Math.PI / 180);
}

// toFixed() returns a string. This returns a number.
// https://stackoverflow.com/questions/2283566/how-can-i-round-a-number-in-javascript-tofixed-returns-a-string
Number.prototype.toFixedNumber = function(x, base) {
  var pow = Math.pow(base || 10, x);
  return Math.round(this * pow) / pow;
};

module.exports = {
  distance,
  bounds
};
