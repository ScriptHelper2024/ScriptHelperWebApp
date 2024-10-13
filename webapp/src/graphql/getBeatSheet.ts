import gql from "graphql-tag";

export const GET_BEAT_SHEET = gql`
  query GetBeatSheet($textId: ID!, $projectId: ID!, $sceneKey: UUID!) {
    getBeatSheet(textId: $textId, projectId: $projectId, sceneKey: $sceneKey) {
      id
      textContent
    }
  }
`;
