# Software-Integration-Final-Project

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
