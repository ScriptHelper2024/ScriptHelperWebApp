import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateMakeScenesMutationVariables = Types.Exact<{
  storyTextId: Types.Scalars['ID'];
  projectId: Types.Scalars['ID'];
  sceneCount: Types.Scalars['Int'];
}>;


export type GenerateMakeScenesMutation = { __typename: 'Mutations', generateMakeScenes?: { __typename: 'GenerateMakeScenes', agentTaskId?: string | null } | null };


export const GenerateMakeScenesDocument = gql`
    mutation GenerateMakeScenes($storyTextId: ID!, $projectId: ID!, $sceneCount: Int!) {
  generateMakeScenes(
    storyTextId: $storyTextId
    projectId: $projectId
    sceneCount: $sceneCount
  ) {
    agentTaskId
  }
}
    `;
export type GenerateMakeScenesMutationFn = Apollo.MutationFunction<GenerateMakeScenesMutation, GenerateMakeScenesMutationVariables>;

/**
 * __useGenerateMakeScenesMutation__
 *
 * To run a mutation, you first call `useGenerateMakeScenesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateMakeScenesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateMakeScenesMutation, { data, loading, error }] = useGenerateMakeScenesMutation({
 *   variables: {
 *      storyTextId: // value for 'storyTextId'
 *      projectId: // value for 'projectId'
 *      sceneCount: // value for 'sceneCount'
 *   },
 * });
 */
export function useGenerateMakeScenesMutation(baseOptions?: Apollo.MutationHookOptions<GenerateMakeScenesMutation, GenerateMakeScenesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateMakeScenesMutation, GenerateMakeScenesMutationVariables>(GenerateMakeScenesDocument, options);
      }
export type GenerateMakeScenesMutationHookResult = ReturnType<typeof useGenerateMakeScenesMutation>;
export type GenerateMakeScenesMutationResult = Apollo.MutationResult<GenerateMakeScenesMutation>;
export type GenerateMakeScenesMutationOptions = Apollo.BaseMutationOptions<GenerateMakeScenesMutation, GenerateMakeScenesMutationVariables>;