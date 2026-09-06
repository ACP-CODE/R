# extension

## Features

<!-- START_GENERATED_FEATURES -->

### Commands

| Command                      | Title                                | Category |
| ---------------------------- | ------------------------------------ | -------- |
| `r.createProject`            | R: Create Project                    | R        |
| `r.formatDocument`           | R: Format Document                   | R        |
| `r.insertAssignmentOperator` | R: Insert Assignment Operator ( <- ) | R        |
| `r.installRPackages`         | R: Install R Packages                | R        |
| `r.openConsole`              | R: Open Console                      | R        |
| `r.restartLanguageServer`    | R: Restart Language Server           | R        |
| `r.validateProjectFiles`     | R: Validate Project Files            | R        |

### Walkthroughs

- **Get Started with R** — From your first line of R to a shareable report.

<!-- END_GENERATED_FEATURES -->

## Installation

Search for `extension` in the VS Code Marketplace, or run:

```bash
ext install Solus.extension
```

## Configuration

<!-- START_GENERATED_CONFIGURATION -->

### Window Configuration

These settings apply to the whole window and are configured via `settings.json`:

| Key | Default Value | Possible Values | Description |
| --- | ------------- | --------------- | ----------- |

### Workspace Configuration

These settings can be overridden per workspace via `settings.json`:

| Key                                 | Default Value | Possible Values   | Description                                                                         |
| ----------------------------------- | ------------- | ----------------- | ----------------------------------------------------------------------------------- |
| `R.format.enable`                   | `true`        | `true` \| `false` | Format .R files on save using styler.                                               |
| `R.rpath.executable`                | ``            | `<string>`        | Path to the R executable. Leave empty to auto-detect.                               |
| `R.showCreateRProjectInWelcomePage` | `true`        | `true` \| `false` | Show the "Create R Project" welcome content in the Explorer when no folder is open. |

<!-- END_GENERATED_CONFIGURATION -->

## Contributors

<!-- START_GENERATED_CONTRIBUTORS -->

![Contributors](./docs/contributors.svg)

[@JakiChen](https://github.com/JakiChen)
<!-- END_GENERATED_CONTRIBUTORS -->

## Sponsors

<!-- START_GENERATED_SPONSORS -->

[❤️ Sponsor this project](https://slous.inc/sponsor)
<!-- END_GENERATED_SPONSORS -->

## License

MIT
