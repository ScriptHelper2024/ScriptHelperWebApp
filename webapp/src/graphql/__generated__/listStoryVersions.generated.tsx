import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListStoryVersionsQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
}>;


export type ListStoryVersionsQuery = { __typename: 'Query', listStoryVersions?: Array<{ __typename: 'StoryText', id: string, versionType: string, versionNumber: number } | null> | null };


export const ListStoryVersionsDocument = gql`
    query ListStoryVersions($projectId: ID!) {
  listStoryVersions(projectId: $projectId) {
    id
    versionType
    versionNumber
  }
}
    `;

/**
 * __useListStoryVersionsQuery__
 *
 * To run a query within a React component, call `useListStoryVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListStoryVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListStoryVersionsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useListStoryVersionsQuery(baseOptions: Apollo.QueryHookOptions<ListStoryVersionsQuery, ListStoryVersionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListStoryVersionsQuery, ListStoryVersionsQueryVariables>(ListStoryVersionsDocument, options);
      }
export function useListStoryVersionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListStoryVersionsQuery, ListStoryVersionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListStoryVersionsQuery, ListStoryVersionsQueryVariables>(ListStoryVersionsDocument, options);
        }
export type ListStoryVersionsQueryHookResult = ReturnType<typeof useListStoryVersionsQuery>;
export type ListStoryVersionsLazyQueryHookResult = ReturnType<typeof useListStoryVersionsLazyQuery>;
export type ListStoryVersionsQueryResult = Apollo.QueryResult<ListStoryVersionsQuery, ListStoryVersionsQueryVariables>;