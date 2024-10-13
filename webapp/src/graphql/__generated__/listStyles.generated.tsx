import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AllStylesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AllStylesQuery = { __typename: 'Query', allStyleGuidelines?: { __typename: 'AllStyleGuidelines', styleGuidelines: Array<{ __typename: 'StyleGuideline', id: string, name: string }> } | null };


export const AllStylesDocument = gql`
    query AllStyles {
  allStyleGuidelines {
    styleGuidelines {
      id
      name
    }
  }
}
    `;

/**
 * __useAllStylesQuery__
 *
 * To run a query within a React component, call `useAllStylesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllStylesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllStylesQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllStylesQuery(baseOptions?: Apollo.QueryHookOptions<AllStylesQuery, AllStylesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllStylesQuery, AllStylesQueryVariables>(AllStylesDocument, options);
      }
export function useAllStylesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllStylesQuery, AllStylesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllStylesQuery, AllStylesQueryVariables>(AllStylesDocument, options);
        }
export type AllStylesQueryHookResult = ReturnType<typeof useAllStylesQuery>;
export type AllStylesLazyQueryHookResult = ReturnType<typeof useAllStylesLazyQuery>;
export type AllStylesQueryResult = Apollo.QueryResult<AllStylesQuery, AllStylesQueryVariables>;