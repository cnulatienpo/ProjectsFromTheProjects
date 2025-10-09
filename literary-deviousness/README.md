# Literary Deviousness Project

## Overview
The "Literary Deviousness" project is designed to enhance the writing process through a series of helpers, types, and prompt builders. It aims to provide tools that assist writers at various levels, from early stages to more advanced writing techniques.

## Project Structure
The project is organized into several directories and files, each serving a specific purpose:

- **src/**: Contains the main source code for the project.
  - **app.ts**: The main application entry point.
  - **helpers/**: Contains helper functions for various writing levels.
    - **earlyLevelHelpers.ts**: Early level helpers for initial writing stages.
  - **types/**: Defines TypeScript types used throughout the project.
    - **index.ts**: Exports types for easy access.
  - **promptBuilders/**: Contains functions to build writing prompts.
    - **index.ts**: Exports prompt building functions.
  - **contentGuard/**: Contains scripts to ensure content safety.
    - **guard.ts**: The content guard script that scans markdown files.

- **package.json**: Contains project metadata and npm scripts.
- **tsconfig.json**: TypeScript configuration file.
- **README.md**: Documentation for the project.

## Features
- Early level helpers to assist novice writers.
- Advanced prompt builders for experienced writers.
- Type definitions to ensure type safety across the project.
- A content guard script to maintain the integrity of markdown content.

## Installation
To install the necessary dependencies, run:

```
npm install
```

## Usage
To run the content guard script, use the following npm command:

```
npm run content:guard
```

This will scan the markdown files in the docs directory for any executable code blocks, ensuring that the content is safe and compliant.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.