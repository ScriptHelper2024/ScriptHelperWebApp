import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateSceneTextMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  textSeed: Types.Scalars['String'];
  title: Types.Scalars['String'];
}>;


export type CreateSceneTextMutation = { __typename: 'Mutations', createSceneText?: { __typename: 'CreateSceneText', sceneText?: { __typename: 'SceneText', sceneKey: string } | null } | null };


export const CreateSceneTextDocument = gql`
    mutation CreateSceneText($projectId: ID!, $textSeed: String!, $title: String!) {
  createSceneText(projectId: $projectId, title: $title, textSeed: $textSeed) {
    sceneText {
      sceneKey
    }
  }
}
    `;
export type CreateSceneTextMutationFn = Apollo.MutationFunction<CreateSceneTextMutation, CreateSceneTextMutationVariables>;

/**
 * __useCreateSceneTextMutation__
 *
 * To run a mutation, you first call `useCreateSceneTextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSceneTextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSceneTextMutation, { data, loading, error }] = useCreateSceneTextMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      textSeed: // value for 'textSeed'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useCreateSceneTextMutation(baseOptions?: Apollo.MutationHookOptions<CreateSceneTextMutation, CreateSceneTextMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSceneTextMutation, CreateSceneTextMutationVariables>(CreateSceneTextDocument, options);
      }
export type CreateSceneTextMutationHookResult = ReturnType<typeof useCreateSceneTextMutation>;
export type CreateSceneTextMutationResult = Apollo.MutationResult<CreateSceneTextMutation>;
export type CreateSceneTextMutationOptions = Apollo.BaseMutationOptions<CreateSceneTextMutation, CreateSceneTextMutationVariables>;