import { CodegenConfig } from "@graphql-codegen/cli";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log(process.env.NEXT_PUBLIC_GRAPHQL_SERVER_URI);

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_URI,
  documents: ["src/**/!(*.generated).{ts,tsx}"],
  generates: {
    "src/types.ts": {
      plugins: ["typescript"],
      config: {
        nonOptionalTypename: true,
      },
    },
    "src/graphql": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".generated.tsx",
        baseTypesPath: "types.ts",
        folder: "__generated__",
        gqlTagName: "gql",
      },
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: { withHooks: true, nonOptionalTypename: true },
    },
  },
  ignoreNoDocuments: true,
};
export default config;
