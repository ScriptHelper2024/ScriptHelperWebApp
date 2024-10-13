import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateSceneFromSeedMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  textId: Types.Scalars['ID'];
  textSeed: Types.Scalars['String'];
}>;


export type GenerateSceneFromSeedMutation = { __typename: 'Mutations', generateSceneFromSeed?: { __typename: 'GenerateSceneFromSeed', agentTaskId?: string | null } | null };


export const GenerateSceneFromSeedDocument = gql`
    mutation GenerateSceneFromSeed($projectId: ID!, $textId: ID!, $textSeed: String!) {
  generateSceneFromSeed(
    projectId: $projectId
    textId: $textId
    textSeed: $textSeed
  ) {
    agentTaskId
  }
}
    `;
export type GenerateSceneFromSeedMutationFn = Apollo.MutationFunction<GenerateSceneFromSeedMutation, GenerateSceneFromSeedMutationVariables>;

/**
 * __useGenerateSceneFromSeedMutation__
 *
 * To run a mutation, you first call `useGenerateSceneFromSeedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateSceneFromSeedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateSceneFromSeedMutation, { data, loading, error }] = useGenerateSceneFromSeedMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      textId: // value for 'textId'
 *      textSeed: // value for 'textSeed'
 *   },
 * });
 */
export function useGenerateSceneFromSeedMutation(baseOptions?: Apollo.MutationHookOptions<GenerateSceneFromSeedMutation, GenerateSceneFromSeedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateSceneFromSeedMutation, GenerateSceneFromSeedMutationVariables>(GenerateSceneFromSeedDocument, options);
      }
export type GenerateSceneFromSeedMutationHookResult = ReturnType<typeof useGenerateSceneFromSeedMutation>;
export type GenerateSceneFromSeedMutationResult = Apollo.MutationResult<GenerateSceneFromSeedMutation>;
export type GenerateSceneFromSeedMutationOptions = Apollo.BaseMutationOptions<GenerateSceneFromSeedMutation, GenerateSceneFromSeedMutationVariables>;