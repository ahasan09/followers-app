# Followers App

Angular 5 application that displays GitHub followers, with Firebase integration and a GitHub Pages deployment setup via an Express static server.

## Tech Stack
- Angular 5
- Firebase
- Express (static server)
- TypeScript

## Project Structure
```
followers-app/
├── src/
│   └── app/
├── server.js            # Express static server for GitHub Pages deploy
├── .angular-cli.json
└── package.json
```

## Development
```bash
# Install dependencies
npm install

# Run development server
ng serve

# Build
ng build --prod

# Serve production build locally
node server.js
```

## Key Notes
- Uses legacy `.angular-cli.json` (Angular 5 era).
- `server.js` is an Express static server used for GitHub Pages deployment.
