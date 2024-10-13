import React from 'react'
import PropTypes from 'prop-types'

import { TableContext } from './RecordsTable'

const renderRecordsTableBody = (
	columns,
	loading,
	hasData,
	hasErrors,
	children
) => {
	if (loading) {
		return (
			<tr>
				<td
					className="message"
					colSpan={columns}
					style={{ gridColumn: `1 / span ${columns}` }}
				>
					Loading...
				</td>
			</tr>
		)
	} else if (hasErrors) {
		return (
			<tr>
				<td
					className="message"
					colSpan={columns}
					style={{ gridColumn: `1 / span ${columns}` }}
				>
					(error retrieving data)
				</td>
			</tr>
		)
	} else if (!hasData) {
		return (
			<tr className="message">
				<td
					className="message"
					colSpan={columns}
					style={{ gridColumn: `1 / span ${columns}` }}
				>
					(no matching records)
				</td>
			</tr>
		)
	} else {
		return children
	}
}

const RecordsTableBody = ({ children }) => {
	const { columns, hasData, recordsTableController } =
		React.useContext(TableContext)
	const { hasErrors } = recordsTableController.state
	return (
		<tbody>
			{renderRecordsTableBody(
				columns,
				recordsTableController.state.loading,
				hasData,
				hasErrors,
				children
			)}
		</tbody>
	)
}

RecordsTableBody.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}

export default RecordsTableBody
