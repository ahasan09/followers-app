# GitHub Followers App

An Angular application that displays GitHub user profiles and their followers, integrated with Firebase for data persistence.

## Features

- Browse GitHub user profiles
- View followers and following lists
- GitHub profile details (avatar, repos, location, bio)
- Firebase integration for caching/storing data

## Tech Stack

- Angular (CLI v1.6.4)
- TypeScript
- Firebase / AngularFire2

## Prerequisites

- [Node.js](https://nodejs.org/) v10+
- Angular CLI: `npm install -g @angular/cli`

## Getting Started

```bash
git clone https://github.com/ahasan09/followers-app
cd followers-app
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200).

## Commands

| Command | Description |
|---------|-------------|
| `ng serve` | Start dev server on port 4200 |
| `ng build --prod` | Production build to `dist/` |
| `node server.js` | Serve production build with Express |
| `ng test` | Run unit tests (Karma) |
| `ng e2e` | Run end-to-end tests (Protractor) |

## Project Structure

```
src/app/
├── github-followers/   # Followers list component
├── github-profile/     # Profile detail component
├── home/               # Home page
├── navbar/             # Navigation bar
├── posts/              # Posts feature
├── change-password/    # Change password feature
├── common/             # Shared utilities
└── services/           # HTTP and data services
```
