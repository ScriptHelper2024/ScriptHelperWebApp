import React from 'react'
import PropTypes from 'prop-types'
import './LoadingBlocker.scss'
import mediumLoadingIndicator from '../../assets/images/medium-loading-indicator.gif'

const LoadingBlocker = ({ loading, children }) => {
	return (
		<div className={`LoadingBlocker ${loading ? 'loading' : ''}`}>
			{loading && (
				<div className="loading-indicator">
					<img src={mediumLoadingIndicator} />
				</div>
			)}
			{children}
		</div>
	)
}

LoadingBlocker.propTypes = {
	loading: PropTypes.bool,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}

export default LoadingBlocker
