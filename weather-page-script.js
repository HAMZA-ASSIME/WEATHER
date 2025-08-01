const apiKey = "f40507307a60e1b5a2c5212daa211ef8";

// Fetch weather by city name
function getWeatherByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== "200") {
        alert("Ville non trouvée !");
        return;
      }

      displayWeather(data);
    })
    .catch(error => console.error("Erreur API:", error));
}

// Fetch weather by geolocation
function getWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`)
    .then(res => res.json())
    .then(data => displayWeather(data))
    .catch(error => console.error("Erreur API:", error));
}

// Display data in the page (with city timezone)
function displayWeather(data) {
  // Current weather
  const cityName = data.city.name;
  const temp = Math.round(data.list[0].main.temp) + "°C";
  const icon = `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`;

  document.querySelector('.current-icon').src = icon;
  document.querySelector('.city_name').textContent = cityName;
  document.querySelector('.temp').textContent = temp;

  // Hourly forecast cards — ONLY for today in city's local time
  const container = document.querySelector('.hours-day');
  container.innerHTML = ""; // Clear old cards

  const cityTimezone = data.city.timezone; // in seconds

  // Get today's date in the city's timezone
  const now = new Date();
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const cityNow = new Date(utcNow.getTime() + cityTimezone * 1000);
  const cityTodayStr = cityNow.toISOString().split("T")[0];

  // Filter forecasts for today's date in city timezone
  const todayForecasts = data.list.filter(item => {
    const forecastUTC = new Date(item.dt_txt);
    const forecastCity = new Date(forecastUTC.getTime() + cityTimezone * 1000);
    return forecastCity.toISOString().split("T")[0] === cityTodayStr;
  });

  // Create cards
  todayForecasts.forEach(item => {
    const forecastUTC = new Date(item.dt_txt);
    const forecastCity = new Date(forecastUTC.getTime() + cityTimezone * 1000);
    const hour = forecastCity.getHours().toString().padStart(2, '0') + ":00";
    const tempCard = Math.round(item.main.temp) + "°C";
    const iconCard = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

    const card = document.createElement('div');
    card.className = "weather_cards px-md-3 d-flex flex-column align-items-center";
    card.innerHTML = `
      <div class="fw-bold mt-3">${hour}</div>
      <img src="${iconCard}" alt="icon" class="icon">
      <div class="temp mb-3">${tempCard}</div>
    `;
    container.appendChild(card);
  });

  if (todayForecasts.length === 0) {
    container.innerHTML = `<div class="text-center">Aucune donnée disponible pour aujourd'hui.</div>`;
  }
  // === Création du graphique après avoir filtré todayForecasts ===

  // Labels X : heures (format "HH:00")
  const labels = todayForecasts.map(item => {
    const forecastUTC = new Date(item.dt_txt);
    const forecastCity = new Date(forecastUTC.getTime() + cityTimezone * 1000);
    return forecastCity.getHours().toString().padStart(2, '0') + ":00";
  });

  // Données Y : températures
  const temperatures = todayForecasts.map(item => Math.round(item.main.temp));

  // Supprimer l'ancien graphique s’il existe
  if (window.weatherChart && typeof window.weatherChart.destroy === 'function') {
    window.weatherChart.destroy();
  }

  // Créer le nouveau graphique
  const ctx = document.getElementById('weatherChart').getContext('2d');

  window.weatherChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels: labels,
        datasets: [{
        label: 'Température (°C)',
        data: temperatures,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Température (°C)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Heure'
          }
        }
      }
    }
  });


  // 6 days
  // === Prévisions pour les 6 prochains jours (hors aujourd'hui) ===

  // 1. Créer un objet pour stocker 1 prévision par jour (midi si possible)
  const dailyForecasts = {};
  data.list.forEach(item => {
    const forecastUTC = new Date(item.dt_txt);
    const forecastCity = new Date(forecastUTC.getTime() + cityTimezone * 1000);
    const dateStr = forecastCity.toISOString().split("T")[0];

    if (dateStr !== cityTodayStr) {
      const hour = forecastCity.getHours();
      if (!dailyForecasts[dateStr] || (hour === 12)) {
        dailyForecasts[dateStr] = item;
      }
    }
  });

  // 2. Garder uniquement les 6 premiers jours
  const nextSixDays = Object.keys(dailyForecasts).slice(0, 6);

  // 3. Afficher dans le HTML
  const sixDaysContainer = document.querySelector('.six-days');
  sixDaysContainer.innerHTML = ""; // Vider le contenu précédent

  nextSixDays.forEach(dateStr => {
    const item = dailyForecasts[dateStr];
    const forecastUTC = new Date(item.dt_txt);
    const forecastCity = new Date(forecastUTC.getTime() + cityTimezone * 1000);

    // Formatter la date (jour/semaine)
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const dayLabel = forecastCity.toLocaleDateString('fr-FR', options);

    const tempDay = Math.round(item.main.temp) + "°C";
    const iconDay = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

    const card = document.createElement('div');
    card.className = "weather_cards d-flex flex-column align-items-center";
    card.innerHTML = `
      <div class="fw-bold mb-1 mt-3">${dayLabel}</div>
      <img src="${iconDay}" alt="icon" class="icon mb-1">
      <div class="temp mb-3">${tempDay}</div>
    `;
    sixDaysContainer.appendChild(card);
  });

  // 6 days
  // === Graphique pour les 6 jours suivants ===

// Détruire l'ancien graphique s'il existe déjà
if (window.sixDayChart instanceof Chart) {
  window.sixDayChart.destroy();
}

// Récupérer les étiquettes (jours) et les températures
const chartLabels = nextSixDays.map(dateStr => {
  const forecastCity = new Date(new Date(dailyForecasts[dateStr].dt_txt).getTime() + cityTimezone * 1000);
  return forecastCity.toLocaleDateString('fr-FR', { weekday: 'short' });
});

const chartTemps = nextSixDays.map(dateStr => Math.round(dailyForecasts[dateStr].main.temp));

  // Créer le graphique
  const ctx_six_days = document.getElementById('sixDayChart').getContext('2d');
  window.sixDayChart = new Chart(ctx_six_days, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Température (°C)',
        data: chartTemps,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#000',
            font: { size: 14 }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return value + '°C';
            }
          }
        }
      }
    }
  });


}

// MAIN LOGIC — check for city in URL or fallback to geolocation
const urlParams = new URLSearchParams(window.location.search);
const city = urlParams.get('q');

if (city) {
  getWeatherByCity(city);
} else if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      getWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    error => {
      alert("Localisation refusée. Ville par défaut utilisée.");
      getWeatherByCity("Casablanca");
    }
  );
} else {
  alert("La géolocalisation n'est pas supportée. Ville par défaut utilisée.");
  getWeatherByCity("Casablanca");
}

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