import React from 'react'
import PropTypes from 'prop-types'
import './GenericErrorFallback.scss'

import { useRouteError } from 'react-router-dom'

const GenericErrorFallback = ({ error }) => {
	let routeError, message
	try {
		routeError = useRouteError()
		message = routeError?.message || routeError.error.message
	} catch (e) {
		// ignore if the router can't be created
	}

	if (!message) {
		message = error?.message || error?.toString()
	}

	return (
		<div className="GenericErrorFallback">
			<h2>The application encountered an error</h2>
			<section>{message || 'Unspecified error.'}</section>
		</div>
	)
}

GenericErrorFallback.propTypes = {
	error: PropTypes.string,
}

export default GenericErrorFallback
