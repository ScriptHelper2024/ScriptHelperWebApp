import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ReorderSceneMutationVariables = Types.Exact<{
  newSceneOrder: Types.Scalars['Int'];
  projectId: Types.Scalars['ID'];
  textId: Types.Scalars['ID'];
}>;


export type ReorderSceneMutation = { __typename: 'Mutations', reorderScene?: { __typename: 'ReorderScene', success?: boolean | null } | null };


export const ReorderSceneDocument = gql`
    mutation ReorderScene($newSceneOrder: Int!, $projectId: ID!, $textId: ID!) {
  reorderScene(
    newSceneOrder: $newSceneOrder
    projectId: $projectId
    textId: $textId
  ) {
    success
  }
}
    `;
export type ReorderSceneMutationFn = Apollo.MutationFunction<ReorderSceneMutation, ReorderSceneMutationVariables>;

/**
 * __useReorderSceneMutation__
 *
 * To run a mutation, you first call `useReorderSceneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReorderSceneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reorderSceneMutation, { data, loading, error }] = useReorderSceneMutation({
 *   variables: {
 *      newSceneOrder: // value for 'newSceneOrder'
 *      projectId: // value for 'projectId'
 *      textId: // value for 'textId'
 *   },
 * });
 */
export function useReorderSceneMutation(baseOptions?: Apollo.MutationHookOptions<ReorderSceneMutation, ReorderSceneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReorderSceneMutation, ReorderSceneMutationVariables>(ReorderSceneDocument, options);
      }
export type ReorderSceneMutationHookResult = ReturnType<typeof useReorderSceneMutation>;
export type ReorderSceneMutationResult = Apollo.MutationResult<ReorderSceneMutation>;
export type ReorderSceneMutationOptions = Apollo.BaseMutationOptions<ReorderSceneMutation, ReorderSceneMutationVariables>;