
import axios from 'axios';

class ReportController {

    // Record a new report generation attempt (Draft/Init)
    async addReportGeneration(reportData) {
        try {
            const res = await axios.post('/ReportGenerations/AddReportGeneration', {
                RouteId: reportData.routeId,
                Type: reportData.type || 'Route Survey',
                Status: 'pending',
                // Add validation/extra fields as expected by backend
                // e.g. CreatedBy: reportData.userId
            });
            return { result: true, data: res.data.data, message: res.data.message };
        } catch (err) {
            console.error('[ReportController] Add Error', err);
            return { result: false, message: err.message };
        }
    }

    // Update status or resulting URL
    async updateReportGeneration(id, status, url = null) {
        try {
            const res = await axios.post('/ReportGenerations/UpdateReportGeneration', {
                Id: id,
                Status: status,
                Url: url
            });
            return { result: true, message: res.data.message };
        } catch (err) {
            return { result: false, message: err.message };
        }
    }

    // Generate Report Content (Text/Structure)
    async generateReportContent(userId, routeId, contentContext) {
        try {
            const res = await axios.post('/Reporting/GenerateReport', {
                UserId: userId,
                RouteId: routeId,
                Content: contentContext // Or specific prompt data
            });
            return { result: true, data: res.data.data };
        } catch (err) {
            return { result: false, message: err.message };
        }
    }

    // Render PDF (Calls the PDF Service)
    async renderPdf(reportId, reportData) {
        try {
            // Note: This matches the route /api/reports/:id/render-pdf
            const res = await axios.post(`/api/reports/${reportId}/render-pdf`, reportData, {
                responseType: 'blob', // Important for PDF download
                timeout: 30000 // Allow time for generation
            });
            return { result: true, blob: res.data };
        } catch (err) {
            console.error('[ReportController] Render PDF Error', err);
            return { result: false, message: 'PDF Generation Failed' };
        }
    }

    // Get History
    async getReportHistory(routeId) {
        try {
            const res = await axios.get(`/ReportGenerations/GetReportGenerations/${routeId}`);
            if (res.data.result) {
                return { result: true, data: res.data.data };
            }
            return { result: false, message: res.data.message };
        } catch (err) {
            return { result: false, message: err.message };
        }
    }
}

export default new ReportController();
