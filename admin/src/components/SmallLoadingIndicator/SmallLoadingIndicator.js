import React from 'react'
import PropTypes from 'prop-types'
import './SmallLoadingIndicator.scss'

const SmallLoadingIndicator = ({ children, loading = true }) => {
	return (
		<span className={`SmallLoadingIndicator ${loading ? 'loading' : ''}`}>
			{loading ? (
				<div className="dots">
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
				</div>
			) : (
				children
			)}
		</span>
	)
}

SmallLoadingIndicator.propTypes = {
	loading: PropTypes.bool.isRequired,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
}

export default SmallLoadingIndicator
