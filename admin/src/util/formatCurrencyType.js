export const currencyTypeOptions = {
	usd: 'USD',
	cad: 'CAD',
}

const formatCurrencyType = (value) => {
	return currencyTypeOptions[value] ?? value
}

export default formatCurrencyType
