const apiKey = "f40507307a60e1b5a2c5212daa211ef8";

const cities = [
  { name: "Casablanca", id: "casablanca" },
  { name: "Tanger", id: "tanger" },
  { name: "Rabat", id: "rabat" },
  { name: "Marrakech", id: "marrakech" },
  { name: "Settat", id: "settat" }
];

// Current localisation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`)
        .then(response => response.json())
        .then(data => {
          const temp = Math.round(data.main.temp);
          const desc = data.weather[0].description;
          const iconCode = data.weather[0].icon;
          const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

          const card = document.getElementById("user-location-weather");
          card.querySelector(".temp").textContent = `${temp} °C`;
          card.querySelector(".city_name").textContent = data.name;
          card.querySelector(".icon").src = iconUrl;
          card.querySelector(".icon").alt = desc;
        })
        .catch(error => {
          console.error("❌ Error fetching user location weather:", error);
        });
    },
    (error) => {
      console.warn("Geolocation denied or unavailable:", error);
    }
  );
} else {
  console.warn("Geolocation is not supported by this browser.");
}


// cities.forEach(city => {
  
//   fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${apiKey}&units=metric&lang=fr`)
//     .then(response => response.json()) // Convert data to JSON object
//     .then(data => {
//       // Extract data from API response
//       const temp = Math.round(data.main.temp); // temperature in °C
//       const desc = data.weather[0].description; // like "clear sky"
//       const iconCode = data.weather[0].icon; // like "01d"
//       const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // full image URL

//       // Target current card using its ID
//       const card = document.getElementById(city.id);

//       // Set data in the card

//       card.querySelector(".temp").textContent = `${temp} °C`;
//       card.querySelector(".city_name").textContent = city.name;
//     //   card.querySelector(".description").textContent = desc;
//       card.querySelector(".icon").src = iconUrl;
//       card.querySelector(".icon").alt = desc;

//     })
//     .catch(error => {
//       console.error("❌ Error:", error);

//       // If there’s an error, set default values
//       const card = document.getElementById(city.id);
//       card.querySelector(".temp").textContent = "N/A";
//       card.querySelector(".description").textContent = "Erreur";
//       card.querySelector(".icon").src = "";
//       card.querySelector(".icon").alt = "No icon";
//       console.log ('error');
//     });
// });
