import getElementText from './getElementText'

function getRecordsTableRowByColumnValue(
	recordsTable,
	columnName,
	columnValue
) {
	const headerCells = [...recordsTable.querySelectorAll('thead th')]

	let columnIndex = null
	headerCells.every((cell, index) => {
		if (getElementText(cell) === columnName) {
			columnIndex = index
			return false
		}
		return true
	})

	const rows = [...recordsTable.querySelectorAll('tbody tr')]

	let recordRow = null
	;[...rows].every((row) => {
		const cell = row.children[columnIndex]
		if (getElementText(cell) === columnValue) {
			recordRow = row
			return false
		}
		return true
	})

	return recordRow
}

export default getRecordsTableRowByColumnValue
