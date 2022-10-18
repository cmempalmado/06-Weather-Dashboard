dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

const searchBtnEl = document.getElementById("searchBtn");
const searchInputEl = document.getElementById("searchInput");
const searchHistoryEl = document.getElementById("searchHistory");

const searchHistory = [];
const apiUrl = "https://api.openweathermap.org";
const apiKey = "621d158e3d9afb2f8ae54d5fb310b3de";


function drawCurrentCard(city, weather, time) {

    const date = dayjs().tz(time).format("M/D/YYYY");
    const currentHumidity = document.getElementById("todayHumidity");
    const currentWind = document.getElementById("todayWind");
    const currentDate = document.getElementById("todayDate");
    const currentIcon = document.getElementById("todayIcon");
    const currentTemperature = document.getElementById("todayTemp");

    const uv = document.getElementById("uv");
    const uvcolor = document.getElementById("uvcolor");
    const weatherIcon = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;

    todayCity.textContent = city;
    currentDate.textContent = date;
    currentIcon.setAttribute("src", weatherIcon);
    currentTemperature.textContent = weather.temp;
    currentWind.textContent = weather.wind_speed;
    currentHumidity.textContent = weather.humidity;
    uv.textContent = weather.uvi;

    if (weather.uvi < 3) {
        uvcolor.setAttribute("class", "uvcard green");
    } else if (weather.uvi < 6) {
        uvcolor.setAttribute("class", "uvcard yellow");
    } else if (weather.uvi < 8) {
        uvcolor.setAttribute("class", "uvcard orange");
    } else {
        uvcolor.setAttribute("class", "uvcard red");
    };
    ;
};

function searchCity(e) {
    if (!searchInputEl.value) {
        return;
    };
    e.preventDefault();

    const search = searchInputEl.value.trim();

    getCoordinates(search);

    searchInputEl.value = "";
};


function getCityInfo(cityData) {
    const lat = cityData.lat;
    const lon = cityData.lon;
    const city = cityData.name;

    const url = `${apiUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`;

    fetch(url)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            drawCurrentCard(city, data.current, data.timezone);
            drawFiveDayCard(data.daily, data.timezone);
        })
        .catch(function (err) {
            console.error(err);
        });
};

// to show the coordinates of the desired place
function getCoordinates(search) {
    const url = apiUrl + "/geo/1.0/direct?q=" + search + "&limit=5&appid=" + apiKey;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert("Location not found. Please enter a city name.");
            } else {
                addHistory(search)
                getCityInfo(data[0]);
                return;
            }
        })
        .catch(function (err) {
            console.log("error: " + err);
        });
    const content = document.getElementById("content");
    content.removeAttribute("class", "hidden");
};

// function that shows the 5day forecast from current time
function drawFiveDayCard(daily, time) {
    const day1 = dayjs().tz(time).add(1, "day").startOf("day").unix();
    const day5 = dayjs().tz(time).add(6, "day").startOf("day").unix();

    for (var i = 0; i < daily.length; i++) {
        if (daily[i].dt >= day1 && daily[i].dt < day5) {
            const timeStamp = daily[i].dt;
            const day = dayjs.unix(timeStamp).tz(time).format("MMM D");
            const date = document.getElementById(`day${i}`);
            const dayIcon = document.getElementById(`day${i}Icon`);
            const dayTemperature = document.getElementById(`day${i}Temp`);
            const dayWind = document.getElementById(`day${i}Wind`);
            const dayHumidity = document.getElementById(`day${i}Humidity`);
            const weatherIcon = `https://openweathermap.org/img/w/${daily[i].weather[0].icon}.png`;

            date.textContent = day;
            dayIcon.setAttribute("src", weatherIcon);
            dayTemperature.textContent = daily[i].temp.max;
            dayWind.textContent = daily[i].wind_speed;
            dayHumidity.textContent = daily[i].humidity;

        };
    };
};

//function that show the past searched place
function clickSearchHistory(e) {
    if (!e.target.matches("button.history")) {
        return;
    };
    const button = e.target;
    const search = button.getAttribute("data-search");
    getCoordinates(search);
};

function addHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    };
    searchHistory.push(search);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    historyButtons();
};



function historyButtons() {
    const historySection = document.getElementById("searchHistory");
    historySection.innerHTML = "";
    for (let i = searchHistory.length - 1; i >= searchHistory.length - 5; i--) {
        if (i < 0) {
            return;
        };

        const button = document.createElement("button");
        const space = document.createElement("br");

        button.setAttribute("type", "button");
        button.setAttribute("class", "history");

        button.setAttribute("data-search", searchHistory[i]);
        button.textContent = searchHistory[i];

        historySection.append(button);
        historySection.append(space);
    };
};


function makeHistory() {
    const savedHistory = localStorage.getItem("searchHistory");

    if (savedHistory) {
        searchHistory = JSON.parse(savedHistory);
    };
    historyButtons();
};


makeHistory();
searchBtnEl.onclick = searchCity;
searchHistoryEl.addEventListener("click", clickSearchHistory);