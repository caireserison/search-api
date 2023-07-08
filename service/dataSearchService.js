require('dotenv').config();var axios = require('axios');
const apiDomain = process.env.API_BING
const auth = process.env.AUTH_BING
const success = 200
const notFound = 404
const serverError = 500
const badGateway = 502

const getImages = createDataFetcher(
    'images',
    'Erro ao efetuar busca de imagens no Bing.',
    'Imagens não encontradas.',
    'Erro ao buscar imagens.'
);

const getNews = createDataFetcher(
    'news',
    'Erro ao efetuar busca de notícias no Bing.',
    'Notícias não encontradas.',
    'Erro ao buscar notícias.'
);

function createDataFetcher(endpoint, serviceErrorMessage, notFoundMessage, genericErrorMessage) {
    return async function(attraction) { 
        try {
            const responseBing = await getResponseService(attraction, endpoint, serviceErrorMessage)
            let response;
            if (endpoint == 'images') {
                response = imageResponse(responseBing)
            } else if (endpoint == 'news') {
                response = newsResponse(responseBing)
            }
    
            if (response == undefined || response.length == 0) {
                return { 'status': notFound, 'message': notFoundMessage }
            } else {
                return { 'status': success, 'images': response }
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

async function getResponseService(query, endpoint, messageError) {
    try {
        var service = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${apiDomain}/${endpoint}/search?mkt=pt-BR&q=${query}`,
            headers: { 
              'Ocp-Apim-Subscription-Key': auth
            }
        };
    
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

module.exports = { getImages, getNews }