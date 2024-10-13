import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateMyUserPreferenceMutationVariables = Types.Exact<{
  defaultLlm: Types.Scalars['String'];
}>;


export type UpdateMyUserPreferenceMutation = { __typename: 'Mutations', updateMyUserPreference?: { __typename: 'UpdateMyUserPreference', userPreference?: { __typename: 'UserPreference', defaultLlm?: string | null } | null } | null };


export const UpdateMyUserPreferenceDocument = gql`
    mutation UpdateMyUserPreference($defaultLlm: String!) {
  updateMyUserPreference(defaultLlm: $defaultLlm) {
    userPreference {
      defaultLlm
    }
  }
}
    `;
export type UpdateMyUserPreferenceMutationFn = Apollo.MutationFunction<UpdateMyUserPreferenceMutation, UpdateMyUserPreferenceMutationVariables>;

/**
 * __useUpdateMyUserPreferenceMutation__
 *
 * To run a mutation, you first call `useUpdateMyUserPreferenceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMyUserPreferenceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMyUserPreferenceMutation, { data, loading, error }] = useUpdateMyUserPreferenceMutation({
 *   variables: {
 *      defaultLlm: // value for 'defaultLlm'
 *   },
 * });
 */
export function useUpdateMyUserPreferenceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMyUserPreferenceMutation, UpdateMyUserPreferenceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMyUserPreferenceMutation, UpdateMyUserPreferenceMutationVariables>(UpdateMyUserPreferenceDocument, options);
      }
export type UpdateMyUserPreferenceMutationHookResult = ReturnType<typeof useUpdateMyUserPreferenceMutation>;
export type UpdateMyUserPreferenceMutationResult = Apollo.MutationResult<UpdateMyUserPreferenceMutation>;
export type UpdateMyUserPreferenceMutationOptions = Apollo.BaseMutationOptions<UpdateMyUserPreferenceMutation, UpdateMyUserPreferenceMutationVariables>;