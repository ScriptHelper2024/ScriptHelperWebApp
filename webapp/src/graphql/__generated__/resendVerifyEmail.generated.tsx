import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ResendVerifyEmailMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type ResendVerifyEmailMutation = { __typename: 'Mutations', sendEmailVerification?: { __typename: 'SendEmailVerificationMutation', success?: boolean | null } | null };


export const ResendVerifyEmailDocument = gql`
    mutation ResendVerifyEmail {
  sendEmailVerification {
    success
  }
}
    `;
export type ResendVerifyEmailMutationFn = Apollo.MutationFunction<ResendVerifyEmailMutation, ResendVerifyEmailMutationVariables>;

/**
 * __useResendVerifyEmailMutation__
 *
 * To run a mutation, you first call `useResendVerifyEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendVerifyEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendVerifyEmailMutation, { data, loading, error }] = useResendVerifyEmailMutation({
 *   variables: {
 *   },
 * });
 */
export function useResendVerifyEmailMutation(baseOptions?: Apollo.MutationHookOptions<ResendVerifyEmailMutation, ResendVerifyEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResendVerifyEmailMutation, ResendVerifyEmailMutationVariables>(ResendVerifyEmailDocument, options);
      }
export type ResendVerifyEmailMutationHookResult = ReturnType<typeof useResendVerifyEmailMutation>;
export type ResendVerifyEmailMutationResult = Apollo.MutationResult<ResendVerifyEmailMutation>;
export type ResendVerifyEmailMutationOptions = Apollo.BaseMutationOptions<ResendVerifyEmailMutation, ResendVerifyEmailMutationVariables>;