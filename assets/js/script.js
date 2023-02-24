const API_KEY = "303e4b50b252c8b4341353d69b2f9319";
const city = "London, UK";
const forecastContainer = document.getElementById("forecast");

const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metrics&appid=${API_KEY}`;

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    // Extract the forecast data from the API response
    const forecast = data.list;

    // Iterate over the forecast data, and create a list item for each day
    forecast.forEach((day) => {
      const date = new Date(day.dt * 1000);
      const temperature = day.main.temp;
      const weather = day.weather[0].description;

      // Create a list item element with the forecast data
      const item = document.createElement("li");
      item.innerHTML = `${date}: ${temperature} degrees, ${weather}`;

      // Append the list item to the forecast container
      forecastContainer.appendChild(item);
    });
  });
