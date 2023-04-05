export function colorGreen(prediction) {
	if (prediction >= 9) {
		return '#15FE00';
	} else if (prediction >= 8) {
		return '#2CFE1A';
	} else if (prediction >= 7) {
		return '#3BFF32';
	} else if (prediction >= 6) {
		return '#52FF4C';
	} else if (prediction >= 5) {
		return '#6BFF66';
	} else if (prediction >= 4) {
		return '#8BFF81';
	} else if (prediction >= 3) {
		return '#99FF99';
	} else if (prediction >= 2) {
		return '#B6FFB3';
	} else if (prediction >= 1) {
		return '#CEFECD';
	} else {
		return '#E8FEE7';
	}
}

export function colorRed(prediction) {
	if (prediction >= 9) {
		return '#CC3311';
	} else if (prediction >= 8) {
		return '#D14928';
	} else if (prediction >= 7) {
		return '#C15B40';
	} else if (prediction >= 6) {
		return '#C96E58';
	} else if (prediction >= 5) {
		return '#D08270';
	} else if (prediction >= 4) {
		return '#E79888';
	} else if (prediction >= 3) {
		return '#EBADA0';
	} else if (prediction >= 2) {
		return '#F0C2B8';
	} else if (prediction >= 1) {
		return '#F5D6CF';
	} else {
		return '#FBEBE9';
	}
}
