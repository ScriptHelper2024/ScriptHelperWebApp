import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetLocationObjectQueryVariables = Types.Exact<{
  textId?: Types.InputMaybe<Types.Scalars['ID']>;
  projectId: Types.Scalars['ID'];
  locationKey?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type GetLocationObjectQuery = { __typename: 'Query', getLocationProfile?: { __typename: 'LocationProfile', id: string, name: string, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null } | null };


export const GetLocationObjectDocument = gql`
    query GetLocationObject($textId: ID, $projectId: ID!, $locationKey: String) {
  getLocationProfile(
    textId: $textId
    projectId: $projectId
    locationKey: $locationKey
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
 * __useGetLocationObjectQuery__
 *
 * To run a query within a React component, call `useGetLocationObjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLocationObjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLocationObjectQuery({
 *   variables: {
 *      textId: // value for 'textId'
 *      projectId: // value for 'projectId'
 *      locationKey: // value for 'locationKey'
 *   },
 * });
 */
export function useGetLocationObjectQuery(baseOptions: Apollo.QueryHookOptions<GetLocationObjectQuery, GetLocationObjectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLocationObjectQuery, GetLocationObjectQueryVariables>(GetLocationObjectDocument, options);
      }
export function useGetLocationObjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLocationObjectQuery, GetLocationObjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLocationObjectQuery, GetLocationObjectQueryVariables>(GetLocationObjectDocument, options);
        }
export type GetLocationObjectQueryHookResult = ReturnType<typeof useGetLocationObjectQuery>;
export type GetLocationObjectLazyQueryHookResult = ReturnType<typeof useGetLocationObjectLazyQuery>;
export type GetLocationObjectQueryResult = Apollo.QueryResult<GetLocationObjectQuery, GetLocationObjectQueryVariables>;