import crmApiClient from "@/utils/crmApiClient";

const CrmController = {
  async health() {
    return (await crmApiClient.get("/api/v1/crm/health")).data;
  },

  async upsertSource(sourceId, data) {
    return (await crmApiClient.put(`/api/v1/crm/sources/${encodeURIComponent(sourceId)}`, data)).data;
  },

  async listCompanies(params = {}) {
    return (await crmApiClient.get("/api/v1/crm/companies", { params })).data;
  },

  async upsertCompany(data) {
    return (await crmApiClient.post("/api/v1/crm/companies", data)).data;
  },

  async listPeople(params = {}) {
    return (await crmApiClient.get("/api/v1/crm/people", { params })).data;
  },

  async createPerson(data) {
    return (await crmApiClient.post("/api/v1/crm/people", data)).data;
  },

  async addEmail(data) {
    return (await crmApiClient.post("/api/v1/crm/emails", data)).data;
  },

  async addEvidence(data) {
    return (await crmApiClient.post("/api/v1/crm/evidence", data)).data;
  },

  async addActivity(data) {
    return (await crmApiClient.post("/api/v1/crm/activities", data)).data;
  },

  async reviewQueue(params = {}) {
    return (await crmApiClient.get("/api/v1/crm/review-queue", { params })).data;
  }
};

export default CrmController;
