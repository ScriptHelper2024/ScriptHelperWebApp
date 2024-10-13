import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateScriptTextWithNotesMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  textId: Types.Scalars['ID'];
  textNotes: Types.Scalars['String'];
  selectTextEnd?: Types.InputMaybe<Types.Scalars['Int']>;
  selectTextStart?: Types.InputMaybe<Types.Scalars['Int']>;
  includeBeatSheet?: Types.InputMaybe<Types.Scalars['Boolean']>;
  sceneKey: Types.Scalars['ID'];
}>;


export type GenerateScriptTextWithNotesMutation = { __typename: 'Mutations', generateScriptTextWithNotes?: { __typename: 'GenerateScriptTextWithNotes', agentTaskId?: string | null } | null };


export const GenerateScriptTextWithNotesDocument = gql`
    mutation GenerateScriptTextWithNotes($projectId: ID!, $textId: ID!, $textNotes: String!, $selectTextEnd: Int, $selectTextStart: Int, $includeBeatSheet: Boolean, $sceneKey: ID!) {
  generateScriptTextWithNotes(
    projectId: $projectId
    textId: $textId
    textNotes: $textNotes
    selectTextEnd: $selectTextEnd
    selectTextStart: $selectTextStart
    includeBeatSheet: $includeBeatSheet
    sceneKey: $sceneKey
  ) {
    agentTaskId
  }
}
    `;
export type GenerateScriptTextWithNotesMutationFn = Apollo.MutationFunction<GenerateScriptTextWithNotesMutation, GenerateScriptTextWithNotesMutationVariables>;

/**
 * __useGenerateScriptTextWithNotesMutation__
 *
 * To run a mutation, you first call `useGenerateScriptTextWithNotesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateScriptTextWithNotesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateScriptTextWithNotesMutation, { data, loading, error }] = useGenerateScriptTextWithNotesMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      textId: // value for 'textId'
 *      textNotes: // value for 'textNotes'
 *      selectTextEnd: // value for 'selectTextEnd'
 *      selectTextStart: // value for 'selectTextStart'
 *      includeBeatSheet: // value for 'includeBeatSheet'
 *      sceneKey: // value for 'sceneKey'
 *   },
 * });
 */
export function useGenerateScriptTextWithNotesMutation(baseOptions?: Apollo.MutationHookOptions<GenerateScriptTextWithNotesMutation, GenerateScriptTextWithNotesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateScriptTextWithNotesMutation, GenerateScriptTextWithNotesMutationVariables>(GenerateScriptTextWithNotesDocument, options);
      }
export type GenerateScriptTextWithNotesMutationHookResult = ReturnType<typeof useGenerateScriptTextWithNotesMutation>;
export type GenerateScriptTextWithNotesMutationResult = Apollo.MutationResult<GenerateScriptTextWithNotesMutation>;
export type GenerateScriptTextWithNotesMutationOptions = Apollo.BaseMutationOptions<GenerateScriptTextWithNotesMutation, GenerateScriptTextWithNotesMutationVariables>;