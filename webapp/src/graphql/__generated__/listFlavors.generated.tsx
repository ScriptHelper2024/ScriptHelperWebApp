import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AllScriptDialogFlavorsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AllScriptDialogFlavorsQuery = { __typename: 'Query', allScriptDialogFlavors?: { __typename: 'AllScriptDialogFlavors', scriptDialogFlavors: Array<{ __typename: 'ScriptDialogFlavor', id: string, name: string }> } | null };


export const AllScriptDialogFlavorsDocument = gql`
    query AllScriptDialogFlavors {
  allScriptDialogFlavors {
    scriptDialogFlavors {
      id
      name
    }
  }
}
    `;

/**
 * __useAllScriptDialogFlavorsQuery__
 *
 * To run a query within a React component, call `useAllScriptDialogFlavorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllScriptDialogFlavorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllScriptDialogFlavorsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllScriptDialogFlavorsQuery(baseOptions?: Apollo.QueryHookOptions<AllScriptDialogFlavorsQuery, AllScriptDialogFlavorsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllScriptDialogFlavorsQuery, AllScriptDialogFlavorsQueryVariables>(AllScriptDialogFlavorsDocument, options);
      }
export function useAllScriptDialogFlavorsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllScriptDialogFlavorsQuery, AllScriptDialogFlavorsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllScriptDialogFlavorsQuery, AllScriptDialogFlavorsQueryVariables>(AllScriptDialogFlavorsDocument, options);
        }
export type AllScriptDialogFlavorsQueryHookResult = ReturnType<typeof useAllScriptDialogFlavorsQuery>;
export type AllScriptDialogFlavorsLazyQueryHookResult = ReturnType<typeof useAllScriptDialogFlavorsLazyQuery>;
export type AllScriptDialogFlavorsQueryResult = Apollo.QueryResult<AllScriptDialogFlavorsQuery, AllScriptDialogFlavorsQueryVariables>;