# Contributing to NinjaX

Thank you for your interest in contributing to NinjaX! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Bugs are tracked as GitHub issues. Before creating a bug report, please check the existing issues to see if the problem has already been reported.

When creating a bug report, please include as much detail as possible:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or logs (if applicable)
- Environment details (OS, Node.js version, NinjaX version)

### Suggesting Enhancements

Enhancement suggestions are also tracked as GitHub issues. When creating an enhancement suggestion, please include:

- A clear and descriptive title
- A detailed description of the proposed enhancement
- Any potential implementation details
- Why this enhancement would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

```bash
# Clone your fork of the repository
git clone https://github.com/NOSIBBiswas22/ninjax.git

# Navigate to the project directory
cd ninjax

# Install dependencies
npm install

# Start the server in development mode
npm run dev
```

### Project Structure

```
ninjax/
├── config/              # Configuration files
├── docs/                # Documentation
├── logs/                # Log files
├── public/              # Static files
├── src/                 # Source code
│   ├── config/          # Configuration handling
│   ├── server/          # Server implementation
│   ├── utils/           # Utility functions
│   └── index.js         # Entry point
├── test/                # Tests
├── package.json         # Dependencies and scripts
└── README.md            # Project overview
```

## Coding Guidelines

### JavaScript Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications. Key points:

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use ES6 features (arrow functions, template literals, etc.)
- Use meaningful variable and function names

### Documentation

- Document all public functions, classes, and modules
- Use JSDoc comments for API documentation
- Keep documentation up-to-date with code changes

### Testing

- Write tests for all new features and bug fixes
- Ensure all tests pass before submitting a pull request
- Aim for high test coverage

## Git Workflow

### Branches

- `main`: The main development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release branches

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```
feat(proxy): add support for WebSocket connections
fix(static): resolve issue with serving index.html
docs: update installation instructions
```

## Release Process

1. Update version number in `package.json`
2. Update CHANGELOG.md
3. Create a new release branch: `release/vX.Y.Z`
4. Create a pull request to merge the release branch into `main`
5. After the pull request is merged, create a new GitHub release

## License

By contributing to NinjaX, you agree that your contributions will be licensed under the project's MIT License.

## Questions?

If you have any questions about contributing, please open an issue or contact the project maintainers.