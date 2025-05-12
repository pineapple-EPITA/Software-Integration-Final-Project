# Software-Integration-Final-Project

This project implements a RESTful API with authentication, MongoDB and PostgreSQL database connections, and various environment configurations.

## Requirements

To run this project, you need:

- Node.js (v18.x or later)
- npm (v8.x or later)
- MongoDB instance (one for each environment)
- PostgreSQL database (one for each environment)
- Git

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/pineapple-EPITA/Software-Integration-Final-Project.git
cd Software-Integration-Final-Project
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create environment files for the environment you want to run. Use the template in `.env.template` as a guide:

- `.env.dev` - Development environment
- `.env.release` - Release environment
- `.env.pprod` - Pre-production environment
- `.env.prod` - Production environment

Example for dev environment:

```bash
# .env.dev
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dev-database
DB_USER=postgres_user
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=5432
DB_NAME=dev_database
SESSION_SECRET=your_dev_session_secret
PORT=8080
```

4. **Run the application in the desired environment**

```bash
# Development
npm run start:dev

# Release
npm run start:release  

# Pre-production
npm run start:pprod

# Production
npm run start:prod
```

5. **Run tests**

```bash
npm test
```

## Database Setup

### MongoDB

You need to set up four MongoDB databases (one for each environment):
- Create a MongoDB Atlas account or use a local MongoDB server
- Create separate databases for each environment
- Configure the connection strings in your environment files

### PostgreSQL

You need to set up four PostgreSQL databases (one for each environment):
- Install PostgreSQL or use a cloud provider like AWS RDS
- Create separate databases for each environment
- Configure the connection details in your environment files

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD. The workflows are configured to:
- Run tests and linting on pull requests
- Deploy to the appropriate EC2 instance on pushes to main (production) or develop (development)

## Project Structure

```
├── .github/       # GitHub Actions workflows
├── dist/          # Compiled output
├── src/           # Source code
│   ├── boot/      # Application bootstrap code
│   ├── constants/ # Constants and enums
│   ├── controllers/ # Route controllers
│   ├── middleware/ # Express middleware
│   ├── models/    # Database models
│   ├── routes/    # Route definitions
│   ├── types/     # TypeScript type definitions
│   └── __tests__/ # Test files
├── .env.*         # Environment configurations (not in repo)
├── .eslintrc.json # ESLint configuration
├── jest.config.cjs # Jest configuration
└── tsconfig.json  # TypeScript configuration
```

## Contributing

1. Create a feature branch: `git checkout -b feat/feature-name`
2. Make your changes
3. Follow commit message conventions: `type: description`
4. Push and create a pull request

## License

This project is licensed under the MIT License.

## Commit Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. All commit messages must follow this format:

```
<type>: <description>
```

- Recommended types: ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']

For example:

```
chore: set up lint and prettier
docs: update installation instructions
test: add Unit tests using Jest
```

A git hook is in place to enforce this convention. See [Commit Convention](docs/COMMIT_CONVENTION.md) for details.

### Setting project

After cloning the repository, run this command to set up node.js

```bash
npm install
npm run prepare
```

If your commit message does not follow the format, the commit will be blocked.
