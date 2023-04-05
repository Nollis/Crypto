<script>
	import { Chart, LineSeries, BarSeries, CandlestickSeries } from 'svelte-lightweight-charts';
	import { CrosshairMode } from 'lightweight-charts';

	export let data;
	console.log(data);

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

	// Add your data and kernel functions here
</script>

<div class=" col-span-1 md:col-span-8 row-span-2" bind:clientWidth={w} bind:clientHeight={h}>
	<Chart {...options} width={w}>
		<CandlestickSeries
			priceFormat={{ type: 'price', precision: 4, minMove: 0.0001 }}
			downColor="#ff4976"
			upColor="#4bffb5"
			borderDownColor="#ff4976"
			borderUpColor="#4bffb5"
			wickDownColor="#838ca1"
			wickUpColor="#838ca1"
			data={data.ohlc}
		/>
		<LineSeries
			priceFormat={{ type: 'price', precision: 5, minMove: 0.00001 }}
			color="#ff0d0d"
			lineWidth={1}
			data={data.RQ}
		/>
		<LineSeries
			priceFormat={{ type: 'price', precision: 5, minMove: 0.00001 }}
			color="#f7ff0d"
			lineWidth={1}
			data={data.gaussian}
		/>
		<LineSeries
			priceFormat={{ type: 'price', precision: 5, minMove: 0.00001 }}
			color="#19ff0d"
			lineWidth={1}
			data={data.periodic}
		/>
		<LineSeries
			priceFormat={{ type: 'price', precision: 5, minMove: 0.00001 }}
			color="#0daeff"
			lineWidth={1}
			data={data.LP}
		/>
	</Chart>
</div>
