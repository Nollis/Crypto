import { n_cci, n_wt, n_adx, n_rsi } from '$lib/MLFunctions';

const gamma = 0.1;

const direction = {
	short: -1,
	long: 1,
	neutral: 0
};

export function generateYTrainSeries(priceData) {
	const y_train_array = [];

	for (let i = 0; i <= priceData.length - 5; i++) {
		const currentPrice = priceData[i];
		const priceFourBarsAhead = priceData[i + 4];

		let priceDirection;
		if (priceFourBarsAhead < currentPrice) {
			priceDirection = direction.short;
		} else if (priceFourBarsAhead > currentPrice) {
			priceDirection = direction.long;
		} else {
			priceDirection = direction.neutral;
		}

		y_train_array.push(priceDirection);
	}

	return y_train_array;
}

export function series_from(feature_string, _close, _high, _low, _hlc3, f_paramA, f_paramB) {
	switch (feature_string) {
		case 'RSI':
			return n_rsi(_close, f_paramA);
		case 'WT':
			return n_wt(_hlc3, f_paramA, f_paramB);
		case 'CCI':
			return n_cci(_close, f_paramA, f_paramB);
		case 'ADX':
			return n_adx(_high, _low, _close, f_paramA);
		default:
			throw new Error(`Unknown feature string: ${feature_string}`);
	}
}

//   get_lorentzian_distance(i, featureCount, featureSeries, featureArrays) {
//     let sum = 0;

//     for (let j = 1; j <= featureCount; j++) {
//       sum += Math.log(
//         1 + Math.abs(featureSeries[`f${j}`] - featureArrays[`f${j}Array`][i])
//       );
//     }

//     return sum;
//   }

export function get_lorentzian_distance(index, featureCount, featureSeries, featureArrays) {
	// Assuming gamma is defined
	const x = [];
	const y = [];

	for (let i = 1; i <= featureCount; i++) {
		x.push(featureSeries[`f${i}`]);
		y.push(featureArrays[`f${i}Array`][index]);
	}

	return lorentzianDistance(x, y);
}

// Define the Lorentzian function
export function lorentzianDistance(x, y) {
	let sum = 0;
	for (let i = 0; i < x.length; i++) {
		sum += Math.log(1 + Math.abs(x[i] - y[i]));
	}
	return sum;
}

export function calculateDistances(data, gamma) {
	const distances = [];
	for (let i = 0; i < data.length; i++) {
		const currentDistances = [];
		for (let j = 0; j < data.length; j++) {
			if (i === j) {
				currentDistances.push(0);
			} else {
				const xi = [data[i].closingPrice, data[i].rsiNormalized];
				const xj = [data[j].closingPrice, data[j].rsiNormalized];
				currentDistances.push(lorentzianDistance(xi, xj, gamma));
			}
		}
		distances.push(currentDistances);
	}
	return distances;
}
