import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateScriptTextMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  sceneTextId: Types.Scalars['ID'];
  textId: Types.Scalars['ID'];
  textContent?: Types.InputMaybe<Types.Scalars['String']>;
  textNotes?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type UpdateScriptTextMutation = { __typename: 'Mutations', updateScriptText?: { __typename: 'UpdateScriptText', scriptText?: { __typename: 'ScriptText', id: string, versionNumber: number, textContent?: string | null } | null } | null };


export const UpdateScriptTextDocument = gql`
    mutation UpdateScriptText($projectId: ID!, $sceneTextId: ID!, $textId: ID!, $textContent: String, $textNotes: String) {
  updateScriptText(
    projectId: $projectId
    sceneTextId: $sceneTextId
    textContent: $textContent
    textId: $textId
    textNotes: $textNotes
  ) {
    scriptText {
      id
      versionNumber
      textContent
    }
  }
}
    `;
export type UpdateScriptTextMutationFn = Apollo.MutationFunction<UpdateScriptTextMutation, UpdateScriptTextMutationVariables>;

/**
 * __useUpdateScriptTextMutation__
 *
 * To run a mutation, you first call `useUpdateScriptTextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateScriptTextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateScriptTextMutation, { data, loading, error }] = useUpdateScriptTextMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      sceneTextId: // value for 'sceneTextId'
 *      textId: // value for 'textId'
 *      textContent: // value for 'textContent'
 *      textNotes: // value for 'textNotes'
 *   },
 * });
 */
export function useUpdateScriptTextMutation(baseOptions?: Apollo.MutationHookOptions<UpdateScriptTextMutation, UpdateScriptTextMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateScriptTextMutation, UpdateScriptTextMutationVariables>(UpdateScriptTextDocument, options);
      }
export type UpdateScriptTextMutationHookResult = ReturnType<typeof useUpdateScriptTextMutation>;
export type UpdateScriptTextMutationResult = Apollo.MutationResult<UpdateScriptTextMutation>;
export type UpdateScriptTextMutationOptions = Apollo.BaseMutationOptions<UpdateScriptTextMutation, UpdateScriptTextMutationVariables>;