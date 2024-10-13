import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListProjectLocationsQueryVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
}>;


export type ListProjectLocationsQuery = { __typename: 'Query', listProjectLocations?: Array<{ __typename: 'LocationProfile', id: string, projectId: string, locationKey: string, locationOrder?: number | null, name: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, locationCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null> | null };


export const ListProjectLocationsDocument = gql`
    query ListProjectLocations($projectId: ID!) {
  listProjectLocations(projectId: $projectId) {
    id
    projectId
    locationKey
    locationOrder
    name
    versionType
    sourceVersionNumber
    versionNumber
    versionLabel
    textSeed
    textNotes
    textContent
    locationCount
    llmModel
    createdAt
    createdBy
  }
}
    `;

/**
 * __useListProjectLocationsQuery__
 *
 * To run a query within a React component, call `useListProjectLocationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListProjectLocationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListProjectLocationsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useListProjectLocationsQuery(baseOptions: Apollo.QueryHookOptions<ListProjectLocationsQuery, ListProjectLocationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListProjectLocationsQuery, ListProjectLocationsQueryVariables>(ListProjectLocationsDocument, options);
      }
export function useListProjectLocationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListProjectLocationsQuery, ListProjectLocationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListProjectLocationsQuery, ListProjectLocationsQueryVariables>(ListProjectLocationsDocument, options);
        }
export type ListProjectLocationsQueryHookResult = ReturnType<typeof useListProjectLocationsQuery>;
export type ListProjectLocationsLazyQueryHookResult = ReturnType<typeof useListProjectLocationsLazyQuery>;
export type ListProjectLocationsQueryResult = Apollo.QueryResult<ListProjectLocationsQuery, ListProjectLocationsQueryVariables>;