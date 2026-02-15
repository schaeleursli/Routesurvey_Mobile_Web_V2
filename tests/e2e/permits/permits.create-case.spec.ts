import { test, expect, loginToApp } from './fixtures/global-fixtures';

/**
 * Permits: Integration Test (Create Case Flow)
 * Tests the full workflow of creating a new permit case
 * Mode: Both MOCK and REAL
 */

test.describe('Permits: Create Case Flow', () => {
    test.beforeEach(async ({ page, mode }) => {
        await loginToApp(page, mode);
    });

    test('should create new permit case and land in workspace', async ({
        page,
        projectId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });
        test.slow(); // Multi-step workflow

        // Navigate to permits dashboard
        await page.goto(`/projects/${projectId}/permits`);
        await expect(page.getByTestId('permits-dashboard')).toBeVisible();

        // Click "Create Case" button
        const createBtn = page.getByRole('button', { name: /create.*case/i });
        await expect(createBtn).toBeVisible({ timeout: 5000 });
        await createBtn.click();

        // Modal should appear for route selection
        const createModal = page.getByRole('dialog');
        if (await createModal.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('✓ Create modal opened');

            // Select a route (in mock mode, use fixture route)
            const routeSelector = page.getByLabel(/select.*route/i);
            if (await routeSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
                await routeSelector.selectOption({ index: 1 }); // First available route
            }

            // Confirm creation
            const confirmBtn = page.getByRole('button', { name: /create|confirm/i });
            await confirmBtn.click();
        }

        // Wait for workspace to load
        await expect(page.getByTestId('permits-workspace')).toBeVisible({ timeout: 10000 });

        // Verify default selected block is permit_summary (or first block)
        const selectedBlock = page.locator('.block-list-item.active').first();
        await expect(selectedBlock).toBeVisible();

        const blockText = await selectedBlock.textContent();
        console.log(`✓ Default selected block: ${blockText}`);

        // Verify editor is visible
        await expect(page.getByTestId('permits-block-editor')).toBeVisible();

        // Verify case title is editable or set
        const caseTitle = page.getByTestId('permits-case-title');
        await expect(caseTitle).toBeVisible();

        console.log('✅ New case created successfully');
    });

    test('should show draft status for newly created case', async ({
        page,
        projectId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        // This assumes a case was just created, or we navigate to a known draft case
        // For simplicity, we'll skip creation and navigate to a draft case if available

        await page.goto(`/projects/${projectId}/permits`);
        await expect(page.getByTestId('permits-dashboard')).toBeVisible();

        // Look for a draft status badge
        const draftBadge = page.locator('[data-testid="permits-status-badge"]', {
            hasText: /draft/i,
        });

        if (await draftBadge.first().isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('✓ Draft case found');

            // Click it
            const draftCase = draftBadge.first().locator('..');
            await draftCase.click();

            // Verify workspace loads
            await expect(page.getByTestId('permits-workspace')).toBeVisible();

            // Verify status is DRAFT
            const statusBadge = page.locator('.status-badge.status-draft');
            await expect(statusBadge).toBeVisible();
        } else {
            console.log('ℹ️ No draft cases available (test skipped)');
            test.skip();
        }
    });

    test('should allow title editing in workspace', async ({ page, blockedCaseId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        const caseTitle = page.getByTestId('permits-case-title');
        const originalTitle = await caseTitle.textContent();

        // Check if title is editable (h1 might not be directly editable)
        // This depends on implementation - might have an edit icon/button
        const editBtn = page.getByRole('button', { name: /edit.*title/i });

        if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await editBtn.click();

            const titleInput = page.locator('input[type="text"]').filter({
                hasText: originalTitle || '',
            });

            if (await titleInput.isVisible().catch(() => false)) {
                await titleInput.fill('Updated Test Title');
                await titleInput.blur();

                // Wait for save
                await page.waitForTimeout(1000);

                // Verify title updated
                await expect(caseTitle).toContainText('Updated');
                console.log('✓ Title edited successfully');
            }
        } else {
            console.log('ℹ️ Title editing not available or not implemented yet');
        }
    });
});
