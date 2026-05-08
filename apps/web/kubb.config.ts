import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginClient } from "@kubb/plugin-client";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import { pluginReactQuery } from "@kubb/plugin-react-query";

export default defineConfig(() => {
  return {
    name: "hedis-frontent",
    root: ".",
    input: {
      path: "./api.yaml",
    },
    output: {
      path: "./src/api",
      clean: true,
      write: true,
    },
    plugins: [
      pluginOas(),
      pluginClient({
        importPath: "../../../utils/client.ts",
      }),
      pluginTs(),
      pluginZod({
        output: {
          path: "./zod",
        },
        group: { type: "tag", name: ({ group }) => `${group}Schemas` },
        typed: true,
        dateType: "stringOffset",
        unknownType: "unknown",
        importPath: "zod",
      }),
      pluginReactQuery({
        output: {
          path: "./hooks",
        },
        group: {
          type: "tag",
          name: ({ group }) => `${group}Hooks`,
        },
        client: {
          dataReturnType: "data",
        },
        mutation: {
          methods: ["post", "put", "patch", "delete"],
        },
        query: {
          methods: ["get"],
          importPath: "@tanstack/react-query",
        },
        infinite: {
          queryParam: "page_no",
          cursorParam: undefined,
          initialPageParam: 0,
        },
      }),
    ],
  };
});
