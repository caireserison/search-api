var express = require('express');
var router = express.Router();
const cors = require('cors');
const { getImages, getNews } = require('../service/dataSearchService')
const badRequest = 400
const serverError = 500

router.options('*', cors())

function createRouteHandler(getData) {
return async function(req, res) {
        if (req.params.query == undefined) {
            return res.status(badRequest).json({ 'message': 'Parâmetro vazio.' });
        }
        const query = req.params.query

        try {
            const response = await getData(query);
            
            res.status(response.status).json(response);
        } catch (error) {
            return res.status(serverError).json({ 'message': error.message });
        }
    };
}

router.get('/images/:query', cors(), createRouteHandler(getImages));

router.get('/news/:query', cors(), createRouteHandler(getNews));

module.exports = router;
