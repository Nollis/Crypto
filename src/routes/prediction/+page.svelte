<script>
	import {
		Chart,
		LineSeries,
		BarSeries,
		PriceScale,
		TimeScale,
		CandlestickSeries
	} from 'svelte-lightweight-charts';
	import { CrosshairMode } from 'lightweight-charts';

	export let data;
	//console.log(data);

	let w;
	let h;
	//apiData.set(data);

	const options = {
		width: 640,
		height: 400,
		layout: {
			background: {
				color: '#242c46'
			},
			textColor: '#ffffff'
		},
		grid: {
			vertLines: {
				color: '#334158'
			},
			horzLines: {
				color: '#334158'
			}
		},
		crosshair: {
			mode: CrosshairMode.Normal
		},
		rightPriceScale: {
			borderColor: '#485c7b'
		},
		timeScale: {
			borderColor: '#485158',
			timeVisible: true,
			secondsVisible: false
		}
	};

	let chart;
	let axis;
	const handleChartLogicalRangeChange = (e) => {
		const range = e.detail;
		axis.timeScale().setVisibleLogicalRange(range);
	};
	const handleAxisLogicalRangeChange = (e) => {
		const range = e.detail;
		chart.timeScale().setVisibleLogicalRange(range);
	};

	// Add your data and kernel functions here
</script>

<div class=" col-span-1 md:col-span-8 row-span-2" bind:clientWidth={w} bind:clientHeight={h}>
	<Chart {...options} width={w} ref={(ref) => (chart = ref)}>
		<PriceScale id="right" width={60} />
		<TimeScale on:visibleLogicalRangeChange={handleChartLogicalRangeChange} />
		<CandlestickSeries
			priceFormat={{ type: 'price', precision: 4, minMove: 0.0001 }}
			downColor="#ff4976"
			upColor="#4bffb5"
			borderDownColor="#ff4976"
			borderUpColor="#4bffb5"
			wickDownColor="#838ca1"
			wickUpColor="#838ca1"
			data={data.ohlc}
			markers={data.markers}
		/>
		<LineSeries
			priceFormat={{ type: 'price', precision: 5, minMove: 0.00001 }}
			color="#fcf803"
			lineWidth={2}
			data={data.prediction}
		/>
	</Chart>
</div>
<div class=" col-span-1 md:col-span-8 row-span-2" bind:clientWidth={w} bind:clientHeight={h}>
	<Chart {...options} width={w} ref={(ref) => (axis = ref)}>
		<PriceScale id="right" width={60} />
		<TimeScale on:visibleLogicalRangeChange={handleAxisLogicalRangeChange} />
		<LineSeries
			priceFormat={{ type: 'price', precision: 5, minMove: 0.00001 }}
			color="#0000ff"
			lineWidth={2}
			data={data.adx}
		/>
	</Chart>
</div>
<button on:click={() => axis.timeScale().fitContent()}>Fit Content</button>
