import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateSceneWithNotesMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  textId: Types.Scalars['ID'];
  textNotes: Types.Scalars['String'];
  selectTextEnd?: Types.InputMaybe<Types.Scalars['Int']>;
  selectTextStart?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type GenerateSceneWithNotesMutation = { __typename: 'Mutations', generateSceneWithNotes?: { __typename: 'GenerateSceneWithNotes', agentTaskId?: string | null } | null };


export const GenerateSceneWithNotesDocument = gql`
    mutation GenerateSceneWithNotes($projectId: ID!, $textId: ID!, $textNotes: String!, $selectTextEnd: Int, $selectTextStart: Int) {
  generateSceneWithNotes(
    projectId: $projectId
    textId: $textId
    textNotes: $textNotes
    selectTextEnd: $selectTextEnd
    selectTextStart: $selectTextStart
  ) {
    agentTaskId
  }
}
    `;
export type GenerateSceneWithNotesMutationFn = Apollo.MutationFunction<GenerateSceneWithNotesMutation, GenerateSceneWithNotesMutationVariables>;

/**
 * __useGenerateSceneWithNotesMutation__
 *
 * To run a mutation, you first call `useGenerateSceneWithNotesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateSceneWithNotesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateSceneWithNotesMutation, { data, loading, error }] = useGenerateSceneWithNotesMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      textId: // value for 'textId'
 *      textNotes: // value for 'textNotes'
 *      selectTextEnd: // value for 'selectTextEnd'
 *      selectTextStart: // value for 'selectTextStart'
 *   },
 * });
 */
export function useGenerateSceneWithNotesMutation(baseOptions?: Apollo.MutationHookOptions<GenerateSceneWithNotesMutation, GenerateSceneWithNotesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateSceneWithNotesMutation, GenerateSceneWithNotesMutationVariables>(GenerateSceneWithNotesDocument, options);
      }
export type GenerateSceneWithNotesMutationHookResult = ReturnType<typeof useGenerateSceneWithNotesMutation>;
export type GenerateSceneWithNotesMutationResult = Apollo.MutationResult<GenerateSceneWithNotesMutation>;
export type GenerateSceneWithNotesMutationOptions = Apollo.BaseMutationOptions<GenerateSceneWithNotesMutation, GenerateSceneWithNotesMutationVariables>;