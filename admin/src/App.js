import React from 'react'
import './App.scss'

import { FeedbackContextProvider } from './contexts/FeedbackContext/FeedbackContext'
import ApolloClientProvider from './apollo/ApolloClientProvider'
import Router from './router/Router'

import { ErrorBoundary } from 'react-error-boundary'
import GenericErrorFallback from './ErrorBoundary/GenericErrorFallback/GenericErrorFallback'

function App() {
	return (
		<div className="App">
			<ErrorBoundary FallbackComponent={GenericErrorFallback}>
				<FeedbackContextProvider>
					<ApolloClientProvider>
						<Router />
					</ApolloClientProvider>
				</FeedbackContextProvider>
			</ErrorBoundary>
		</div>
	)
}

export default App
