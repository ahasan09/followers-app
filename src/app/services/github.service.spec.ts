import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GitHubService } from './github.service';
import {
  GitHubUser,
  GitHubFollower,
  PaginationParams,
  ApiError
} from '../models/github.model';

describe('GitHubService', () => {
  let service: GitHubService;
  let httpMock: HttpTestingController;

  const mockUser: GitHubUser = {
    login: 'octocat',
    id: 1,
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    url: 'https://api.github.com/users/octocat',
    html_url: 'https://github.com/octocat',
    type: 'User',
    followers: 100,
    following: 50,
    public_repos: 25,
    created_at: '2011-01-25T18:44:36Z',
    updated_at: '2024-01-01T12:00:00Z'
  };

  const mockFollowers: GitHubFollower[] = [
    {
      login: 'follower1',
      id: 2,
      avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
      url: 'https://api.github.com/users/follower1',
      html_url: 'https://github.com/follower1',
      type: 'User'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GitHubService]
    });

    service = TestBed.inject(GitHubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getUser', () => {
    it('should fetch a GitHub user by username', (done) => {
      service.getUser('octocat').subscribe(user => {
        expect(user.login).toBe('octocat');
        expect(user.followers).toBe(100);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/users/octocat'));
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Accept')).toBe(true);
      req.flush(mockUser);
    });

    it('should handle 404 error (user not found)', (done) => {
      service.getUser('nonexistent').subscribe(
        () => fail('should have errored'),
        (error: ApiError) => {
          expect(error.statusCode).toBe(404);
          expect(error.message).toContain('not found');
          done();
        }
      );

      const req = httpMock.expectOne(req => req.url.includes('/users/nonexistent'));
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 403 error (rate limit exceeded)', (done) => {
      service.getUser('octocat').subscribe(
        () => fail('should have errored'),
        (error: ApiError) => {
          expect(error.statusCode).toBe(403);
          done();
        }
      );

      const req = httpMock.expectOne(req => req.url.includes('/users/octocat'));
      req.flush(
        { message: 'API rate limit exceeded' },
        { status: 403, statusText: 'Forbidden' }
      );
    });
  });

  describe('getFollowers', () => {
    it('should fetch followers with pagination', (done) => {
      const pagination: PaginationParams = { page: 1, per_page: 30 };

      service.getFollowers('octocat', pagination).subscribe(result => {
        expect(result.data.length).toBe(1);
        expect(result.data[0].login).toBe('follower1');
        expect(result.pagination.page).toBe(1);
        done();
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/users/octocat/followers') &&
        req.params.get('page') === '1' &&
        req.params.get('per_page') === '30'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockFollowers);
    });

    it('should handle empty followers list', (done) => {
      const pagination: PaginationParams = { page: 1, per_page: 30 };

      service.getFollowers('someuser', pagination).subscribe(result => {
        expect(result.data.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/followers'));
      req.flush([]);
    });

    it('should handle pagination parameters correctly', (done) => {
      const pagination: PaginationParams = { page: 2, per_page: 50 };

      service.getFollowers('octocat', pagination).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/followers') &&
        req.params.get('page') === '2' &&
        req.params.get('per_page') === '50'
      );
      req.flush(mockFollowers);
    });
  });

  describe('getRateLimit', () => {
    it('should retrieve rate limit status', (done) => {
      service.getRateLimit().subscribe(rateLimit => {
        expect(rateLimit.limit).toBe(60);
        expect(rateLimit.remaining).toBe(59);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/rate_limit'));
      req.flush({
        resources: {
          core: {
            limit: 60,
            remaining: 59,
            reset: Math.floor(Date.now() / 1000) + 3600
          }
        }
      });
    });

    it('should calculate reset date correctly', (done) => {
      const now = Math.floor(Date.now() / 1000);
      const resetUnix = now + 3600; // 1 hour from now

      service.getRateLimit().subscribe(rateLimit => {
        expect(rateLimit.reset).toBe(resetUnix);
        expect(rateLimit.resetDate).toBeInstanceOf(Date);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/rate_limit'));
      req.flush({
        resources: {
          core: {
            limit: 5000,
            remaining: 4999,
            reset: resetUnix
          }
        }
      });
    });
  });

  describe('compareFollowers', () => {
    it('should compare followers between two users', (done) => {
      service.compareFollowers('user1', 'user2').subscribe(comparison => {
        expect(comparison.user1.login).toBe('octocat');
        expect(comparison.user2.login).toBe('octocat');
        done();
      });

      // Multiple requests will be made for this operation
      let requestCount = 0;
      httpMock.match(() => true).forEach(req => {
        requestCount++;
        if (req.url.includes('/users/')) {
          req.flush(mockUser);
        } else if (req.url.includes('/followers')) {
          req.flush(mockFollowers);
        }
      });

      expect(requestCount).toBeGreaterThan(0);
    });
  });
});
