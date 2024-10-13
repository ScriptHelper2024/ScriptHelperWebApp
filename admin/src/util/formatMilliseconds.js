// accepts a string parameter in milliseconds and outputs the value as seconds
const formatMilliseconds = (milliseconds) => {
	if (!milliseconds) {
		return ''
	} else {
		const number = parseInt(milliseconds) / 1000
		return Number(number.toFixed(2)) + 's'
	}
}

export default formatMilliseconds
