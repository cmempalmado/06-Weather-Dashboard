const apiUrl = 'https://api.openweathermap.org';
const apiKey = '621d158e3d9afb2f8ae54d5fb310b3de';
const searchHistory = [];

const searchBtnEl = document.getElementById('searchBtn');
const searchInputEl = document.getElementById('searchInput');
const searchHistoryEl = document.getElementById('searchHistory');

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function drawCurrentCard(city, weather, time) {

    const date = dayjs().tz(time).format('M/D/YYYY');
    const currentHumidity = document.getElementById('humidityToday');
    const currentWind = document.getElementById('windToday');
    const currentDate = document.getElementById('dateToday');
    const currentIcon = document.getElementById('iconToday');
    const currentTemperature = document.getElementById('tempToday');

    const uv = document.getElementById('uv');
    const uvcolor = document.getElementById('uvcolor');
    const weatherIcon = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;

    todayCity.textContent = city;
    currentDate.textContent = date;
    currentIcon.setAttribute('src', weatherIcon);
    currentTemperature.textContent = weather.temp;
    currentWind.textContent = weather.wind_speed;
    currentHumidity.textContent = weather.humidity;
    uv.textContent = weather.uvi;

    if (weather.uvi < 3) {
        uvcolor.setAttribute('class', 'uvcard green');
    } else if (weather.uvi < 6) {
        uvcolor.setAttribute('class', 'uvcard yellow');
    } else if (weather.uvi < 8) {
        uvcolor.setAttribute('class', 'uvcard orange');
    } else {
        uvcolor.setAttribute('class', 'uvcard red');
    };

};

function searchCity(event) {
    if (!searchInputEl.value) {
        return alert('No City Entered!');
    };
    event.preventDefault();
    const search = searchInputEl.value.trim();

    getCoordinates(search);
    searchInputEl.value = '';
};


function getCityInfo(location) {
    const lat = location.lat;
    const lon = location.lon;
    const city = location.name;

    const url = `${apiUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`;

    fetch(url)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            drawCurrentCard(city, data.current, data.timezone);
            drawWeatherCards(data.daily, data.timezone);
        })
        .catch(function (err) {
            console.error(err);
        });
};

function getCoordinates(search) {
    const url = apiUrl + '/geo/1.0/direct?q=' + search + '&limit=5&appid=' + apiKey;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert('Location not found. Please enter a city name.');
            } else {
                addHistory(search)
                getCityInfo(data[0]);
                return;
            }
        })
        .catch(function (err) {
            console.log(err);
        });
    const content = document.getElementById('content');
    content.removeAttribute('class', 'hidden');
};

function drawWeatherCards(daily, time) {
    const day1 = dayjs().tz(time).add(1, 'day').startOf('day').unix();
    const day5 = dayjs().tz(time).add(5-1, 'day').startOf('day').unix();

    for (var i = 0; i < daily.length; i++) {
        if (daily[i].dt >= day1 && daily[i].dt < day5) {
            const timeStamp = daily[i].dt;
            const day = dayjs.unix(timeStamp).tz(time).format('MMM D');
            const date = document.getElementById(`day${i}`);
            const icon = document.getElementById(`iconDay${i}`);
            const temperature = document.getElementById(`tempDay${i}`);
            const wind = document.getElementById(`windDay${i}`);
            const humidityEl = document.getElementById(`humidityDay${i}`);
            const weatherIcon = `https://openweathermap.org/img/w/${daily[i].weather[0].icon}.png`;

            date.textContent = day;
            icon.setAttribute('src', weatherIcon);
            temperature.textContent = daily[i].temp.max;
            wind.textContent = daily[i].wind_speed;
            humidityEl.textContent = daily[i].humidity;
        }
    };
};


function clickSearchHistory(event) {
    event.preventDefault();
    if (!event.target.matches('button.history')) {
        return;
    };
    const button = event.target;
    const search = button.getAttribute('data-search');
    getCoordinates(search);
};

function addHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    };
    searchHistory.push(search);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    historyButtons();
};

function historyButtons() {
    const historySection = document.getElementById('searchHistory');
    historySection.innerHTML = '';
    for (var i = searchHistory.length - 1; i >= searchHistory.length - 5; i--) {
        if (i < 0) {
            return;
        };
        const button = document.createElement('button');
        const lineBreak = document.createElement('br');

        button.setAttribute('type', 'button');
        button.setAttribute('class', 'history');
        button.setAttribute('data-search', searchHistory[i]);
        button.textContent = searchHistory[i];

        historySection.append(button);
        historySection.append(lineBreak);
    };
};

function makeHistory() {
    const savedHistory = localStorage.getItem('searchHistory');

    if (savedHistory) {
       const searchHistory = JSON.parse(savedHistory);
       return searchHistory;
    };
    historyButtons();
};

makeHistory();
searchBtnEl.onclick = searchCity;
searchHistoryEl.addEventListener('click', clickSearchHistory);