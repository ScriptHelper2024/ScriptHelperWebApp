// src/ErrorBoundary.js

import React from 'react'

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false, errorInfo: null }
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: !!error }
	}

	componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service
		this.setState({ errorInfo: errorInfo })
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				<div>
					<h1>Something went wrong.</h1>
					<details style={{ whiteSpace: 'pre-wrap' }}>
						{this.state.errorInfo && this.state.errorInfo.componentStack}
					</details>
				</div>
			)
		}
		/* eslint-disable-next-line react/prop-types */
		return this.props.children
	}
}

export default ErrorBoundary
