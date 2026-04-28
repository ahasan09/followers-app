import { test, expect } from '@playwright/test';

test.describe('GitHub Followers App - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display followers search interface', async ({ page }) => {
    // Check for search form elements
    await expect(page.locator('[data-testid="username-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="rate-limit-indicator"]')).toBeVisible();
  });

  test('should search for a GitHub user and display followers', async ({ page }) => {
    // Fill in username
    await page.fill('[data-testid="username-input"]', 'torvalds');
    
    // Click search button
    await page.click('[data-testid="search-button"]');

    // Wait for user profile to load
    await page.waitForSelector('[data-testid="user-profile"]', { timeout: 10000 });

    // Verify user info is displayed
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="followers-count"]')).toBeVisible();
  });

  test('should display followers list with pagination', async ({ page }) => {
    // Search for user
    await page.fill('[data-testid="username-input"]', 'octocat');
    await page.click('[data-testid="search-button"]');

    // Wait for followers list
    await page.waitForSelector('[data-testid="followers-list"]', { timeout: 10000 });

    // Verify followers are displayed
    const followerItems = await page.locator('[data-testid="follower-item"]');
    const count = await followerItems.count();
    expect(count).toBeGreaterThan(0);

    // Check for pagination controls
    const nextButton = page.locator('[data-testid="pagination-next"]');
    if (await nextButton.isEnabled()) {
      await expect(nextButton).toBeVisible();
    }
  });

  test('should display user repositories', async ({ page }) => {
    // Search for user
    await page.fill('[data-testid="username-input"]', 'octocat');
    await page.click('[data-testid="search-button"]');

    // Wait for profile
    await page.waitForSelector('[data-testid="user-profile"]', { timeout: 10000 });

    // Click on repositories tab
    await page.click('[data-testid="repos-tab"]');

    // Wait for repos list
    await page.waitForSelector('[data-testid="repos-list"]', { timeout: 10000 });

    // Verify repositories are displayed
    const repoItems = await page.locator('[data-testid="repo-item"]');
    const count = await repoItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should compare followers between two users', async ({ page }) => {
    // Enter first username
    await page.fill('[data-testid="username-input"]', 'user1');
    
    // Enter second username
    await page.fill('[data-testid="compare-username-input"]', 'user2');
    
    // Click compare button
    await page.click('[data-testid="compare-button"]');

    // Wait for comparison results
    await page.waitForSelector('[data-testid="comparison-results"]', { timeout: 10000 });

    // Verify comparison sections are displayed
    await expect(page.locator('[data-testid="common-followers-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="user1-only-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="user2-only-section"]')).toBeVisible();
  });

  test('should display error message for nonexistent user', async ({ page }) => {
    // Search for nonexistent user
    await page.fill('[data-testid="username-input"]', 'nonexistentuser123xyz');
    await page.click('[data-testid="search-button"]');

    // Wait for error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
    const errorMessage = await page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('not found');
  });

  test('should display rate limit warning when approaching limit', async ({ page }) => {
    // Mock rate limit near limit
    await page.goto('/?rateLimit=5');

    // Check for warning indicator
    const rateLimitIndicator = page.locator('[data-testid="rate-limit-warning"]');
    if (await rateLimitIndicator.isVisible()) {
      await expect(rateLimitIndicator).toContainText('rate limit');
    }
  });

  test('should handle pagination navigation', async ({ page }) => {
    // Search for user
    await page.fill('[data-testid="username-input"]', 'octocat');
    await page.click('[data-testid="search-button"]');

    // Wait for followers
    await page.waitForSelector('[data-testid="followers-list"]', { timeout: 10000 });

    // Get first page follower count
    const firstPageFollowers = await page.locator('[data-testid="follower-item"]').count();

    // Click next page
    const nextButton = page.locator('[data-testid="pagination-next"]');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      
      // Wait for new followers to load
      await page.waitForTimeout(1000);

      // Verify we still have followers (may be different ones)
      const newFollowerCount = await page.locator('[data-testid="follower-item"]').count();
      expect(newFollowerCount).toBeGreaterThan(0);
    }
  });

  test('should allow following a user', async ({ page }) => {
    // Search for user
    await page.fill('[data-testid="username-input"]', 'octocat');
    await page.click('[data-testid="search-button"]');

    // Wait for profile
    await page.waitForSelector('[data-testid="user-profile"]', { timeout: 10000 });

    // Click follow button
    const followButton = page.locator('[data-testid="follow-button"]');
    const initialText = await followButton.textContent();
    
    await followButton.click();

    // Wait for button state change
    await page.waitForTimeout(500);

    const newText = await followButton.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should persist compare state when navigating', async ({ page }) => {
    // Enter comparison
    await page.fill('[data-testid="username-input"]', 'user1');
    await page.fill('[data-testid="compare-username-input"]', 'user2');
    await page.click('[data-testid="compare-button"]');

    // Wait for results
    await page.waitForSelector('[data-testid="comparison-results"]', { timeout: 10000 });

    // Navigate to different page
    await page.click('[data-testid="repos-tab"]');

    // Navigate back to comparison
    await page.click('[data-testid="compare-tab"]');

    // Verify comparison is still visible
    await expect(page.locator('[data-testid="comparison-results"]')).toBeVisible();
  });
});
