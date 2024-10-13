import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateCharacterProfileMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  name: Types.Scalars['String'];
  textId: Types.Scalars['ID'];
  textSeed?: Types.InputMaybe<Types.Scalars['String']>;
  textContent?: Types.InputMaybe<Types.Scalars['String']>;
  textNotes?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type UpdateCharacterProfileMutation = { __typename: 'Mutations', updateCharacterProfile?: { __typename: 'UpdateCharacterProfile', characterProfile?: { __typename: 'CharacterProfile', id: string, projectId: string, characterKey: string, characterOrder?: number | null, name: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null } | null };


export const UpdateCharacterProfileDocument = gql`
    mutation UpdateCharacterProfile($projectId: ID!, $name: String!, $textId: ID!, $textSeed: String, $textContent: String, $textNotes: String) {
  updateCharacterProfile(
    projectId: $projectId
    name: $name
    textId: $textId
    textSeed: $textSeed
    textContent: $textContent
    textNotes: $textNotes
  ) {
    characterProfile {
      id
      projectId
      characterKey
      characterOrder
      name
      versionType
      sourceVersionNumber
      versionNumber
      versionLabel
      textSeed
      textNotes
      textContent
      characterCount
      llmModel
      createdAt
      createdBy
    }
  }
}
    `;
export type UpdateCharacterProfileMutationFn = Apollo.MutationFunction<UpdateCharacterProfileMutation, UpdateCharacterProfileMutationVariables>;

/**
 * __useUpdateCharacterProfileMutation__
 *
 * To run a mutation, you first call `useUpdateCharacterProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCharacterProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCharacterProfileMutation, { data, loading, error }] = useUpdateCharacterProfileMutation({
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
export function useUpdateCharacterProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCharacterProfileMutation, UpdateCharacterProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCharacterProfileMutation, UpdateCharacterProfileMutationVariables>(UpdateCharacterProfileDocument, options);
      }
export type UpdateCharacterProfileMutationHookResult = ReturnType<typeof useUpdateCharacterProfileMutation>;
export type UpdateCharacterProfileMutationResult = Apollo.MutationResult<UpdateCharacterProfileMutation>;
export type UpdateCharacterProfileMutationOptions = Apollo.BaseMutationOptions<UpdateCharacterProfileMutation, UpdateCharacterProfileMutationVariables>;