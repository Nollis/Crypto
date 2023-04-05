import data from '$lib/data/nxttData_new.json';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	let features = [];
	const getOHLC = async () => {
		features = data.map((row) => {
			return {
				time: row.timestamp,
				open: row.openingPrice,
				high: row.high,
				low: row.low,
				close: row.closingPrice
			};
		});
		return features;
	};

	return {
		ohlc: getOHLC()
	};
}
