// In CI/CD, replace this file with a version containing real credentials before building.
// Never commit actual API tokens here.
export const environment = {
  production: true,
  apiConfig: {
    github: {
      baseUrl: 'https://api.github.com',
      token: '',
      rateLimit: 5000
    }
  }
};
