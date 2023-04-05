export function weightedRationalQuadratic(timeSeries, lookback, relativeWeight, startAtBar) {
	const yhat = timeSeries.map((_, index) => {
		if (index < startAtBar) {
			return timeSeries[index];
		}

		let currentWeight = 0.0;
		let cumulativeWeight = 0.0;

		for (let i = 0; i < lookback; i++) {
			let dataIndex = index - i;
			if (dataIndex < 0) {
				continue;
			}

			let y = timeSeries[dataIndex];
			let w = Math.pow(
				1 + Math.pow(i, 2) / (Math.pow(lookback, 2) * 2 * relativeWeight),
				-relativeWeight
			);

			currentWeight += y * w;
			cumulativeWeight += w;
		}

		return currentWeight / cumulativeWeight;
	});

	return yhat;
}

export function gaussian(timeSeries, lookback, startAtBar) {
	const yhat = timeSeries.map((_, index) => {
		if (index < startAtBar) {
			return timeSeries[index];
		}

		let currentWeight = 0.0;
		let cumulativeWeight = 0.0;

		for (let i = 0; i < lookback; i++) {
			let dataIndex = index - i;
			if (dataIndex < 0) {
				continue;
			}

			let y = timeSeries[dataIndex];
			let w = Math.exp(-Math.pow(i, 2) / (2 * Math.pow(lookback, 2)));
			currentWeight += y * w;
			cumulativeWeight += w;
		}

		return currentWeight / cumulativeWeight;
	});

	return yhat;
}

export function periodic(timeSeries, lookback, period, startAtBar) {
	const yhat = timeSeries.map((_, index) => {
		if (index < startAtBar) {
			return timeSeries[index];
		}

		let currentWeight = 0.0;
		let cumulativeWeight = 0.0;

		for (let i = 0; i < lookback; i++) {
			let dataIndex = index - i;
			if (dataIndex < 0) {
				continue;
			}

			let y = timeSeries[dataIndex];
			let w = Math.exp(
				(-2 * Math.pow(Math.sin((Math.PI * i) / period), 2)) / Math.pow(lookback, 2)
			);
			currentWeight += y * w;
			cumulativeWeight += w;
		}

		return currentWeight / cumulativeWeight;
	});

	return yhat;
}

export function locallyPeriodic(timeSeries, lookback, period, startAtBar) {
	const yhat = timeSeries.map((_, index) => {
		if (index < startAtBar) {
			return timeSeries[index];
		}

		let currentWeight = 0.0;
		let cumulativeWeight = 0.0;

		for (let i = 0; i < lookback; i++) {
			let dataIndex = index - i;
			if (dataIndex < 0) {
				continue;
			}

			let y = timeSeries[dataIndex];
			let w =
				Math.exp((-2 * Math.pow(Math.sin((Math.PI * i) / period), 2)) / Math.pow(lookback, 2)) *
				Math.exp(-Math.pow(i, 2) / (2 * Math.pow(lookback, 2)));
			currentWeight += y * w;
			cumulativeWeight += w;
		}

		return currentWeight / cumulativeWeight;
	});

	return yhat;
}
