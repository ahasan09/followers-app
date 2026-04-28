// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.

export const environment = {
  production: false,
  apiConfig: {
    github: {
      baseUrl: 'https://api.github.com',
      token: '', // Set via environment variable or local config
      rateLimit: 60 // Requests per hour without token
    }
  }
};
