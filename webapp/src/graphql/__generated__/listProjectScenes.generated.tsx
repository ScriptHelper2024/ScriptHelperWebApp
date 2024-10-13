import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListProjectScenesQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
}>;


export type ListProjectScenesQuery = { __typename: 'Query', listProjectScenes?: Array<{ __typename: 'SceneText', id: string, sceneKey: string, sceneOrder?: number | null, title: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null, latestBeatSheetId?: string | null, latestScriptTextId?: string | null } | null> | null };


export const ListProjectScenesDocument = gql`
    query ListProjectScenes($projectId: ID!) {
  listProjectScenes(projectId: $projectId) {
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
 * __useListProjectScenesQuery__
 *
 * To run a query within a React component, call `useListProjectScenesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListProjectScenesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListProjectScenesQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useListProjectScenesQuery(baseOptions: Apollo.QueryHookOptions<ListProjectScenesQuery, ListProjectScenesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListProjectScenesQuery, ListProjectScenesQueryVariables>(ListProjectScenesDocument, options);
      }
export function useListProjectScenesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListProjectScenesQuery, ListProjectScenesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListProjectScenesQuery, ListProjectScenesQueryVariables>(ListProjectScenesDocument, options);
        }
export type ListProjectScenesQueryHookResult = ReturnType<typeof useListProjectScenesQuery>;
export type ListProjectScenesLazyQueryHookResult = ReturnType<typeof useListProjectScenesLazyQuery>;
export type ListProjectScenesQueryResult = Apollo.QueryResult<ListProjectScenesQuery, ListProjectScenesQueryVariables>;