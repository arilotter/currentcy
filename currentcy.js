function initRates() {
    if (typeof rates === 'undefined') {
        var rates = {
            "EUR": {
                "USD": ["0", "0"],
                "CAD": ["0", "0"],
                "GBP": ["0", "0"],
                "INR": ["0", "0"],
                "JPY": ["0", "0"],
                "CNY": ["0", "0"],
            },
            "USD": {
                "EUR": ["0", "0"],
                "CAD": ["0", "0"],
                "GBP": ["0", "0"],
                "INR": ["0", "0"],
                "JPY": ["0", "0"],
                "CNY": ["0", "0"],
            },
            "CAD": {
                "EUR": ["0", "0"],
                "USD": ["0", "0"],
                "GBP": ["0", "0"],
                "INR": ["0", "0"],
                "JPY": ["0", "0"],
                "CNY": ["0", "0"],
            },
            "GBP": {
                "EUR": ["0", "0"],
                "USD": ["0", "0"],
                "CAD": ["0", "0"],
                "INR": ["0", "0"],
                "JPY": ["0", "0"],
                "CNY": ["0", "0"],
            },
            "INR": {
                "EUR": ["0", "0"],
                "USD": ["0", "0"],
                "CAD": ["0", "0"],
                "GBP": ["0", "0"],
                "JPY": ["0", "0"],
                "CNY": ["0", "0"],
            },
            "JPY": {
                "EUR": ["0", "0"],
                "USD": ["0", "0"],
                "CAD": ["0", "0"],
                "GBP": ["0", "0"],
                "INR": ["0", "0"],
                "CNY": ["0", "0"],
            },
            "CNY": {
                "EUR": ["0", "0"],
                "USD": ["0", "0"],
                "CAD": ["0", "0"],
                "GBP": ["0", "0"],
                "INR": ["0", "0"],
                "JPY": ["0", "0"],
            },
        };
        return rates;
    } else {
        console.log("ERROR: initRates() called with previously initialised rates.");
    }
}

function updateRates(rates) {
    for (const currIn in rates) {
        for (const currOut in rates[currIn]) {
            if (Date.now() - Number(rates[currIn][currOut][1]) >= 1800000) { // 30 minutes
                if (Date.now() - Number(rates[currOut][currIn][1]) < 1800000) {
                    rates[currIn][currOut][0] = (1 / Number(rates[currOut][currIn][0])).toString(); // Value
                    rates[currIn][currOut][1] = Number(rates[currOut][currIn][1]).toString(); // Timestamp
                    browser.storage.local.set({
                        rates
                    });
                } else {
                    getRate(rates, currIn, currOut);
                }
            }
        }
    }
}

function getRate(rates, currIn, currOut) {
    var jsonSource = `https://free.currencyconverterapi.com/api/v5/convert?q=${currIn}_${currOut}&compact=y`;
    try {
        fetch(jsonSource)
            .then(
                function (res) {
                    if (res.status !== 200) {
                        console.log("Failed to fetch JSON: " + res.status);
                        return;
                    }
                    res.json().then(function (data) {
                        rates[currIn][currOut][0] = Object.values(data)[0].val.toString();
                        rates[currIn][currOut][1] = Date.now().toString();
                        browser.storage.local.set({
                            rates
                        });
                        console.log(`rates for ${currIn} to ${currOut} set from ${jsonSource}.`);
                    });
                }
            )
            .catch(function (err) {
                console.log(err);
            });
    } catch (err) {
        console.log("Error: JSON data could not be read.");
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function onGot(item) {
    if (item.localCurr) {
        localCurr = item.localCurr;
    }
    if (item.rates) {
        rates = item.rates;
        updateRates(rates);
    } else {
        rates = initRates();
        updateRates(rates);
    }
}

function main() {
    var gettingCurr = browser.storage.local.get("localCurr");
    gettingCurr.then(onGot, onError);
    var gettingRates = browser.storage.local.get("rates");
    gettingRates.then(onGot, onError);
}

main();
setInterval(main, 1800000);