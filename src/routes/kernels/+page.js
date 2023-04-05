import rawData from '$lib/data/nxttData.json';
import {
	weightedRationalQuadratic,
	gaussian,
	periodic,
	locallyPeriodic
} from '$lib/kernelFunctions';

export async function load() {
	const closingPrices = rawData.map((result) => result.closingPrice);

	const getRQ = async () => {
		let resultRQ = [];
		const lookback = 8;
		const relativeWeight = 1;
		const startAtBar = 25;

		const weightedAverages = weightedRationalQuadratic(
			closingPrices,
			lookback,
			relativeWeight,
			startAtBar
		);
		//console.log('WA', weightedAverages);

		resultRQ = rawData.map((result, index) => {
			return {
				time: new Date(result.timestamp).toISOString().slice(0, 10),
				value: weightedAverages[index]
				//value: rationalQuadratic(closingPrices.slice(0, index + 1), 6, 4, index)
			};
		});
		//console.log(resultReformat);
		return resultRQ;
	};

	const getGaussian = async () => {
		let resultGauss = [];
		const lookback = 16;
		const startAtBar = 25;

		const Gaussian = gaussian(closingPrices, lookback, startAtBar);
		console.log('GA', Gaussian);

		resultGauss = rawData.map((result, index) => {
			return {
				time: new Date(result.timestamp).toISOString().slice(0, 10),
				value: Gaussian[index]
				//value: rationalQuadratic(closingPrices.slice(0, index + 1), 6, 4, index)
			};
		});
		//console.log(resultReformat);
		return resultGauss;
	};

	const getPeriodic = async () => {
		let resultP = [];
		const lookback = 8;
		const period = 100;
		const startAtBar = 25;

		const Periodic = periodic(closingPrices, lookback, period, startAtBar);
		//console.log('GA', Periodic);

		resultP = rawData.map((result, index) => {
			return {
				time: new Date(result.timestamp).toISOString().slice(0, 10),
				value: Periodic[index]
				//value: rationalQuadratic(closingPrices.slice(0, index + 1), 6, 4, index)
			};
		});
		//console.log(resultReformat);
		return resultP;
	};

	const getlocalP = async () => {
		let resultLP = [];
		const lookback = 8;
		const period = 24;
		const startAtBar = 25;

		const localPeriodic = locallyPeriodic(closingPrices, lookback, period, startAtBar);
		//console.log('GA', Periodic);

		resultLP = rawData.map((result, index) => {
			return {
				time: new Date(result.timestamp).toISOString().slice(0, 10),
				value: localPeriodic[index]
				//value: rationalQuadratic(closingPrices.slice(0, index + 1), 6, 4, index)
			};
		});
		//console.log(resultReformat);
		return resultLP;
	};

	const getNEValue = async () => {
		let resultReformat = [];

		resultReformat = rawData.map((result) => {
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

	return {
		ohlc: getNEValue(),
		RQ: getRQ(),
		gaussian: getGaussian(),
		periodic: getPeriodic(),
		LP: getlocalP()
	};
}
