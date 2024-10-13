import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSceneTextQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  versionNumber?: Types.InputMaybe<Types.Scalars['Int']>;
  textId: Types.Scalars['ID'];
}>;


export type GetSceneTextQuery = { __typename: 'Query', getSceneText?: { __typename: 'SceneText', id: string, sceneKey: string, sceneOrder?: number | null, title: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null, latestBeatSheetId?: string | null, latestScriptTextId?: string | null } | null };


export const GetSceneTextDocument = gql`
    query GetSceneText($projectId: ID!, $versionNumber: Int, $textId: ID!) {
  getSceneText(
    projectId: $projectId
    versionNumber: $versionNumber
    textId: $textId
  ) {
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
 * __useGetSceneTextQuery__
 *
 * To run a query within a React component, call `useGetSceneTextQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSceneTextQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSceneTextQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      versionNumber: // value for 'versionNumber'
 *      textId: // value for 'textId'
 *   },
 * });
 */
export function useGetSceneTextQuery(baseOptions: Apollo.QueryHookOptions<GetSceneTextQuery, GetSceneTextQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSceneTextQuery, GetSceneTextQueryVariables>(GetSceneTextDocument, options);
      }
export function useGetSceneTextLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSceneTextQuery, GetSceneTextQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSceneTextQuery, GetSceneTextQueryVariables>(GetSceneTextDocument, options);
        }
export type GetSceneTextQueryHookResult = ReturnType<typeof useGetSceneTextQuery>;
export type GetSceneTextLazyQueryHookResult = ReturnType<typeof useGetSceneTextLazyQuery>;
export type GetSceneTextQueryResult = Apollo.QueryResult<GetSceneTextQuery, GetSceneTextQueryVariables>;