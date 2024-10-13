import React from 'react'
import PropTypes from 'prop-types'

const GraphqlError = ({ error, children }) => {
	return (
		<div>
			{children &&
				Object.keys(children).length &&
				React.Children.map(children, (child) => child)}
			{error.message}
		</div>
	)
}

GraphqlError.propTypes = {
	error: PropTypes.shape({
		message: PropTypes.string.isRequired,
	}),
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
}

export default GraphqlError
