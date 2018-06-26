function getTextNodes(element) {
  var node,
    arr = [],
    walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
  while ((node = walker.nextNode())) arr.push(node);
  return arr;
}

function getPrice(nodeVal) {
  let price;
  let sep = /((\.|,)([\d\-]{1,2}))?$/.exec(nodeVal)[2];
  if (sep === ".") {
    price = parseFloat(nodeVal.replace(",", "").replace("-", "0"));
  } else if (sep === ",") {
    price = parseFloat(
      nodeVal
        .replace(".", "")
        .replace(",", ".")
        .replace("-", "0")
    );
  } else if (!sep) {
    price = parseFloat(nodeVal);
  }
  return {
    price: price,
    sep: sep
  };
}

function convertRates(rates) {
  let getText = getTextNodes(document.body);
  for (let i = 0; i < getText.length; i++) {
    for (let j = 0; j < currencies.length; j++) {
      let match;
      let result;
      // e.g. EUR 19,99, USD 14.99
      if (
        (match = new RegExp(
          "(?=.*\\d)^" +
            currencies[j][0] +
            "(\\s)?(\\d{0,3}((\\.|,)\\d{3})*)?((\\.|,)(\\d{1,2}|\\-{2}))?$"
        ).exec(getText[i].nodeValue))
      ) {
        result = getPrice(
          match[0].replace(new RegExp(currencies[j][0]), "").replace(" ", "")
        );
        // e.g. € 19,99, $14.99
      } else if (
        (match = new RegExp(
          "(?=.*\\d)^" +
            currencies[j][1] +
            "(\\s)?(\\d{0,3}((\\.|,)\\d{3})*)?((\\.|,)(\\d{1,2}|\\-{2}))?$"
        ).exec(getText[i].nodeValue))
      ) {
        result = getPrice(
          match[0].replace(new RegExp(currencies[j][1]), "").replace(" ", "")
        );
        // e.g. 19,99€, 14.99 $
      } else if (
        (match = new RegExp(
          "(?=.*\\d)^(\\d{0,3}((\\.|,)\\d{3})*)?((\\.|,)(\\d{1,2}|\\-{2}))?(\\s)?" +
            currencies[j][1] +
            "$"
        ).exec(getText[i].nodeValue))
      ) {
        result = getPrice(
          match[0].replace(new RegExp(currencies[j][1]), "").replace(" ", "")
        );
      }

      if (result) {
        let conv = result.price * Number(rates[currencies[j][0]][localCurr][0]);
        let amount = localCurr + " " + conv.toFixed(2);
        let newValue = getText[i].nodeValue + " (" + amount + ")";
        if (result.sep === ",") {
          newValue.replace(".", ",");
        }
        getText[i].nodeValue = newValue;
        getText[i].parentElement.title = amount;
        continue;
      }
    }
  }
}

function onError(error) {
  window.alert(`Error: ${error}`);
}

function onGot(item) {
  if (item.localCurr) {
    localCurr = item.localCurr;
  }
  if (item.rates) {
    convertRates(item.rates);
  }
}

let localCurr = "EUR";
let currencies = [
  ["EUR", "€"], // Euro
  ["USD", "(US\\s)?\\$"], // US Dollar
  ["CAD", "C(\\s)?\\$"], // Canadian Dollar
  ["GBP", "£"], // British Pound Sterling
  ["INR", "₹"], // Indian Rupee
  ["JPY", "¥"], // Japanese Yen
  ["CNY", "¥"] // Chinese Yuan (RMB)
];
let elements = document.getElementsByTagName("*");
let gettingCurr = browser.storage.local.get("localCurr");
gettingCurr.then(onGot, onError);
let gettingRates = browser.storage.local.get("rates");
gettingRates.then(onGot, onError);
