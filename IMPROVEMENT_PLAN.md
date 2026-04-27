# Improvement Plan: followers-app

## Overview
Angular 5 app showing GitHub followers. Angular 5 is EOL, Firebase integration may use an outdated SDK, and the Express server is a workaround for GitHub Pages rather than a proper deployment setup.

## Improvements

### Modernization (High Priority)
- Upgrade from Angular 5 to Angular 19+
- Replace `.angular-cli.json` with `angular.json`
- Replace TSLint with ESLint + `@angular-eslint`
- Update Firebase SDK to v11+ modular API (if Firebase features are still needed)
- Remove the Express static server workaround — use `ng deploy` with `angular-cli-ghpages` instead

### API & Features
- Add GitHub API authentication (Personal Access Token) to avoid rate limiting (60 req/hr unauthenticated vs 5000 authenticated)
- Add pagination for followers list (GitHub API returns max 30 per page)
- Add a follower detail panel showing repos, bio, and location
- Add follow/unfollow tracking comparison between two users

### Testing
- Add unit tests for the GitHub API service using `HttpClientTestingModule`
- Add component tests for the followers list component
- Add Playwright e2e tests

### Code Quality
- Enable TypeScript `strict` mode
- Add proper TypeScript interfaces for GitHub API response shapes
- Add HTTP error handling (rate limit exceeded, user not found)

### DevOps
- Add GitHub Actions CI: lint + test + build
- Add `ng deploy` to auto-deploy to GitHub Pages on push to `main`
