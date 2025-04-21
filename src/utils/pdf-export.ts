import {toast} from "sonner";
import {jsPDF} from "jspdf";
import {ChartData} from "@/components/custom/donut-chart";
import {FrequencyData} from "@/components/custom/line-chart";
import {DashboardData} from "@/contexts/news-context";

// Function to draw a donut chart in the PDF
const drawDonutChart = (pdf: jsPDF, data: ChartData[], title: string, x: number, y: number, size: number = 35) => {
    const centerX = x + size;
    const centerY = y + size;
    const outerRadius = size;
    const innerRadius = size * 0.6;
    const total = data.reduce((acc, item) => acc + item.value, 0);

    // Draw title
    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, x + size, y - 5, { align: 'center' });

    // Draw chart
    let startAngle = 0;
    data.forEach((item, index) => {
        const portion = item.value / total;
        const endAngle = startAngle + portion * 2 * Math.PI;

        // Get color
        let color;
        if (item.color) {
            color = hexToRgb(item.color);
        } else {
            const fallbackColors = ["#4a69dd", "#90c469", "#f6c652", "#f05a5a", "#5ec8eb"];
            color = hexToRgb(fallbackColors[index % fallbackColors.length]);
        }

        // Draw segment
        drawDonutSegment(pdf, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, color);

        // Calculate position for percentage label
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = (innerRadius + outerRadius) / 2;
        const labelX = centerX + Math.cos(midAngle) * labelRadius * 0.8;
        const labelY = centerY + Math.sin(midAngle) * labelRadius * 0.8;

        // Draw percentage label if segment is large enough
        if (portion > 0.05) {
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${Math.round(portion * 100)}%`, labelX, labelY, { align: 'center' });
        }

        startAngle = endAngle;
    });

    // Draw legend with wrapping for multiple rows if needed
    const legendY = y + size * 2 + 5;
    pdf.setFontSize(7);
    const maxItemsPerRow = 3;
    const itemWidth = Math.max((size * 2) / 3, 25);

    data.forEach((item, index) => {
        const row = Math.floor(index / maxItemsPerRow);
        const col = index % maxItemsPerRow;
        // Add more spacing between items
        const legendX = x + (col * itemWidth);
        const currentLegendY = legendY + (row * 10);

        // Get color
        let color;
        if (item.color) {
            color = hexToRgb(item.color);
        } else {
            const fallbackColors = ["#4a69dd", "#90c469", "#f6c652", "#f05a5a", "#5ec8eb"];
            color = hexToRgb(fallbackColors[index % fallbackColors.length]);
        }

        // Draw color box
        pdf.setFillColor(color.r, color.g, color.b);
        pdf.rect(legendX, currentLegendY, 3, 3, 'F');

        pdf.setTextColor(60, 60, 60);
        let labelText = item.name;
        if (labelText.length > 12) {
            labelText = labelText.substring(0, 9) + '...';
        }
        pdf.text(labelText, legendX + 5, currentLegendY + 2.5);
    });

    const legendRows = Math.ceil(data.length / maxItemsPerRow);
    return legendY + (legendRows * 10) + 5;
};

// Helper function to draw a donut segment
const drawDonutSegment = (
    pdf: jsPDF,
    centerX: number,
    centerY: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    color: { r: number, g: number, b: number }
) => {
    const steps = Math.max(5, Math.floor((endAngle - startAngle) * 30));
    const angleStep = (endAngle - startAngle) / steps;

    pdf.setFillColor(color.r, color.g, color.b);

    for (let i = 0; i < steps; i++) {
        const angle1 = startAngle + i * angleStep;
        const angle2 = startAngle + (i + 1) * angleStep;

        const x1 = centerX + Math.cos(angle1) * outerRadius;
        const y1 = centerY + Math.sin(angle1) * outerRadius;
        const x2 = centerX + Math.cos(angle2) * outerRadius;
        const y2 = centerY + Math.sin(angle2) * outerRadius;
        const x3 = centerX + Math.cos(angle2) * innerRadius;
        const y3 = centerY + Math.sin(angle2) * innerRadius;
        const x4 = centerX + Math.cos(angle1) * innerRadius;
        const y4 = centerY + Math.sin(angle1) * innerRadius;

        pdf.triangle(x1, y1, x2, y2, x3, y3, 'F');
        pdf.triangle(x1, y1, x4, y4, x3, y3, 'F');
    }
};

// Function to draw a line chart in the PDF
const drawLineChart = (pdf: jsPDF, data: FrequencyData[], title: string, x: number, y: number, width: number, height: number) => {
    if (title) {
        pdf.setFontSize(14);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, x + width / 2, y - 5, { align: 'center' });
    }

    // Find min and max values
    const values = data.map(item => item.value);
    const maxValue = Math.max(...values);
    const minValue = 0;

    // Chart area
    const chartX = x + 15;
    const chartY = y;
    const chartWidth = width - 30;
    const chartHeight = height - 25;

    // Draw light gray background for the chart area
    pdf.setFillColor(245, 245, 245);
    pdf.rect(chartX, chartY, chartWidth, chartHeight, 'F');

    // Draw axes
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(chartX, chartY, chartX, chartY + chartHeight);
    pdf.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight);

    // Draw grid lines
    const gridLines = 5;
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.1);
    for (let i = 1; i <= gridLines; i++) {
        const lineY = chartY + chartHeight - (i * chartHeight / gridLines);
        pdf.line(chartX, lineY, chartX + chartWidth, lineY);

        // Draw Y-axis labels
        const value = Math.round(minValue + (i * (maxValue - minValue) / gridLines));
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(value.toString(), chartX - 5, lineY, { align: 'right' });
    }

    // Draw data points and line
    if (data.length > 0) {
        const pointSpacing = chartWidth / (data.length - 1 || 1);
        let prevX = chartX;
        let prevY = chartY + chartHeight - ((data[0].value - minValue) / (maxValue - minValue || 1)) * chartHeight;

        // Create area under the curve
        const areaPoints = [];
        areaPoints.push([chartX, chartY + chartHeight]);

        // Use a lighter blue color for better appearance
        const lineColor = { r: 90, g: 140, b: 230 };
        pdf.setDrawColor(lineColor.r, lineColor.g, lineColor.b);
        pdf.setLineWidth(0.8);

        data.forEach((item, index) => {
            const pointX = chartX + index * pointSpacing;
            const pointY = chartY + chartHeight - ((item.value - minValue) / (maxValue - minValue || 1)) * chartHeight;

            // Add point to area polygon
            areaPoints.push([pointX, pointY]);

            // Draw line segment
            if (index > 0) {
                pdf.line(prevX, prevY, pointX, pointY);
            }

            // Draw point with a white border for better visibility
            pdf.setFillColor(255, 255, 255);
            pdf.circle(pointX, pointY, 2.5, 'F'); // White background
            pdf.setFillColor(lineColor.r, lineColor.g, lineColor.b);
            pdf.circle(pointX, pointY, 1.8, 'F'); // Blue point

            if (index % Math.ceil(data.length / 8) === 0 || index === data.length - 1) {
                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.text(item.day, pointX, chartY + chartHeight + 10, { align: 'center' });
            }

            prevX = pointX;
            prevY = pointY;
        });

        areaPoints.push([prevX, chartY + chartHeight]);

        pdf.setFillColor(lineColor.r, lineColor.g, lineColor.b, 0.05);
        const flatPoints = areaPoints.flat();
        for (let i = 0; i < flatPoints.length - 3; i += 2) {
            pdf.triangle(
                flatPoints[i], flatPoints[i + 1],
                flatPoints[i + 2], flatPoints[i + 3],
                areaPoints[0][0], areaPoints[0][1],
                'F'
            );
        }
    }

    return y + height + 20;
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
};

// Helper function to add a footer to a PDF page
const addPdfFooter = (pdf: jsPDF, pageIndex: number, pageHeight: number, pageWidth: number, lastUpdated: string) => {
    pdf.setPage(pageIndex);
    const footerY = pageHeight - 10;
    pdf.setFillColor(245, 247, 250);
    pdf.rect(0, footerY - 5, pageWidth, 15, 'F');

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated by BizNow Intelligence Platform | Last updated: ${lastUpdated}`, pageWidth / 2, footerY, {align: 'center'});
};

// Function to draw a metric box
const drawMetricBox = (pdf: jsPDF, title: string, value: string, iconColor: { r: number, g: number, b: number }, x: number, y: number, width: number, height: number) => {
    pdf.setDrawColor(240, 240, 240);
    pdf.setLineWidth(0.2);
    pdf.setFillColor(250, 250, 250);
    pdf.roundedRect(x, y, width, height, 3, 3, 'FD');
    pdf.setFillColor(iconColor.r, iconColor.g, iconColor.b);
    pdf.circle(x + 10, y + height / 2, 4, 'F');

    // Draw title
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(title, x + 20, y + height / 2 - 4);

    // Draw value
    pdf.setFontSize(14);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, x + 20, y + height / 2 + 6);

    return height;
};

// Function to export dashboard as PDF
export const exportAsPDF = async (dashboardData: DashboardData) => {
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        const currentDate = new Date().toISOString().substring(0, 10);

        // Add header with gradient-like effect
        pdf.setFillColor(74, 105, 221);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        pdf.setFillColor(59, 130, 246);
        pdf.rect(0, 0, pageWidth, 5, 'F');

        // Header Text
        pdf.setFontSize(24);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('News Intelligence Report', pageWidth / 2, 20, {align: 'center'});

        // Date only (removed location)
        pdf.setFontSize(10);
        pdf.setTextColor(220, 220, 220);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on ${currentDate}`, pageWidth / 2, 30, {align: 'center'});

        // Start content after header with more spacing
        let yPosition = 55;

        // Draw metrics row with better spacing
        const metricWidth = contentWidth / 2 - 5;
        const metricHeight = 30;
        const metricSpacing = 10;

        // Industry Impact Score
        drawMetricBox(
            pdf,
            'Industry Impact Score',
            `${dashboardData.industryImpactScore.toFixed(2)}%`,
            {r: 74, g: 105, b: 221},
            margin,
            yPosition,
            metricWidth,
            metricHeight
        );

        // Business Growth Trend
        drawMetricBox(
            pdf,
            'Business Growth Trend',
            `${dashboardData.businessGrowthTrend > 0 ? "+" : ""}${dashboardData.businessGrowthTrend}%`,
            {r: 144, g: 196, b: 105},
            margin + metricWidth + metricSpacing,
            yPosition,
            metricWidth,
            metricHeight
        );

        // Move to next row of metrics
        yPosition += metricHeight + metricSpacing;

        // Positive Sentiment
        drawMetricBox(
            pdf,
            'Positive Sentiment',
            `${dashboardData.positiveSentiment}%`,
            {r: 74, g: 222, b: 128},
            margin,
            yPosition,
            metricWidth,
            metricHeight
        );

        // Regulatory Ease Score
        drawMetricBox(
            pdf,
            'Regulatory Ease Score',
            `${dashboardData.regulatoryEaseScore.toFixed(2)}%`,
            {r: 246, g: 198, b: 82},
            margin + metricWidth + metricSpacing,
            yPosition,
            metricWidth,
            metricHeight
        );

        // Add more space after metric cards
        yPosition += metricHeight + 20;

        // Section title for charts
        pdf.setFontSize(16);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analytics Overview', margin, yPosition);

        // Draw horizontal line
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);

        yPosition += 15;

        // Calculate chart sizes and positions for side-by-side layout
        const chartSize = 35;
        const halfWidth = contentWidth / 2 - 10;

        // Draw sentiment donut chart (left side)
        const sentimentY = drawDonutChart(
            pdf,
            dashboardData.sentimentData,
            'Sentiment Analysis',
            margin,
            yPosition,
            chartSize
        );

        // Draw category donut chart (right side)
        const categoryY = drawDonutChart(
            pdf,
            dashboardData.categoryData,
            'Category Distribution',
            margin + halfWidth + 10,
            yPosition,
            chartSize
        );

        yPosition = Math.max(sentimentY, categoryY) + 10;

        // Add a new page for the frequency chart
        pdf.addPage();

        yPosition = 20;

        // Section title for frequency chart
        pdf.setFontSize(16);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'bold');
        pdf.text('News Volume Trends', margin, yPosition);

        // Draw horizontal line
        pdf.setDrawColor(0,0,0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);

        yPosition += 15;

        // Draw line chart for frequency data with appropriate size
        drawLineChart(
            pdf,
            dashboardData.frequencyData,
            '',
            margin,
            yPosition,
            contentWidth,
            100
        );

        // Add footer to both pages
        addPdfFooter(pdf, 0, pageHeight, pageWidth, dashboardData.lastUpdated);
        addPdfFooter(pdf, 1, pageHeight, pageWidth, dashboardData.lastUpdated);
        pdf.setPage(1);

        // Save the PDF
        pdf.save(`News_Intelligence_Report_${currentDate.replace(/\//g, '-')}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("PDF Export Failed. Please try again.");
    }
};