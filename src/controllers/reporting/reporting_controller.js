import axios from "axios";
import Cookies from "js-cookie";

class ReportingController {

    /**
     * Generate a report from a template string
     * @param {string} content - The MASL content string
     * @param {number|string} routeId - The ID of the route
     */
    async generateReportFromTemplate(content, routeId) {
        try {
            const uid = Number(Cookies.get("login_user_id"));

            const res = await axios.post("Reporting/GenerateReport", {
                UserId: uid,
                RouteId: routeId,
                Content: content
            });

            if (res.data.result) {
                return {
                    result: true,
                    message: String(res.data.message),
                    data: res.data.data
                };
            } else {
                return {
                    result: false,
                    message: String(res.data.message)
                };
            }
        } catch (error) {
            console.error(error);
            return {
                result: false,
                message: String(error)
            };
        }
    }

    /**
     * Render a PDF for a specific route report
     * @param {string} routeId - The ID of the route
     * @param {Object} payload - The report data payload (metadata, sections, etc)
     */
    async renderPdf(routeId, payload) {
        try {
            // Note: This endpoint might be on a different service port (e.g. 3001 for a local PDF service)
            // Ideally this URL should come from an environment variable.
            // For now we match the logic seen in RouteReport.vue but wrapped nicely.

            const pdfServiceUrl = import.meta.env.VITE_PDF_SERVICE_URL || 'http://localhost:3001';

            const res = await axios.post(`${pdfServiceUrl}/api/reports/${routeId}/render-pdf`, payload, {
                responseType: 'blob' // Important for PDF download
            });

            if (res.status === 200) {
                return {
                    result: true,
                    data: res.data // This is the blob
                };
            } else {
                return {
                    result: false,
                    message: "Failed to render PDF"
                };
            }
        } catch (error) {
            console.error(error);
            // Handle blob error response which might be JSON
            if (error.response && error.response.data instanceof Blob) {
                const errorText = await error.response.data.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    return { result: false, message: errorJson.error || String(error) };
                } catch (e) {
                    return { result: false, message: String(error) };
                }
            }
            return {
                result: false,
                message: String(error)
            };
        }
    }
}

export default new ReportingController();
