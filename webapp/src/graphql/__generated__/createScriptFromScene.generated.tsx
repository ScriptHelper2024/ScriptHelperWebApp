import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateScriptTextFromSceneMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  sceneKey: Types.Scalars['ID'];
  sceneTextId: Types.Scalars['ID'];
  includeBeatSheet: Types.Scalars['Boolean'];
  scriptDialogFlavorId?: Types.InputMaybe<Types.Scalars['ID']>;
  styleGuidelineId?: Types.InputMaybe<Types.Scalars['ID']>;
  textId: Types.Scalars['ID'];
}>;


export type GenerateScriptTextFromSceneMutation = { __typename: 'Mutations', generateScriptTextFromScene?: { __typename: 'GenerateScriptTextFromScene', agentTaskId?: string | null } | null };


export const GenerateScriptTextFromSceneDocument = gql`
    mutation GenerateScriptTextFromScene($projectId: ID!, $sceneKey: ID!, $sceneTextId: ID!, $includeBeatSheet: Boolean!, $scriptDialogFlavorId: ID, $styleGuidelineId: ID, $textId: ID!) {
  generateScriptTextFromScene(
    projectId: $projectId
    sceneKey: $sceneKey
    sceneTextId: $sceneTextId
    includeBeatSheet: $includeBeatSheet
    scriptDialogFlavorId: $scriptDialogFlavorId
    styleGuidelineId: $styleGuidelineId
    textId: $textId
  ) {
    agentTaskId
  }
}
    `;
export type GenerateScriptTextFromSceneMutationFn = Apollo.MutationFunction<GenerateScriptTextFromSceneMutation, GenerateScriptTextFromSceneMutationVariables>;

/**
 * __useGenerateScriptTextFromSceneMutation__
 *
 * To run a mutation, you first call `useGenerateScriptTextFromSceneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateScriptTextFromSceneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateScriptTextFromSceneMutation, { data, loading, error }] = useGenerateScriptTextFromSceneMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      sceneKey: // value for 'sceneKey'
 *      sceneTextId: // value for 'sceneTextId'
 *      includeBeatSheet: // value for 'includeBeatSheet'
 *      scriptDialogFlavorId: // value for 'scriptDialogFlavorId'
 *      styleGuidelineId: // value for 'styleGuidelineId'
 *      textId: // value for 'textId'
 *   },
 * });
 */
export function useGenerateScriptTextFromSceneMutation(baseOptions?: Apollo.MutationHookOptions<GenerateScriptTextFromSceneMutation, GenerateScriptTextFromSceneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateScriptTextFromSceneMutation, GenerateScriptTextFromSceneMutationVariables>(GenerateScriptTextFromSceneDocument, options);
      }
export type GenerateScriptTextFromSceneMutationHookResult = ReturnType<typeof useGenerateScriptTextFromSceneMutation>;
export type GenerateScriptTextFromSceneMutationResult = Apollo.MutationResult<GenerateScriptTextFromSceneMutation>;
export type GenerateScriptTextFromSceneMutationOptions = Apollo.BaseMutationOptions<GenerateScriptTextFromSceneMutation, GenerateScriptTextFromSceneMutationVariables>;