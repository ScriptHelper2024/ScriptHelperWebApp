import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateStoryFromUpdateMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  textId: Types.Scalars['ID'];
  textContent?: Types.InputMaybe<Types.Scalars['String']>;
  textSeed?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type GenerateStoryFromUpdateMutation = { __typename: 'Mutations', updateStoryText?: { __typename: 'UpdateStoryText', storyText?: { __typename: 'StoryText', id: string, versionNumber: number, versionLabel?: string | null } | null } | null };


export const GenerateStoryFromUpdateDocument = gql`
    mutation GenerateStoryFromUpdate($projectId: ID!, $textId: ID!, $textContent: String, $textSeed: String) {
  updateStoryText(
    projectId: $projectId
    textId: $textId
    textContent: $textContent
    textSeed: $textSeed
  ) {
    storyText {
      id
      versionNumber
      versionLabel
    }
  }
}
    `;
export type GenerateStoryFromUpdateMutationFn = Apollo.MutationFunction<GenerateStoryFromUpdateMutation, GenerateStoryFromUpdateMutationVariables>;

/**
 * __useGenerateStoryFromUpdateMutation__
 *
 * To run a mutation, you first call `useGenerateStoryFromUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateStoryFromUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateStoryFromUpdateMutation, { data, loading, error }] = useGenerateStoryFromUpdateMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      textId: // value for 'textId'
 *      textContent: // value for 'textContent'
 *      textSeed: // value for 'textSeed'
 *   },
 * });
 */
export function useGenerateStoryFromUpdateMutation(baseOptions?: Apollo.MutationHookOptions<GenerateStoryFromUpdateMutation, GenerateStoryFromUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateStoryFromUpdateMutation, GenerateStoryFromUpdateMutationVariables>(GenerateStoryFromUpdateDocument, options);
      }
export type GenerateStoryFromUpdateMutationHookResult = ReturnType<typeof useGenerateStoryFromUpdateMutation>;
export type GenerateStoryFromUpdateMutationResult = Apollo.MutationResult<GenerateStoryFromUpdateMutation>;
export type GenerateStoryFromUpdateMutationOptions = Apollo.BaseMutationOptions<GenerateStoryFromUpdateMutation, GenerateStoryFromUpdateMutationVariables>;