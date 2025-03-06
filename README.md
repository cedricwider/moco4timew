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

### Environment Variables Setup

1. Copy the example environment file to create your own local environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and set your actual credentials:
   ```
   MOCO_API_KEY=your_actual_api_key_here
   MOCO_INSTANCE_URL=your_instance_url_here
   ```

3. **Important:** The `.env` file contains sensitive information and should **never** be committed to version control. It's already included in `.gitignore` to prevent accidental commits.

When using the Devbox development environment, these environment variables will be automatically loaded through the `.envrc` file.

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
