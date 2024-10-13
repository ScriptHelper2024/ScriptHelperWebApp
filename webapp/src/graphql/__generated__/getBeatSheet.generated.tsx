import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetBeatSheetQueryVariables = Types.Exact<{
  textId: Types.Scalars['ID'];
  projectId: Types.Scalars['ID'];
  sceneKey: Types.Scalars['UUID'];
}>;


export type GetBeatSheetQuery = { __typename: 'Query', getBeatSheet?: { __typename: 'BeatSheet', id: string, textContent?: string | null } | null };


export const GetBeatSheetDocument = gql`
    query GetBeatSheet($textId: ID!, $projectId: ID!, $sceneKey: UUID!) {
  getBeatSheet(textId: $textId, projectId: $projectId, sceneKey: $sceneKey) {
    id
    textContent
  }
}
    `;

/**
 * __useGetBeatSheetQuery__
 *
 * To run a query within a React component, call `useGetBeatSheetQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBeatSheetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBeatSheetQuery({
 *   variables: {
 *      textId: // value for 'textId'
 *      projectId: // value for 'projectId'
 *      sceneKey: // value for 'sceneKey'
 *   },
 * });
 */
export function useGetBeatSheetQuery(baseOptions: Apollo.QueryHookOptions<GetBeatSheetQuery, GetBeatSheetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBeatSheetQuery, GetBeatSheetQueryVariables>(GetBeatSheetDocument, options);
      }
export function useGetBeatSheetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBeatSheetQuery, GetBeatSheetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBeatSheetQuery, GetBeatSheetQueryVariables>(GetBeatSheetDocument, options);
        }
export type GetBeatSheetQueryHookResult = ReturnType<typeof useGetBeatSheetQuery>;
export type GetBeatSheetLazyQueryHookResult = ReturnType<typeof useGetBeatSheetLazyQuery>;
export type GetBeatSheetQueryResult = Apollo.QueryResult<GetBeatSheetQuery, GetBeatSheetQueryVariables>;