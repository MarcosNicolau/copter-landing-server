const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser({ extended: true }));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
    });
}

app.post('/get-chart-data', async (req, res) => {
    const { crypto, timestamp } = req.body;
    const endpoint = `https://api.nomics.com/v1/currencies/sparkline?key=${process.env.NOMICS_KEY}&ids=${crypto}&start=${timestamp}T00%3A00%3A00Z`;
    const data = await fetch(endpoint, {});
    const parsedData = await data.json();
    const timestamps = parsedData[0].timestamps.map((timestamp) =>
        new Date(timestamp).toDateString()
    );
    res.send({ prices: parsedData[0].prices, timestamps });
});

app.post('/get-price-data', async (req, res) => {
    const cryptoPair = req.body.cryptoPair;
    const endpoint = `https://exchange-data-service.cryptosrvc.com/v1/quotes?exchange=COPTER`;
    const response = await fetch(endpoint);
    const data = await response.json();
    const pair = data.find((crypto) => crypto.pair === cryptoPair);
    res.send(pair);
});

app.listen(PORT);
