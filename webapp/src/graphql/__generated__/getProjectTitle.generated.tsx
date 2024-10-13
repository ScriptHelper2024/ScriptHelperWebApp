import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetProjectTitleQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type GetProjectTitleQuery = { __typename: 'Query', projectById?: { __typename: 'Project', title: string } | null };


export const GetProjectTitleDocument = gql`
    query GetProjectTitle($id: ID!) {
  projectById(id: $id) {
    title
  }
}
    `;

/**
 * __useGetProjectTitleQuery__
 *
 * To run a query within a React component, call `useGetProjectTitleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectTitleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectTitleQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetProjectTitleQuery(baseOptions: Apollo.QueryHookOptions<GetProjectTitleQuery, GetProjectTitleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectTitleQuery, GetProjectTitleQueryVariables>(GetProjectTitleDocument, options);
      }
export function useGetProjectTitleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectTitleQuery, GetProjectTitleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectTitleQuery, GetProjectTitleQueryVariables>(GetProjectTitleDocument, options);
        }
export type GetProjectTitleQueryHookResult = ReturnType<typeof useGetProjectTitleQuery>;
export type GetProjectTitleLazyQueryHookResult = ReturnType<typeof useGetProjectTitleLazyQuery>;
export type GetProjectTitleQueryResult = Apollo.QueryResult<GetProjectTitleQuery, GetProjectTitleQueryVariables>;