// Import TensorFlow.js
import * as tf from '@tensorflow/tfjs';
import data from '$lib/data/nxttData.json';
import { writeFileSync } from 'fs';

//const prices = data.map((row) => row[1]);
const prices = data.map((row) => row.openingPrice);
const windowSize = 14; // Adjust this value according to the data
const sma = Array(prices.length).fill(0);
const rsiValues = Array(prices.length).fill(0);
const macdLine = Array(prices.length).fill(0);
const signalLine = Array(prices.length).fill(0);
//const sma = movingAverage(prices, windowSize);
//const rsiValues = rsi(prices, windowSize);
//const { macdLine, signalLine } = macd(prices, 12, 26, 9);
movingAverage(prices, windowSize, sma);
rsi(prices, windowSize, rsiValues);
macd(prices, 12, 26, 9, macdLine, signalLine);

//const timestamps = data.map((row) => row[0]);
const timestamps = data.map((row) => row.timestamp);

const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);

const normalizedPrices = prices.map((x) => (x - minPrice) / (maxPrice - minPrice));

//console.log(normalizedPrices);

// Functions for technical indicators
function movingAverage(data, windowSize, result) {
	if (windowSize > data.length) {
		throw new Error('Window size is greater than data length');
	}

	for (let i = 0; i < data.length - windowSize + 1; i++) {
		const windowData = data.slice(i, i + windowSize);
		const average = windowData.reduce((sum, value) => sum + value, 0) / windowSize;
		result[i + windowSize - 1] = average;
	}
}

function macd(data, shortPeriod, longPeriod, signalPeriod, macdLine, signalLine) {
	if (
		shortPeriod <= 0 ||
		longPeriod <= 0 ||
		shortPeriod >= longPeriod ||
		data.length <= longPeriod
	) {
		throw new Error('Invalid period(s)');
	}

	const shortEMA = Array(data.length).fill(0);
	const longEMA = Array(data.length).fill(0);
	movingAverage(data, shortPeriod, shortEMA);
	movingAverage(data, longPeriod, longEMA);

	for (let i = 0; i < data.length; i++) {
		macdLine[i] = shortEMA[i] - longEMA[i];
	}

	movingAverage(macdLine, signalPeriod, signalLine);
}

function rsi(data, windowSize, result) {
	if (data.length < 2) {
		throw new Error('data array must have at least 2 elements');
	}
	if (windowSize <= 0 || !Number.isInteger(windowSize)) {
		throw new Error('windowSize must be a positive integer');
	}
	if (windowSize > data.length) {
		throw new Error('windowSize cannot be greater than data length');
	}

	const gains = Array(data.length - 1).fill(0);
	const losses = Array(data.length - 1).fill(0);

	for (let i = 1; i < data.length; i++) {
		const change = data[i] - data[i - 1];
		gains[i - 1] = Math.max(change, 0);
		losses[i - 1] = Math.max(-change, 0);
	}

	const avgGain = Array(data.length).fill(0);
	const avgLoss = Array(data.length).fill(0);
	movingAverage(gains, windowSize, avgGain);
	movingAverage(losses, windowSize, avgLoss);

	for (let i = 0; i < data.length; i++) {
		if (avgLoss[i] === 0) {
			result[i] = 50; // If avgLoss[i] is zero, use a default value of 50 for RSI
		} else {
			const rs = avgGain[i] / avgLoss[i];
			result[i] = 100 - 100 / (1 + rs);
		}
	}
}

// Define the Lorentzian function
function lorentzian(x, x0, gamma) {
	const denominator = (x - x0) ** 2 + gamma ** 2;
	return denominator > 0 ? gamma / Math.PI / denominator : 0;
}

// Transform the input data using the Lorentzian function
const gamma = 0.1; // You can adjust this value

// Find the maximum Lorentzian value over the range of x values
const maxLorentzian = Math.max(
	...data.map((row) => lorentzian(row.timestamp, row.openingPrice, gamma))
);

// Transform the input data using the Lorentzian function and normalize the Lorentzian values
const lorentzianData = data.map(({ timestamp, openingPrice }) => {
	const lorentzianValue = lorentzian(timestamp, openingPrice, gamma) / maxLorentzian;
	return [timestamp, openingPrice, isNaN(lorentzianValue) ? 0 : lorentzianValue];
});

//const timestamps = data.map((row) => row[0]);
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
	signalLine[index], // Signal Line
	lorentzianData[index][2] // Lorentzian value
]);

// Normalize the data
const minTimestamp = Math.min(...timestamps);
const maxTimestamp = Math.max(...timestamps);
const maxVolume = Math.max(...data.map((row) => row.volume));
const normalizedTimestamps = timestamps.map(
	(x) => (x - minTimestamp) / (maxTimestamp - minTimestamp)
);

const normalizedFeatures = features.map((row) => {
	const openingPrice = (row[1] - minPrice) / (maxPrice - minPrice);
	const high = (row[2] - minPrice) / (maxPrice - minPrice);
	const low = (row[3] - minPrice) / (maxPrice - minPrice);
	const volume = row[5] / maxVolume;
	const smaNormalized = (row[6] - minPrice) / (maxPrice - minPrice);
	const rsiNormalized = row[7] / 100;
	const macdNormalized = (row[8] - minPrice) / (maxPrice - minPrice);
	const signalNormalized = (row[9] - minPrice) / (maxPrice - minPrice);
	const lorentzianNormalized = row[10]; // Since Lorentzian values are already in the range [0, 1], no need to normalize
	return [
		openingPrice,
		high,
		low,
		volume,
		smaNormalized,
		rsiNormalized,
		macdNormalized,
		signalNormalized,
		lorentzianNormalized
	];
});

//const predictionInput = normalizedTimestamps.map((value) => [[value, 0, 0, 0, 0, 0, 0, 0, 0]]);
//const predictionInput = normalizedFeatures.slice(-100);
const predictionInput = normalizedFeatures.slice(-100).map((row) => [row]);

//console.log('pInput', predictionInput);

// Define the LSTM model
const model = tf.sequential();
model.add(tf.layers.lstm({ units: 10, inputShape: [1, 9], returnSequences: false }));
model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

// Compile the model
model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

console.log('normal_length:', normalizedFeatures.length);
// Train the model
const xs = tf.tensor3d(normalizedFeatures.map((row) => [row]));
console.log('xs_shape:', xs.shape);
//const xs = tf.tensor3d(normalizedFeatures.map((row) => row.map((value) => [value])));
const ys = tf.tensor(normalizedPrices);
model.fit(xs, ys, { epochs: 200 }).then(() => {
	// Make predictions
	//const prediction = model.predict(tf.tensor(normalizedTimestamps)).dataSync();
	const prediction = model.predict(tf.tensor3d(predictionInput)).dataSync();
	// const prediction = model
	// 	.predict(tf.tensor3d(normalizedTimestamps.map((value) => [[value]])))
	// 	.dataSync();
	const unnormalizedPrediction = prediction.map((x) => x * (maxPrice - minPrice) + minPrice);

	// Plot the chart
	const chartData = [];
	for (let i = 0; i < timestamps.length; i++) {
		chartData.push({ timestamp: timestamps[i], predictedPrice: unnormalizedPrediction[i] });
	}

	//console.log(prediction);

	// Determine buying and selling points
	const buyingPoints = [];
	const sellingPoints = [];

	for (let i = 1; i < unnormalizedPrediction.length - 1; i++) {
		if (
			unnormalizedPrediction[i] > unnormalizedPrediction[i - 1] &&
			unnormalizedPrediction[i] > unnormalizedPrediction[i + 1]
		) {
			sellingPoints.push({ timestamp: timestamps[i], price: unnormalizedPrediction[i] });
		} else if (
			unnormalizedPrediction[i] < unnormalizedPrediction[i - 1] &&
			unnormalizedPrediction[i] < unnormalizedPrediction[i + 1]
		) {
			buyingPoints.push({ timestamp: timestamps[i], price: unnormalizedPrediction[i] });
		}
	}

	console.log('Buying Points:', buyingPoints);
	console.log('Selling Points:', sellingPoints);
	// Save the model
});

await model.save('file:///model.json');
