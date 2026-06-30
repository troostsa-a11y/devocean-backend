import { defineConfig, InputTransformerFn } from "orval";
import path from "path";

// Used only by check-codegen-sync.sh — mirrors orval.config.ts exactly except
// output paths are driven by ORVAL_CHECK_TMP_ROOT so we write to a temp
// directory and never touch the committed generated files.

const tmpRoot = process.env.ORVAL_CHECK_TMP_ROOT;
if (!tmpRoot) {
  throw new Error("ORVAL_CHECK_TMP_ROOT must be set when using orval.check.config.ts");
}

const reactOut = path.join(tmpRoot, "api-client-react");
const zodOut = path.join(tmpRoot, "api-zod");

const titleTransformer: InputTransformerFn = (config) => {
  config.info ??= {};
  config.info.title = "Api";
  return config;
};

const specPath = path.resolve(__dirname, "openapi.yaml");

export default defineConfig({
  "api-client-react": {
    input: {
      target: specPath,
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: reactOut,
      target: "generated",
      client: "react-query",
      mode: "split",
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: path.resolve(
            __dirname, "..", "api-client-react", "src", "custom-fetch.ts"
          ),
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: {
      target: specPath,
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: zodOut,
      client: "zod",
      target: "generated",
      schemas: { path: "generated/types", type: "typescript" },
      mode: "split",
      clean: true,
      prettier: true,
      override: {
        zod: {
          coerce: {
            query: ["boolean", "number", "string"],
            param: ["boolean", "number", "string"],
            body: ["bigint", "date"],
            response: ["bigint", "date"],
          },
        },
        useDates: true,
        useBigInt: true,
      },
    },
  },
});
