/**
 * Strongly typed interfaces for GitHub API data models
 */

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  html_url: string;
  type: 'User' | 'Organization';
  bio?: string;
  blog?: string;
  location?: string;
  email?: string;
  company?: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubFollower {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  html_url: string;
  type: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description?: string;
  url: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface UserComparison {
  user1: GitHubUser;
  user2: GitHubUser;
  commonFollowers: GitHubFollower[];
  user1OnlyFollowers: GitHubFollower[];
  user2OnlyFollowers: GitHubFollower[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
  resetDate: Date;
}
