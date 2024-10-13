import gql from 'graphql-tag';

export const PROJECTS_QUERY = gql`
    query Projects {
        projects {
            id
            title
            createdAt
            updatedAt
            archived
            metadata
            members
        }
    }
`;