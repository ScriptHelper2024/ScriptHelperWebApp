import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateProjectMutationVariables = Types.Exact<{
  textSeed?: Types.InputMaybe<Types.Scalars['String']>;
  title: Types.Scalars['String'];
}>;


export type CreateProjectMutation = { __typename: 'Mutations', createProject?: { __typename: 'CreateProject', project?: { __typename: 'Project', id: string, title: string, latestStoryTextId?: string | null, createdAt?: any | null, updatedAt?: any | null, archived?: boolean | null, metadata?: any | null, members?: any | null } | null } | null };


export const CreateProjectDocument = gql`
    mutation CreateProject($textSeed: String, $title: String!) {
  createProject(textSeed: $textSeed, title: $title) {
    project {
      id
      title
      latestStoryTextId
      createdAt
      updatedAt
      archived
      metadata
      members
    }
  }
}
    `;
export type CreateProjectMutationFn = Apollo.MutationFunction<CreateProjectMutation, CreateProjectMutationVariables>;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      textSeed: // value for 'textSeed'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useCreateProjectMutation(baseOptions?: Apollo.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, options);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;