function initMap() {
    const office = { lat: 51.04562456913234, lng :-114.05906382583966 };
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