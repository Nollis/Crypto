<script>
	//export let data;
	//console.log(data);

	let f1_string = 'RSI';
	let f1_paramA = 14;
	let f1_paramB = 1;
	let hlc3 = 1;

	let source = 'close';
	let neighborsCount = 8;
	let maxBarsBack = 2000;
	let featureCount = 5;
	let colorCompression = 1;
	let showDefaultExits = false;
	let useDynamicExits = false;

	$: settings = {
		source,
		neighborsCount,
		maxBarsBack,
		featureCount,
		colorCompression,
		showDefaultExits,
		useDynamicExits
	};

	let lastDistance = -1.0;

	// Calculate y_train_series
	const y_train_series =
		source[4] < source[0] ? 'short' : source[4] > source[0] ? 'long' : 'neutral';

	// Variables used for ML Logic
	const y_train_array = [y_train_series];

	const size = Math.min(maxBarsBack - 1, y_train_array.length - 1);
	const sizeLoop = Math.min(maxBarsBack - 1, size);

	const distances = [];
	const predictions = [];

	function handleChange() {}

	// if (barIndex >= maxBarsBackIndex) {
	// 	for (let i = 0; i <= sizeLoop; i++) {
	// 		const d = get_lorentzian_distance(i, settings.featureCount, featureSeries, featureArrays);

	// 		if (d >= lastDistance && i % 4) {
	// 			lastDistance = d;
	// 			distances.push(d);
	// 			predictions.push(Math.round(y_train_array[i]));

	// 			if (predictions.length > settings.neighborsCount) {
	// 				lastDistance = distances[Math.round((settings.neighborsCount * 3) / 4)];
	// 				distances.shift();
	// 				predictions.shift();
	// 			}
	// 		}
	// 	}
	// 	const prediction = predictions.reduce((sum, current) => sum + current, 0);
	// }
</script>

<div class="space-y-4">
	<div class="flex flex-col space-y-2">
		<label class="font-semibold" for="source">Source:</label>
		<input id="source" type="text" bind:value={source} class="border border-gray-300 rounded p-2" />
	</div>
	<div class="flex flex-col space-y-2">
		<label class="font-semibold" for="neighborsCount">Neighbors Count:</label>
		<input
			id="neighborsCount"
			type="number"
			bind:value={neighborsCount}
			min="1"
			max="100"
			class="border border-gray-300 rounded p-2"
		/>
	</div>
	<div class="flex flex-col space-y-2">
		<label class="font-semibold" for="maxBarsBack">Max Bars Back:</label>
		<input
			id="maxBarsBack"
			type="number"
			bind:value={maxBarsBack}
			class="border border-gray-300 rounded p-2"
		/>
	</div>
	<div class="flex flex-col space-y-2">
		<label class="font-semibold" for="featureCount">Feature Count:</label>
		<input
			id="featureCount"
			type="number"
			bind:value={featureCount}
			min="2"
			max="5"
			class="border border-gray-300 rounded p-2"
		/>
	</div>
	<div class="flex flex-col space-y-2">
		<label class="font-semibold" for="colorCompression">Color Compression:</label>
		<input
			id="colorCompression"
			type="number"
			bind:value={colorCompression}
			min="1"
			max="10"
			class="border border-gray-300 rounded p-2"
		/>
	</div>
	<div class="flex items-center space-x-2">
		<input id="showDefaultExits" type="checkbox" bind:checked={showDefaultExits} />
		<label class="font-semibold" for="showDefaultExits">Show Default Exits</label>
	</div>
	<div class="flex items-center space-x-2">
		<input id="useDynamicExits" type="checkbox" bind:checked={useDynamicExits} />
		<label class="font-semibold" for="useDynamicExits">Use Dynamic Exits</label>
	</div>
</div>
<div class="flex flex-wrap space-y-4">
	<div class="flex flex-col space-y-2">
		<label class="font-semibold" for="feature1">Feature 1:</label>
		<select id="feature1" bind:value={f1_string} class="border border-gray-300 rounded p-2">
			<option value="RSI">RSI</option>
			<option value="WT">WT</option>
			<option value="CCI">CCI</option>
			<option value="ADX">ADX</option>
		</select>
	</div>
	<div class="flex flex-col space-y-2">
		<label class="font-semibold" for="parameterA">Parameter A:</label>
		<input
			id="parameterA"
			type="number"
			bind:value={f1_paramA}
			class="border border-gray-300 rounded p-2"
		/>
	</div>
</div>
