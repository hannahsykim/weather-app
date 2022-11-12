// Find the input element
var searchInput = document.querySelector("#search-input")
var timeNow = moment();

//Listen for the "Enter" key to be pressed, then search
searchInput.addEventListener('keypress', function(event) {
  
  if (event.key === 'Enter') {
    event.preventDefault();
    createWeatherDisplay(event.target.value)
  }
})

// Get the previous search history from local storage
var previousSearchHistory = localStorage.getItem('searchHistory')
// If there is a previous search history, parse it
if (previousSearchHistory) {
  previousSearchHistory = JSON.parse(previousSearchHistory)
} else {
  // If there is no previous search history, set it to an empty array
  previousSearchHistory = []
}

console.log(previousSearchHistory);

// Loop through the previous search history
for (var i = 0; i < previousSearchHistory.length; i++) {
  var historyContainer = document.querySelector('#history-card');
  // Create a button for each item in the previous search history

  var historyBtn = document.querySelector('#search-history');
  historyBtn.textContent = previousSearchHistory[i];
  historyBtn.classList.add("list-group-item");
  historyBtn.setAttribute("data-value", previousSearchHistory[i]);
  // Add an event listener to each button, when you click it, it will search for the location
  historyBtn.addEventListener('click', function(event) {
    createWeatherDisplay(event.target.textContent)
  })

  historyContainer.appendChild(historyBtn)
  }


// Create a variable to hold the API key
var API_KEY = '06004f8a17a759fff68c0aee9d340d6a'

// A function that returns a promise. The promise is a fetch coordinate data based on a location
function getGeoLocation(query, limit = 5) {
  return fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=${limit}&appid=${API_KEY}`)
}

// A function that returns a promise. The promise is a fetch the weather based on the coordinates
function getCurrentWeather(arguments) {
  var { lat, lon, units } = arguments
  return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${arguments.lat}&lon=${arguments.lon}&units=${'imperial'}&appid=${API_KEY}`)
}

function getFiveDayWeather(arguments) {
  return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${arguments.lat}&lon=${arguments.lon}&units=imperial&appid=${API_KEY}`)
}

// A function that returns a promise. The promise is a fetch to api geolocator
function getLocation(callback) {
  console.log('this work?')
  if (navigator.geolocation) {
    console.log('this did work?')
    navigator.geolocation.getCurrentPosition(
      callback,
      (error) => console.log(error)
    );
  } else {
    console.log('Nope!')
  }
}

// A function that adds a location to the search history
function addToHistory(location) {
  // Get the previous search history from local storage
  var searchHistory = localStorage.getItem('searchHistory')
  // If there is a previous search history, parse it
  if (searchHistory) {
    searchHistory = JSON.parse(searchHistory)
    
    // If the location is already in the search history, don't add it again
    if (searchHistory.includes(location)) {
      return
    }
    
    // Add the location to the search history
    searchHistory.push(location)
    // Save the search history to local storage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
  } else {
    // If there is no previous search history, set it to an empty array
    searchHistory = [location]
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
  }
}


var errorMessage = document.querySelector("#error-message")
var fiveDay = document.querySelector("#five-day")
var weatherDetails = document.querySelector("#weather-body")
var $searchHistory = document.querySelector("#search-history");
var currentDate = document.querySelector('#current');
    currentDate.textContent = timeNow.format("dddd, MM/DD/YYYY");

// A function that gets the current location from the first API
// Then it gets the weather data from the second API
// Then it displays the weather data
function createWeatherDisplay(location) {
 return getGeoLocation(location)
  .then(function(response) {
    return response.json()
  })

  .then(data => {
    console.log(data)
    if (data.length === 0) {
      var erroEl = document.createElement('p')
      erroEl.textContent = `We couldn't find ${location}`
      document.body.appendChild(erroEl)
    } else {
      getCurrentWeather({ lat: data[0].lat, lon: data[0].lon })
      .then(weatherResponse => weatherResponse.json())
      .then(weatherData => {
        console.log(weatherData)
        var weatherPic = document.querySelector('.weather-icon')
        weatherPic.src = "https://openweathermap.org/img/w/" + (weatherData.weather[0].icon) + ".png";
        

        var locationName = document.querySelector('.currentName')
        locationName.textContent = (weatherData.name);

        var currentWeatherStatement = document.querySelector('.currentStatus')
        currentWeatherStatement.textContent = `${weatherData.weather[0].main}: it currently has ${weatherData.weather[0].description}.`
        
        var weatherTemp = document.querySelector('.currentTemp')
        weatherTemp.textContent = "Temperature: " + (weatherData.main.temp) + " °F";
        
        var weatherHumid = document.querySelector('.currentHumidity')
        weatherHumid.textContent = "Humidity: " + (weatherData.main.humidity) + "%";

        var weatherWind = document.querySelector('.currentWind')
        weatherWind.textContent = "Wind Speed: " + (weatherData.wind.speed) + " MPH";

        
        weatherDetails.appendChild(weatherPic, locationName, currentWeatherStatement, weatherTemp, weatherHumid, weatherWind)
        addToHistory(location)
      })
      
     getFiveDayWeather({ lat: data[0].lat, lon: data[0].lon })
      .then(fiveDayWeatherResponse => fiveDayWeatherResponse.json())
      .then(fiveDayData => {
       for (i = 0; i < 5; i++) {
        
        var newForecast = document.querySelector('.card')

        var weatherIcon = document.querySelector('.weatherIcon')
        weatherIcon.src = "https://openweathermap.org/img/w/" + (fiveDayData.list[i].weather[0].icon) + ".png";
        
        var nextDates = document.querySelector('.day-after');
        nextDates.textContent = timeNow.add(1, "days").format("dddd, MM/DD/YYYY");
        
        
        var temp = document.querySelector('.temperature')
        temp.textContent = "Temp: " + (fiveDayData.list[i].main.temp) + " °F";

        var wind = document.querySelector('.wind')
        wind.textContent = "Wind: " + (fiveDayData.list[i].wind.speed) + " MPH";

        var humidity = document.querySelector('.humidity')
        humidity.textContent = "Humidity: " + (fiveDayData.list[i].main.humidity) + " %";

        fiveDay.appendChild( newForecast, weatherIcon, nextDates, temp, wind, humidity);
        
       }
      })  
    }
  })
}
