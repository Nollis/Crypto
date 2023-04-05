export function calculateSMA(prices, period) {
	const sma = [];
	for (let i = 0; i < prices.length; i++) {
		if (i < period - 1) {
			sma.push(null);
		} else {
			const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
			sma.push(sum / period);
		}
	}
	return sma;
}

export function normalizeArray(srcArray, min, max) {
	let historicMin = 1e10;
	let historicMax = -1e10;

	for (const src of srcArray) {
		historicMin = Math.min(src || historicMin, historicMin);
		historicMax = Math.max(src || historicMax, historicMax);
	}

	return srcArray.map((src) => {
		return min + ((max - min) * (src - historicMin)) / Math.max(historicMax - historicMin, 1e-10);
	});
}

export function createBuySellLabels(shortTermSMA, longTermSMA) {
	const labels = [];
	for (let i = 1; i < shortTermSMA.length; i++) {
		if (shortTermSMA[i - 1] <= longTermSMA[i - 1] && shortTermSMA[i] > longTermSMA[i]) {
			labels.push('buy');
		} else if (shortTermSMA[i - 1] >= longTermSMA[i - 1] && shortTermSMA[i] < longTermSMA[i]) {
			labels.push('sell');
		} else {
			labels.push('hold');
		}
	}
	return labels;
}

export function HLC3(high, low, close) {
	let hcl3;
	hcl3 = (high + low + close) / 3;
	return hcl3;
}

export function movingAverage(data, windowSize) {
	if (windowSize > data.length) {
		throw new Error('Window size is greater than data length');
	}

	const result = Array(data.length).fill(0);

	for (let i = windowSize - 1; i < data.length; i++) {
		let sum = 0;
		for (let j = 0; j < windowSize; j++) {
			sum += data[i - j];
		}
		result[i] = sum / windowSize;
	}

	return result;
}

export function exponentialMovingAverage(data, period) {
	if (period > data.length) {
		throw new Error('Period is greater than data length');
	}

	const result = [];
	const k = 2 / (period + 1);
	result[0] = data[0];

	for (let i = 1; i < data.length; i++) {
		result[i] = (data[i] - result[i - 1]) * k + result[i - 1];
	}

	return result;
}

export function macd(data, shortPeriod, longPeriod, signalPeriod) {
	if (
		shortPeriod <= 0 ||
		longPeriod <= 0 ||
		shortPeriod >= longPeriod ||
		data.length <= longPeriod
	) {
		throw new Error('Invalid period(s)');
	}

	const shortEMA = exponentialMovingAverage(data, shortPeriod);
	const longEMA = exponentialMovingAverage(data, longPeriod);

	const macdLine = Array(data.length).fill(0);
	for (let i = 0; i < data.length; i++) {
		macdLine[i] = shortEMA[i] - longEMA[i];
	}

	const signalLine = exponentialMovingAverage(macdLine, signalPeriod);

	return { macdLine, signalLine };
}

export function rsi(data, windowSize) {
	if (data.length < 2) {
		throw new Error('data array must have at least 2 elements');
	}
	if (windowSize <= 0 || !Number.isInteger(windowSize)) {
		throw new Error('windowSize must be a positive integer');
	}
	if (windowSize > data.length) {
		throw new Error('windowSize cannot be greater than data length');
	}

	const result = Array(data.length).fill(0);

	const gains = Array(data.length - 1).fill(0);
	const losses = Array(data.length - 1).fill(0);

	for (let i = 1; i < data.length; i++) {
		const change = data[i] - data[i - 1];
		gains[i - 1] = Math.max(change, 0);
		losses[i - 1] = Math.max(-change, 0);
	}

	const avgGain = movingAverage(gains, windowSize);
	const avgLoss = movingAverage(losses, windowSize);

	for (let i = 0; i < data.length; i++) {
		if (avgLoss[i] === 0) {
			result[i] = 50; // If avgLoss[i] is zero, use a default value of 50 for RSI
		} else {
			const rs = avgGain[i] / avgLoss[i];
			result[i] = 100 - 100 / (1 + rs);
		}
	}

	return result;
}

export function n_rsi(data, windowSize) {
	if (data.length < 2) {
		throw new Error('data array must have at least 2 elements');
	}
	if (windowSize <= 0 || !Number.isInteger(windowSize)) {
		throw new Error('windowSize must be a positive integer');
	}
	if (windowSize > data.length) {
		throw new Error('windowSize cannot be greater than data length');
	}

	const result = Array(data.length).fill(0);

	const gains = Array(data.length - 1).fill(0);
	const losses = Array(data.length - 1).fill(0);

	for (let i = 1; i < data.length; i++) {
		const change = data[i] - data[i - 1];
		gains[i - 1] = Math.max(change, 0);
		losses[i - 1] = Math.max(-change, 0);
	}

	const avgGain = movingAverage(gains, windowSize);
	const avgLoss = movingAverage(losses, windowSize);

	for (let i = 0; i < windowSize - 1; i++) {
		result[i] = 50;
	}

	for (let i = windowSize - 1; i < data.length; i++) {
		if (avgLoss[i - windowSize + 1] === 0) {
			result[i] = 50; // If avgLoss[i] is zero, use a default value of 50 for RSI
		} else {
			const rs = avgGain[i - windowSize + 1] / avgLoss[i - windowSize + 1];
			result[i] = 100 - 100 / (1 + rs);
		}
	}

	// Normalize the RSI values between 0 and 1

	const minValue = Math.min(...result);
	const maxValue = Math.max(...result);

	const normalizedResult = result.map((value) => (value - minValue) / (maxValue - minValue));

	console.log('normalizedResult:', normalizedResult);
	return normalizedResult;
}

// normalized Average Directional Index (ADX)
// highSrc: An array of high prices.
// lowSrc: An array of low prices.
// closeSrc: An array of close prices.
// n1: The length of the ADX. This is the number of periods to be considered for the calculation.
export function n_adx(highSrc, lowSrc, closeSrc, n1) {
	const length = n1;
	let trSmooth = 0.0;
	let smoothDirectionalMovementPlus = 0.0;
	let smoothNegMovement = 0.0;

	const adx = [];

	for (let i = 0; i < highSrc.length; i++) {
		const tr = Math.max(
			Math.max(highSrc[i] - lowSrc[i], Math.abs(highSrc[i] - (closeSrc[i - 1] || 0))),
			Math.abs(lowSrc[i] - (closeSrc[i - 1] || 0))
		);

		const directionalMovementPlus =
			highSrc[i] - (highSrc[i - 1] || 0) > (lowSrc[i - 1] || 0) - lowSrc[i]
				? Math.max(highSrc[i] - (highSrc[i - 1] || 0), 0)
				: 0;
		const negMovement =
			(lowSrc[i - 1] || 0) - lowSrc[i] > highSrc[i] - (highSrc[i - 1] || 0)
				? Math.max((lowSrc[i - 1] || 0) - lowSrc[i], 0)
				: 0;

		trSmooth = trSmooth - trSmooth / length + tr;
		smoothDirectionalMovementPlus =
			smoothDirectionalMovementPlus -
			smoothDirectionalMovementPlus / length +
			directionalMovementPlus;
		smoothNegMovement = smoothNegMovement - smoothNegMovement / length + negMovement;

		const diPositive = (smoothDirectionalMovementPlus / trSmooth) * 100;
		const diNegative = (smoothNegMovement / trSmooth) * 100;
		const dx = (Math.abs(diPositive - diNegative) / (diPositive + diNegative)) * 100;

		adx.push(dx);
	}

	// Calculate the RMA (Running Moving Average) of the ADX array
	const adxRma = adx.reduce((accumulator, currentValue, currentIndex, array) => {
		const prevValue = accumulator[currentIndex - 1] || 0;
		const rma = (prevValue * (length - 1) + currentValue) / length;
		accumulator.push(rma);
		return accumulator;
	}, []);

	const normalizedAdx = adxRma.map((value) => rescale(value, 0, 100, 0, 1));

	return normalizedAdx;
}

export function rescale(src, oldMin, oldMax, newMin, newMax) {
	return newMin + ((newMax - newMin) * (src - oldMin)) / Math.max(oldMax - oldMin, 1e-10);
}

// Commodity Channel Index (CCI) indicator.
function cci(src, length) {
	const smaSrc = sma(src, length);
	const meanDeviation = src.map((_, i, arr) =>
		i < length - 1
			? 0
			: arr.slice(i - length + 1, i + 1).reduce((sum, val) => sum + Math.abs(val - smaSrc[i])) /
			  length
	);
	return src.map((val, i) => (val - smaSrc[i]) / (0.015 * meanDeviation[i]));
}

export function n_cci(src, n1, n2) {
	const cciResult = cci(src, n1);
	const emaResult = ema(cciResult, n2);
	return normalize(emaResult, 0, 1);
}

//Williams %R oscillator
export function william(high, low, close, period) {
	const highestHigh = [];
	const lowestLow = [];
	const williamsR = [];

	for (let i = 0; i < close.length; i++) {
		if (i >= period - 1) {
			const hh = Math.max(...high.slice(i - period + 1, i + 1));
			const ll = Math.min(...low.slice(i - period + 1, i + 1));
			highestHigh.push(hh);
			lowestLow.push(ll);
			williamsR.push(((hh - close[i]) / (hh - ll)) * -100);
		} else {
			highestHigh.push(null);
			lowestLow.push(null);
			williamsR.push(null);
		}
	}

	return williamsR;
}

function ema(src, length) {
	return src.reduce((acc, val, i) => {
		const prev = acc[i - 1] || val;
		const current = (val - prev) * (2 / (length + 1)) + prev;
		acc.push(current);
		return acc;
	}, []);
}

function sma(src, length) {
	return src.map((_, i, arr) =>
		i < length - 1 ? 0 : arr.slice(i - length + 1, i + 1).reduce((sum, val) => sum + val) / length
	);
}

function normalize(src, min, max) {
	return src.map((val) => (val - min) / (max - min));
}

export function n_wt(src, n1 = 10, n2 = 11) {
	const ema1 = ema(src, n1);
	const ema2 = ema(
		src.map((val, i) => Math.abs(val - ema1[i])),
		n1
	);
	const ci = src.map((val, i) => (val - ema1[i]) / (0.015 * ema2[i]));
	const wt1 = ema(ci, n2);
	const wt2 = sma(wt1, 4);
	const result = wt1.map((val, i) => val - wt2[i]);
	return normalize(result, 0, 1);
}
