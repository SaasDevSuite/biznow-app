import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportAsPDF } from './pdf-export';
import { jsPDF } from 'jspdf';
import { DashboardData } from '@/contexts/news-context';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(210),
        getHeight: vi.fn().mockReturnValue(297),
      },
    },
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    circle: vi.fn(),
    roundedRect: vi.fn(),
    triangle: vi.fn(),
    addPage: vi.fn(),
    setPage: vi.fn(),
    save: vi.fn(),
    autoTable: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock helper functions
vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

describe('PDF Export Functionality', () => {
  let mockPdf: any;
  let mockDashboardData: DashboardData;

  beforeEach(() => {
    vi.resetAllMocks();

    // Reset the mock implementation for jsPDF
    mockPdf = {
      internal: {
        pageSize: {
          getWidth: vi.fn().mockReturnValue(210),
          getHeight: vi.fn().mockReturnValue(297),
        },
      },
      setFillColor: vi.fn(),
      rect: vi.fn(),
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      setDrawColor: vi.fn(),
      setLineWidth: vi.fn(),
      line: vi.fn(),
      circle: vi.fn(),
      roundedRect: vi.fn(),
      triangle: vi.fn(),
      addPage: vi.fn(),
      setPage: vi.fn(),
      save: vi.fn(),
    };

    (jsPDF as unknown as jest.Mock).mockImplementation(() => mockPdf);

    // Create mock dashboard data
    mockDashboardData = {
      newsItems: [
        {
          id: '1',
          title: 'Test News 1',
          content: 'Test content 1',
          category: 'Technology',
          sentiment: 'Positive',
          date: new Date('2023-01-01'),
          url: 'https://example.com/1',
        },
        {
          id: '2',
          title: 'Test News 2',
          content: 'Test content 2',
          category: 'Economy',
          sentiment: 'Neutral',
          date: new Date('2023-01-02'),
          url: 'https://example.com/2',
        },
      ],
      categoryData: [
        { name: 'Technology', value: 10, color: '#4a69dd' },
        { name: 'Economy', value: 5, color: '#90c469' },
      ],
      sentimentData: [
        { name: 'Positive', value: 8, color: '#4a69dd' },
        { name: 'Neutral', value: 7, color: '#90c469' },
      ],
      frequencyData: [
        { day: 'Mon', value: 5 },
        { day: 'Tue', value: 8 },
        { day: 'Wed', value: 12 },
      ],
      city: 'Test City',
      industryImpactScore: 75,
      positiveSentiment: 65,
      regulatoryEaseScore: 65.75,
      businessGrowthTrend: 5,
      lastUpdated: '2023-01-03T12:00:00Z',
    };
  });

  describe('exportAsPDF', () => {
    it('should create a PDF document with correct initialization', async () => {
      await exportAsPDF(mockDashboardData);

      // Verify jsPDF was initialized correctly
      expect(jsPDF).toHaveBeenCalledWith('p', 'mm', 'a4');
    });

    it('should add header to the PDF with correct styling', async () => {
      await exportAsPDF(mockDashboardData);

      expect(mockPdf.setFillColor).toHaveBeenCalledWith(74, 105, 221);
      expect(mockPdf.rect).toHaveBeenCalledWith(0, 0, 210, 40, 'F');
      expect(mockPdf.setFillColor).toHaveBeenCalledWith(59, 130, 246);
      expect(mockPdf.rect).toHaveBeenCalledWith(0, 0, 210, 5, 'F');

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(24);
      expect(mockPdf.setTextColor).toHaveBeenCalledWith(255, 255, 255);
      expect(mockPdf.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockPdf.text).toHaveBeenCalledWith('News Intelligence Report', expect.any(Number), 20, {align: 'center'});

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(10);
      expect(mockPdf.setTextColor).toHaveBeenCalledWith(220, 220, 220);
      expect(mockPdf.setFont).toHaveBeenCalledWith('helvetica', 'normal');
    });

    it('should add all metric boxes with correct data', async () => {
      await exportAsPDF(mockDashboardData);

      // Verify Industry Impact Score
      expect(mockPdf.text).toHaveBeenCalledWith('Industry Impact Score', expect.any(Number), expect.any(Number));
      expect(mockPdf.text).toHaveBeenCalledWith("75/100", expect.any(Number), expect.any(Number));

      // Verify Business Growth Trend
      expect(mockPdf.text).toHaveBeenCalledWith('Business Growth Trend', expect.any(Number), expect.any(Number));
      expect(mockPdf.text).toHaveBeenCalledWith("+5", expect.any(Number), expect.any(Number));

      // Verify Positive Sentiment
      expect(mockPdf.text).toHaveBeenCalledWith('Positive Sentiment', expect.any(Number), expect.any(Number));
      expect(mockPdf.text).toHaveBeenCalledWith("65%", expect.any(Number), expect.any(Number));

      // Verify Regulatory Ease Score
      expect(mockPdf.text).toHaveBeenCalledWith('Regulatory Ease Score', expect.any(Number), expect.any(Number));
      expect(mockPdf.text).toHaveBeenCalledWith("65.75/100", expect.any(Number), expect.any(Number));
    });

    it('should add section title for charts with proper styling', async () => {
      await exportAsPDF(mockDashboardData);

      // Verify section title
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(16);
      expect(mockPdf.setTextColor).toHaveBeenCalledWith(60, 60, 60);
      expect(mockPdf.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockPdf.text).toHaveBeenCalledWith('Analytics Overview', expect.any(Number), expect.any(Number));

      // Verify horizontal line under section title
      expect(mockPdf.setDrawColor).toHaveBeenCalledWith(220, 220, 220);
      expect(mockPdf.setLineWidth).toHaveBeenCalledWith(0.5);
      expect(mockPdf.line).toHaveBeenCalled();
    });

    it('should create a multi-page PDF with frequency chart on second page', async () => {
      await exportAsPDF(mockDashboardData);

      // Verify page creation
      expect(mockPdf.addPage).toHaveBeenCalled();

      // Verify frequency chart title on second page
      expect(mockPdf.text).toHaveBeenCalledWith('News Volume Trends', expect.any(Number), expect.any(Number));

      // Verify page navigation for footer
      expect(mockPdf.setPage).toHaveBeenCalledWith(0);
      expect(mockPdf.setPage).toHaveBeenCalledWith(1);
    });

    it('should draw the frequency chart with proper styling', async () => {
      await exportAsPDF(mockDashboardData);

      // Verify chart background
      expect(mockPdf.setFillColor).toHaveBeenCalledWith(245, 245, 245);

      // Verify axes
      expect(mockPdf.setDrawColor).toHaveBeenCalledWith(200, 200, 200);
      expect(mockPdf.line).toHaveBeenCalled();

      // Verify grid lines
      expect(mockPdf.setDrawColor).toHaveBeenCalledWith(230, 230, 230);
      expect(mockPdf.setLineWidth).toHaveBeenCalledWith(0.1);

      // Verify data points
      // Each data point has a white background circle and a colored point
      expect(mockPdf.setFillColor).toHaveBeenCalledWith(255, 255, 255);
      expect(mockPdf.circle).toHaveBeenCalled();

      // Verify area under the curve
      expect(mockPdf.triangle).toHaveBeenCalled();
    });

    it('should add footers to both pages', async () => {
      await exportAsPDF(mockDashboardData);

      // Verify footer background on both pages
      expect(mockPdf.setPage).toHaveBeenCalledWith(0);
      expect(mockPdf.setPage).toHaveBeenCalledWith(1);
      expect(mockPdf.setFillColor).toHaveBeenCalledWith(245, 247, 250);
      expect(mockPdf.rect).toHaveBeenCalledWith(0, expect.any(Number), 210, 15, 'F');

      // Verify footer text
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(8);
      expect(mockPdf.setTextColor).toHaveBeenCalledWith(100, 100, 100);
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringContaining('Generated by BizNow Intelligence Platform'),
        expect.any(Number),
        expect.any(Number),
        {align: 'center'}
      );
    });

    it('should save the PDF with the correct filename', async () => {
      const currentDate = new Date().toISOString().substring(0, 10);
      await exportAsPDF(mockDashboardData);

      // Verify PDF was saved with correct filename
      expect(mockPdf.save).toHaveBeenCalledWith(`News_Intelligence_Report_${currentDate.replace(/\//g, '-')}.pdf`);
    });

    it('should handle errors during PDF creation gracefully', async () => {
      // Make the PDF creation fail
      (jsPDF as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('PDF creation failed');
      });

      await exportAsPDF(mockDashboardData);

      // Verify error handling
      expect(toast.error).toHaveBeenCalledWith('PDF Export Failed. Please try again.');
    });

    it('should handle errors during chart drawing gracefully', async () => {
      // Make the chart drawing fail
      mockPdf.circle.mockImplementation(() => {
        throw new Error('Circle drawing failed');
      });

      await exportAsPDF(mockDashboardData);

      // Verify error handling
      expect(toast.error).toHaveBeenCalledWith('PDF Export Failed. Please try again.');
    });

    it('should handle empty data gracefully', async () => {
      // Create empty dashboard data
      const emptyData: DashboardData = {
        ...mockDashboardData,
        newsItems: [],
        categoryData: [],
        sentimentData: [],
        frequencyData: [],
      };

      await exportAsPDF(emptyData);

      // Verify PDF was still created and saved
      expect(mockPdf.save).toHaveBeenCalled();
    });
  });
});
