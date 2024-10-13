import gql from "graphql-tag";

export const GET_FLAVORS = gql`
  query AllScriptDialogFlavors {
    allScriptDialogFlavors {
      scriptDialogFlavors {
        id
        name
      }
    }
  }
`;
