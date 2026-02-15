import { test, expect, loginToApp, navigateToPermitsDashboard } from './fixtures/global-fixtures';

/**
 * Permits Dashboard E2E Tests
 * Tests: Navigation, case list, status pills, opening cases
 * Mode: Both MOCK and REAL
 */

test.describe('Permits Dashboard', () => {
    test.beforeEach(async ({ page, mode }) => {
        await loginToApp(page, mode);
    });

    test('should navigate to project permits dashboard', async ({ page, projectId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        // Navigate to permits
        await page.goto(`/projects/${projectId}/permits`);

        // Assert dashboard renders
        await expect(page.getByTestId('permits-dashboard')).toBeVisible({ timeout: 10000 });

        // Assert header exists
        await expect(page.getByRole('heading', { name: /permits/i })).toBeVisible();
    });

    test('should display cases list with correct count', async ({ page, projectId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/projects/${projectId}/permits`);
        await expect(page.getByTestId('permits-dashboard')).toBeVisible();

        // In mock mode, expect exactly 2 cases
        // In real mode, expect at least 1 case
        const caseItems = page.locator('[data-testid^="permit-case-"]');

        if (mode === 'mock') {
            await expect(caseItems).toHaveCount(2, { timeout: 5000 });
        } else {
            await expect(caseItems.first()).toBeVisible({ timeout: 5000 });
        }
    });

    test('should show status pills (blocked + ready)', async ({ page, projectId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/projects/${projectId}/permits`);
        await expect(page.getByTestId('permits-dashboard')).toBeVisible();

        // Check for at least one status badge
        const statusBadges = page.locator('[data-testid="permits-status-badge"]');
        await expect(statusBadges.first()).toBeVisible({ timeout: 5000 });

        if (mode === 'mock') {
            // In mock mode, we know we have both blocked and ready
            const blockedBadge = page.locator('[data-testid="permits-status-badge"]', {
                hasText: 'BLOCKED',
            });
            const readyBadge = page.locator('[data-testid="permits-status-badge"]', {
                hasText: 'READY',
            });

            await expect(blockedBadge).toBeVisible();
            await expect(readyBadge).toBeVisible();
        }
    });

    test('should open blocked case and verify workspace loaded', async ({
        page,
        projectId,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/projects/${projectId}/permits`);
        await expect(page.getByTestId('permits-dashboard')).toBeVisible();

        // Click the blocked case
        const blockedCase = page.locator(`[data-testid="permit-case-${blockedCaseId}"]`);
        await blockedCase.click();

        // Wait for workspace to load
        await expect(page.getByTestId('permits-workspace')).toBeVisible({ timeout: 10000 });

        // Verify case title is displayed
        await expect(page.getByTestId('permits-case-title')).toBeVisible();

        // Verify status badge shows BLOCKED (or appropriate status)
        if (mode === 'mock') {
            const statusBadge = page.locator('.status-badge.status-blocked');
            await expect(statusBadge).toBeVisible();
        }

        // Verify readiness score widget exists
        await expect(page.locator('[data-testid="permits-readiness-score"]')).toBeVisible();
    });

    test('should display readiness scores', async ({ page, projectId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/projects/${projectId}/permits`);
        await expect(page.getByTestId('permits-dashboard')).toBeVisible();

        // Find readiness score widgets
        const scoreWidgets = page.locator('[data-testid="permits-readiness-score"]');
        await expect(scoreWidgets.first()).toBeVisible({ timeout: 5000 });

        if (mode === 'mock') {
            // Verify specific scores from fixtures
            const blockedScore = page
                .locator('[data-testid="permit-case-case_blocked_001"]')
                .locator('[data-testid="permits-readiness-score"]');
            await expect(blockedScore).toContainText('62');

            const readyScore = page
                .locator('[data-testid="permit-case-case_ready_002"]')
                .locator('[data-testid="permits-readiness-score"]');
            await expect(readyScore).toContainText('98');
        }
    });

    test('should handle empty state when no cases exist', async ({ page, projectId, mode }) => {
        // Skip in mock mode (we always have fixtures)
        test.skip(mode === 'mock', 'Not applicable in mock mode');

        test.info().annotations.push({ type: 'mode', description: mode });

        // Navigate to a project with no permits
        const emptyProjectId = process.env.E2E_EMPTY_PROJECT_ID || 'empty-project';
        await page.goto(`/projects/${emptyProjectId}/permits`);

        // Should show empty state
        const emptyState = page.locator('[data-testid="permits-empty-state"]');
        await expect(emptyState).toBeVisible({ timeout: 5000 });
        await expect(emptyState).toContainText(/no permit cases/i);
    });
});
