import React from 'react'
import './RecordsTableRowLimit.scss'
import useDebouncingState from '../../hooks/useDebouncingState'
import { recordsTableControllerPropTypes } from './useRecordsTableController'

const RecordsTableRowLimit = ({ recordsTableController }) => {
	const [rows, setRows] = useDebouncingState(
		recordsTableController.state.rows,
		(value) => {
			if (value > 0) {
				recordsTableController.setRows(value)
				recordsTableController.resetPage()
			}
		}
	)

	const onRowsChange = (e) => {
		let value = e.target.value
		if (value !== '') {
			value = parseInt(value)
			if (!Number.isInteger(value)) {
				return false
			}
		}
		setRows(value)
	}

	React.useEffect(() => {
		if (recordsTableController.state.rows !== undefined) {
			if (rows === undefined) {
				// set the input value to the number of rows displayed
				setRows(recordsTableController.state.rows)
			} else {
				// handle mismatch between the rows displayed and the input value
				if (recordsTableController.state.rows < rows) {
					if (recordsTableController.state.pages === 1) {
						// if there is only one page then all possible rows are already displayed
						// set the input to the rows count value
						setRows(recordsTableController.state.rows)
					} else {
						// the last page of results may have less rows displayed than requested so
						// set the rows count value to the input value
						recordsTableController.setRows(rows)
					}
				}
			}
		}
	}, [recordsTableController.state.rows])

	return (
		<label className="RecordsTableRowLimit">
			<span>Rows: </span>
			<input value={rows ?? ''} onChange={onRowsChange} />
		</label>
	)
}
RecordsTableRowLimit.propTypes = {
	recordsTableController: recordsTableControllerPropTypes.isRequired,
}

export default RecordsTableRowLimit
