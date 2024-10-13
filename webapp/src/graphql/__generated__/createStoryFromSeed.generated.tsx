import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateStoryFromSeedMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  textId: Types.Scalars['ID'];
  textSeed: Types.Scalars['String'];
}>;


export type GenerateStoryFromSeedMutation = { __typename: 'Mutations', generateStoryFromSeed?: { __typename: 'GenerateStoryFromSeed', agentTaskId?: string | null } | null };


export const GenerateStoryFromSeedDocument = gql`
    mutation GenerateStoryFromSeed($projectId: ID!, $textId: ID!, $textSeed: String!) {
  generateStoryFromSeed(
    projectId: $projectId
    textId: $textId
    textSeed: $textSeed
  ) {
    agentTaskId
  }
}
    `;
export type GenerateStoryFromSeedMutationFn = Apollo.MutationFunction<GenerateStoryFromSeedMutation, GenerateStoryFromSeedMutationVariables>;

/**
 * __useGenerateStoryFromSeedMutation__
 *
 * To run a mutation, you first call `useGenerateStoryFromSeedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateStoryFromSeedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateStoryFromSeedMutation, { data, loading, error }] = useGenerateStoryFromSeedMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      textId: // value for 'textId'
 *      textSeed: // value for 'textSeed'
 *   },
 * });
 */
export function useGenerateStoryFromSeedMutation(baseOptions?: Apollo.MutationHookOptions<GenerateStoryFromSeedMutation, GenerateStoryFromSeedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateStoryFromSeedMutation, GenerateStoryFromSeedMutationVariables>(GenerateStoryFromSeedDocument, options);
      }
export type GenerateStoryFromSeedMutationHookResult = ReturnType<typeof useGenerateStoryFromSeedMutation>;
export type GenerateStoryFromSeedMutationResult = Apollo.MutationResult<GenerateStoryFromSeedMutation>;
export type GenerateStoryFromSeedMutationOptions = Apollo.BaseMutationOptions<GenerateStoryFromSeedMutation, GenerateStoryFromSeedMutationVariables>;