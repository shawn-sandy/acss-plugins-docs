import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://shawn-sandy.github.io',
  base: '/acss-plugins-docs',
  integrations: [
    starlight({
      title: 'acss-plugins',
      description: 'Developer documentation for acss-kit and acss-utilities — Claude Code plugins for building accessible React components, CSS themes, and atomic utility classes.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/shawn-sandy/agentic-acss-plugins' },
      ],
      editLink: {
        baseUrl: 'https://github.com/shawn-sandy/acss-plugins-docs/edit/main/',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Prerequisites', slug: 'getting-started/prerequisites' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Your First Component', slug: 'getting-started/first-component' },
            { label: 'Your First Theme', slug: 'getting-started/first-theme' },
            { label: 'Your First Utilities', slug: 'getting-started/first-utilities' },
          ],
        },
        {
          label: 'acss-kit',
          items: [
            { label: 'Overview', slug: 'acss-kit/overview' },
            {
              label: 'Commands',
              items: [
                { label: '/setup', slug: 'acss-kit/commands/setup' },
                { label: '/kit-add', slug: 'acss-kit/commands/kit-add' },
                { label: '/kit-create', slug: 'acss-kit/commands/kit-create' },
                { label: '/kit-list', slug: 'acss-kit/commands/kit-list' },
                { label: '/theme-create', slug: 'acss-kit/commands/theme-create' },
                { label: '/theme-brand', slug: 'acss-kit/commands/theme-brand' },
                { label: '/theme-extract', slug: 'acss-kit/commands/theme-extract' },
                { label: '/theme-update', slug: 'acss-kit/commands/theme-update' },
                { label: '/style-tune', slug: 'acss-kit/commands/style-tune' },
              ],
            },
            {
              label: 'Skills',
              items: [
                { label: 'setup skill', slug: 'acss-kit/skills/setup' },
                { label: 'components skill', slug: 'acss-kit/skills/components' },
                { label: 'component-creator skill', slug: 'acss-kit/skills/component-creator' },
                { label: 'styles skill', slug: 'acss-kit/skills/styles' },
                { label: 'component-form (pilot)', slug: 'acss-kit/skills/component-form' },
                { label: 'style-tune (pilot)', slug: 'acss-kit/skills/style-tune' },
              ],
            },
            { label: 'Component Catalogue', slug: 'acss-kit/component-catalogue' },
            { label: 'CSS Variables Reference', slug: 'acss-kit/css-variables' },
            { label: 'OKLCH Theming', slug: 'acss-kit/oklch-theming' },
          ],
        },
        {
          label: 'acss-utilities',
          items: [
            { label: 'Overview', slug: 'acss-utilities/overview' },
            {
              label: 'Commands',
              items: [
                { label: '/utility-add', slug: 'acss-utilities/commands/utility-add' },
                { label: '/utility-list', slug: 'acss-utilities/commands/utility-list' },
                { label: '/utility-tune', slug: 'acss-utilities/commands/utility-tune' },
                { label: '/utility-bridge', slug: 'acss-utilities/commands/utility-bridge' },
              ],
            },
            { label: 'utilities skill', slug: 'acss-utilities/skills/utilities' },
            { label: 'Utility Families', slug: 'acss-utilities/utility-families' },
            { label: 'Token Bridge', slug: 'acss-utilities/token-bridge' },
            { label: 'Responsive Variants', slug: 'acss-utilities/responsive-variants' },
          ],
        },
        {
          label: 'Recipes',
          items: [
            { label: 'Build an Accessible Form', slug: 'recipes/accessible-form' },
            { label: 'Create a Brand Dark Theme', slug: 'recipes/brand-dark-theme' },
            { label: 'Add Utilities to an Existing App', slug: 'recipes/add-utilities' },
            { label: 'Extract a Theme from Figma', slug: 'recipes/figma-theme-extraction' },
            { label: 'Tune Styles with Natural Language', slug: 'recipes/style-tuning' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Python Scripts', slug: 'reference/python-scripts' },
            { label: 'WCAG Contrast Pairs', slug: 'reference/wcag-contrast-pairs' },
            { label: 'Semantic Color Roles', slug: 'reference/semantic-color-roles' },
            { label: 'Troubleshooting', slug: 'reference/troubleshooting' },
          ],
        },
        {
          label: 'Contributing',
          items: [
            { label: 'Plugin Architecture', slug: 'contributing/architecture' },
            { label: 'Authoring Commands', slug: 'contributing/authoring-commands' },
            { label: 'Authoring Skills', slug: 'contributing/authoring-skills' },
            { label: 'Python Script Contracts', slug: 'contributing/python-scripts' },
            { label: 'Local Plugin Testing', slug: 'contributing/local-testing' },
          ],
        },
      ],
    }),
  ],
});
