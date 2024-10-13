import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetScriptTextQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  sceneKey: Types.Scalars['UUID'];
  versionNumber?: Types.InputMaybe<Types.Scalars['Int']>;
  textId: Types.Scalars['ID'];
}>;


export type GetScriptTextQuery = { __typename: 'Query', getScriptText?: { __typename: 'ScriptText', id: string, sceneKey: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, sceneTextId?: string | null, textNotes?: string | null, textContent?: string | null, textContentFormatted?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null };


export const GetScriptTextDocument = gql`
    query GetScriptText($projectId: ID!, $sceneKey: UUID!, $versionNumber: Int, $textId: ID!) {
  getScriptText(
    projectId: $projectId
    sceneKey: $sceneKey
    versionNumber: $versionNumber
    textId: $textId
  ) {
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
 * __useGetScriptTextQuery__
 *
 * To run a query within a React component, call `useGetScriptTextQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScriptTextQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScriptTextQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      sceneKey: // value for 'sceneKey'
 *      versionNumber: // value for 'versionNumber'
 *      textId: // value for 'textId'
 *   },
 * });
 */
export function useGetScriptTextQuery(baseOptions: Apollo.QueryHookOptions<GetScriptTextQuery, GetScriptTextQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetScriptTextQuery, GetScriptTextQueryVariables>(GetScriptTextDocument, options);
      }
export function useGetScriptTextLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScriptTextQuery, GetScriptTextQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetScriptTextQuery, GetScriptTextQueryVariables>(GetScriptTextDocument, options);
        }
export type GetScriptTextQueryHookResult = ReturnType<typeof useGetScriptTextQuery>;
export type GetScriptTextLazyQueryHookResult = ReturnType<typeof useGetScriptTextLazyQuery>;
export type GetScriptTextQueryResult = Apollo.QueryResult<GetScriptTextQuery, GetScriptTextQueryVariables>;