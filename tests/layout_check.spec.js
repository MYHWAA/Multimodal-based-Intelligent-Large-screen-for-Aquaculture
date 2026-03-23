// tests/layout_check.spec.js
const { test, expect } = require('@playwright/test');

test('Weather and Water Quality modules should have equal card heights', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Adjust URL as needed

  // Select all weather items and water quality items
  const weatherItems = page.locator('.weather-item');
  const wqItems = page.locator('.wq-item');

  // Get the count of items
  const weatherCount = await weatherItems.count();
  const wqCount = await wqItems.count();

  expect(weatherCount).toBeGreaterThan(0);
  expect(wqCount).toBeGreaterThan(0);

  // Get bounding box of the first item of each to compare height
  const weatherBox = await weatherItems.first().boundingBox();
  const wqBox = await wqItems.first().boundingBox();

  // Assert heights are equal (allowing for very small sub-pixel rendering differences if necessary, but request said 0px)
  // Using a small epsilon for float precision is good practice, but user asked for "0 difference".
  // Let's try to be strict first.
  expect(Math.abs(weatherBox.height - wqBox.height)).toBeLessThan(1); // < 1px tolerance as per request 3.1 "不允许出现 1 px 以上的偏差"

  // Check alignment baseline
  // This is harder to check generically without specific knowledge of page layout,
  // but we can check if they are top-aligned if they are in the same row context,
  // or just check their heights are consistent.
  
  // Check text format for Weather (Label: Value)
  const weatherText = await weatherItems.first().locator('.weather-info').innerText();
  expect(weatherText).toMatch(/.*：.*/); // Contains colon
  
  // Check text format for Water Quality (Label \n Value)
  // We expect the text to be split into two lines or separate elements
  const wqLabel = await wqItems.first().locator('.wq-label');
  const wqValue = await wqItems.first().locator('.wq-value');
  
  // Verify they are stacked vertically (label top < value top)
  const labelBox = await wqLabel.boundingBox();
  const valueBox = await wqValue.boundingBox();
  expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(valueBox.y);
});
