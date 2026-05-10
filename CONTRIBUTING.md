# Contributing to Traveloop

## Branch Naming

```
feature/trip-builder
fix/auth-refresh
chore/seed-data
```

Format: `{type}/{short-description}` where type is one of: `feature`, `fix`, `chore`, `docs`, `refactor`, `test`.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(trips): add drag-and-drop stop reorder
fix(auth): handle expired refresh token edge case
chore(db): add index on cities.country
docs(readme): add setup instructions for Windows
refactor(budget): extract calculation into service layer
test(auth): add signup validation edge cases
```

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] No hardcoded data in production components
- [ ] All inputs validated (client + server)
- [ ] Tests pass (`pytest` / `npm test`)
- [ ] Responsive design checked at 375px, 768px, 1280px
- [ ] Loading, empty, and error states implemented
- [ ] No `console.log` left in production code
- [ ] Migration file included if schema changed

## Code Review

- Minimum **2 team members** must review each PR before merge
- Use "Request Changes" for blocking issues, "Comment" for suggestions
- Approve only after all checklist items are verified

## Development Workflow

1. Create a branch from `main` using the naming convention above
2. Make your changes, commit with conventional commit messages
3. Push and open a PR using the PR template
4. Address review feedback
5. Squash-merge into `main` after approval
