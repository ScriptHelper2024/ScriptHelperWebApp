import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListMagicNoteCriticsByTypeQueryVariables = Types.Exact<{
  documentType: Types.Scalars['String'];
}>;


export type ListMagicNoteCriticsByTypeQuery = { __typename: 'Query', listMagicNoteCriticsByType?: Array<{ __typename: 'MagicNoteCritic', id: string, name: string } | null> | null };


export const ListMagicNoteCriticsByTypeDocument = gql`
    query ListMagicNoteCriticsByType($documentType: String!) {
  listMagicNoteCriticsByType(documentType: $documentType) {
    id
    name
  }
}
    `;

/**
 * __useListMagicNoteCriticsByTypeQuery__
 *
 * To run a query within a React component, call `useListMagicNoteCriticsByTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useListMagicNoteCriticsByTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListMagicNoteCriticsByTypeQuery({
 *   variables: {
 *      documentType: // value for 'documentType'
 *   },
 * });
 */
export function useListMagicNoteCriticsByTypeQuery(baseOptions: Apollo.QueryHookOptions<ListMagicNoteCriticsByTypeQuery, ListMagicNoteCriticsByTypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListMagicNoteCriticsByTypeQuery, ListMagicNoteCriticsByTypeQueryVariables>(ListMagicNoteCriticsByTypeDocument, options);
      }
export function useListMagicNoteCriticsByTypeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListMagicNoteCriticsByTypeQuery, ListMagicNoteCriticsByTypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListMagicNoteCriticsByTypeQuery, ListMagicNoteCriticsByTypeQueryVariables>(ListMagicNoteCriticsByTypeDocument, options);
        }
export type ListMagicNoteCriticsByTypeQueryHookResult = ReturnType<typeof useListMagicNoteCriticsByTypeQuery>;
export type ListMagicNoteCriticsByTypeLazyQueryHookResult = ReturnType<typeof useListMagicNoteCriticsByTypeLazyQuery>;
export type ListMagicNoteCriticsByTypeQueryResult = Apollo.QueryResult<ListMagicNoteCriticsByTypeQuery, ListMagicNoteCriticsByTypeQueryVariables>;