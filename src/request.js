/*global google*/
var API_PREFIX = "https://api.graphloc.com/graphql";
function getLocation(ip){
  return  fetch(API_PREFIX, {
   method: 'POST',
   headers: {
      'Content-Type' : 'application/json'
   },
   body:JSON.stringify({
      query: "{getLocation(ip: \"" + ip + "\") {country {names {en}geoname_id iso_code}location {latitude longitude}}}",
      variables: null,
      operationName: null

   })
  }).then(
    function(response){
      if(response)
        return Promise.resolve(response.json());
    }
  )
}

function getDistance(originLatLong, destinationLatLong, callback){
      var origin = new google.maps.LatLng(originLatLong.latitude, originLatLong.longitude);
      var destination = new google.maps.LatLng(destinationLatLong.latitude, destinationLatLong.longitude);
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: "DRIVING"
        }, callback);
}




export {getLocation, getDistance}