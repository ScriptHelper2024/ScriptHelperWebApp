const USDollar = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
})

function formatCurrency(number) {
	if (isNaN(number)) {
		return ''
	}
	const formatted = USDollar.format(number)

	return formatted
}

export default formatCurrency
