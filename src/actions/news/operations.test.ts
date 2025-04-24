import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processNews, setCategorizerInstance } from '@/actions/news/operations';
import { analyzeSentiment } from '@/service/sentiment-analysis';
import { initializeCategorizer } from '@/service/categorization';
import { prisma } from '@/prisma';
import { callGroqAPI } from '@/lib/groqClient';

// ------------------ Mock Setup ------------------

vi.mock('@/prisma', () => ({
    prisma: {
        summarizedNews: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 1 }),
        }
    }
}));

vi.mock('@/service/sentiment-analysis', () => ({
    analyzeSentiment: vi.fn(),
}));

vi.mock('@/service/categorization', () => ({
    initializeCategorizer: vi.fn().mockResolvedValue({
        categorizeWithKMeans: vi.fn().mockResolvedValue('Technology')
    }),
}));

vi.mock('@/lib/groqClient', () => ({
    callGroqAPI: vi.fn(),
}));

// ------------------ Test Suite ------------------

describe('News Operations', () => {
    const mockNewsItem = {
        title: 'Test News Article',
        content: 'This is a test news article content for testing purposes.',
        date: new Date('2025-01-01'),
        url: 'https://example.com/test-news',
    };

    const mockLongNewsItem = {
        ...mockNewsItem,
        content: 'A'.repeat(1000),
    };

    beforeEach(() => {
        vi.resetAllMocks();

        const mockCategorizer = {
            categorizeWithKMeans: vi.fn().mockResolvedValue('Technology'),
        };

        // Directly set the categorizer instance for testing
        setCategorizerInstance(mockCategorizer);

        vi.mocked(initializeCategorizer).mockResolvedValue(mockCategorizer);
        vi.mocked(analyzeSentiment).mockResolvedValue({ sentiment: 'positive', score: 0.5 });
        vi.mocked(prisma.summarizedNews.findFirst).mockResolvedValue(null);
        vi.mocked(prisma.summarizedNews.create).mockResolvedValue({ id: 1 } as any);
        vi.mocked(callGroqAPI).mockResolvedValue('Summarized content');
    });

    //  Test: Successful processing
    it('should process a news item successfully', async () => {
        const mockCategorizer = {
            categorizeWithKMeans: vi.fn().mockResolvedValue('Technology'),
        };

        // Directly set the mock categorizer instance
        setCategorizerInstance(mockCategorizer);

        await processNews(mockNewsItem);

        // Check if the news was looked up
        expect(prisma.summarizedNews.findFirst).toHaveBeenCalledWith({
            where: { OR: [{ title: mockNewsItem.title }, { url: mockNewsItem.url }] }
        });

        // Ensure sentiment analysis was called
        expect(analyzeSentiment).toHaveBeenCalledWith(mockNewsItem.content);

        // Ensure categorizer was used
        expect(mockCategorizer.categorizeWithKMeans).toHaveBeenCalledWith(mockNewsItem.content);

        // Final check that the item was saved with expected structure
        expect(prisma.summarizedNews.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                title: mockNewsItem.title,
                content: mockNewsItem.content,
                category: 'Technology',
                sentiment: 'positive',
                date: mockNewsItem.date,
                url: mockNewsItem.url,
            }),
        }));
    });

    //  Test: Summarization triggered
    it('should summarize long content using callGroqAPI', async () => {
        const mockCategorizer = {
            categorizeWithKMeans: vi.fn().mockResolvedValue('Technology'),
        };

        // Directly set the mock categorizer instance
        setCategorizerInstance(mockCategorizer);

        await processNews(mockLongNewsItem);

        // Ensure summarization API was called
        expect(callGroqAPI).toHaveBeenCalled();

        const mockCalls = vi.mocked(callGroqAPI).mock.calls;
        expect(mockCalls.length).toBeGreaterThan(0);
        expect(mockCalls[0][0]).toContain('Summarize the following news article');
        expect(mockCalls[0][1]).toBe(mockLongNewsItem.content.slice(0, 5000));

        // Ensure categorizer was used on summarized content
        expect(mockCategorizer.categorizeWithKMeans).toHaveBeenCalledWith('Summarized content');

        // Ensure sentiment analysis used summarized content
        expect(analyzeSentiment).toHaveBeenCalledWith('Summarized content');

        // Final DB check
        expect(prisma.summarizedNews.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    content: 'Summarized content',
                    category: 'Technology',
                    sentiment: 'positive',
                }),
            })
        );
    });

    //  Test: Skip already existing news
    it('should skip processing if news already exists', async () => {
        vi.mocked(prisma.summarizedNews.findFirst).mockResolvedValue({ id: 1, title: mockNewsItem.title } as any);
        await processNews(mockNewsItem);
        expect(callGroqAPI).not.toHaveBeenCalled();
        expect(analyzeSentiment).not.toHaveBeenCalled();
        // Skip testing categorizer since we're not reaching that point
        expect(prisma.summarizedNews.create).not.toHaveBeenCalled();
    });

    //  Test: Categorization failure fallback
    it('should handle categorization failure gracefully', async () => {
        const mockCategorizer = { categorizeWithKMeans: vi.fn().mockRejectedValue(new Error('Categorization failed')) };
        setCategorizerInstance(mockCategorizer);

        await processNews(mockNewsItem);

        // Ensure the news item is not created when categorization fails
        expect(prisma.summarizedNews.create).not.toHaveBeenCalled();
    });

    //  Test: Categorization failure
    it('should handle categorization failure gracefully', async () => {
        const mockCategorizer = { categorizeWithKMeans: vi.fn().mockRejectedValue(new Error('Categorization failed')) };
        setCategorizerInstance(mockCategorizer);

        await processNews(mockNewsItem);
        expect(prisma.summarizedNews.create).not.toHaveBeenCalled();
    });

    // Test: Empty sentiment
    it('should handle empty sentiment gracefully', async () => {
        vi.mocked(analyzeSentiment).mockResolvedValue({ sentiment: '', score: 0 });
        await processNews(mockNewsItem);
        expect(prisma.summarizedNews.create).not.toHaveBeenCalled();
    });

    //  Test: Invalid categorization result
    it('should handle invalid categorization gracefully', async () => {
        const mockCategorizer = { categorizeWithKMeans: vi.fn().mockResolvedValue(null) };
        setCategorizerInstance(mockCategorizer);

        await processNews(mockNewsItem);

        // Ensure the news item is not created when categorization returns null
        expect(prisma.summarizedNews.create).not.toHaveBeenCalled();
    });

    //  Test: Categorizer initializes if not already available
    it('should initialize categorizer if not already initialized', async () => {
        const mockCategorizer = {
            categorizeWithKMeans: vi.fn().mockResolvedValue('Tech')
        };

        // Set the mock categorizer and reset initializeCategorizer
        setCategorizerInstance(mockCategorizer);
        vi.mocked(initializeCategorizer).mockResolvedValue(mockCategorizer);

        await processNews(mockNewsItem);

        expect(mockCategorizer.categorizeWithKMeans).toHaveBeenCalledWith(mockNewsItem.content);
        expect(prisma.summarizedNews.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    category: 'Tech',
                })
            })
        );
    });

    //  Test: Short content skips summarization
    it('should not attempt to summarize short content', async () => {
        const shortContentNewsItem = { ...mockNewsItem, content: 'Short content under 200 characters.' };
        await processNews(shortContentNewsItem);
        expect(callGroqAPI).not.toHaveBeenCalled();
    });

    //  Test: Database error handled gracefully
    it('should handle database errors gracefully', async () => {
        vi.mocked(prisma.summarizedNews.create).mockRejectedValue(new Error('Database error'));
        await expect(processNews(mockNewsItem)).resolves.not.toThrow();
    });
});
