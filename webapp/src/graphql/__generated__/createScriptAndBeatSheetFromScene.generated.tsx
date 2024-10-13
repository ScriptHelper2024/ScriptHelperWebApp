import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateScriptAndBeatSheetMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  sceneKey: Types.Scalars['ID'];
  sceneTextId: Types.Scalars['ID'];
  styleGuidelineId?: Types.InputMaybe<Types.Scalars['ID']>;
  scriptDialogFlavorId?: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type GenerateScriptAndBeatSheetMutation = { __typename: 'Mutations', generateScriptAndBeatSheet?: { __typename: 'GenerateScriptAndBeatSheet', agentTaskId?: string | null } | null };


export const GenerateScriptAndBeatSheetDocument = gql`
    mutation GenerateScriptAndBeatSheet($projectId: ID!, $sceneKey: ID!, $sceneTextId: ID!, $styleGuidelineId: ID, $scriptDialogFlavorId: ID) {
  generateScriptAndBeatSheet(
    projectId: $projectId
    sceneKey: $sceneKey
    sceneTextId: $sceneTextId
    scriptDialogFlavorId: $scriptDialogFlavorId
    styleGuidelineId: $styleGuidelineId
  ) {
    agentTaskId
  }
}
    `;
export type GenerateScriptAndBeatSheetMutationFn = Apollo.MutationFunction<GenerateScriptAndBeatSheetMutation, GenerateScriptAndBeatSheetMutationVariables>;

/**
 * __useGenerateScriptAndBeatSheetMutation__
 *
 * To run a mutation, you first call `useGenerateScriptAndBeatSheetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateScriptAndBeatSheetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateScriptAndBeatSheetMutation, { data, loading, error }] = useGenerateScriptAndBeatSheetMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      sceneKey: // value for 'sceneKey'
 *      sceneTextId: // value for 'sceneTextId'
 *      styleGuidelineId: // value for 'styleGuidelineId'
 *      scriptDialogFlavorId: // value for 'scriptDialogFlavorId'
 *   },
 * });
 */
export function useGenerateScriptAndBeatSheetMutation(baseOptions?: Apollo.MutationHookOptions<GenerateScriptAndBeatSheetMutation, GenerateScriptAndBeatSheetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateScriptAndBeatSheetMutation, GenerateScriptAndBeatSheetMutationVariables>(GenerateScriptAndBeatSheetDocument, options);
      }
export type GenerateScriptAndBeatSheetMutationHookResult = ReturnType<typeof useGenerateScriptAndBeatSheetMutation>;
export type GenerateScriptAndBeatSheetMutationResult = Apollo.MutationResult<GenerateScriptAndBeatSheetMutation>;
export type GenerateScriptAndBeatSheetMutationOptions = Apollo.BaseMutationOptions<GenerateScriptAndBeatSheetMutation, GenerateScriptAndBeatSheetMutationVariables>;