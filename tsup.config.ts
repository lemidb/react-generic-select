import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2019",
  external: [
    "react",
    "react-dom",

    // shadcn / app-level paths
    "@/lib/utils",
    "@/hooks/use-debounce",
    "@/components/ui/button",
    "@/components/ui/badge",
    "@/components/ui/command",
    "@/components/ui/popover",
    "@/components/ui/separator",
    "@/components/ui/input",

    // icons & helpers
    "lucide-react",
    "class-variance-authority",
  ],
})
