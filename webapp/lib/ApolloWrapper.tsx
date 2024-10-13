import { ApolloProvider } from "@apollo/client";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Use the environment variable for the GraphQL URI
const uri = process.env.NEXT_PUBLIC_GRAPHQL_SERVER_URI;

const httpLink = createHttpLink({ uri });

const client = new ApolloClient({
  link: setContext((_, { headers }) => {
    const token = localStorage.getItem("AUTH_TOKEN");
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  }).concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: "cache-first", errorPolicy: "all" },
    watchQuery: { fetchPolicy: "cache-first", errorPolicy: "all" },
  },
});


export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
