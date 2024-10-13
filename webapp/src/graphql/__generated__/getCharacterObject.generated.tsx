import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCharacterObjectQueryVariables = Types.Exact<{
  textId?: Types.InputMaybe<Types.Scalars['ID']>;
  projectId: Types.Scalars['ID'];
  characterKey?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type GetCharacterObjectQuery = { __typename: 'Query', getCharacterProfile?: { __typename: 'CharacterProfile', id: string, name: string, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null } | null };


export const GetCharacterObjectDocument = gql`
    query GetCharacterObject($textId: ID, $projectId: ID!, $characterKey: String) {
  getCharacterProfile(
    textId: $textId
    projectId: $projectId
    characterKey: $characterKey
  ) {
    id
    name
    versionLabel
    textSeed
    textNotes
    textContent
  }
}
    `;

/**
 * __useGetCharacterObjectQuery__
 *
 * To run a query within a React component, call `useGetCharacterObjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCharacterObjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCharacterObjectQuery({
 *   variables: {
 *      textId: // value for 'textId'
 *      projectId: // value for 'projectId'
 *      characterKey: // value for 'characterKey'
 *   },
 * });
 */
export function useGetCharacterObjectQuery(baseOptions: Apollo.QueryHookOptions<GetCharacterObjectQuery, GetCharacterObjectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCharacterObjectQuery, GetCharacterObjectQueryVariables>(GetCharacterObjectDocument, options);
      }
export function useGetCharacterObjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCharacterObjectQuery, GetCharacterObjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCharacterObjectQuery, GetCharacterObjectQueryVariables>(GetCharacterObjectDocument, options);
        }
export type GetCharacterObjectQueryHookResult = ReturnType<typeof useGetCharacterObjectQuery>;
export type GetCharacterObjectLazyQueryHookResult = ReturnType<typeof useGetCharacterObjectLazyQuery>;
export type GetCharacterObjectQueryResult = Apollo.QueryResult<GetCharacterObjectQuery, GetCharacterObjectQueryVariables>;