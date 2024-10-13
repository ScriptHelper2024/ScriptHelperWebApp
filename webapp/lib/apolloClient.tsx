import { useMemo } from 'react'
import {
  ApolloLink,
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
// import CONFIG from '../config'
import { getMainDefinition } from '@apollo/client/utilities'
// import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink'

// Add this line to get the GraphQL URI from the environment variable
const GRAPHQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_SERVER_URI

const httpLink = new HttpLink({
  uri: GRAPHQL_URI,
  credentials: 'include',
})

let link: ApolloLink
if (typeof window !== 'undefined') {


    link = ApolloLink.split(
    ({ query }) => {
      if (typeof query === 'undefined') {
        return false
      }
      const definition = getMainDefinition(query)

      return (
        definition.kind === 'OperationDefinition' 
      )
    },
   
    httpLink
  )
}

let apolloClient: any

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined', // set to true for SSR
    link: link || httpLink,
    cache: new InMemoryCache(),
  })
}

export function initializeApollo(initialState: any) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState })
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient
  return _apolloClient
}

export function useApollo(initialState: any) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
