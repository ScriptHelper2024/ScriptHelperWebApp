import React from 'react'
import PropTypes from 'prop-types'

const RecordsTableHeader = ({ children }) => {
	return <thead>{children}</thead>
}

RecordsTableHeader.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}

export default RecordsTableHeader
