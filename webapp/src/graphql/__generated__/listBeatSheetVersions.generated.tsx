import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListBeatSheetVersionsQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  sceneKey: Types.Scalars['ID'];
}>;


export type ListBeatSheetVersionsQuery = { __typename: 'Query', listBeatSheetVersions?: Array<{ __typename: 'BeatSheet', id: string, sceneKey: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, sceneTextId?: string | null, textNotes?: string | null, textContent?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null> | null };


export const ListBeatSheetVersionsDocument = gql`
    query ListBeatSheetVersions($projectId: ID!, $sceneKey: ID!) {
  listBeatSheetVersions(projectId: $projectId, sceneKey: $sceneKey) {
    id
    sceneKey
    versionType
    sourceVersionNumber
    versionNumber
    versionLabel
    sceneTextId
    textNotes
    textContent
    characterCount
    llmModel
    createdAt
    createdBy
  }
}
    `;

/**
 * __useListBeatSheetVersionsQuery__
 *
 * To run a query within a React component, call `useListBeatSheetVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListBeatSheetVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListBeatSheetVersionsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      sceneKey: // value for 'sceneKey'
 *   },
 * });
 */
export function useListBeatSheetVersionsQuery(baseOptions: Apollo.QueryHookOptions<ListBeatSheetVersionsQuery, ListBeatSheetVersionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListBeatSheetVersionsQuery, ListBeatSheetVersionsQueryVariables>(ListBeatSheetVersionsDocument, options);
      }
export function useListBeatSheetVersionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListBeatSheetVersionsQuery, ListBeatSheetVersionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListBeatSheetVersionsQuery, ListBeatSheetVersionsQueryVariables>(ListBeatSheetVersionsDocument, options);
        }
export type ListBeatSheetVersionsQueryHookResult = ReturnType<typeof useListBeatSheetVersionsQuery>;
export type ListBeatSheetVersionsLazyQueryHookResult = ReturnType<typeof useListBeatSheetVersionsLazyQuery>;
export type ListBeatSheetVersionsQueryResult = Apollo.QueryResult<ListBeatSheetVersionsQuery, ListBeatSheetVersionsQueryVariables>;