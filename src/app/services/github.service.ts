import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer, of, switchMap } from 'rxjs';
import { catchError, retry, timeout, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  GitHubUser,
  GitHubFollower,
  GitHubRepository,
  PaginationParams,
  PaginatedResponse,
  UserComparison,
  ApiError,
  RateLimitStatus
} from '../models/github.model';

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private readonly apiUrl = environment.apiConfig.github.baseUrl;
  private readonly token = environment.apiConfig.github.token;
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds
  private readonly MAX_RETRIES = 2;
  private rateLimitStatus: RateLimitStatus | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Get a GitHub user by username
   */
  getUser(username: string): Observable<GitHubUser> {
    const url = `${this.apiUrl}/users/${username}`;

    return this.http.get<GitHubUser>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          console.warn(`Retry attempt ${retryCount} for user ${username}`);
          return timer(Math.pow(2, retryCount) * 1000);
        }
      }),
      tap(response => this.updateRateLimit(response)),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get followers for a GitHub user with pagination
   */
  getFollowers(
    username: string,
    pagination: PaginationParams
  ): Observable<PaginatedResponse<GitHubFollower>> {
    const url = `${this.apiUrl}/users/${username}/followers`;
    const params = new HttpParams()
      .set('page', String(pagination.page))
      .set('per_page', String(pagination.per_page));

    return this.http.get<GitHubFollower[]>(url, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          console.warn(`Retry attempt ${retryCount} for followers`);
          return timer(Math.pow(2, retryCount) * 1000);
        }
      }),
      map(data => this.buildPaginatedResponse(data, pagination)),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get repositories for a GitHub user
   */
  getUserRepositories(
    username: string,
    pagination: PaginationParams
  ): Observable<PaginatedResponse<GitHubRepository>> {
    const url = `${this.apiUrl}/users/${username}/repos`;
    const params = new HttpParams()
      .set('page', String(pagination.page))
      .set('per_page', String(pagination.per_page))
      .set('sort', 'updated')
      .set('direction', 'desc');

    return this.http.get<GitHubRepository[]>(url, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Compare followers between two users
   */
  compareFollowers(
    username1: string,
    username2: string
  ): Observable<UserComparison> {
    return new Observable(observer => {
      let user1: GitHubUser;
      let user2: GitHubUser;
      let followers1: GitHubFollower[] = [];
      let followers2: GitHubFollower[] = [];
      let page1 = 1;
      let page2 = 1;
      const perPage = 100;

      // Fetch first user
      this.getUser(username1).subscribe(
        user => {
          user1 = user;
          this.fetchAllFollowers(username1, 1, perPage, []).subscribe(
            followers => {
              followers1 = followers;
              this.getUser(username2).subscribe(
                user => {
                  user2 = user;
                  this.fetchAllFollowers(username2, 1, perPage, []).subscribe(
                    followers => {
                      followers2 = followers;
                      const comparison = this.computeComparison(
                        user1,
                        user2,
                        followers1,
                        followers2
                      );
                      observer.next(comparison);
                      observer.complete();
                    },
                    error => observer.error(error)
                  );
                },
                error => observer.error(error)
              );
            },
            error => observer.error(error)
          );
        },
        error => observer.error(error)
      );
    });
  }

  /**
   * Get rate limit status
   */
  getRateLimit(): Observable<RateLimitStatus> {
    const url = `${this.apiUrl}/rate_limit`;

    return this.http.get<any>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => ({
        limit: response.resources.core.limit,
        remaining: response.resources.core.remaining,
        reset: response.resources.core.reset,
        resetDate: new Date(response.resources.core.reset * 1000)
      })),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get cached rate limit status
   */
  getCachedRateLimit(): RateLimitStatus | null {
    return this.rateLimitStatus;
  }

  /**
   * Fetch all followers (handles pagination internally)
   */
  private fetchAllFollowers(
    username: string,
    page: number,
    perPage: number,
    accumulated: GitHubFollower[]
  ): Observable<GitHubFollower[]> {
    const url = `${this.apiUrl}/users/${username}/followers`;
    const params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(perPage));

    return this.http.get<GitHubFollower[]>(url, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      switchMap(followers => {
        const combined = [...accumulated, ...followers];
        // Continue fetching if we got a full page
        if (followers.length === perPage) {
          return this.fetchAllFollowers(username, page + 1, perPage, combined);
        }
        return of(combined);
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Compute comparison between two users' followers
   */
  private computeComparison(
    user1: GitHubUser,
    user2: GitHubUser,
    followers1: GitHubFollower[],
    followers2: GitHubFollower[]
  ): UserComparison {
    const set1 = new Set(followers1.map(f => f.login));
    const set2 = new Set(followers2.map(f => f.login));

    const commonFollowers = followers1.filter(f => set2.has(f.login));
    const user1OnlyFollowers = followers1.filter(f => !set2.has(f.login));
    const user2OnlyFollowers = followers2.filter(f => !set1.has(f.login));

    return {
      user1,
      user2,
      commonFollowers,
      user1OnlyFollowers,
      user2OnlyFollowers
    };
  }

  /**
   * Build paginated response
   */
  private buildPaginatedResponse<T>(
    data: T[],
    pagination: PaginationParams
  ): PaginatedResponse<T> {
    return {
      data,
      pagination: {
        page: pagination.page,
        per_page: pagination.per_page,
        total: data.length,
        total_pages: Math.ceil(data.length / pagination.per_page)
      }
    };
  }

  /**
   * Update rate limit status from response headers
   */
  private updateRateLimit(response: any): void {
    // Rate limit info can be extracted from response headers if available
    if (response.headers && response.headers.get) {
      const limit = response.headers.get('x-ratelimit-limit');
      const remaining = response.headers.get('x-ratelimit-remaining');
      const reset = response.headers.get('x-ratelimit-reset');

      if (limit && remaining && reset) {
        this.rateLimitStatus = {
          limit: parseInt(limit, 10),
          remaining: parseInt(remaining, 10),
          reset: parseInt(reset, 10),
          resetDate: new Date(parseInt(reset, 10) * 1000)
        };
      }
    }
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let apiError: ApiError;

    if (error instanceof HttpErrorResponse) {
      apiError = {
        code: `HTTP_${error.status}`,
        message: this.getErrorMessage(error.status),
        statusCode: error.status,
        details: error.error
      };

      console.error('GitHub API error:', apiError);
    } else {
      apiError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500,
        details: { originalError: error.message }
      };

      console.error('Unexpected error:', error);
    }

    return throwError(() => apiError);
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(status: number): string {
    const statusMessages: Record<number, string> = {
      401: 'Authentication failed. Please verify your GitHub token.',
      403: 'Rate limit exceeded or access forbidden.',
      404: 'User not found.',
      422: 'Invalid request parameters.',
      500: 'GitHub server error. Please try again later.',
      503: 'GitHub service temporarily unavailable.'
    };

    return statusMessages[status] || 'An error occurred while fetching GitHub data.';
  }
}
