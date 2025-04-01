import type React from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { formatDate } from "./export-utils"

export async function generatePDF(dashboardRef: React.RefObject<HTMLDivElement>, filename?: string): Promise<void> {
    if (!dashboardRef.current) {
        console.error("Dashboard reference is not available")
        return
    }

    try {
        // Show a loading indicator
        const loadingIndicator = document.createElement("div")
        loadingIndicator.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        loadingIndicator.innerHTML = `
      <div class="bg-white p-4 rounded-md shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p>Generating PDF...</p>
        </div>
      </div>
    `
        document.body.appendChild(loadingIndicator)

        // Create a new jsPDF instance
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        })

        // Get the dashboard element
        const element = dashboardRef.current

        // Calculate the number of pages needed
        const pageHeight = pdf.internal.pageSize.getHeight()
        const pageWidth = pdf.internal.pageSize.getWidth()

        // Add title and date
        const today = new Date()
        pdf.setFontSize(20)
        pdf.text("BizNow Dashboard Report", 14, 20)
        pdf.setFontSize(12)
        pdf.text(`Generated on: ${formatDate(today)}`, 14, 30)

        // Capture the entire dashboard as an image
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            allowTaint: true,
        })

        // Convert the canvas to an image
        const imgData = canvas.toDataURL("image/png")

        // Calculate the aspect ratio
        const imgWidth = pageWidth - 28 // 14mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Add the image to the PDF
        let heightLeft = imgHeight
        let position = 40 // Start position after title and date

        // Add first page
        pdf.addImage(imgData, "PNG", 14, position, imgWidth, imgHeight)
        heightLeft -= pageHeight - position

        // Add additional pages if needed
        while (heightLeft > 0) {
            position = 0
            pdf.addPage()
            pdf.addImage(imgData, "PNG", 14, position - (pageHeight - 40), imgWidth, imgHeight)
            heightLeft -= pageHeight
        }

        // Save the PDF
        const pdfFilename = filename || `biznow-dashboard-report-${today.toISOString().split("T")[0]}.pdf`
        pdf.save(pdfFilename)

        // Remove loading indicator
        document.body.removeChild(loadingIndicator)
    } catch (error) {
        console.error("Error generating PDF:", error)
        alert("Failed to generate PDF. Please try again.")
    }
}

