import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateLocationProfileMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  name: Types.Scalars['String'];
  textId: Types.Scalars['ID'];
  textSeed?: Types.InputMaybe<Types.Scalars['String']>;
  textContent?: Types.InputMaybe<Types.Scalars['String']>;
  textNotes?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type UpdateLocationProfileMutation = { __typename: 'Mutations', updateLocationProfile?: { __typename: 'UpdateLocationProfile', locationProfile?: { __typename: 'LocationProfile', id: string, projectId: string, locationKey: string, locationOrder?: number | null, name: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, locationCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null } | null };


export const UpdateLocationProfileDocument = gql`
    mutation UpdateLocationProfile($projectId: ID!, $name: String!, $textId: ID!, $textSeed: String, $textContent: String, $textNotes: String) {
  updateLocationProfile(
    projectId: $projectId
    name: $name
    textId: $textId
    textSeed: $textSeed
    textContent: $textContent
    textNotes: $textNotes
  ) {
    locationProfile {
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
}
    `;
export type UpdateLocationProfileMutationFn = Apollo.MutationFunction<UpdateLocationProfileMutation, UpdateLocationProfileMutationVariables>;

/**
 * __useUpdateLocationProfileMutation__
 *
 * To run a mutation, you first call `useUpdateLocationProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLocationProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLocationProfileMutation, { data, loading, error }] = useUpdateLocationProfileMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      name: // value for 'name'
 *      textId: // value for 'textId'
 *      textSeed: // value for 'textSeed'
 *      textContent: // value for 'textContent'
 *      textNotes: // value for 'textNotes'
 *   },
 * });
 */
export function useUpdateLocationProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLocationProfileMutation, UpdateLocationProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateLocationProfileMutation, UpdateLocationProfileMutationVariables>(UpdateLocationProfileDocument, options);
      }
export type UpdateLocationProfileMutationHookResult = ReturnType<typeof useUpdateLocationProfileMutation>;
export type UpdateLocationProfileMutationResult = Apollo.MutationResult<UpdateLocationProfileMutation>;
export type UpdateLocationProfileMutationOptions = Apollo.BaseMutationOptions<UpdateLocationProfileMutation, UpdateLocationProfileMutationVariables>;