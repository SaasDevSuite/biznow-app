import axios from 'axios';
import path from 'path';
import { vi, describe, it, expect, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { getFullNewsContent } from '../../src/service/scraper';

const mockAxios = new MockAdapter(axios);
path.join(process.cwd(), 'public/news-data', 'news.json');
// Mock fs properly
vi.mock('fs', async () => {
    const actualFs = await import('fs'); // Import the original fs module
    return {
        ...actualFs, // Retain the original methods of fs
        writeFileSync: vi.fn(), // Mock writeFileSync method
    };
});

describe('News Scraper Tests', () => {
    afterEach(() => {
        mockAxios.reset(); // Reset the mock axios after each test
    });

    it('should return error object for an invalid news URL', async () => {
        mockAxios.onGet('https://invalid.com').reply(404);

        const result = await getFullNewsContent('https://invalid.com');

        expect(result).toEqual({
            title: 'Error',
            url: 'error',
            content: 'Error fetching content',
            date: '',
        });
    });

    it('should handle empty news content gracefully', async () => {
        const mockArticleHTML = `
      <article class="news">
        <h1>Empty News</h1>
        <p class="news-datestamp">March 30, 2025</p>
      </article>
      <div class="news-content"></div>
    `;

        mockAxios.onGet('https://example.com/empty-news').reply(200, mockArticleHTML);

        const result = await getFullNewsContent('https://example.com/empty-news');

        expect(result.content).toBe('No content found');
    });

});
