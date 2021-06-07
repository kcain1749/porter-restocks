const Promise = require('bluebird');
const _ = require('lodash');
const request = Promise.promisify(require("request"));
Promise.promisifyAll(request);

const apiUrl = 'https://www.mrporter.com/api/inseason/search/resources/store/mrp_us/productview/byCategory?attrs=true&category=%2Fsale&locale=en_GB&pageSize=256&pageNumber=';

let saleItems = [],
    latestRestocks = [],
    latestRefresh = 0,
    latestPush = 0,
    maxPercent = 0;

const timeoutInterval = 10000;

function addRestock (item) {

    latestRestocks.unshift(item);
    latestRestocks = _.uniqBy(latestRestocks, 'partNumber');
    if (latestRestocks.length > 500) {
        latestRestocks.pop();
    }

}

function getAllItems() {
    let allProducts = [];


    function getAllChunks(url, offset) {

        return request.getAsync({
            url: (url + offset),
            pool: {maxSockets: 100},
            timeout: 10000,
            headers : {
                'authority': 'www.mrporter.com',
                'accept': '*/*',
                'x-ibm-client-id': '16c6e258-e6f8-4015-8c52-697f6e65ad67',
                'application-version': '3.709.0',
                'accept-language': 'en-US,en;q=0.9,he;q=0.8',
                'label': 'getCategoryBySeoPath',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
                'application-name': 'blue lobster',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://www.mrporter.com/en-us/mens/sale',
                'cookie': 'LPVID=RiNTg1MDg4NGE0OGNhMTcx; Y-City=US-IL-CHICAGO; akacd_RWASP-default-phased-release=3767534543~rv=35~id=95604fb882ff457e59d84f41f08501c2; geoIP=US; ak_bmsc=732FB3FDB4CD9CC8881D2AE1C3BC8950684678A75A5400006D730C5FBAD7EB19~plxJq3W8hAyv5p3BzEue5T6ZdA6FW8o8yTG+gyCchKt07HOj+F1Eypxws4UpdMydUsz6dCzsN8iPGGpvYy/cHqLhmqlk/2coqF4oxgWoHlk99JZEDHVPS0EmERQz4ANpJXPv8VMlOhQCl+he9h7br+s//US9enR95XqY41RLqwFmTuQLPr7ld3N8QbTl7gdnCu/TCnB+hKPsvIjukMnfY3/g5714swjWX0dtUdxFI4HPI=; bm_sz=E5FC85333C953B548DFCCF280C896ACC~YAAQp3hGaGfOyQ9zAQAAdOSiSAi3TAA6z5T9sa+KnD1qMY+xyoOLZf00+VoNdKd0CuS+oM3f5YGGLhMx0K63sSysL5nom4XFPXJF9ZofrbD7FquI2D+hqnoxZZQFiHQ8k22sIlRVds5kULC3X/6xH7OfmPtVHog0PcfmzER0/0ozmhz/Ah4aeq3v3BbUwGhqWrU=; _abck=55E05F1F95DA64E4B766201E57F05D06~0~YAAQp3hGaGrOyQ9zAQAA5OmiSAQOZPkrnDkOHuC09Vtd9XQa0IkQVJA0NNn+g3HV8A9o2zjOpt6KqRdVGsLMuYHIRrsc5dmtbdTnh9s/DxYuYe4qYIkkeZbIIopUi8RXOIGIL2zR22xMEckGH6qg8ZN9V4L38DTrB7fAJKQbmsNl2aY2ZQqRrkS8q+iw9o5I6GASqVjdy0Y4fQAQx3w5ldMIEHTbj726hqeNu+ZNwyGzIEZTj5Pmh+/1KlXOtDctcrO7gEOOJmW7VQTbBIpgOarNnxQDnk+Yb5OE6oJZkmPvQ0MRFZiusY3ExAqLDUnOlxXmLDkT9uyP~-1~-1~-1; LPSID-73583570=OBm412-ZTzmqkoZzBkAPxQ; TS01351945=0122c051bc054339f344465815be10c2287917c8c3bc4efd563ecf91d3755df408f9203ff4ce64ce60d1dd0847aef3b1dad43ec632; TS016d9db0=01231dfb7f5791937c1aed01534173e41f991793d43abba31330b983889dcded70efec82d006e275855ead4e6034803b73a73b4b3d3abe387435d8039a6bc6cba0309a2761; bm_sv=198B85103D9DCC4652B056C5F18D68E6~SSw3B/i3N+RY7B/aHw6Ea8o2HKdVKowOKFimyOx+7A5UehPFEqrGJPbpVhQyZK7XZr/XgsxnYi5Ic7uXsJBLsYcaxvMAVk3iYx1n/JIdGV4z70Q9ptHOPb+LCUByeNzpGBu5bmJSt5JObqrLfuU5Ee5AzlqEzThIPMNCeCX0Iaw='
            }
        }).then(function (response) {
            var body = JSON.parse(response[0].body);


            var products = body.products
                allProducts = _.union(allProducts, products);
                return body.recordSetCount;

        }).then(function (response) {
            if (response < 256) {
                return _.uniq(_.filter(allProducts, function(item) {
                    return (!_.has(item, 'badges') || _.indexOf(item.badges, _.find(item.badges, {label: "SOLD OUT"})) === -1)})
                , false, 'partNumber');
            } else {
                return getAllChunks(url, (offset + 1));
            }
        }).catch(function (error) {
            console.log('Error: ' + error);
            allProducts = [];
            return getAllChunks(apiUrl, 1);
        });
    }

    return getAllChunks(apiUrl, 1);
}


function getAllSaleItems(req, res) {
    return {
        latestPush: latestPush,
        latestRefresh: latestRefresh,
        latestRestocks: saleItems,
        itemCount: saleItems.length,
        maxPercent: maxPercent
    }}

function getAllPorterItems(req, res) {
    getAllItems().then(function (response) {
        res.send(response);
    });
}


function getAllSaleItemsAsync() {
    return getAllItems(function(item) { return _.has(item, 'price.discountPercent') });
}

function startLoadingItems() {
    console.log('starting mr porter polling');
    getAllSaleItemsAsync().then(function (response) {
        if (response.length) {
            saleItems = response;
        }
        maxPercent = _.max(_.map(_.map(response, 'price'), 'discount.amount')) / 100 || 0;
        console.log('current max ' + maxPercent);
        console.log('current count ' + saleItems.length);
        setTimeout(loadItemsAndCompare, timeoutInterval);
    });
}

function loadItemsAndCompare() {
    getAllSaleItemsAsync().then(function (response) {
        var newMaxPercent = _.max(_.map(_.map(response, 'price'), 'discount.amount')) / 100 || 0;
        if (newMaxPercent > maxPercent) {
            latestPush = new Date();
            maxPercent = newMaxPercent;
        }
        _.each(response, function(item) {
           if (_.findIndex(saleItems, {partNumber: item.partNumber}) === -1 && _.has(item, 'price.discount.amount') && _.has(item, 'price.sellingPrice.amount'))  {
               addRestock(item);
           }
        });
        if (response.length) {
            saleItems = response;
        }
        latestRefresh = new Date();
        setTimeout(loadItemsAndCompare, timeoutInterval);
    });
}

function getRestockData() {
    return {
        latestPush: latestPush,
        latestRefresh: latestRefresh,
        latestRestocks: latestRestocks,
        itemCount: saleItems.length,
        maxPercent: maxPercent
    }
}

module.exports = {
    getAllSaleItems: getAllSaleItems,
    startLoadingItems: startLoadingItems,
    getRestockData: getRestockData,
    getAllItems: getAllPorterItems
};


