import { n_cci, n_wt, n_adx, n_rsi } from '$lib/MLFunctions';
import { generateYTrainSeries, series_from, get_lorentzian_distance } from '$lib/lorentzian';
import data from '$lib/data/nxttData_new.json';

//export let data;

let f1_string = 'RSI';
let f1_paramA = 14;
let f1_paramB = 1;
let f2_string = 'WT';
let f2_paramA = 10;
let f2_paramB = 11;
let f3_string = 'CCI';
let f3_paramA = 20;
let f3_paramB = 1;
let f4_string = 'ADX';
let f4_paramA = 20;
let f4_paramB = 2;

const settings = {
	maxBarsBack: 400, // or any other value
	featureCount: 4, // or any other value
	neighborsCount: 8 // or any other value
};

let lastDistance = -1.0;

let distances = [];
let predictions = [];
let prediction;

const close = data.map((row) => row.closingPrice);
const high = data.map((row) => row.high);
const low = data.map((row) => row.low);
const hlc3 = data.map((row) => (row.high + row.low + row.closingPrice) / 3);

const lastBarIndex = close.length - 1;
const maxBarsBackIndex =
	lastBarIndex >= settings.maxBarsBack ? lastBarIndex - settings.maxBarsBack : 0;

let y_train_array = generateYTrainSeries(close);
let size = Math.min(settings.maxBarsBack - 1, y_train_array.length - 1);
let sizeLoop = Math.min(settings.maxBarsBack - 1, size);
//console.log('y_train', y_train_array);

const featureSeries = {
	f1: series_from(f1_string, close, high, low, hlc3, f1_paramA, f1_paramB),
	f2: series_from(f2_string, close, high, low, hlc3, f2_paramA, f2_paramB),
	f3: series_from(f3_string, close, high, low, hlc3, f3_paramA, f3_paramB),
	f4: series_from(f4_string, close, high, low, hlc3, f4_paramA, f4_paramB)
	// f5: series_from(f5_string, close, high, low, hlc3, f5_paramA, f5_paramB)
};

console.log('featureSeries.f1:', featureSeries.f1);
console.log('featureSeries.f2:', featureSeries.f2);
console.log('featureSeries.f3:', featureSeries.f3);
console.log('featureSeries.f4:', featureSeries.f4);

// Create featureArrays
const featureArrays = {
	f1Array: [...featureSeries.f1],
	f2Array: [...featureSeries.f2],
	f3Array: [...featureSeries.f3],
	f4Array: [...featureSeries.f4]
	// f5Array: [...featureSeries.f5]
};

const bar_index = close.length - 1;

//console.log(featureArrays);
if (bar_index >= maxBarsBackIndex) {
	for (let i = 0; i <= sizeLoop; i++) {
		let d = get_lorentzian_distance(i, settings.featureCount, featureSeries, featureArrays);
		console.log('d:', d, 'lastDistance:', lastDistance);
		if (d >= lastDistance && i % 4) {
			lastDistance = d;
			distances.push(d);
			predictions.push(Math.round(y_train_array[i]));
			if (predictions.length > settings.neighborsCount) {
				lastDistance = distances[Math.round((settings.neighborsCount * 3) / 4)];
				distances.shift();
				predictions.shift();
			}
		}
	}
	prediction = predictions.reduce((sum, pred) => sum + pred, 0);
	console.log(prediction);
}
