import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MyUserPreferenceQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MyUserPreferenceQuery = { __typename: 'Query', myUserPreference?: { __typename: 'UserPreference', defaultLlm?: string | null } | null };


export const MyUserPreferenceDocument = gql`
    query MyUserPreference {
  myUserPreference {
    defaultLlm
  }
}
    `;

/**
 * __useMyUserPreferenceQuery__
 *
 * To run a query within a React component, call `useMyUserPreferenceQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyUserPreferenceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyUserPreferenceQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyUserPreferenceQuery(baseOptions?: Apollo.QueryHookOptions<MyUserPreferenceQuery, MyUserPreferenceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyUserPreferenceQuery, MyUserPreferenceQueryVariables>(MyUserPreferenceDocument, options);
      }
export function useMyUserPreferenceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyUserPreferenceQuery, MyUserPreferenceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyUserPreferenceQuery, MyUserPreferenceQueryVariables>(MyUserPreferenceDocument, options);
        }
export type MyUserPreferenceQueryHookResult = ReturnType<typeof useMyUserPreferenceQuery>;
export type MyUserPreferenceLazyQueryHookResult = ReturnType<typeof useMyUserPreferenceLazyQuery>;
export type MyUserPreferenceQueryResult = Apollo.QueryResult<MyUserPreferenceQuery, MyUserPreferenceQueryVariables>;