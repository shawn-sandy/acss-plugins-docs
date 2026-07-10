import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { fileURLToPath } from "url";

// https://astro.build/config
export default defineConfig({
  site: "https://shawn-sandy.github.io",
  base: "/acss-plugins-docs",
  vite: {
    resolve: {
      alias: {
        "~/": fileURLToPath(new URL("./src/", import.meta.url)),
      },
    },
  },
  integrations: [
    starlight({
      title: "acss-plugins",
      description:
        "Developer documentation for acss-kit and acss-utilities — Claude Code plugins for building accessible React components, CSS themes, and atomic utility classes.",
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: false,
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/shawn-sandy/agentic-acss-plugins",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/shawn-sandy/acss-plugins-docs/edit/main/",
      },
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
      },
      customCss: ["./src/styles/acss-tokens.css", "./src/styles/custom.css"],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Prerequisites", slug: "getting-started/prerequisites" },
            { label: "Installation", slug: "getting-started/installation" },
            {
              label: "Your First Component",
              slug: "getting-started/first-component",
            },
            { label: "Your First Theme", slug: "getting-started/first-theme" },
            {
              label: "Your First Utilities",
              slug: "getting-started/first-utilities",
            },
          ],
        },
        {
          label: "acss-kit",
          items: [
            { label: "Overview", slug: "acss-kit/overview" },
            {
              label: "Commands",
              items: [
                { label: "/setup", slug: "acss-kit/commands/setup" },
                { label: "/kit-add", slug: "acss-kit/commands/kit-add" },
                {
                  label: "/color-scale",
                  slug: "acss-kit/commands/color-scale",
                },
                {
                  label: "/kit-add-html (removed)",
                  slug: "acss-kit/commands/kit-add-html",
                },
                { label: "/kit-create", slug: "acss-kit/commands/kit-create" },
                { label: "/kit-list", slug: "acss-kit/commands/kit-list" },
                { label: "/kit-sync", slug: "acss-kit/commands/kit-sync" },
                { label: "/kit-update", slug: "acss-kit/commands/kit-update" },
                {
                  label: "/theme-create",
                  slug: "acss-kit/commands/theme-create",
                },
                {
                  label: "/theme-brand",
                  slug: "acss-kit/commands/theme-brand",
                },
                {
                  label: "/theme-extract",
                  slug: "acss-kit/commands/theme-extract",
                },
                {
                  label: "/theme-update",
                  slug: "acss-kit/commands/theme-update",
                },
                {
                  label: "/theme-from-design",
                  slug: "acss-kit/commands/theme-from-design",
                },
                {
                  label: "/theme-from-figma",
                  slug: "acss-kit/commands/theme-from-figma",
                },
                {
                  label: "/design-export",
                  slug: "acss-kit/commands/design-export",
                },
                { label: "/style-tune", slug: "acss-kit/commands/style-tune" },
                {
                  label: "/prompt-book",
                  slug: "acss-kit/commands/prompt-book",
                },
                {
                  label: "/utility-add",
                  slug: "acss-kit/commands/utility-add",
                },
                {
                  label: "/utility-bridge",
                  slug: "acss-kit/commands/utility-bridge",
                },
                {
                  label: "/utility-list",
                  slug: "acss-kit/commands/utility-list",
                },
                {
                  label: "/utility-tune",
                  slug: "acss-kit/commands/utility-tune",
                },
              ],
            },
            {
              label: "Skills",
              items: [
                { label: "setup skill", slug: "acss-kit/skills/setup" },
                {
                  label: "components skill",
                  slug: "acss-kit/skills/components",
                },
                {
                  label: "components-html skill",
                  slug: "acss-kit/skills/components-html",
                },
                {
                  label: "component-creator skill",
                  slug: "acss-kit/skills/component-creator",
                },
                { label: "styles skill", slug: "acss-kit/skills/styles" },
                { label: "kit-sync skill", slug: "acss-kit/skills/kit-sync" },
                {
                  label: "prompt-book skill",
                  slug: "acss-kit/skills/prompt-book",
                },
                {
                  label: "component-form (pilot)",
                  slug: "acss-kit/skills/component-form",
                },
                {
                  label: "style-tune (pilot)",
                  slug: "acss-kit/skills/style-tune",
                },
                {
                  label: "utilities skill",
                  slug: "acss-kit/skills/utilities",
                },
                {
                  label: "kit-core skill",
                  slug: "acss-kit/skills/kit-core",
                },
                {
                  label: "Component Skills (v1.2)",
                  items: [
                    {
                      label: "component-alert",
                      slug: "acss-kit/skills/component-alert",
                    },
                    {
                      label: "component-button",
                      slug: "acss-kit/skills/component-button",
                    },
                    {
                      label: "component-card",
                      slug: "acss-kit/skills/component-card",
                    },
                    {
                      label: "component-checkbox",
                      slug: "acss-kit/skills/component-checkbox",
                    },
                    {
                      label: "component-dialog",
                      slug: "acss-kit/skills/component-dialog",
                    },
                    {
                      label: "component-field",
                      slug: "acss-kit/skills/component-field",
                    },
                    {
                      label: "component-icon",
                      slug: "acss-kit/skills/component-icon",
                    },
                    {
                      label: "component-icon-button",
                      slug: "acss-kit/skills/component-icon-button",
                    },
                    {
                      label: "component-img",
                      slug: "acss-kit/skills/component-img",
                    },
                    {
                      label: "component-input",
                      slug: "acss-kit/skills/component-input",
                    },
                    {
                      label: "component-link",
                      slug: "acss-kit/skills/component-link",
                    },
                    {
                      label: "component-list",
                      slug: "acss-kit/skills/component-list",
                    },
                    {
                      label: "component-nav",
                      slug: "acss-kit/skills/component-nav",
                    },
                    {
                      label: "component-popover",
                      slug: "acss-kit/skills/component-popover",
                    },
                    {
                      label: "component-table",
                      slug: "acss-kit/skills/component-table",
                    },
                  ],
                },
              ],
            },
            {
              label: "Component Usage Guides",
              items: [
                {
                  label: "Component index",
                  slug: "acss-kit/components",
                },
                { label: "Alert", slug: "acss-kit/components/alert" },
                { label: "Button", slug: "acss-kit/components/button" },
                { label: "Card", slug: "acss-kit/components/card" },
                {
                  label: "Checkbox",
                  slug: "acss-kit/components/checkbox",
                },
                { label: "Dialog", slug: "acss-kit/components/dialog" },
                { label: "Field", slug: "acss-kit/components/field" },
                { label: "Icon", slug: "acss-kit/components/icon" },
                {
                  label: "Icon Button",
                  slug: "acss-kit/components/icon-button",
                },
                { label: "Img", slug: "acss-kit/components/img" },
                { label: "Input", slug: "acss-kit/components/input" },
                { label: "Link", slug: "acss-kit/components/link" },
                { label: "List", slug: "acss-kit/components/list" },
                { label: "Nav", slug: "acss-kit/components/nav" },
                {
                  label: "Popover",
                  slug: "acss-kit/components/popover",
                },
                { label: "Table", slug: "acss-kit/components/table" },
              ],
            },
            {
              label: "Component Catalogue",
              slug: "acss-kit/component-catalogue",
            },
            { label: "Styles Guide", slug: "acss-kit/styles" },
            { label: "Utilities Guide", slug: "acss-kit/utilities" },
            {
              label: "CSS Variables Reference",
              slug: "acss-kit/css-variables",
            },
            { label: "OKLCH Theming", slug: "acss-kit/oklch-theming" },
            {
              label: "Migration Guide (v1.0.0)",
              slug: "acss-kit/migration-v1",
            },
          ],
        },
        {
          label: "acss-utilities",
          items: [
            { label: "Overview", slug: "acss-utilities/overview" },
            {
              label: "Commands",
              items: [
                {
                  label: "/utility-add",
                  slug: "acss-utilities/commands/utility-add",
                },
                {
                  label: "/utility-list",
                  slug: "acss-utilities/commands/utility-list",
                },
                {
                  label: "/utility-tune",
                  slug: "acss-utilities/commands/utility-tune",
                },
                {
                  label: "/utility-bridge",
                  slug: "acss-utilities/commands/utility-bridge",
                },
              ],
            },
            {
              label: "utilities skill",
              slug: "acss-utilities/skills/utilities",
            },
            {
              label: "Utility Families",
              slug: "acss-utilities/utility-families",
            },
            { label: "Token Bridge", slug: "acss-utilities/token-bridge" },
            {
              label: "Responsive Variants",
              slug: "acss-utilities/responsive-variants",
            },
          ],
        },
        {
          label: "style-agent",
          items: [
            { label: "Overview", slug: "style-agent/overview" },
            {
              label: "Tutorial: Your First Class",
              slug: "style-agent/tutorial",
            },
            {
              label: "Commands",
              items: [
                {
                  label: "/css-to-class",
                  slug: "style-agent/commands/css-to-class",
                },
                {
                  label: "/inline-style-to-class",
                  slug: "style-agent/commands/inline-style-to-class",
                },
                {
                  label: "/create-utilities",
                  slug: "style-agent/commands/create-utilities",
                },
              ],
            },
            {
              label: "Skills",
              items: [
                {
                  label: "css-to-class skill",
                  slug: "style-agent/skills/css-to-class",
                },
                {
                  label: "inline-style-to-class skill",
                  slug: "style-agent/skills/inline-style-to-class",
                },
                {
                  label: "create-utilities skill",
                  slug: "style-agent/skills/create-utilities",
                },
              ],
            },
          ],
        },
        {
          label: "Recipes",
          items: [
            {
              label: "Build an Accessible Form",
              slug: "recipes/accessible-form",
            },
            {
              label: "Create a Brand Dark Theme",
              slug: "recipes/brand-dark-theme",
            },
            {
              label: "Add Utilities to an Existing App",
              slug: "recipes/add-utilities",
            },
            {
              label: "Extract a Theme from Figma",
              slug: "recipes/figma-theme-extraction",
            },
            {
              label: "Tune Styles with Natural Language",
              slug: "recipes/style-tuning",
            },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Python Scripts", slug: "reference/python-scripts" },
            {
              label: "WCAG Contrast Pairs",
              slug: "reference/wcag-contrast-pairs",
            },
            {
              label: "Semantic Color Roles",
              slug: "reference/semantic-color-roles",
            },
            { label: "Type Scale", slug: "reference/type-scale" },
            { label: "Troubleshooting", slug: "reference/troubleshooting" },
          ],
        },
        {
          label: "Contributing",
          items: [
            { label: "Plugin Architecture", slug: "contributing/architecture" },
            {
              label: "Authoring Commands",
              slug: "contributing/authoring-commands",
            },
            {
              label: "Authoring Skills",
              slug: "contributing/authoring-skills",
            },
            {
              label: "Python Script Contracts",
              slug: "contributing/python-scripts",
            },
            {
              label: "Local Plugin Testing",
              slug: "contributing/local-testing",
            },
            {
              label: "Framework-Agnostic Design Systems",
              slug: "contributing/framework-agnostic-design-systems",
            },
            {
              label: "Worktree Freshness Hook",
              slug: "contributing/worktree-freshness",
            },
          ],
        },
      ],
    }),
  ],
});
