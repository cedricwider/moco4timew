# Timewarrior to Moco Sync

A Deno-based tool that synchronizes time tracking data from Timewarrior to Moco,
featuring fuzzy matching for project and task names.

## Features

- Converts Timewarrior intervals to Moco activities
- Smart project/task matching using Jaro-Winkler algorithm
- Handles billable/non-billable time tracking
- Proper error handling and validation
- Debug logging for troubleshooting

## Prerequisites

- [Deno](https://deno.land/) (latest version)
- Timewarrior
- Moco API access token

## Installation

1. Clone this repository
2. Build the binary:

```bash
deno task build
```

## Development

Available tasks:

```bash
deno task dev        # Run with watch mode
deno task test      # Run tests
deno task test:watch # Run tests in watch mode
deno task check     # Type check the codebase
deno task build     # Create binary executable
```

## Configuration

The tool requires:

- Moco API token
- Moco instance URL
- Optional fuzzy matching threshold (default: 0.8)

## Usage

The tool can be used as a Timewarrior hook to automatically sync time entries to
Moco.

Non-billable time can be marked using tags such as:

- vacation
- holiday
- sick
- nobill
- non-billable (and various other variations)

By default, all time entries are considered billable unless tagged otherwise.

## Testing

Run the test suite:

```bash
deno task test
```

## License

[Add your license here]
