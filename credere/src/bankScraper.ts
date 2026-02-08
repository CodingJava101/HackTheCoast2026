import { chromium } from 'playwright';

interface CreditCard {
    name: string;
    value: string;
    fee: string;
}

export async function scrapeCardsByBank(targetBank: string) {
    const browser = await chromium.launch({ headless: false });  //TODO make it true to hide the browser
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('https://princeoftravel.com/credit-cards/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        const dropdown = page.locator('.select2-selection.select2-selection--multiple').first();
        await dropdown.waitFor({ state: 'visible' });
        await dropdown.click();

        const bankOption = page.locator(`.select2-results__option >> text="${targetBank}"`);
        await bankOption.waitFor({ state: 'visible', timeout: 5000 });
        await bankOption.click();

        await page.waitForTimeout(5000);

        const cards = await page.evaluate(() => {
            const cardElements = document.querySelectorAll('.offers-block-main');
            const results: any[] = [];

            cardElements.forEach((el) => {
                const name = el.querySelector('h6')?.textContent?.trim() || 'Unknown Card';

                const details = Array.from(el.querySelectorAll('ul li')).map(li => li.textContent?.trim());

                const fee = details.find(text => text?.toLowerCase().includes('fee')) || 'N/A';

                const benefits = details.filter(text => !text?.toLowerCase().includes('fee'));

                results.push({
                    name,
                    fee,
                    benefits,
                    value: details[0] || 'N/A'
                });
            });

            return results;
        });

        return cards;
    } catch (error) {
        console.error('Scraper failed. Taking debug screenshot...');
        await page.screenshot({ path: 'scraper-error.png' });
        throw error;
    } finally {
        await browser.close();
    }
}