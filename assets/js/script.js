/* 

Tecnical Requirements:
- Use the [5 Day Weather Forecast](https://openweathermap.org/forecast5) to retrieve weather data for cities.
- You will use `localStorage` to store any persistent data.
- Create a weather dashboard with form inputs.
  - When a user searches for a city they are presented with current and future conditions for that city and that city is added to the search history
  - When a user views the current weather conditions for that city they are presented with:
    - The city name
    - The date
    - An icon representation of weather conditions
    - The temperature
    - The humidity
    - The wind speed
  - When a user view future weather conditions for that city they are presented with a 5-day forecast that displays:
    - The date
    - An icon representation of weather conditions
    - The temperature
    - The humidity
  - When a user click on a city in the search history they are again presented with current and future conditions for that city
*/

// Start code==================================================
// Empty variable for cities
var cities = [];

// Cities at localStorage
$(document).ready(function () {
  var savedCity = JSON.parse(localStorage.getItem("cities"));
  if (savedCity !== null) {
    cities = savedCity;
  }
  displayCityButtons(cities);
});

// click event listeners
$(document).on("click", ".city", function () {
  // Get the value of the "data-city" attribute from the clicked element
  var city = $(this).attr("data-city");
  // Call the "mainForecastFunctionDisplay" function with the city as the argument
  mainForecastFunctionDisplay(city);
});

// button event listener
$("#search-button").on("click", function (event) {
  event.preventDefault();
  var city = $("#search-input").val().trim();
  if (city === "") {
    alert("Please enter a city name!");
    return;
  }
  city = CityCaseName(city);
  mainForecastFunctionDisplay(city);
  $("#search-input").val("");
});

// change metrics unit
function WindMetrics(speed) {
  return speed * 3.6;
}

// change city case naming function
function CityCaseName(city) {
  return city.charAt(0).toUpperCase() + city.slice(1);
}

// function for day 1
function showDayOne(fiveDaysData) {
  $("#today").empty();
  var firstDayData = fiveDaysData[0];
  var h3El = $("<h3>").text(`${firstDayData.city} ${firstDayData.date} `);
  var iconEl = $("<img>").attr("src", firstDayData.icon);
  h3El.append(iconEl);
  var temperatureEl = $("<p>").text(`Temperature: ${firstDayData.temp}`);
  var humidityEl = $("<p>").text(`Humidity: ${firstDayData.humidity}`);
  var windEl = $("<p>").text(`Wind: ${firstDayData.wind}`);
  $("#today").append(h3El, temperatureEl, humidityEl, windEl);
  $("#today").addClass("today");
}

// function for full forecast
function showDayTwoToFour(fiveDaysData) {
  $("#forecast").empty();

  for (let i = 1; i < fiveDaysData.length; i++) {
    const day = fiveDaysData[i];

    const dayDiv = $("<div>");
    dayDiv.attr("class", "card col px-1 py-2 mx-1");

    const h5El = $("<h5>").text(`${day.date}`);
    const iconEl = $("<img>").attr("src", day.icon);
    const tempEl = $("<p>").text(`Temp: ${day.temp}`);
    const humidityEl = $("<p>").text(`Humidity: ${day.humidity}`);

    dayDiv.append(h5El, iconEl, tempEl, humidityEl);
    $("#forecast").append(dayDiv);
  }
}

// function that adds city with data to cities state
function addCityToCities(city, fiveDaysData) {
  let cityExists = false;
  for (let i = 0; i < cities.length; i++) {
    if (cities[i].cityName === city) {
      cityExists = true;
      break;
    }
  }
  if (!cityExists) {
    cities.push({
      cityName: city,
      data: fiveDaysData,
    });
  }
}

// function to save in local storage
function saveLocal(cities) {
  localStorage.setItem("cities", JSON.stringify(cities));
}

// function to display buttons
function displayCityButtons() {
  // Clear the list of previously displayed buttons
  $("#history").empty();

  // Loop through the array of cities and create a button for each one
  for (var i = 0; i < cities.length; i++) {
    var city = cities[i];

    // Create a new button element
    var buttonEl = $("<button>");

    // Add the necessary classes and data attribute to the button
    buttonEl.addClass("city btn btn-outline-success btn-block");
    buttonEl.attr("data-city", city.cityName);

    // Set the text of the button to the city name
    buttonEl.text(city.cityName);

    // Add the button to the list of buttons in the DOM
    $("#history").append(buttonEl);
  }
}

// function that makes AJAX calls and handles data back
function mainForecastFunctionDisplay(city) {
  var API_KEY = "8b4f86900b772bf6f2b5948251379071";
  var geolocationQueryURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;

  $.ajax({
    url: geolocationQueryURL,
    method: "GET",
  }).then(function (response) {
    var lat = response[0].lat;
    var lon = response[0].lon;

    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=50&appid=${API_KEY}`;

    // second AJAX call for weather data , using longitude and latitude data
    return $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      // console.log(response);
      var results = response.list;
      var timeStamps = [];
      var currentTimestamp;
      var fiveDaysData = [];

      // iterating through list of data and grabbing current data and 5 days in future by adding 24h in minutes in timestamp
      results.map(function (item, i) {
        if (i === 0) {
          timeStamps.push(item.dt);
          currentTimestamp = item.dt;
          // console.log(currentTimestamp, item.dt_txt);
          var firstDay = {
            city: city,
            date: moment.unix(item.dt).format("MM/DD/YYYY"),
            icon: `https://openweathermap.org/img/w/${item.weather[0].icon}.png`,
            temp: `${Math.round(item.main.temp - 273)} °C`,
            humidity: `${item.main.humidity} %`,
            wind: `${
              Math.round(WindMetrics(item.wind.speed) * 100) / 100
            } Km/h`,
          };
          fiveDaysData.push(firstDay);
        }
        if (
          item.dt === currentTimestamp + 86400 ||
          item.dt === currentTimestamp + 2 * 86400 ||
          item.dt === currentTimestamp + 3 * 86400 ||
          item.dt === currentTimestamp + 4 * 86400
        ) {
          var futureDay = {
            city: city,
            date: moment.unix(item.dt).format("MM/DD/YYYY"),
            icon: `https://openweathermap.org/img/w/${item.weather[0].icon}.png`,
            temp: `${Math.round(item.main.temp - 273)} °C`,
            humidity: `${item.main.humidity} %`,
            wind: `${
              Math.round(WindMetrics(item.wind.speed) * 100) / 100
            } Km/h`,
          };
          fiveDaysData.push(futureDay);
          timeStamps.push(item.dt);
        }
      });
      // below we re displaying current day , forecast for 5 days , adding city with data in cities state, adding it to localStorage if not already there and render buttons
      showDayOne(fiveDaysData);
      showDayTwoToFour(fiveDaysData);
      addCityToCities(city, fiveDaysData);
      displayCityButtons(cities);
      saveLocal(cities);
    });
  });
}
