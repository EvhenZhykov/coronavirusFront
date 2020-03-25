let startCoronaVirus = new Date("12/08/2019");
let now = new Date();
let timeDiff = Math.abs(now.getTime() - startCoronaVirus.getTime());
let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

const HOST = 'https://api.covid.theevenstar.net';
const URL = HOST+'/api/last-statistic';
const URLbyCountry = HOST +'/api/statistic';
const TIMEOUT = 86400;

function getStatisticByCountry() {
    let searchString = $("#search_box").val();

    if(searchString === ''){
        searchString = "Ukraine";
    }

    axios.post(URLbyCountry, {
        country: searchString,
    })
        .then(function (response) {
            let data = response.data.results.data;
            $('.by-country .country-name').text(data.country);
            $('.by-country .infected-count').text(data.totalCases);
            $('.by-country .death').text(data.totalDeaths);
            $('.by-country .recovered').text(data.totalRecovered);
            $('.by-country .country-population').text(data.population.toLocaleString());
            $('.spread-value').text((data.totalCases/diffDays).toFixed(0) + " people/day");
        })
        .catch(function (error) {
            console.log(error);
        });
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

        getStatisticByCountry()

    }

};
const init = async () => {
    await dataProcessing();
    setInterval(dataProcessing, TIMEOUT);
};
init();

$(".search_button").click(function() {
    getStatisticByCountry()
});

$("#search_box").keydown(function(e) {
    if(e.keyCode === 13) {
        getStatisticByCountry()
    }
});

