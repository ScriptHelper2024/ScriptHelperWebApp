import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListScriptTextVersionsQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  sceneKey: Types.Scalars['ID'];
}>;


export type ListScriptTextVersionsQuery = { __typename: 'Query', listScriptTextVersions?: Array<{ __typename: 'ScriptText', id: string, sceneKey: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, sceneTextId?: string | null, textNotes?: string | null, textContent?: string | null, textContentFormatted?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null> | null };


export const ListScriptTextVersionsDocument = gql`
    query ListScriptTextVersions($projectId: ID!, $sceneKey: ID!) {
  listScriptTextVersions(projectId: $projectId, sceneKey: $sceneKey) {
    id
    sceneKey
    versionType
    sourceVersionNumber
    versionNumber
    versionLabel
    sceneTextId
    textNotes
    textContent
    textContentFormatted
    characterCount
    llmModel
    createdAt
    createdBy
  }
}
    `;

/**
 * __useListScriptTextVersionsQuery__
 *
 * To run a query within a React component, call `useListScriptTextVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListScriptTextVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListScriptTextVersionsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      sceneKey: // value for 'sceneKey'
 *   },
 * });
 */
export function useListScriptTextVersionsQuery(baseOptions: Apollo.QueryHookOptions<ListScriptTextVersionsQuery, ListScriptTextVersionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListScriptTextVersionsQuery, ListScriptTextVersionsQueryVariables>(ListScriptTextVersionsDocument, options);
      }
export function useListScriptTextVersionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListScriptTextVersionsQuery, ListScriptTextVersionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListScriptTextVersionsQuery, ListScriptTextVersionsQueryVariables>(ListScriptTextVersionsDocument, options);
        }
export type ListScriptTextVersionsQueryHookResult = ReturnType<typeof useListScriptTextVersionsQuery>;
export type ListScriptTextVersionsLazyQueryHookResult = ReturnType<typeof useListScriptTextVersionsLazyQuery>;
export type ListScriptTextVersionsQueryResult = Apollo.QueryResult<ListScriptTextVersionsQuery, ListScriptTextVersionsQueryVariables>;