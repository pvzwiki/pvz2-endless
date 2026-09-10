import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";
import { MathDisplay } from "@/components/math-display";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    span: (props: ComponentProps<"span">) =>
      props.className?.split(" ").includes("katex-display") ? (
        <MathDisplay {...props} />
      ) : (
        <span {...props} />
      ),
    ...components,
  };
}
