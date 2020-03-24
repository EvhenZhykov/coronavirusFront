let startCoronaVirus = new Date("12/08/2019");
let now = new Date();
let timeDiff = Math.abs(now.getTime() - startCoronaVirus.getTime());
let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

const URL = 'http://ff96d2bc.ngrok.io/api/last-statistic';
const TIMEOUT = 86400;
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
        const generalData = data.generalData;
        const totalAllData = data.data;
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

        axios.post('http://ff96d2bc.ngrok.io/api/statistic', {
            country: "Ukraine",
        })
            .then(function (response) {
                $('.by-country .country-name').text(response.data.results.data.country);
                $('.by-country .infected-count').text(response.data.results.data.totalCases);
                $('.by-country .death').text(response.data.results.data.totalDeaths);
                $('.by-country .recovered').text(response.data.results.data.totalRecovered);
                $('.by-country .country-population').text(response.data.results.data.population.toLocaleString());
                $('.spread-value').text((response.data.results.data.totalCases/diffDays).toFixed(0) + " people/day");

            })
            .catch(function (error) {
                console.log(error);
            });

    }

};
const init = async () => {
    await dataProcessing();
    setInterval(dataProcessing, TIMEOUT);
};
init();

$(".search_button").click(function() {
    let searchString = $("#search_box").val();

    axios.post('http://ff96d2bc.ngrok.io/api/statistic', {
        country: searchString,
    })
    .then(function (response) {
        console.log(response.data.results.data);
        $('.by-country .country-name').text(response.data.results.data.country);
        $('.by-country .infected-count').text(response.data.results.data.totalCases);
        $('.by-country .death').text(response.data.results.data.totalDeaths);
        $('.by-country .recovered').text(response.data.results.data.totalRecovered);
        $('.by-country .country-population').text(response.data.results.data.population.toLocaleString());
        $('.spread-value').text((response.data.results.data.totalCases/diffDays).toFixed(0) + " people/day");

    })
    .catch(function (error) {
        console.log(error);
    });
});

