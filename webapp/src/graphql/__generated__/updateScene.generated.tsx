import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateSceneTextMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  textContent?: Types.InputMaybe<Types.Scalars['String']>;
  textId: Types.Scalars['ID'];
  textNotes?: Types.InputMaybe<Types.Scalars['String']>;
  textSeed?: Types.InputMaybe<Types.Scalars['String']>;
  title?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type UpdateSceneTextMutation = { __typename: 'Mutations', updateSceneText?: { __typename: 'UpdateSceneText', sceneText?: { __typename: 'SceneText', id: string, versionNumber: number, title: string, textContent?: string | null, textNotes?: string | null, textSeed?: string | null } | null } | null };


export const UpdateSceneTextDocument = gql`
    mutation UpdateSceneText($projectId: ID!, $textContent: String, $textId: ID!, $textNotes: String, $textSeed: String, $title: String) {
  updateSceneText(
    projectId: $projectId
    textContent: $textContent
    textId: $textId
    textNotes: $textNotes
    textSeed: $textSeed
    title: $title
  ) {
    sceneText {
      id
      versionNumber
      title
      textContent
      textNotes
      textSeed
    }
  }
}
    `;
export type UpdateSceneTextMutationFn = Apollo.MutationFunction<UpdateSceneTextMutation, UpdateSceneTextMutationVariables>;

/**
 * __useUpdateSceneTextMutation__
 *
 * To run a mutation, you first call `useUpdateSceneTextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneTextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneTextMutation, { data, loading, error }] = useUpdateSceneTextMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      textContent: // value for 'textContent'
 *      textId: // value for 'textId'
 *      textNotes: // value for 'textNotes'
 *      textSeed: // value for 'textSeed'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useUpdateSceneTextMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneTextMutation, UpdateSceneTextMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneTextMutation, UpdateSceneTextMutationVariables>(UpdateSceneTextDocument, options);
      }
export type UpdateSceneTextMutationHookResult = ReturnType<typeof useUpdateSceneTextMutation>;
export type UpdateSceneTextMutationResult = Apollo.MutationResult<UpdateSceneTextMutation>;
export type UpdateSceneTextMutationOptions = Apollo.BaseMutationOptions<UpdateSceneTextMutation, UpdateSceneTextMutationVariables>;