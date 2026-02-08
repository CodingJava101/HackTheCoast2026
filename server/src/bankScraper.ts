import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';

chromium.use(stealthPlugin());

export async function scrapeCreditCards() {
    const browser = await chromium.launch({ headless: false });

    const context = await browser.newContext({
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    });

    await context.addInitScript(() => {
        (window as any).__name = (fn: any) => fn;
    });

    const listPage = await context.newPage();
    const allCards: any[] = [];
    const OUTPUT_FILE = 'cards_2026.json';

    const exportData = () => {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allCards, null, 2));
        console.log(`💾 Saved ${allCards.length} cards`);
    };

    process.on('SIGINT', () => {
        console.log('\n🛑 Interrupted');
        exportData();
        process.exit(0);
    });

    try {
        let currentPage = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            console.log(`\n📄 Navigating to Listing Page ${currentPage}...`);
            await listPage.goto(
                `https://princeoftravel.com/credit-cards/page/${currentPage}/`,
                { waitUntil: 'domcontentloaded', timeout: 60000 }
            );

            const cardUrls = await listPage.evaluate(() =>
                Array.from(document.querySelectorAll('a'))
                    .filter(
                        a =>
                            (a.textContent?.toLowerCase().includes('learn more') || a.textContent?.toLowerCase().includes('apply now')) &&
                            a.href.includes('/credit-cards/')
                    )
                    .map(a => a.href)
                    .filter(u => !u.includes('/page/'))
            );

            const uniqueUrls = [...new Set(cardUrls)];

            for (const url of uniqueUrls) {
                const page = await context.newPage();
                try {
                    console.log(`Processing: ${url}`);
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
                    await page.waitForTimeout(1500);

                    const cardData = await page.evaluate(() => {
                        const clean = (s?: string) => s?.replace(/\s+/g, ' ').trim() || '';
                        const bodyText = document.body.innerText;

                        // 1. Name
                        const name = clean(document.querySelector('h1')?.textContent)
                            .replace(/\s*\|\s*Prince of Travel\s*$/i, '');

                        // 2. Bank
                        const getBank = (cardName: string) => {
                            const n = cardName.toLowerCase();
                            const knownBanks = [
                                'American Express', 'Amex', 'TD', 'RBC', 'CIBC', 'BMO', 'Scotiabank',
                                'National Bank', 'Desjardins', 'MBNA', 'Rogers', 'Tangerine',
                                'PC Financial', 'Canadian Tire', 'Simplii', 'HSBC', 'Laurentian', 'Brim'
                            ];
                            for (const bank of knownBanks) {
                                if (n.includes(bank.toLowerCase())) {
                                    if (bank.toLowerCase() === 'amex') return 'American Express';
                                    return bank;
                                }
                            }
                            return 'N/A';
                        };

                        // 3. CPP Logic
                        const calculateCpp = (cardName: string) => {
                            const n = cardName.toLowerCase();
                            if (n.includes('aeroplan')) return '2.1';
                            if (n.includes('british airways') || n.includes('avios')) return '2.0';
                            if (n.includes('marriott')) return '0.9';
                            if (n.includes('platinum') || n.includes('gold') || n.includes('cobalt') || n.includes('edge')) return '2.2';
                            if (n.includes('td rewards') || n.includes('first class')) return '0.5';
                            if (n.includes('aventura')) return '1.25';
                            if (n.includes('scene+')) return '1.0';
                            if (n.includes('westjet')) return '1.0';
                            if (n.includes('cash back') || n.includes('dividend')) return '1.0';
                            return 'N/A';
                        };

                        // 4. Fee (Improved)
                        const getFee = () => {
                            const feeMatch = bodyText.match(/Annual Fee\s*[:]?\s*\$?\s?(\d{1,3})(?![0-9])/i);
                            if (feeMatch) return feeMatch[1];
                            if (/Annual Fee\s*[:]?\s*(Free|None|\$0)/i.test(bodyText)) return "0";
                            return "";
                        };

                        // 5. First Year Value (Comprehensive Regex)
                        const getFYV = () => {
                            // Pattern A: "First-Year Value: $900" (Standard)
                            // Handles optional hyphen, optional colon, case insensitive
                            const matchStandard = bodyText.match(/First[- ]?Year Value\s*[:]?\s*\$([0-9,]+)/i);
                            if (matchStandard) return matchStandard[1].replace(/,/g, '');

                            // Pattern B: "$900 First-Year Value" (Reverse order common on PoT)
                            const matchReverse = bodyText.match(/\$([0-9,]+)\s+First[- ]?Year\s+Value/i);
                            if (matchReverse) return matchReverse[1].replace(/,/g, '');

                            // Pattern C: "Total Value: $900" (Fallback)
                            const matchTotal = bodyText.match(/Total\s+Value\s*[:]?\s*\$([0-9,]+)/i);
                            if (matchTotal) return matchTotal[1].replace(/,/g, '');

                            // Pattern D: "Net Value: $900" (Verdict section)
                            const matchNet = bodyText.match(/Net\s+Value\s*[:]?\s*\$([0-9,]+)/i);
                            if (matchNet) return matchNet[1].replace(/,/g, '');

                            return "";
                        };

                        // 6. Welcome Bonus
                        const getWelcomeBonus = () => {
                            const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                            const bonusHeader = headers.find(h =>
                                h.textContent?.toLowerCase().includes('signup bonus') ||
                                h.textContent?.toLowerCase().includes('welcome bonus')
                            );
                            if (bonusHeader && bonusHeader.parentElement) {
                                return clean(bonusHeader.parentElement.textContent?.replace(bonusHeader.textContent || '', ''));
                            }
                            return 'N/A';
                        };

                        return {
                            name,
                            bank: getBank(name),
                            fee: getFee(),
                            welcomeBonus: getWelcomeBonus(),
                            cpp: calculateCpp(name),
                            firstYearValue: getFYV()
                        };
                    });

                    console.log(`   -> Bank: ${cardData.bank} | Fee: $${cardData.fee} | FYV: $${cardData.firstYearValue}`);

                    allCards.push({ ...cardData, url });
                    exportData();

                } catch (e: any) {
                    console.error(`⚠️ Failed ${url}: ${e.message}`);
                } finally {
                    await page.close();
                }
            }

            const next = listPage.locator('a.next.page-numbers').first();
            hasNextPage = await next.isVisible();
            if (hasNextPage) currentPage++;
        }
    } finally {
        await browser.close();
        exportData();
    }
}

scrapeCreditCards();