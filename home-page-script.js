const apiKey = "f40507307a60e1b5a2c5212daa211ef8";

const cities = [
  { name: "Casablanca", id: "casablanca" },
  { name: "Tanger", id: "tanger" },
  { name: "Rabat", id: "rabat" },
  { name: "Marrakech", id: "marrakech" },
  { name: "Settat", id: "settat" }
];

cities.forEach(city => {
  
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${apiKey}&units=metric&lang=fr`)
    .then(response => response.json()) // Convert data to JSON object
    .then(data => {
      // Extract data from API response
      const temp = Math.round(data.main.temp); // temperature in °C
      const desc = data.weather[0].description; // like "clear sky"
      const iconCode = data.weather[0].icon; // like "01d"
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // full image URL

      // Target current card using its ID
      const card = document.getElementById(city.id);

      // Set data in the card

      card.querySelector(".temp").textContent = `${temp} °C`;
      card.querySelector(".city_name").textContent = city.name;
    //   card.querySelector(".description").textContent = desc;
      card.querySelector(".icon").src = iconUrl;
      card.querySelector(".icon").alt = desc;

    })
    .catch(error => {
      console.error("❌ Error:", error);

      // If there’s an error, set default values
      const card = document.getElementById(city.id);
      card.querySelector(".temp").textContent = "N/A";
      card.querySelector(".description").textContent = "Erreur";
      card.querySelector(".icon").src = "";
      card.querySelector(".icon").alt = "No icon";
      console.log ('error');
    });
});

const cities_card = document.querySelector('.user-location');
cities_card.addEventListener("click",function(){
  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (navigator.geolocation) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        window.location.href = `weather-page.html?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
      }
    });
});

const submit = document.querySelector('.btn-submit');
submit.addEventListener('click',function(event){
  event.preventDefault();
  const city = document.querySelector('.input-text').value;
  window.location.href = `weather-page.html?q=${encodeURIComponent(city)}`;
});

// toggle mode : 
function toggleMode() {
    document.body.classList.toggle("dark-mode");
    const hero_section = document.querySelector('.hero_section');
    const toggle_cercle = document.querySelector('.slider-circle');
    const copyright = document.querySelector('.copyright');
    hero_section.classList.toggle('night-mode');
    toggle_cercle.classList.toggle('night-toggle');
    copyright.classList.toggle('copyright-dark');


}