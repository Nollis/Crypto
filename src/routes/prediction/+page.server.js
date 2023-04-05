// Import TensorFlow.js
import * as tf from '@tensorflow/tfjs';
//import fetch from 'node-fetch';
import data from '$lib/data/nxttData_new.json';
import {
	calculateSMA,
	createBuySellLabels,
	movingAverage,
	macd,
	rsi,
	n_adx
} from '$lib/MLFunctions';

const shortTermPeriod = 5;
const longTermPeriod = 10;

const prices = data.map((point) => point.closingPrice);
const high = data.map((point) => point.high);
const low = data.map((point) => point.low);
const shortTermSMA = calculateSMA(prices, shortTermPeriod);
const longTermSMA = calculateSMA(prices, longTermPeriod);

const labels = createBuySellLabels(shortTermSMA, longTermSMA);
//console.log('labels', labels);

const maxVolume = Math.max(...data.map((row) => row.volume));
const windowSize = 14; // Adjust this value according to the data
const gamma = 0.1; // You can adjust this value

//const distancesMatrix = calculateDistances(data, gamma);

const sma = movingAverage(prices, windowSize);
const rsiValues = rsi(prices, windowSize);
const { macdLine, signalLine } = macd(prices, 12, 26, 9);

const timestamps = data.map((row) => row.timestamp);

const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);
const normalizedPrices = prices.map((x) => (x - minPrice) / (maxPrice - minPrice));

const features = data.map((row, index) => [
	row.timestamp,
	row.openingPrice,
	row.high,
	row.low,
	row.closingPrice,
	row.volume,
	sma[index], // Simple Moving Average
	rsiValues[index], // RSI
	macdLine[index], // MACD Line
	signalLine[index] // Signal Line
	//lorentzianData[index][2] // Lorentzian value
]);

const preprocessedData = features.map((row) => {
	const openingPrice = (row[1] - minPrice) / (maxPrice - minPrice);
	const high = (row[2] - minPrice) / (maxPrice - minPrice);
	const low = (row[3] - minPrice) / (maxPrice - minPrice);
	const closingPrice = (row[4] - minPrice) / (maxPrice - minPrice);
	const volume = row[5] / maxVolume;
	const smaNormalized = (row[6] - minPrice) / (maxPrice - minPrice);
	const rsiNormalized = row[7] / 100;
	const macdNormalized = (row[8] - minPrice) / (maxPrice - minPrice);
	const signalNormalized = (row[9] - minPrice) / (maxPrice - minPrice);
	//const lorentzianNormalized = row[10]; // Since Lorentzian values are already in the range [0, 1], no need to normalize
	return [
		openingPrice,
		high,
		low,
		closingPrice,
		volume,
		smaNormalized,
		rsiNormalized,
		macdNormalized,
		signalNormalized
		// lorentzianNormalized
	];
});

export async function load() {
	// Load the model
	async function loadModel() {
		console.log('loading model');
		//tf.util.setFetch(fetch);
		//const res = await tf.util.fetch('$lib/data/testModel/nxttData.json');
		const model = await tf.loadLayersModel('http://localhost:5173/model.json');
		console.log('model received');
		return model;
	}

	// Function to run the process
	async function getPrediction() {
		let resultReformat = [];
		const model = await loadModel();
		const prediction = await makePrediction(model);
		//console.log('Predicted price:', prediction);
		resultReformat = data.map((result, index) => {
			return {
				time: new Date(result.timestamp).toISOString().slice(0, 10),
				value: prediction[index]
			};
		});
		return resultReformat;
	}

	const getMarkers = async () => {
		let markerFormat = [];

		markerFormat = data.map((result, index) => {
			let position, color, shape, text;

			if (labels[index] === 'sell') {
				position = 'aboveBar';
				color = '#e91e63';
				shape = 'arrowDown';
				text = 'Sell';
			} else if (labels[index] === 'buy') {
				position = 'belowBar';
				color = '#2196F3';
				shape = 'arrowUp';
				text = 'Buy';
			} else {
				return null;
			}

			return {
				time: new Date(result.timestamp).toISOString().slice(0, 10),
				position,
				color,
				shape,
				text
			};
		});

		// Filter out null values
		return markerFormat.filter((marker) => marker !== null);
	};

	const getNEValue = async () => {
		let resultReformat = [];

		resultReformat = data.map((result) => {
			return {
				time: new Date(result.timestamp).toISOString().slice(0, 10),
				open: result.openingPrice,
				high: result.high,
				low: result.low,
				close: result.closingPrice
			};
		});
		//console.log(resultReformat);
		return resultReformat;
	};

	const getADX = async () => {
		let adxReformat = [];
		const adx = n_adx(high, low, prices, 14);

		adxReformat = data.map((result, index) => {
			return {
				time: new Date(result.timestamp).toISOString().slice(0, 10),
				value: adx[index]
			};
		});
		//console.log(resultReformat);
		return adxReformat;
	};

	// Make a prediction on the example time series
	async function makePrediction(model) {
		const reshapedPreprocessedData = preprocessedData.map((row) => [row]); // Enclose each row within an array to create the time steps dimension
		const prediction = model.predict(tf.tensor3d(reshapedPreprocessedData)).dataSync();
		const unnormalizedPrediction = prediction.map((x) => x * (maxPrice - minPrice) + minPrice);
		return Array.from(unnormalizedPrediction); // Convert TypedArray to a regular array
	}

	//const prediction = await getPrediction();

	return {
		prediction: getPrediction(),
		ohlc: getNEValue(),
		adx: getADX(),
		markers: getMarkers()
	};
}
