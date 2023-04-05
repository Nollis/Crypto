import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrapeData(url) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url);

	const data = await page.evaluate(() => {
		const tableRows = document.querySelectorAll('table > tbody > tr');
		console.log(tableRows);
		const scrapedData = [];

		tableRows.forEach((row) => {
			const rowData = [];
			const date = row.querySelector('td:first-child').innerText;
			rowData.push(new Date(date).getTime());

			const otherCells = row.querySelectorAll('td:not(:first-child)');
			otherCells.forEach((cell) => {
				rowData.push(parseFloat(cell.innerText.replace(/[\\$,]/g, '')));
			});

			scrapedData.push(rowData);
		});

		return scrapedData;
	});

	console.log(data);

	await browser.close();
	return data;
}

function saveDataAsCSV(data, filePath) {
	const header = 'Timestamp,Open,High,Low,Close,Volume,MarketCap\\n';
	const csvData = data.map((row) => row.join(',')).join('\\n');
	const fileContent = header + csvData;
	fs.writeFileSync(filePath, fileContent);
}

async function main() {
	const dataUrl = 'https://coinmarketcap.com/currencies/nextearth/historical-data/';
	const data = await scrapeData(dataUrl);
	console.log(data);

	// Save the scraped data as a CSV file
	const filePath = './historical_data.csv';
	saveDataAsCSV(data, filePath);
	console.log('Data saved as', filePath);

	// Preprocess and normalize the data
	// ... same as before ...

	// Define, compile, and train the model
	// ... same as before ...
}

main();
