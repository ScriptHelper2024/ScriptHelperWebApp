import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetLatestStoryTextIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type GetLatestStoryTextIdQuery = { __typename: 'Query', projectById?: { __typename: 'Project', latestStoryTextId?: string | null } | null };


export const GetLatestStoryTextIdDocument = gql`
    query GetLatestStoryTextId($id: ID!) {
  projectById(id: $id) {
    latestStoryTextId
  }
}
    `;

/**
 * __useGetLatestStoryTextIdQuery__
 *
 * To run a query within a React component, call `useGetLatestStoryTextIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestStoryTextIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestStoryTextIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLatestStoryTextIdQuery(baseOptions: Apollo.QueryHookOptions<GetLatestStoryTextIdQuery, GetLatestStoryTextIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLatestStoryTextIdQuery, GetLatestStoryTextIdQueryVariables>(GetLatestStoryTextIdDocument, options);
      }
export function useGetLatestStoryTextIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLatestStoryTextIdQuery, GetLatestStoryTextIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLatestStoryTextIdQuery, GetLatestStoryTextIdQueryVariables>(GetLatestStoryTextIdDocument, options);
        }
export type GetLatestStoryTextIdQueryHookResult = ReturnType<typeof useGetLatestStoryTextIdQuery>;
export type GetLatestStoryTextIdLazyQueryHookResult = ReturnType<typeof useGetLatestStoryTextIdLazyQuery>;
export type GetLatestStoryTextIdQueryResult = Apollo.QueryResult<GetLatestStoryTextIdQuery, GetLatestStoryTextIdQueryVariables>;