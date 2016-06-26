(function(){

  var $refComposant = $(".locateAddressMap"),
      lat = parseFloat($(".locateAddressMap").data("lat")) || 46.3191,
      lng = parseFloat($(".locateAddressMap").data("lng")) || -0.4415,
      zoom = parseInt($(".locateAddressMap").data("zoom"), 10) || 13;

  var map = L.map('map').setView([lat,lng], zoom),
      $unknownUl = $("#unknown-location").find("ul"),
      adherents = [];

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
    id: 'loicc.0fh367h2',
    accessToken: 'pk.eyJ1IjoibG9pY2MiLCJhIjoiY2lwcmJsMHE1MDA0bGgybnIyZ3puMWN2dSJ9.qH8x1GjEISEQEh_chfIQpw'
  }).addTo(map);


  $("#locate-btn").on("click", function(e) {
    var $inputfile = $("input#loadfile"),
        file = $inputfile[0].files[0],
        filename = file.name,
        ext = $inputfile.val().split(".").pop().toLowerCase(),
        hasHeader = $("input#hasHeader").is(":checked") || false,
        hasCoordinates = $("input#hasCoord").is(":checked") || false;

    if($.inArray(ext, ["csv"]) == -1) {
      alert('File must be CSV!');
      return false;
    }

    if (filename != undefined) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var data = $.csv.toArrays(e.target.result);
        data.forEach(function(row, rowIndex){
          if((hasHeader && rowIndex!==0) || (!hasHeader)) {
            var adh = {
              street:row[2],
              city:row[4],
              countrycode:"fr"
            };
            adherents.push(addCoordToAdh(adh));
          }
        });
      };
      var blob = file.slice(0, file.size - 1);
      reader.readAsBinaryString(blob);
    }

    return false;

  });

  function addCoordToAdh(adh) {
    var nominatimQueryUrl = "http://nominatim.openstreetmap.org/search?format=json&limit=1&countrycode="+adh.countrycode+"&street="+adh.street+"&city="+adh.city;

    //window.console.log("Processing : ["+street+","+city+"]");
    $.getJSON(nominatimQueryUrl, function(data) {
      if(data.length>0){
        //window.console.log("Found : ["+data[0].lat+","+data[0].lon+"]");
        adh.position = {
          lat : data[0].lat,
          lng : data[0].lon
        };
        addPoint(adh);
      }else{
        $unknownUl.append("<li>No address for "+adh.street+","+adh.city+"</li>");
      }
    }).fail(function(e){
      $unknownUl.append("<li>Call failed ("+e.state()+") : "+adh.street+","+adh.city+"</li>");
    });

    return adh;
  }

  function addPoint(adh) {
    if(adh.position && adh.position.lat && adh.position.lng){
      var marker = L.marker([adh.position.lat,adh.position.lng]);
      marker.bindPopup("Nom<br/>"+adh.street+" à "+adh.city, L.popup());
      marker.addTo(map);
      return marker;
    }
  }
})();
