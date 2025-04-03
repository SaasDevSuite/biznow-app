import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ChartData } from '@/components/custom/donut-chart';
import { FrequencyData } from '@/components/custom/frequency-chart';

// Define the news item interface for type safety
export interface NewsItem {
    id: string;
    title: string;
    category: string;
    sentiment: string;
    date: string;
}

// Common function to show loading indicator
const showLoadingIndicator = (message: string): HTMLDivElement => {
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    loadingIndicator.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p>${message}</p>
        </div>
      </div>
    `;
    document.body.appendChild(loadingIndicator);
    return loadingIndicator;
};

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
        'technology': { r: 74, g: 105, b: 221 }, // Blue
        'economy': { r: 144, g: 196, b: 105 },   // Green
        'environment': { r: 246, g: 198, b: 82 }, // Yellow
        'politics': { r: 240, g: 90, b: 90 },    // Red
        'other': { r: 94, g: 200, b: 235 }       // Cyan
    };

    return mapping[category.toLowerCase()] || { r: 136, g: 132, b: 216 }; // Default purple
};

// Function to generate chart summary text with icons and formatting
export const generateChartSummary = (
    sentimentData: ChartData[],
    categoryData: ChartData[],
    frequencyData: FrequencyData[]
): { summary: string, icons: Array<{text: string, x: number, y: number, color: { r: number, g: number, b: number }}> } => {
    // Calculate highest sentiment
    const totalSentiment = sentimentData.reduce((acc, item) => acc + item.value, 0);
    const sentimentSummary = sentimentData
        .map(item => `${item.name}: ${((item.value / totalSentiment) * 100).toFixed(1)}%`)
        .join(', ');

    // Calculate most common category
    const highestCategory = categoryData.reduce((prev, current) =>
        (prev.value > current.value) ? prev : current, categoryData[0]);

    // Calculate highest frequency day
    const highestFrequency = frequencyData.reduce((prev, current) =>
        (prev.value > current.value) ? prev : current, frequencyData[0]);

    const summary = `
• Sentiment Analysis: ${sentimentSummary}
• Most Common Category: ${highestCategory.name} (${highestCategory.value} occurrences)
• Peak News Day: ${highestFrequency.day} (${highestFrequency.value} articles)
    `;

    // Icons for the summary with positioning
    const icons = [
        {
            text: "",
            x: 20,
            y: 60,
            color: { r: 74, g: 105, b: 221 } // Blue
        },
        {
            text: "",
            x: 20,
            y: 70,
            color: { r: 144, g: 196, b: 105 } // Green
        },
        {
            text: "",
            x: 20,
            y: 80,
            color: { r: 246, g: 198, b: 82 } // Yellow
        }
    ];

    return { summary, icons };
};

// Function to export dashboard as PDF
export const exportAsPDF = async (
    newsItems: NewsItem[],
    sentimentData: ChartData[],
    categoryData: ChartData[],
    frequencyData: FrequencyData[],
    city: string
) => {
    let loadingIndicator: HTMLDivElement | null = null;

    try {
        // Show loading indicator
        loadingIndicator = showLoadingIndicator("Generating PDF report...");

        // Create a new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add header background
        pdf.setFillColor(74, 105, 221); // Blue header
        pdf.rect(0, 0, pageWidth, 30, 'F');

        // Add current date and title (Improved alignment)
        const currentDate = new Date().toLocaleDateString();
        pdf.setFontSize(20);
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFont('helvetica', 'bold');
        pdf.text('Daily News Report', pageWidth / 2, 18, { align: 'center' }); // Adjusted Y position for better centering

        // Add subtitle area (Improved alignment)
        pdf.setFillColor(240, 242, 245); // Light gray background
        pdf.rect(0, 30, pageWidth, 15, 'F');

        pdf.setFontSize(12);
        pdf.setTextColor(60, 60, 60); // Dark gray text
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Date: ${currentDate} | Location: ${city}`, pageWidth / 2, 38, { align: 'center' }); // Adjusted Y position

        // Add decorative page border
        pdf.setDrawColor(74, 105, 221); // Blue border
        pdf.setLineWidth(0.5);
        pdf.rect(10, 50, pageWidth - 20, pageHeight - 60, 'S');

        // Add inner border with lighter color
        pdf.setDrawColor(173, 188, 230); // Light blue
        pdf.setLineWidth(0.2);
        pdf.rect(12, 52, pageWidth - 24, pageHeight - 64, 'S');

        // Add Analytics Summary section with decorative header (Improved alignment)
        pdf.setFillColor(74, 105, 221, 0.8); // Blue with transparency
        pdf.roundedRect(15, 55, pageWidth - 30, 10, 2, 2, 'F');

        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analytics Summary', pageWidth / 2, 61, { align: 'center' }); // Adjusted Y position

        // Add chart summaries (Improved alignment for icons and text)
        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 50); // Dark text
        pdf.setFont('helvetica', 'normal');
        const { summary, icons } = generateChartSummary(sentimentData, categoryData, frequencyData);

        // Add icons (Adjusted positions for better alignment)
        icons.forEach(icon => {
            pdf.setTextColor(icon.color.r, icon.color.g, icon.color.b);
            pdf.setFontSize(12);
            pdf.text(icon.text, icon.x, icon.y + 2); // Slight Y adjustment for better spacing
        });

        // Add summary text after icons (Adjusted position)
        const summaryLines = pdf.splitTextToSize(summary, pageWidth - 45);
        pdf.setTextColor(50, 50, 50); // Reset to dark text
        pdf.setFontSize(10);
        pdf.text(summaryLines, 30, 62); // Adjusted X and Y for better alignment

        // Add news items table with nice header (Improved alignment)
        pdf.setFillColor(74, 105, 221, 0.8); // Blue with transparency
        pdf.roundedRect(15, 95, pageWidth - 30, 10, 2, 2, 'F');

        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFont('helvetica', 'bold');
        pdf.text('Latest News', pageWidth / 2, 101, { align: 'center' }); // Adjusted Y position

        // Table header (Improved column alignment)
        pdf.setFillColor(220, 230, 242); // Light blue
        pdf.rect(20, 110, pageWidth - 40, 8, 'F');

        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50); // Dark text
        pdf.setFont('helvetica', 'bold');
        pdf.text('Title', 25, 115); // Adjusted X position
        pdf.text('Category', 90, 115); // Adjusted X position
        pdf.text('Sentiment', 120, 115); // Adjusted X position
        pdf.text('Date', 150, 115); // Adjusted X position

        // Table rows (Improved alignment)
        let yPosition = 118;

        for (let i = 0; i < newsItems.length; i++) {
            // Check if we need a new page
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;

                // Add decorative page border on new page
                pdf.setDrawColor(74, 105, 221); // Blue border
                pdf.setLineWidth(0.5);
                pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

                // Add inner border with lighter color
                pdf.setDrawColor(173, 188, 230); // Light blue
                pdf.setLineWidth(0.2);
                pdf.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');

                // Add table header on new page
                pdf.setFillColor(220, 230, 242); // Light blue
                pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');

                pdf.setFontSize(10);
                pdf.setTextColor(50, 50, 50); // Dark text
                pdf.setFont('helvetica', 'bold');
                pdf.text('Title', 25, yPosition + 5); // Adjusted X position
                pdf.text('Category', 90, yPosition + 5); // Adjusted X position
                pdf.text('Sentiment', 120, yPosition + 5); // Adjusted X position
                pdf.text('Date', 150, yPosition + 5); // Adjusted X position

                yPosition += 8;
            }

            // Add background color for alternating rows
            if (i % 2 === 0) {
                pdf.setFillColor(245, 247, 250);
                pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
            }

            const item = newsItems[i];

            // Truncate title if too long
            const title = item.title.length > 30 ? item.title.substring(0, 27) + '...' : item.title;

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(50, 50, 50); // Dark text
            pdf.text(title, 25, yPosition + 6); // Adjusted X position

            // Color-coded category
            const categoryColor = getCategoryColor(item.category);
            pdf.setTextColor(categoryColor.r, categoryColor.g, categoryColor.b);
            pdf.text(item.category, 90, yPosition + 6); // Adjusted X position

            // Color-coded sentiment
            const sentimentColor = getSentimentColor(item.sentiment);
            pdf.setTextColor(sentimentColor.r, sentimentColor.g, sentimentColor.b);
            pdf.text(item.sentiment, 120, yPosition + 6); // Adjusted X position

            // Reset text color for date
            pdf.setTextColor(50, 50, 50);
            pdf.text(new Date(item.date).toLocaleDateString(), 150, yPosition + 6); // Adjusted X position

            yPosition += 10;
        }

        // Add footer with gradient (Improved alignment)
        const footerY = pageHeight - 15;
        pdf.setFillColor(240, 242, 245); // Light gray background
        pdf.rect(0, footerY - 5, pageWidth, 20, 'F');

        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Generated on ' + new Date().toLocaleString(), pageWidth / 2, footerY, { align: 'center' }); // Removed "© BizNow"

        // Save the PDF
        pdf.save(`News_Report_${currentDate.replace(/\//g, '-')}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        // Remove loading indicator
        if (loadingIndicator) {
            document.body.removeChild(loadingIndicator);
        }
    }
};

// Function to export dashboard as PNG
export const exportAsPNG = async () => {
    let loadingIndicator: HTMLDivElement | null = null;

    try {
        // Show loading indicator
        loadingIndicator = showLoadingIndicator("Generating PNG image...");

        // Get the dashboard element
        const dashboardElement = document.getElementById('news-dashboard');
        if (!dashboardElement) {
            throw new Error('Dashboard element not found');
        }

        // Use html2canvas to convert the dashboard to an image
        const canvas = await html2canvas(dashboardElement, {
            scale: 2, // Higher scale for better quality
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
            onclone: (clonedDoc) => {
                // Find the cloned dashboard element in the cloned document
                const clonedDashboard = clonedDoc.getElementById('news-dashboard');
                if (clonedDashboard) {
                    // Add a temporary "export" class to the cloned dashboard
                    clonedDashboard.classList.add('export-snapshot');

                    // Add a temporary style tag to modify appearance for export
                    const styleTag = clonedDoc.createElement('style');
                    styleTag.innerHTML = `
                        .export-snapshot {
                            padding: 20px !important;
                            box-shadow: 0 0 30px rgba(0,0,0,0.1) !important;
                            border-radius: 8px !important;
                        }
                        .export-snapshot header {
                            border-bottom-width: 2px !important;
                        }
                    `;
                    clonedDoc.head.appendChild(styleTag);
                }
            }
        });

        // Create a download link
        const link = document.createElement('a');
        link.download = `News_Dashboard_${new Date().toLocaleDateString().replace(/\//g, '-')}.png`; // Updated filename to remove "BizNow"
        link.href = canvas.toDataURL('image/png');
        link.click();

    } catch (error) {
        console.error('Error generating PNG:', error);
        alert('Failed to generate PNG. Please try again.');
    } finally {
        // Remove loading indicator
        if (loadingIndicator) {
            document.body.removeChild(loadingIndicator);
        }
    }
};