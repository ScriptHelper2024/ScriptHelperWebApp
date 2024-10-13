import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDefaultLlmOptionsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDefaultLlmOptionsQuery = { __typename: 'Query', defaultLlmOptions?: { __typename: 'DefaultLlmOptions', defaultLlmOptions?: any | null } | null };


export const GetDefaultLlmOptionsDocument = gql`
    query GetDefaultLlmOptions {
  defaultLlmOptions {
    defaultLlmOptions
  }
}
    `;

/**
 * __useGetDefaultLlmOptionsQuery__
 *
 * To run a query within a React component, call `useGetDefaultLlmOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDefaultLlmOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDefaultLlmOptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDefaultLlmOptionsQuery(baseOptions?: Apollo.QueryHookOptions<GetDefaultLlmOptionsQuery, GetDefaultLlmOptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDefaultLlmOptionsQuery, GetDefaultLlmOptionsQueryVariables>(GetDefaultLlmOptionsDocument, options);
      }
export function useGetDefaultLlmOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDefaultLlmOptionsQuery, GetDefaultLlmOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDefaultLlmOptionsQuery, GetDefaultLlmOptionsQueryVariables>(GetDefaultLlmOptionsDocument, options);
        }
export type GetDefaultLlmOptionsQueryHookResult = ReturnType<typeof useGetDefaultLlmOptionsQuery>;
export type GetDefaultLlmOptionsLazyQueryHookResult = ReturnType<typeof useGetDefaultLlmOptionsLazyQuery>;
export type GetDefaultLlmOptionsQueryResult = Apollo.QueryResult<GetDefaultLlmOptionsQuery, GetDefaultLlmOptionsQueryVariables>;