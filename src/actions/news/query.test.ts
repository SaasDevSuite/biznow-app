import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processAllNews, loadNewsData } from '@/actions/news/query';
import redis from '@/lib/redis';
import { processNews } from '@/service/news/news-processor';

// Mock the external dependencies
vi.mock('@/lib/redis', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
    },
}));

vi.mock('@/service/news/news-processor', () => ({
    processNews: vi.fn(),
}));

describe('News Query Operations', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('loadNewsData', () => {
        it('should return cached news data when available', async () => {
            const mockCachedData = [
                { title: 'Test News', date: '2025-01-01' }, // String date as stored in cache
            ];
            (redis.get as any).mockResolvedValue(JSON.stringify(mockCachedData));

            const result = await loadNewsData();

            expect(result).toEqual(mockCachedData); // Expect the exact same structure as cached
            expect(redis.get).toHaveBeenCalledWith('summarized_news');
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should fetch and cache news data when cache is empty', async () => {
            const mockNewsData = [
                { title: 'News 1', date: '2025-01-01' },
                { title: 'News 2', date: 'invalid-date' },
            ];
            (redis.get as any).mockResolvedValue(null);
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockNewsData),
            });

            const result = await loadNewsData();

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('News 1');
            expect(result[0].date).toBeInstanceOf(Date);
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/news-data/newsData.json');
            expect(redis.set).toHaveBeenCalledWith(
                'summarized_news',
                expect.any(String),
                'EX',
                3600
            );
        });

        it('should handle fetch errors gracefully', async () => {
            (redis.get as any).mockResolvedValue(null);
            (global.fetch as any).mockResolvedValue({
                ok: false,
                statusText: 'Network error',
            });

            const result = await loadNewsData();

            expect(result).toEqual([]);
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/news-data/newsData.json');
        });
    });

    describe('processAllNews', () => {
        // Mock the delay function to resolve immediately
        beforeEach(() => {
            vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
                fn(); // Call the callback immediately
                return 0 as any; // Return a dummy timer ID
            });
        });

        it('should process all news items with delay', async () => {
            const mockNewsData = [
                { title: 'News 1', date: '2025-01-01' },
                { title: 'News 2', date: '2025-01-02' },
            ];
            (redis.get as any).mockResolvedValue(null);
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockNewsData),
            });
            (processNews as any).mockResolvedValue(undefined);
            (redis.del as any).mockResolvedValue(undefined);

            await processAllNews();

            expect(processNews).toHaveBeenCalledTimes(2);
            expect(processNews).toHaveBeenNthCalledWith(1, expect.objectContaining({ title: 'News 1' }));
            expect(processNews).toHaveBeenNthCalledWith(2, expect.objectContaining({ title: 'News 2' }));
            expect(redis.del).toHaveBeenCalledTimes(2);
            expect(redis.del).toHaveBeenCalledWith('summarized_news');
        });
    });
});