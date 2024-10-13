import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteSceneByKeyMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  sceneKey: Types.Scalars['String'];
}>;


export type DeleteSceneByKeyMutation = { __typename: 'Mutations', deleteSceneByKey?: { __typename: 'DeleteSceneByKey', success?: boolean | null } | null };


export const DeleteSceneByKeyDocument = gql`
    mutation DeleteSceneByKey($projectId: ID!, $sceneKey: String!) {
  deleteSceneByKey(projectId: $projectId, sceneKey: $sceneKey) {
    success
  }
}
    `;
export type DeleteSceneByKeyMutationFn = Apollo.MutationFunction<DeleteSceneByKeyMutation, DeleteSceneByKeyMutationVariables>;

/**
 * __useDeleteSceneByKeyMutation__
 *
 * To run a mutation, you first call `useDeleteSceneByKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSceneByKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSceneByKeyMutation, { data, loading, error }] = useDeleteSceneByKeyMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      sceneKey: // value for 'sceneKey'
 *   },
 * });
 */
export function useDeleteSceneByKeyMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSceneByKeyMutation, DeleteSceneByKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSceneByKeyMutation, DeleteSceneByKeyMutationVariables>(DeleteSceneByKeyDocument, options);
      }
export type DeleteSceneByKeyMutationHookResult = ReturnType<typeof useDeleteSceneByKeyMutation>;
export type DeleteSceneByKeyMutationResult = Apollo.MutationResult<DeleteSceneByKeyMutation>;
export type DeleteSceneByKeyMutationOptions = Apollo.BaseMutationOptions<DeleteSceneByKeyMutation, DeleteSceneByKeyMutationVariables>;