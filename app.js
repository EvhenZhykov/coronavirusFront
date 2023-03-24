const planetApp =  new PlanetApp.PlanetApp();
let startCoronaVirus = new Date("12/08/2019");
let now = new Date();
let timeDiff = Math.abs(now.getTime() - startCoronaVirus.getTime());
let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
let mapCounter = 0;
let apiData = [];

const HOST = 'https://api-covid.theevenstar.net';
const URL = HOST+'/api/last-statistic';
const URLbyCountry = HOST +'/api/statistic';
const TIMEOUT = 86400;
const countryContainer = document.querySelector( "#country-container" );

planetApp.on( "planetAppLoaded", () => {
    const loader = document.querySelector( "#planet-progress" );
    const title = document.querySelector( "#loader-title" );
    loader.style.display = 'none';
    title.style.display = 'none';
} );

function getStatisticByCountry() {
    let searchString = $("#search_box").val();
    let search = searchString.toLowerCase().trim();

    if(search === 'us' || search === 'u.s.a.' || search === 'u.s.a' || search === 'usa' || search === 'america'){
        search = "us";
    }
    const searchRes = apiData.filter(el => {
        const country = el.attributes.Country_Region.toLowerCase();
        return country === search;
    });

    if(searchRes.length > 0) {
        planetApp.focusOnACountry(searchRes[0].attributes.OBJECTID);

        axios.get(URLbyCountry +'?country=' + searchString)
            .then(function (response) {
                let data = response.data.results.data;
                $('.by-country .country-name').text(data.country);
                $('.by-country .infected-count').text(data.totalCases);
                $('.by-country .death').text(data.totalDeaths);
                $('.by-country .recovered').text(data.totalRecovered);
                $('.by-country .country-population').text(data.population.toLocaleString());
                $('.spread-value').text((data.totalCases / diffDays).toFixed(0) + " people/day");
                document.getElementById('countries').innerHTML = '';
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}

const fetchData = () => {
    return axios({
        method: 'get',
        url: URL
    });
};

const getData = async () => {
    try {
        const response = await fetchData();
        if (response.status !== 200)
            return null;
        return response.data.results.data;
    } catch (err) {
        console.log(err);
        return null;
    }
};

const dataProcessing = async () => {
    const data = await getData();
    if (data) {
        let generalData = data.generalData;
        let totalAllData = data.data;
        let topData = totalAllData.splice(0, 8);

        $('#total_infected').text(generalData.cases.toLocaleString());
        $('#total_death').text(generalData.deaths.toLocaleString());
        $('#total_recovered').text(generalData.recovered.toLocaleString());

        $('.total-infected-population').text((generalData.cases*100/generalData.population).toFixed(5));
        $('.total-death-population').text((generalData.deaths*100/generalData.population).toFixed(5));
        $('.total-recovered-population').text((generalData.recovered*100/generalData.population).toFixed(5));
        $('.total-spread-value').text((generalData.cases/diffDays).toFixed(0) + " people/day");

        $.each(topData, function(index, val) {
            $('#indexName_' + index ).text(val.country);
            $('#indexCount_' + index ).text(val.totalCases.toLocaleString());
            $('#population_' + index ).text((val.totalCases*100/val.population).toFixed(5)+" %");
        });
        Promise.all([
            planetApp.load('./PlanetAppLib/resources')
        ]).then(() => {
            apiData = data.apiData;
            planetApp.setPandemicData({features: data.apiData});
            if(!mapCounter){
                planetApp.setContainer(document.querySelector("#planet-container"));
                mapCounter++;
            }
        });

        getStatisticByCountry()

    }

};
const init = async () => {
    await dataProcessing();
   setInterval(dataProcessing, TIMEOUT);
};
move();
init();

$(".search_button").click(function() {
    getStatisticByCountry()
});

planetApp.on( "countryScreenPositionChanged", ( left, top ) => {
    countryContainer.style.left = (left + 20) + "px";
    countryContainer.style.top = (top + 100) + "px";
    countryContainer.style.display = "flex";
} );

$("#close_button").click(function() {
    planetApp.unfocusCountry();
    countryContainer.style.display = "none";
    document.getElementById('search_box').value = ''
});

function onInput() {
    const search = document.getElementById('search_box').value;
    const searchRes = apiData.filter(el => {
        const country = el.attributes.Country_Region.toLowerCase();
        return country.includes(search.toLowerCase());
    });
    if((searchRes.length === 1 && searchRes[0].attributes.Country_Region === search) || search === 'US') {
        getStatisticByCountry();
    }
    let options = '';
    for(let i = 0; i < searchRes.length; i++) {
        options += '<option value="' + searchRes[i].attributes.Country_Region + '" />';
    }
    document.getElementById('countries').innerHTML = options;
}


function move() {
    let i = 0;
    if (i === 0) {
        i = 1;
        let elem = document.getElementById("planet-bar");
        let width = 5;
        let id = setInterval(frame, 25);
        function frame() {
            if (width >= 95) {
                clearInterval(id);
                i = 0;
            } else {
                width++;
                elem.style.width = width + "%";
                elem.innerHTML = width + "%";
            }
        }
    }
}

$("#search_box").keydown(function(e) {
    if(e.keyCode === 13) {
        getStatisticByCountry()
    }
});

