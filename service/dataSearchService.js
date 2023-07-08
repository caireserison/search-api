require('dotenv').config();var axios = require('axios');
const bingDomain = process.env.API_BING
const authBing = process.env.AUTH_BING
const ocdDomain = process.env.API_OCD
const authOcd = process.env.AUTH_OCD
const success = 200
const notFound = 404
const serverError = 500
const badGateway = 502

const getImages = createDataFetcher(
    'bing',
    'images',
    'Erro ao efetuar busca de imagens no Bing.',
    'Imagens não encontradas.',
    'Erro ao buscar imagens.'
);

const getNews = createDataFetcher(
    'bing',
    'news',
    'Erro ao efetuar busca de notícias no Bing.',
    'Notícias não encontradas.',
    'Erro ao buscar notícias.'
);

const getMaps = createDataFetcher(
    'opencagedata',
    'maps',
    'Erro ao efetuar busca de mapas no Open Cage Data.',
    'Mapas não encontrados.',
    'Erro ao buscar mapas.'
);

function createDataFetcher(source, endpoint, serviceErrorMessage, notFoundMessage, genericErrorMessage) {
    return async function(attraction) { 
        try {
            const response = await getResponseService(source, attraction, endpoint, serviceErrorMessage)
            let responseData;
            if (endpoint == 'images') {
                responseData = imageResponse(response)
            } else if (endpoint == 'news') {
                responseData = newsResponse(response)
            } else if (endpoint == 'maps') {
                responseData = mapsResponse(response)
            }
    
            if (responseData == undefined || responseData.length == 0) {
                return { 'status': notFound, 'message': notFoundMessage }
            } else {
                return { 'status': success, 'images': responseData }
            }
        } catch (error) {
            return { 'status': serverError, 'message': genericErrorMessage }
        }
    }
}

function imageResponse(responseBing) {
    try {
        let listImages = []

        responseBing.value.forEach(element => {
            let image = null
            if (element.contentUrl != null) {
                image = element.contentUrl
            }

            listImages.push(image)
        })

        return listImages
    } catch (error) {
        console.log('Erro ao buscar imagens no Bing. Erro: ' + error.message)
        return []
    }
}

function newsResponse(responseBing) {
    try {
        let listNews = []

        responseBing.value.forEach(element => {
            let news = { name: element.name, description: element.description, url: element.url }
            listNews.push(news)
        })

        return listNews
    } catch (error) {
        console.log('Erro ao buscar notícias no Bing. Erro: ' + error.message)
        return []
    }
}

function mapsResponse(responseOcd) {
    try {
        let listMaps = []

        responseOcd.results.forEach(element => {
            let maps = { map: element.annotations.OSM.url, place: element.formatted }
            listMaps.push(maps)
        })

        return listMaps
    } catch (error) {
        console.log('Erro ao buscar mapas no Open Cage Data. Erro: ' + error.message)
        return []
    }
}

async function getResponseService(source, query, endpoint, messageError) {
    try {
        let service
        if (source == 'bing') {
            service = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${bingDomain}/${endpoint}/search?mkt=pt-BR&q=${query}`,
                headers: { 
                  'Ocp-Apim-Subscription-Key': authBing
                }
            };
        } else if (source == 'opencagedata') {
            service = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${ocdDomain}?language=pt-BR&pretty=1&q=${query}&key=${authOcd}`
            };
        }
        
        return requestApi(service);
    } catch (error) {
        console.log(`${messageError} Erro: ${error.message}`)
        throw new Error(`{"status": ${badGateway}, "message": ${messageError}}`)
    }
}

function requestApi(service) {
    return axios(service)
        .then(function (response) {
            return JSON.parse(JSON.stringify(response.data));
        })
        .catch(function (error) {
            if (error.response != null) {
                return error.response;
            } else {
                console.log(`Erro na requisição da API ${service.url}. Erro: ${error.message}`)
                throw new Error(`{"status": ${badGateway}, "message": "Erro na requisição de API"}`)
            }
        });
}

module.exports = { getImages, getNews, getMaps }