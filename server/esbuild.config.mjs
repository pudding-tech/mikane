import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  outfile: "build/index.js",
  minify: true,
  external: ["*.env", "*/api.json", "swagger-ui-express"]
});
