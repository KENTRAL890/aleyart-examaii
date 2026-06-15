# Contributing to ALEYART EXAMAI PRO

Thank you for your interest in contributing to ALEYART EXAMAI PRO.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs
Open a GitHub Issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behaviour
- Environment (OS, Node version, browser)

### Suggesting Features
Open a GitHub Issue with the `enhancement` label.
Describe the use case and how it benefits Ghanaian schools.

### Pull Requests

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the coding standards below
4. Write or update tests
5. Commit with a clear message
   ```bash
   git commit -m "feat: add question import from CSV"
   ```
6. Push and open a Pull Request against `develop`

### Commit Convention (Conventional Commits)

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Formatting (no logic change)
refactor: Code restructure (no feature/bug change)
test:     Adding/updating tests
chore:    Build, config, dependencies
```

### Coding Standards

- **JavaScript**: ES2022+, async/await, no callbacks
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Error handling**: always use try/catch and pass to next(err)
- **Prisma**: use transactions for multi-step operations
- **API responses**: always return `{ success: true/false, data/message }`
- **Security**: never log passwords, tokens, or sensitive data

## Development Setup

```bash
git clone https://github.com/aleyart-academy/examai-pro.git
cd examai-pro/backend
npm install
cp .env.example .env
# Fill in test database and AI credentials
npx prisma migrate dev
node prisma/seed.js
npm run dev
```

## Testing

```bash
npm test          # Run all tests
npm test -- --testPathPattern=auth  # Specific tests
```
