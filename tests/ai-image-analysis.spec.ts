import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('AI Image Analysis', () => {
  test('should populate form fields after image upload', async ({ page }) => {
    // Navigate to new item page
    await page.goto('http://localhost:3001/items/new');
    
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Foto aufnehmen oder auswählen').click();
    const fileChooser = await fileChooserPromise;
    
    // Use a test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    await fileChooser.setFiles(testImagePath);
    
    // Wait for AI analysis to complete
    await page.waitForTimeout(3000);
    
    // Check if form fields are populated
    const titleInput = page.locator('input[id="title"]');
    const titleValue = await titleInput.inputValue();
    expect(titleValue).not.toBe('');
    
    const descriptionInput = page.locator('textarea[id="description"]');
    const descriptionValue = await descriptionInput.inputValue();
    expect(descriptionValue).not.toBe('');
    
    const categorySelect = page.locator('select[id="category"]');
    const categoryValue = await categorySelect.inputValue();
    expect(categoryValue).not.toBe('');
    
    const conditionSelect = page.locator('select[id="condition"]');
    const conditionValue = await conditionSelect.inputValue();
    expect(conditionValue).toBeTruthy();
    
    const pricePerDayInput = page.locator('input[id="pricePerDay"]');
    const pricePerDayValue = await pricePerDayInput.inputValue();
    expect(pricePerDayValue).not.toBe('');
    
    const depositInput = page.locator('input[id="deposit"]');
    const depositValue = await depositInput.inputValue();
    expect(depositValue).not.toBe('');
    
    console.log('Form values after AI analysis:', {
      title: titleValue,
      description: descriptionValue,
      category: categoryValue,
      condition: conditionValue,
      pricePerDay: pricePerDayValue,
      deposit: depositValue
    });
  });
});