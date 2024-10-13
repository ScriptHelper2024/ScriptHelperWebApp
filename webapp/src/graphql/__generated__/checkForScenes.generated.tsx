import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CheckForScenesQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
}>;


export type CheckForScenesQuery = { __typename: 'Query', listProjectScenes?: Array<{ __typename: 'SceneText', id: string } | null> | null };


export const CheckForScenesDocument = gql`
    query CheckForScenes($projectId: ID!) {
  listProjectScenes(projectId: $projectId) {
    id
  }
}
    `;

/**
 * __useCheckForScenesQuery__
 *
 * To run a query within a React component, call `useCheckForScenesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckForScenesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckForScenesQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useCheckForScenesQuery(baseOptions: Apollo.QueryHookOptions<CheckForScenesQuery, CheckForScenesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckForScenesQuery, CheckForScenesQueryVariables>(CheckForScenesDocument, options);
      }
export function useCheckForScenesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckForScenesQuery, CheckForScenesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckForScenesQuery, CheckForScenesQueryVariables>(CheckForScenesDocument, options);
        }
export type CheckForScenesQueryHookResult = ReturnType<typeof useCheckForScenesQuery>;
export type CheckForScenesLazyQueryHookResult = ReturnType<typeof useCheckForScenesLazyQuery>;
export type CheckForScenesQueryResult = Apollo.QueryResult<CheckForScenesQuery, CheckForScenesQueryVariables>;