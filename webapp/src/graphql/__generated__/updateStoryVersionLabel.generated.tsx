import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateStoryVersionLabelMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  storyTextId: Types.Scalars['ID'];
  versionLabel: Types.Scalars['String'];
  versionNumber: Types.Scalars['Int'];
}>;


export type UpdateStoryVersionLabelMutation = { __typename: 'Mutations', updateStoryVersionLabel?: { __typename: 'UpdateStoryVersionLabel', success?: boolean | null } | null };


export const UpdateStoryVersionLabelDocument = gql`
    mutation UpdateStoryVersionLabel($projectId: ID!, $storyTextId: ID!, $versionLabel: String!, $versionNumber: Int!) {
  updateStoryVersionLabel(
    projectId: $projectId
    storyTextId: $storyTextId
    versionLabel: $versionLabel
    versionNumber: $versionNumber
  ) {
    success
  }
}
    `;
export type UpdateStoryVersionLabelMutationFn = Apollo.MutationFunction<UpdateStoryVersionLabelMutation, UpdateStoryVersionLabelMutationVariables>;

/**
 * __useUpdateStoryVersionLabelMutation__
 *
 * To run a mutation, you first call `useUpdateStoryVersionLabelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateStoryVersionLabelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateStoryVersionLabelMutation, { data, loading, error }] = useUpdateStoryVersionLabelMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      storyTextId: // value for 'storyTextId'
 *      versionLabel: // value for 'versionLabel'
 *      versionNumber: // value for 'versionNumber'
 *   },
 * });
 */
export function useUpdateStoryVersionLabelMutation(baseOptions?: Apollo.MutationHookOptions<UpdateStoryVersionLabelMutation, UpdateStoryVersionLabelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateStoryVersionLabelMutation, UpdateStoryVersionLabelMutationVariables>(UpdateStoryVersionLabelDocument, options);
      }
export type UpdateStoryVersionLabelMutationHookResult = ReturnType<typeof useUpdateStoryVersionLabelMutation>;
export type UpdateStoryVersionLabelMutationResult = Apollo.MutationResult<UpdateStoryVersionLabelMutation>;
export type UpdateStoryVersionLabelMutationOptions = Apollo.BaseMutationOptions<UpdateStoryVersionLabelMutation, UpdateStoryVersionLabelMutationVariables>;