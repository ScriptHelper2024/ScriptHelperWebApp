import React from 'react'
import PropTypes from 'prop-types'
import {
	ApolloProvider,
	ApolloClient,
	InMemoryCache,
	createHttpLink,
  ApolloLink,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev'

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'development') {
	loadDevMessages()
	loadErrorMessages()
}

const ApolloClientProvider = ({ children }) => {
	// eslint-disable-next-line no-undef
	if (!process.env.REACT_APP_GRAPHQL_SERVER_URI) {
		throw 'REACT_APP_GRAPHQL_SERVER_URI environment variable is missing a value.'
	}

	const httpLink = createHttpLink({
		// eslint-disable-next-line no-undef
		uri: process.env.REACT_APP_GRAPHQL_SERVER_URI,
	})

	const authLink = setContext((_, { headers }) => {
		const token = localStorage.getItem('authentication')
		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : '',
			},
		}
	})

	// Error handling link
	const errorLink = onError(({ graphQLErrors, networkError }) => {
			if (graphQLErrors) {
					for (let err of graphQLErrors) {
							switch (err.message) {
									case 'Not authorized':
											// Handle token expiration or invalidation here
											localStorage.removeItem('authentication')
											window.location.href = '/login'
											break
									default:
											console.error(`[GraphQL error]: ${err.message}`)
							}
					}
			}
			if (networkError) {
					console.error(`[Network error]: ${networkError}`)
			}
	})

	const client = new ApolloClient({
			link: ApolloLink.from([errorLink, authLink.concat(httpLink)]),
			cache: new InMemoryCache(),
			defaultOptions: {
					watchQuery: {
							fetchPolicy: 'no-cache',
							errorPolicy: 'ignore',
					},
					query: {
							fetchPolicy: 'no-cache',
							errorPolicy: 'all',
					},
			},
	})

	return <ApolloProvider client={client}>{children}</ApolloProvider>
}

ApolloClientProvider.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}

export default ApolloClientProvider
