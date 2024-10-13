import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListProjectCharactersQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
}>;


export type ListProjectCharactersQuery = { __typename: 'Query', listProjectCharacters?: Array<{ __typename: 'CharacterProfile', id: string, projectId: string, characterKey: string, characterOrder?: number | null, name: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null> | null };


export const ListProjectCharactersDocument = gql`
    query ListProjectCharacters($projectId: ID!) {
  listProjectCharacters(projectId: $projectId) {
    id
    projectId
    characterKey
    characterOrder
    name
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
 * __useListProjectCharactersQuery__
 *
 * To run a query within a React component, call `useListProjectCharactersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListProjectCharactersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListProjectCharactersQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useListProjectCharactersQuery(baseOptions: Apollo.QueryHookOptions<ListProjectCharactersQuery, ListProjectCharactersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListProjectCharactersQuery, ListProjectCharactersQueryVariables>(ListProjectCharactersDocument, options);
      }
export function useListProjectCharactersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListProjectCharactersQuery, ListProjectCharactersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListProjectCharactersQuery, ListProjectCharactersQueryVariables>(ListProjectCharactersDocument, options);
        }
export type ListProjectCharactersQueryHookResult = ReturnType<typeof useListProjectCharactersQuery>;
export type ListProjectCharactersLazyQueryHookResult = ReturnType<typeof useListProjectCharactersLazyQuery>;
export type ListProjectCharactersQueryResult = Apollo.QueryResult<ListProjectCharactersQuery, ListProjectCharactersQueryVariables>;