import { test, expect } from '@playwright/test'

test.describe('Pawn Moves', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForSelector('.board') // Ensure the board is loaded
  })

  test('white pawn moves', async ({ page }) => {
    // Move white pawn from initial position two squares forward
    await page
      .locator('div.row:nth-child(8) > div.cell:nth-child(2) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(6) > div.cell:nth-child(2)').click()
    await expect(
      page.locator('div.row:nth-child(6) > div.cell:nth-child(2) > .piece > .piece-image')
    ).toBeVisible()

    // Move the same white pawn one square forward
    await page
      .locator('div.row:nth-child(6) > div.cell:nth-child(2) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(5) > div.cell:nth-child(2)').click()
    await expect(
      page.locator('div.row:nth-child(5) > div.cell:nth-child(2) > .piece > .piece-image')
    ).toBeVisible()
  })

  test('black pawn moves', async ({ page }) => {
    // Move black pawn from initial position two squares forward
    await page
      .locator('div.row:nth-child(3) > div.cell:nth-child(2) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(5) > div.cell:nth-child(2)').click()
    await expect(
      page.locator('div.row:nth-child(5) > div.cell:nth-child(2) > .piece > .piece-image')
    ).toBeVisible()

    await page
      .locator('div.row:nth-child(5) > div.cell:nth-child(2) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(6) > div.cell:nth-child(2)').click()
    await expect(
      page.locator('div.row:nth-child(6) > div.cell:nth-child(2) > .piece > .piece-image')
    ).toBeVisible()
  })

  test('white pawn captures diagonally', async ({ page }) => {
    // Move white pawn to make space for placing a black pawn diagonally
    await page
      .locator('div.row:nth-child(8) > div.cell:nth-child(4) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(6) > div.cell:nth-child(4)').click()

    // Move another white pawn forward
    await page
      .locator('div.row:nth-child(8) > div.cell:nth-child(3) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(6) > div.cell:nth-child(3)').click()

    // Now, move a black pawn diagonally to set up capture
    await page
      .locator('div.row:nth-child(3) > div.cell:nth-child(3) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(5) > div.cell:nth-child(3)').click()

    // Move black pawn
    await page
      .locator('div.row:nth-child(3) > div.cell:nth-child(4) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(5) > div.cell:nth-child(4)').click()

    // Move white pawn to capture the black pawn
    await page
      .locator('div.row:nth-child(6) > div.cell:nth-child(3) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(5) > div.cell:nth-child(4)').click()
    await expect(
      page.locator('div.row:nth-child(5) > div.cell:nth-child(4) > .piece > .piece-image')
    ).toBeVisible()
    // Move white pawn to capture the black pawn
    await page
      .locator('div.row:nth-child(6) > div.cell:nth-child(4) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(5) > div.cell:nth-child(3)').click()
    await expect(
      page.locator('div.row:nth-child(5) > div.cell:nth-child(3) > .piece > .piece-image')
    ).toBeVisible()
  })

  test('black pawn captures diagonally', async ({ page }) => {
    // Move white pawn to make space for placing a black pawn diagonally
    await page
      .locator('div.row:nth-child(8) > div.cell:nth-child(4) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(6) > div.cell:nth-child(4)').click()

    // Move another white pawn forward
    await page
      .locator('div.row:nth-child(8) > div.cell:nth-child(3) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(6) > div.cell:nth-child(3)').click()

    // Now, move a black pawn diagonally to set up capture
    await page
      .locator('div.row:nth-child(3) > div.cell:nth-child(3) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(5) > div.cell:nth-child(3)').click()

    // Move black pawn
    await page
      .locator('div.row:nth-child(3) > div.cell:nth-child(4) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(5) > div.cell:nth-child(4)').click()

    // Move white pawn to capture the black pawn
    await page
      .locator('div.row:nth-child(5) > div.cell:nth-child(3) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(6) > div.cell:nth-child(4)').click()
    await expect(
      page.locator('div.row:nth-child(6) > div.cell:nth-child(4) > .piece > .piece-image')
    ).toBeVisible()
    // Move white pawn to capture the black pawn
    await page
      .locator('div.row:nth-child(5) > div.cell:nth-child(4) > .piece > .piece-image')
      .click()
    await page.locator('div.row:nth-child(6) > div.cell:nth-child(3)').click()
    await expect(
      page.locator('div.row:nth-child(6) > div.cell:nth-child(3) > .piece > .piece-image')
    ).toBeVisible()
  })
})
