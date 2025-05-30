import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category'); // Optional filter by general category

        // Build where clause
        const whereClause: any = {};
        if (category && category !== 'all') {
            whereClause.category = category;
        }

        // Get main category distribution
        const mainCategoryStats = await prisma.summarizedNews.groupBy({
            by: ['mainCategory'],
            where: whereClause,
            _count: {
                mainCategory: true,
            },
            orderBy: {
                _count: {
                    mainCategory: 'desc'
                }
            }
        });

        // Transform the data for frontend consumption
        const mainCategoryData = mainCategoryStats.map((stat) => ({
            name: stat.mainCategory,
            value: stat._count.mainCategory,
            color: getColorForMainCategory(stat.mainCategory)
        }));

        // Get sentiment distribution by main category
        const sentimentByMainCategory = await prisma.summarizedNews.groupBy({
            by: ['mainCategory', 'sentiment'],
            where: whereClause,
            _count: {
                id: true,
            }
        });

        // Transform sentiment data
        const sentimentData: Record<string, any[]> = {};
        sentimentByMainCategory.forEach((item) => {
            if (!sentimentData[item.mainCategory]) {
                sentimentData[item.mainCategory] = [];
            }
            sentimentData[item.mainCategory].push({
                sentiment: item.sentiment,
                count: item._count.id
            });
        });

        // Get total counts for percentage calculations
        const totalCount = await prisma.summarizedNews.count({ where: whereClause });

        return NextResponse.json({
            mainCategoryData,
            sentimentByMainCategory: sentimentData,
            totalCount,
            success: true
        });

    } catch (error) {
        console.error('Error fetching main category statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch main category statistics' },
            { status: 500 }
        );
    }
}

// Helper function to assign colors to main categories
function getColorForMainCategory(category: string): string {
    const colorMap: Record<string, string> = {
        'POLICY_CHANGES': '#4a69dd',
        'COMPLIANCE': '#f05a5a',
        'LEGAL_UPDATES': '#f6c652',
        'TAX_REGULATIONS': '#5ec8eb',
        'MARKET_EXPANSION': '#90c469',
        'NEW_INVESTMENTS': '#4a69dd',
        'INNOVATION': '#f6c652',
        'PARTNERSHIPS': '#5ec8eb',
        'MARKET_VOLATILITY': '#f05a5a',
        'COMPETITION': '#f6c652',
        'SUPPLY_CHAIN': '#4a69dd',
        'WORKFORCE_ISSUES': '#5ec8eb',
        'GENERAL': '#9ca3af'
    };

    return colorMap[category] || '#9ca3af';
}
