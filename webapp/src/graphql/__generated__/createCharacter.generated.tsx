import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateCharacterProfileMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  name: Types.Scalars['String'];
  textSeed?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type CreateCharacterProfileMutation = { __typename: 'Mutations', createCharacterProfile?: { __typename: 'CreateCharacterProfile', characterProfile?: { __typename: 'CharacterProfile', id: string, projectId: string, characterKey: string, characterOrder?: number | null, name: string, versionType: string, sourceVersionNumber?: number | null, versionNumber: number, versionLabel?: string | null, textSeed?: string | null, textNotes?: string | null, textContent?: string | null, characterCount?: number | null, llmModel?: string | null, createdAt?: any | null, createdBy?: string | null } | null } | null };


export const CreateCharacterProfileDocument = gql`
    mutation CreateCharacterProfile($projectId: ID!, $name: String!, $textSeed: String) {
  createCharacterProfile(projectId: $projectId, name: $name, textSeed: $textSeed) {
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
export type CreateCharacterProfileMutationFn = Apollo.MutationFunction<CreateCharacterProfileMutation, CreateCharacterProfileMutationVariables>;

/**
 * __useCreateCharacterProfileMutation__
 *
 * To run a mutation, you first call `useCreateCharacterProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCharacterProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCharacterProfileMutation, { data, loading, error }] = useCreateCharacterProfileMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      name: // value for 'name'
 *      textSeed: // value for 'textSeed'
 *   },
 * });
 */
export function useCreateCharacterProfileMutation(baseOptions?: Apollo.MutationHookOptions<CreateCharacterProfileMutation, CreateCharacterProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCharacterProfileMutation, CreateCharacterProfileMutationVariables>(CreateCharacterProfileDocument, options);
      }
export type CreateCharacterProfileMutationHookResult = ReturnType<typeof useCreateCharacterProfileMutation>;
export type CreateCharacterProfileMutationResult = Apollo.MutationResult<CreateCharacterProfileMutation>;
export type CreateCharacterProfileMutationOptions = Apollo.BaseMutationOptions<CreateCharacterProfileMutation, CreateCharacterProfileMutationVariables>;