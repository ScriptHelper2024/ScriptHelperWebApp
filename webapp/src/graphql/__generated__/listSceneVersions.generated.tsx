import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListSceneVersionsQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  sceneKey: Types.Scalars['String'];
}>;


export type ListSceneVersionsQuery = { __typename: 'Query', listSceneVersions?: Array<{ __typename: 'SceneText', id: string, sceneKey: string, sceneOrder?: number | null, title: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null, latestBeatSheetId?: string | null, latestScriptTextId?: string | null } | null> | null };


export const ListSceneVersionsDocument = gql`
    query ListSceneVersions($projectId: ID!, $sceneKey: String!) {
  listSceneVersions(projectId: $projectId, sceneKey: $sceneKey) {
    id
    sceneKey
    sceneOrder
    title
    versionType
    sourceVersionNumber
    versionNumber
    versionLabel
    textSeed
    textNotes
    textContent
    characterCount
    llmModel
    createdAt
    createdBy
    latestBeatSheetId
    latestScriptTextId
  }
}
    `;

/**
 * __useListSceneVersionsQuery__
 *
 * To run a query within a React component, call `useListSceneVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListSceneVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListSceneVersionsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      sceneKey: // value for 'sceneKey'
 *   },
 * });
 */
export function useListSceneVersionsQuery(baseOptions: Apollo.QueryHookOptions<ListSceneVersionsQuery, ListSceneVersionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListSceneVersionsQuery, ListSceneVersionsQueryVariables>(ListSceneVersionsDocument, options);
      }
export function useListSceneVersionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListSceneVersionsQuery, ListSceneVersionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListSceneVersionsQuery, ListSceneVersionsQueryVariables>(ListSceneVersionsDocument, options);
        }
export type ListSceneVersionsQueryHookResult = ReturnType<typeof useListSceneVersionsQuery>;
export type ListSceneVersionsLazyQueryHookResult = ReturnType<typeof useListSceneVersionsLazyQuery>;
export type ListSceneVersionsQueryResult = Apollo.QueryResult<ListSceneVersionsQuery, ListSceneVersionsQueryVariables>;