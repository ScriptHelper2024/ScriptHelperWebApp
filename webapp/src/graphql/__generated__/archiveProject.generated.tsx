import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ArchiveProjectMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
}>;


export type ArchiveProjectMutation = { __typename: 'Mutations', archiveProject?: { __typename: 'ArchiveProject', success?: boolean | null } | null };


export const ArchiveProjectDocument = gql`
    mutation ArchiveProject($projectId: ID!) {
  archiveProject(projectId: $projectId) {
    success
  }
}
    `;
export type ArchiveProjectMutationFn = Apollo.MutationFunction<ArchiveProjectMutation, ArchiveProjectMutationVariables>;

/**
 * __useArchiveProjectMutation__
 *
 * To run a mutation, you first call `useArchiveProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveProjectMutation, { data, loading, error }] = useArchiveProjectMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useArchiveProjectMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveProjectMutation, ArchiveProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ArchiveProjectMutation, ArchiveProjectMutationVariables>(ArchiveProjectDocument, options);
      }
export type ArchiveProjectMutationHookResult = ReturnType<typeof useArchiveProjectMutation>;
export type ArchiveProjectMutationResult = Apollo.MutationResult<ArchiveProjectMutation>;
export type ArchiveProjectMutationOptions = Apollo.BaseMutationOptions<ArchiveProjectMutation, ArchiveProjectMutationVariables>;