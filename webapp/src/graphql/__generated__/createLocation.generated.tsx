import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateLocationProfileMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  name: Types.Scalars['String'];
  textSeed?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type CreateLocationProfileMutation = { __typename: 'Mutations', createLocationProfile?: { __typename: 'CreateLocationProfile', locationProfile?: { __typename: 'LocationProfile', id: string, projectId: string, locationKey: string, locationOrder?: number | null, name: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, locationCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null } | null };


export const CreateLocationProfileDocument = gql`
    mutation CreateLocationProfile($projectId: ID!, $name: String!, $textSeed: String) {
  createLocationProfile(projectId: $projectId, name: $name, textSeed: $textSeed) {
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
export type CreateLocationProfileMutationFn = Apollo.MutationFunction<CreateLocationProfileMutation, CreateLocationProfileMutationVariables>;

/**
 * __useCreateLocationProfileMutation__
 *
 * To run a mutation, you first call `useCreateLocationProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLocationProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLocationProfileMutation, { data, loading, error }] = useCreateLocationProfileMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      name: // value for 'name'
 *      textSeed: // value for 'textSeed'
 *   },
 * });
 */
export function useCreateLocationProfileMutation(baseOptions?: Apollo.MutationHookOptions<CreateLocationProfileMutation, CreateLocationProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateLocationProfileMutation, CreateLocationProfileMutationVariables>(CreateLocationProfileDocument, options);
      }
export type CreateLocationProfileMutationHookResult = ReturnType<typeof useCreateLocationProfileMutation>;
export type CreateLocationProfileMutationResult = Apollo.MutationResult<CreateLocationProfileMutation>;
export type CreateLocationProfileMutationOptions = Apollo.BaseMutationOptions<CreateLocationProfileMutation, CreateLocationProfileMutationVariables>;