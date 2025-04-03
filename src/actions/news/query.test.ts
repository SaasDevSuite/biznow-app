import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fetchNewsItems, loadNewsData, processAllNews} from '@/actions/news/query';
import redis from '@/lib/redis';
import {processNews} from '@/service/news/news-processor';
import {prisma} from "@/prisma";

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

vi.mock("@/prisma", () => ({
    prisma: {
        summarizedNews: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}));

describe('News Query Operations', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    describe('loadNewsData', () => {
        it('should return cached news data when available', async () => {
            const mockCachedData = [
                {title: 'Test News', date: '2025-01-01'},
            ];
            (redis.get as any).mockResolvedValue(JSON.stringify(mockCachedData));

            const result = await loadNewsData();

            expect(result).toEqual(mockCachedData);
            expect(redis.get).toHaveBeenCalledWith('summarized_news');
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should fetch and cache news data when cache is empty', async () => {
            const mockNewsData = [
                {title: 'News 1', date: '2025-01-01'},
                {title: 'News 2', date: 'invalid-date'},
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

        it('should handle network errors gracefully', async () => {
            (redis.get as any).mockResolvedValue(null);
            (global.fetch as any).mockRejectedValue(new Error('Network failure'));

            const result = await loadNewsData();

            expect(result).toEqual([]);
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/news-data/newsData.json');
        });

        it('should handle JSON parsing errors gracefully', async () => {
            (redis.get as any).mockResolvedValue(null);
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.reject(new Error('Invalid JSON')),
            });

            const result = await loadNewsData();

            expect(result).toEqual([]);
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/news-data/newsData.json');
        });

        it('should handle mixed valid and invalid date formats', async () => {
            const mockNewsData = [
                {title: 'News 1', date: '2025-01-01'},
                {title: 'News 2', date: 'January 2, 2025'},
                {title: 'News 3', date: 'invalid-date'},
                {title: 'News 4', date: '01/03/2025'},
            ];
            (redis.get as any).mockResolvedValue(null);
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockNewsData),
            });

            const result = await loadNewsData();

            expect(result).toHaveLength(3); // Should have 3 valid dates
            expect(result.map((item: any) => item.title)).toContain('News 1');
            expect(result.map((item: any) => item.title)).toContain('News 2');
            expect(result.map((item: any) => item.title)).toContain('News 4');
            expect(result.map((item: any) => item.title)).not.toContain('News 3');
        });
    });

    describe('processAllNews', () => {
        // Mock the delay function to resolve immediately
        beforeEach(() => {
            vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
                fn();
                return 0 as any;
            });
        });

        it('should process all news items with delay', async () => {
            const mockNewsData = [
                {title: 'News 1', date: '2025-01-01'},
                {title: 'News 2', date: '2025-01-02'},
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
            expect(processNews).toHaveBeenNthCalledWith(1, expect.objectContaining({title: 'News 1'}));
            expect(processNews).toHaveBeenNthCalledWith(2, expect.objectContaining({title: 'News 2'}));
            expect(redis.del).toHaveBeenCalledTimes(2);
            expect(redis.del).toHaveBeenCalledWith('summarized_news');
        });

        it('should handle empty news array gracefully', async () => {
            (redis.get as any).mockResolvedValue(JSON.stringify([]));

            await processAllNews();

            expect(processNews).not.toHaveBeenCalled();
            expect(redis.del).not.toHaveBeenCalled();
        });

        it('should continue processing remaining news items if one fails', async () => {
            const mockNewsData = [
                {title: 'News 1', date: '2025-01-01'},
                {title: 'News 2', date: '2025-01-02'},
                {title: 'News 3', date: '2025-01-03'},
            ];
            (redis.get as any).mockResolvedValue(null);
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockNewsData),
            });

            // Make the second news item fail processing
            (processNews as any).mockImplementation((newsItem: any) => {
                if (newsItem.title === 'News 2') {
                    return Promise.reject(new Error('Processing failed'));
                }
                return Promise.resolve(undefined);
            });

            (redis.del as any).mockResolvedValue(undefined);

            await processAllNews();

            // Should still process the first and third items
            expect(processNews).toHaveBeenCalledTimes(3);
            expect(processNews).toHaveBeenNthCalledWith(1, expect.objectContaining({title: 'News 1'}));
            expect(processNews).toHaveBeenNthCalledWith(2, expect.objectContaining({title: 'News 2'}));
            expect(processNews).toHaveBeenNthCalledWith(3, expect.objectContaining({title: 'News 3'}));

            expect(redis.del).toHaveBeenCalledTimes(2);
        });

        it('should handle redis.del failure gracefully', async () => {
            const mockNewsData = [
                {title: 'News 1', date: '2025-01-01'},
            ];
            (redis.get as any).mockResolvedValue(null);
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockNewsData),
            });
            (processNews as any).mockResolvedValue(undefined);
            (redis.del as any).mockRejectedValue(new Error('Redis error'));

            await expect(processAllNews()).resolves.not.toThrow();

            expect(processNews).toHaveBeenCalledTimes(1);
            expect(redis.del).toHaveBeenCalledTimes(1);
        });
    });

    describe("fetchNewsItems", () => {
        const mockNewsItems = [
            {id: "1", title: "News 1", content: "Content 1", category: "tech", sentiment: "positive", date: new Date()},
            {
                id: "2",
                title: "News 2",
                content: "Content 2",
                category: "sports",
                sentiment: "neutral",
                date: new Date()
            },
        ];

        it("should return news items with pagination and no filters", async () => {
            const page = 1;
            const pageSize = 10;
            const totalItemsCount = 15;

            (prisma.summarizedNews.findMany as any).mockResolvedValue(mockNewsItems);
            (prisma.summarizedNews.count as any).mockResolvedValue(totalItemsCount);

            const result = await fetchNewsItems(page, pageSize);

            expect(result).toEqual({
                newsItems: mockNewsItems,
                totalPages: Math.ceil(totalItemsCount / pageSize),
            });

            expect(prisma.summarizedNews.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 0,
                take: 10,
                orderBy: {date: "desc"},
            });
        });

        it("should apply search filter correctly", async () => {
            const search = "tech";

            await fetchNewsItems(1, 10, search);

            expect(prisma.summarizedNews.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        {title: {contains: search, mode: "insensitive"}},
                        {content: {contains: search, mode: "insensitive"}},
                    ],
                },
                skip: 0,
                take: 10,
                orderBy: {date: "desc"},
            });
        });

        it("should apply category filter correctly", async () => {
            const category = "tech";

            await fetchNewsItems(1, 10, undefined, category);

            expect(prisma.summarizedNews.findMany).toHaveBeenCalledWith({
                where: {
                    category: category,
                },
                skip: 0,
                take: 10,
                orderBy: {date: "desc"},
            });
        });

        it("should apply sentiment filter correctly", async () => {
            const sentiment = "positive";

            await fetchNewsItems(1, 10, undefined, undefined, sentiment);

            expect(prisma.summarizedNews.findMany).toHaveBeenCalledWith({
                where: {
                    sentiment: sentiment,
                },
                skip: 0,
                take: 10,
                orderBy: {date: "desc"},
            });
        });

        it("should combine multiple filters correctly", async () => {
            const search = "AI";
            const category = "tech";
            const sentiment = "neutral";

            await fetchNewsItems(1, 10, search, category, sentiment);

            expect(prisma.summarizedNews.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        {title: {contains: search, mode: "insensitive"}},
                        {content: {contains: search, mode: "insensitive"}},
                    ],
                    category: category,
                    sentiment: sentiment,
                },
                skip: 0,
                take: 10,
                orderBy: {date: "desc"},
            });
        });

        it("should calculate pagination correctly", async () => {
            const totalItemsCount = 25;
            const pageSize = 10;
            (prisma.summarizedNews.count as any).mockResolvedValue(totalItemsCount);

            const result = await fetchNewsItems(3, pageSize);
            expect(result.totalPages).toBe(Math.ceil(totalItemsCount / pageSize));
            expect(prisma.summarizedNews.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 20,
                    take: 10,
                })
            );
        });

        it("should handle empty results", async () => {
            (prisma.summarizedNews.findMany as any).mockResolvedValue([]);
            (prisma.summarizedNews.count as any).mockResolvedValue(0);

            const result = await fetchNewsItems(1, 10);
            expect(result.newsItems).toEqual([]);
            expect(result.totalPages).toBe(0);
        });
    });
});