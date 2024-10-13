import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetStoryTextQueryVariables = Types.Exact<{
  textId?: Types.InputMaybe<Types.Scalars['ID']>;
  projectId: Types.Scalars['ID'];
  versionNumber?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type GetStoryTextQuery = { __typename: 'Query', getStoryText?: { __typename: 'StoryText', id: string, projectId: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null };


export const GetStoryTextDocument = gql`
    query GetStoryText($textId: ID, $projectId: ID!, $versionNumber: Int) {
  getStoryText(
    textId: $textId
    projectId: $projectId
    versionNumber: $versionNumber
  ) {
    id
    projectId
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
  }
}
    `;

/**
 * __useGetStoryTextQuery__
 *
 * To run a query within a React component, call `useGetStoryTextQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStoryTextQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStoryTextQuery({
 *   variables: {
 *      textId: // value for 'textId'
 *      projectId: // value for 'projectId'
 *      versionNumber: // value for 'versionNumber'
 *   },
 * });
 */
export function useGetStoryTextQuery(baseOptions: Apollo.QueryHookOptions<GetStoryTextQuery, GetStoryTextQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStoryTextQuery, GetStoryTextQueryVariables>(GetStoryTextDocument, options);
      }
export function useGetStoryTextLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStoryTextQuery, GetStoryTextQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStoryTextQuery, GetStoryTextQueryVariables>(GetStoryTextDocument, options);
        }
export type GetStoryTextQueryHookResult = ReturnType<typeof useGetStoryTextQuery>;
export type GetStoryTextLazyQueryHookResult = ReturnType<typeof useGetStoryTextLazyQuery>;
export type GetStoryTextQueryResult = Apollo.QueryResult<GetStoryTextQuery, GetStoryTextQueryVariables>;