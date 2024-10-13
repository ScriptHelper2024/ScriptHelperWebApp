import React from 'react'
import PropTypes from 'prop-types'
import { TableContext } from './RecordsTable'

const RecordsTableFooter = ({ children }) => {
	const { columns } = React.useContext(TableContext)

	return (
		<tfoot>
			<tr>
				<td colSpan={columns} style={{ gridColumn: `1 / span ${columns}` }}>
					{children}
				</td>
			</tr>
		</tfoot>
	)
}

RecordsTableFooter.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}

export default RecordsTableFooter
