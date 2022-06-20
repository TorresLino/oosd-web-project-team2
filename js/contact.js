function initMap() {
    const office = { lat: 51.04596233727227, lng : -114.0881891182375 };
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: office,
    });
    const marker = new google.maps.Marker({
        position: office,
        map: map,
    });
}
window.initMap = initMap;