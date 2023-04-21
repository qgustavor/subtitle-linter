# Subtitle Linter

A linter for .ass subtitles with a plugin based architecture inspired by ESLint.

## Installing:

1. Clone the project locally
1. `npm install`
1. Download the [LanguageTool server](https://dev.languagetool.org/http-server) and set up it

## Commands:

- `npm run http`: start the HTTP server and browser interface
- `npx nx graph`: open a diagram of the dependencies of the projects.

LanguageTool server needs to be running for the "languagetool" linting rule (it handles orthographic and grammar mistakes). If you don't need it just disable this rule and it will improve performance a lot. Requires Node v18.0.0 or later due to usage of global `fetch` (for some reason `node-fetch` is not working).

Some rules, such as the "invalid-tags" rule, relies on [libjass](https://github.com/Arnavion/libjass/) parsing. This library is no longer supported and may have issues.

## History:

Development started in 2019 and core development stagnated since, because of that the CLI is barebones, it does not support `// eslint-disable-line` like directives and third party plugins might not work. Most of the work went into making the tool easier to work with Brazilian Portuguese Crunchyroll subtitles, so "glyph-whitelist" and "font-whitelist" are rules made specificity to check if a subtitle use a glyph or font their player do not support.

As for the future of this tool many things can be done such as: finishing implementing the CLI, adding more rules as many issues don't get detected, changing LanguageTool's rule config from a blacklist to a whitelist (many rules were added to LanguageTool since 2019, mostly are useless for subtitles and the blacklist is out of date), finding a way to disable useless European Portuguese rules (since LanguageTool Brazilian rules are based on the European Portuguese rules), localizing, documenting features and improving performance.
