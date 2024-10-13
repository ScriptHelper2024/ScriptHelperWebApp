import React from 'react'
import GraphQLAPIExplorer from './GraphQLAPIExplorer'
import ErrorBoundary from './ErrorBoundary'
import WebsocketListener from './WebsocketListener'

function QueryBrowserApp() {
	// const darkMode = true;

	return (
		<ErrorBoundary>
			<GraphQLAPIExplorer />
			<WebsocketListener />
		</ErrorBoundary>
	)
}

export default QueryBrowserApp
