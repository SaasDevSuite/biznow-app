import { toast } from "sonner";
import { SummarizedNews } from "@prisma/client";
import { jsPDF } from "jspdf";
import { ChartData } from "@/components/custom/donut-chart";
import { FrequencyData } from "@/components/custom/frequency-chart";

interface DashboardData {
    newsItems: SummarizedNews[];
    categoryData: ChartData[];
    sentimentData: ChartData[];
    frequencyData: FrequencyData[];
    city: string;
    industryImpactScore: number;
    competitorMentions: number;
    positiveSentiment: number;
    engagementRate: number;
    lastUpdated: string;
}

// Function to get sentiment color
const getSentimentColor = (sentiment: string): { r: number, g: number, b: number } => {
    switch (sentiment.toLowerCase()) {
        case 'positive':
            return { r: 74, g: 222, b: 128 }; // Green
        case 'neutral':
            return { r: 250, g: 204, b: 21 }; // Yellow
        case 'negative':
            return { r: 248, g: 113, b: 113 }; // Red
        default:
            return { r: 148, g: 163, b: 184 }; // Slate
    }
};

// Function to get category color
const getCategoryColor = (category: string): { r: number, g: number, b: number } => {
    const mapping: Record<string, { r: number, g: number, b: number }> = {
        'technology': { r: 74, g: 105, b: 221 },
        'economy': { r: 144, g: 196, b: 105 },
        'environment': { r: 246, g: 198, b: 82 },
        'politics': { r: 240, g: 90, b: 90 },
        'other': { r: 94, g: 200, b: 235 }
    };
    return mapping[category.toLowerCase()] || { r: 136, g: 132, b: 216 }; // Default purple
};

// Function to generate chart summary text
const generateChartSummary = (
    sentimentData: ChartData[],
    categoryData: ChartData[],
    frequencyData: FrequencyData[]
) => {
    const totalSentiment = sentimentData.reduce((acc, item) => acc + item.value, 0);
    const sentimentSummary = sentimentData
        .map(item => `${item.name}: ${((item.value / totalSentiment) * 100).toFixed(1)}%`)
        .join(', ');

    const highestCategory = categoryData.reduce((prev, current) =>
        (prev.value > current.value) ? prev : current, categoryData[0]);

    const highestFrequency = frequencyData.reduce((prev, current) =>
        (prev.value > current.value) ? prev : current, frequencyData[0]);

    return `
• Sentiment Analysis: ${sentimentSummary}
• Most Common Category: ${highestCategory.name} (${highestCategory.value} occurrences)
• Peak News Day: ${highestFrequency.day} (${highestFrequency.value} articles)
    `;
};

// Function to export dashboard as PDF
export const exportAsPDF = async (dashboardData: DashboardData) => {
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const currentDate = new Date().toLocaleDateString();

        // Add header background
        pdf.setFillColor(74, 105, 221);
        pdf.rect(0, 0, pageWidth, 30, 'F');

        // Header Text
        pdf.setFontSize(20);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Daily News Report', pageWidth / 2, 18, { align: 'center' });

        // Date and Location
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`Date: ${currentDate} | Location: ${dashboardData.city}`, pageWidth / 2, 26, { align: 'center' });

        // Analytics Summary Section
        pdf.setFillColor(240, 242, 245);
        pdf.rect(0, 30, pageWidth, 20, 'F');

        pdf.setFontSize(14);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analytics Summary', 20, 45);

        pdf.setFont('helvetica', 'normal');
        const summaryText = generateChartSummary(dashboardData.sentimentData, dashboardData.categoryData, dashboardData.frequencyData);
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);
        pdf.text(pdf.splitTextToSize(summaryText, pageWidth - 40), 20, 50);

        // Table Header - Moved down to allow more space for summary
        pdf.setFillColor(74, 105, 221);
        pdf.rect(15, 80, pageWidth - 30, 10, 'F');

        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Title', 20, 86);
        pdf.text('Category', 100, 86);
        pdf.text('Sentiment', 140, 86);
        pdf.text('Date', 180, 86);

        // Table Rows
        let yPosition = 95;
        const rowHeight = 12;

        dashboardData.newsItems.forEach((item, index) => {
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
            }

            if (index % 2 === 0) {
                pdf.setFillColor(245, 247, 250);
                pdf.rect(15, yPosition - 5, pageWidth - 30, rowHeight, 'F');
            }

            const titleLines = pdf.splitTextToSize(item.title, 70);

            pdf.setFontSize(10);
            pdf.setTextColor(50, 50, 50);
            pdf.setFont('helvetica', 'normal');
            pdf.text(titleLines, 20, yPosition);

            // Category Color
            const categoryColor = getCategoryColor(item.category);
            pdf.setTextColor(categoryColor.r, categoryColor.g, categoryColor.b);
            pdf.text(item.category, 100, yPosition);

            // Sentiment Color
            const sentimentColor = getSentimentColor(item.sentiment);
            pdf.setTextColor(sentimentColor.r, sentimentColor.g, sentimentColor.b);
            pdf.text(item.sentiment, 140, yPosition);

            // Date
            pdf.setTextColor(50, 50, 50);
            pdf.text(new Date(item.date).toLocaleDateString(), 170, yPosition);

            const lineCount = titleLines.length;
            const additionalHeight = lineCount > 1 ? (lineCount - 1) * 5 : 0;
            yPosition += rowHeight + additionalHeight;
        });

        // Footer
        const footerY = pageHeight - 15;
        pdf.setFillColor(240, 242, 245);
        pdf.rect(0, footerY - 5, pageWidth, 20, 'F');

        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: 'center' });

        // Save the PDF
        pdf.save(`News_Report_${currentDate.replace(/\//g, '-')}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("PDF Export Failed. Please try again.");
    }
};