<template>
  <div class="engineering-review">
    <BasePanel
      title="Transport Engineering Review"
      subtitle="Review discovered heavy-transport engineers and specialist companies before CRM verification"
      elevation="level2"
    >
      <div class="review-content">
        <BaseCard class="backend-status">
          <div>
            <strong>CRM persistence</strong>
            <p>{{ backendMessage }}</p>
          </div>
          <BaseButton
            variant="primary"
            size="small"
            :disabled="syncing || !backendAvailable"
            @click="syncReviewedSeeds"
          >
            {{ syncing ? "Syncing…" : "Sync reviewed seeds" }}
          </BaseButton>
        </BaseCard>

        <section class="review-metrics">
          <BaseCard v-for="metric in metrics" :key="metric.label" class="metric-card">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <small>{{ metric.hint }}</small>
          </BaseCard>
        </section>

        <BaseCard>
          <div class="filters">
            <label>
              <span>Region</span>
              <select v-model="region">
                <option value="all">All regions</option>
                <option value="USA">USA</option>
                <option value="Europe">Europe</option>
                <option value="LATAM">LATAM</option>
              </select>
            </label>
            <label>
              <span>Candidate type</span>
              <select v-model="candidateType">
                <option value="all">People + companies</option>
                <option value="person">People</option>
                <option value="company">Companies</option>
              </select>
            </label>
            <label>
              <span>Search</span>
              <input v-model.trim="query" type="search" placeholder="Name, company, country, specialty" />
            </label>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="table-head">
            <div>
              <h2>Engineering candidates</h2>
              <p>{{ filtered.length }} records. Scores rank evidence for review; they do not verify a professional credential.</p>
            </div>
            <router-link to="/admin/crm">Back to CRM</router-link>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Region</th>
                  <th>Evidence</th>
                  <th>Specialties</th>
                  <th>Review state</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="candidate in filtered" :key="candidateKey(candidate)">
                  <td>
                    <strong>{{ displayName(candidate) }}</strong>
                    <span>{{ candidate.companyName || candidate.country || "—" }}</span>
                    <small v-if="candidate.roleEvidence">{{ candidate.roleEvidence }}</small>
                  </td>
                  <td>
                    <strong>{{ candidate.region }}</strong>
                    <span>{{ candidate.country || "—" }}</span>
                  </td>
                  <td>
                    <strong>{{ candidate.engineeringEvidence.score }}/100</strong>
                    <span>{{ candidate.engineeringEvidence.reasons.join(" · ") }}</span>
                  </td>
                  <td>
                    <div class="specialties">
                      <span
                        v-for="specialty in specialtyLabels(candidate)"
                        :key="specialty"
                        class="chip"
                      >{{ specialty }}</span>
                      <span v-if="specialtyLabels(candidate).length === 0">Needs classification</span>
                    </div>
                  </td>
                  <td>
                    <span class="state" :class="'state--' + candidate.engineeringEvidence.reviewState">
                      {{ reviewLabel(candidate.engineeringEvidence.reviewState) }}
                    </span>
                    <small>Verification: {{ candidate.verificationState }}</small>
                  </td>
                  <td>
                    <a :href="candidate.sourceUrl" target="_blank" rel="noopener noreferrer">Open source</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>

        <BaseCard class="boundary">
          <strong>Verification boundary</strong>
          <p>
            Discovery evidence can prioritize a record for review, but cannot prove licensure,
            current employment, or professional competence. Those fields require an authoritative
            credential/company source and an explicit verification action.
          </p>
        </BaseCard>
      </div>
    </BasePanel>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { BaseButton, BaseCard, BasePanel } from "@/components/ui";
import CrmController from "@/controllers/crm/crm_controller";
import { syncTransportEngineeringSeeds } from "@/services/crmSeedSyncService";
import { TRANSPORT_ENGINEERING_REVIEW_QUEUE } from "@/data/crm/transportEngineeringReviewQueue";

const region = ref("all");
const candidateType = ref("all");
const query = ref("");
const backendAvailable = ref(false);
const backendMessage = ref("Checking CRM backend…");
const syncing = ref(false);
const persistedReviewCount = ref(0);

const displayName = (candidate) =>
  candidate.fullName || candidate.companyName || "Unnamed candidate";

const candidateKey = (candidate) =>
  [candidate.candidateType, candidate.fullName, candidate.companyName, candidate.sourceUrl]
    .filter(Boolean)
    .join("|");

const specialtyMap = {
  route: "Route",
  bridge: "Bridge",
  heavyTransport: "Heavy transport",
  rigging: "Rigging / lifting",
  sweptPath: "Swept path",
  axleLoad: "Axle load",
  permits: "Permits"
};

const specialtyLabels = (candidate) =>
  Object.entries(candidate.engineeringEvidence.specialties)
    .filter(([, active]) => active)
    .map(([key]) => specialtyMap[key] || key);

const reviewLabel = (value) => ({
  priority_review: "Priority review",
  review: "Review",
  discovery: "Discovery"
}[value] || value);

const filtered = computed(() => {
  const needle = query.value.toLowerCase();

  return TRANSPORT_ENGINEERING_REVIEW_QUEUE.filter((candidate) => {
    if (region.value !== "all" && candidate.region !== region.value) return false;
    if (candidateType.value !== "all" && candidate.candidateType !== candidateType.value) return false;

    if (!needle) return true;

    const text = [
      candidate.fullName,
      candidate.companyName,
      candidate.country,
      candidate.roleEvidence,
      ...(candidate.capabilities || []),
      ...specialtyLabels(candidate)
    ].filter(Boolean).join(" ").toLowerCase();

    return text.includes(needle);
  });
});

async function refreshBackendState() {
  try {
    await CrmController.health();
    backendAvailable.value = true;
    const queue = await CrmController.reviewQueue({ limit: 500 });
    persistedReviewCount.value = queue.length;
    backendMessage.value = `Connected · ${queue.length} persisted records awaiting verification`;
  } catch (error) {
    backendAvailable.value = false;
    backendMessage.value = "CRM backend unavailable or admin token not accepted.";
  }
}

async function syncReviewedSeeds() {
  if (!backendAvailable.value || syncing.value) return;
  syncing.value = true;
  try {
    const result = await syncTransportEngineeringSeeds();
    backendMessage.value = `Synced ${result.companies} companies and ${result.people} people.`;
    await refreshBackendState();
  } catch (error) {
    backendMessage.value = error.response?.data?.detail || error.message || "Seed sync failed.";
  } finally {
    syncing.value = false;
  }
}

const metrics = computed(() => {
  const all = TRANSPORT_ENGINEERING_REVIEW_QUEUE;
  const people = all.filter((item) => item.candidateType === "person").length;
  const companies = all.filter((item) => item.candidateType === "company").length;
  const priority = all.filter((item) => item.engineeringEvidence.reviewState === "priority_review").length;

  return [
    { label: "Candidates", value: all.length, hint: "Current reviewed seed universe" },
    { label: "People", value: people, hint: "Named engineers / technical leaders" },
    { label: "Companies", value: companies, hint: "Specialist engineering firms" },
    { label: "Priority review", value: priority, hint: "Strongest current evidence" },
    { label: "Persisted queue", value: persistedReviewCount.value, hint: "Backend verification queue" }
  ];
});

onMounted(refreshBackendState);
</script>

<style scoped>
.review-content { display:grid; gap:1rem; }
.backend-status { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
.backend-status p { margin:.35rem 0 0; color:var(--text-secondary,#667085); font-size:.84rem; }
.review-metrics { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.75rem; }
.metric-card span,.metric-card small,.table-head p,td span,td small,.boundary p { color:var(--text-secondary,#667085); }
.metric-card strong { display:block; margin:.3rem 0; font-size:1.8rem; }
.metric-card span,.metric-card small { display:block; }
.filters { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.75rem; }
.filters label { display:grid; gap:.35rem; font-size:.8rem; font-weight:600; }
.filters input,.filters select { min-height:40px; border:1px solid var(--border-color,#d0d5dd); border-radius:8px; padding:0 .75rem; background:var(--surface-primary,#fff); color:inherit; }
.table-head { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:.75rem; }
.table-head h2,.table-head p { margin:0; }
.table-head p { margin-top:.35rem; font-size:.84rem; }
.table-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; font-size:.86rem; }
th,td { padding:.75rem; text-align:left; vertical-align:top; border-bottom:1px solid var(--border-color,#eaecf0); }
th { font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color:var(--text-secondary,#667085); }
td strong,td span,td small { display:block; }
td span,td small { margin-top:.2rem; }
.specialties { display:flex; flex-wrap:wrap; gap:.3rem; }
.chip,.state { width:max-content; border-radius:999px; padding:.18rem .5rem; font-size:.72rem; font-weight:700; }
.chip { background:#f2f4f7; color:#344054 !important; }
.state--priority_review { background:#e6f4ea; color:#137333 !important; }
.state--review { background:#fef7e0; color:#b06000 !important; }
.state--discovery { background:#f2f4f7; color:#475467 !important; }
.boundary p { margin:.4rem 0 0; }
@media (max-width:900px){ .review-metrics,.filters { grid-template-columns:repeat(2,minmax(0,1fr)); } .backend-status{align-items:flex-start;flex-direction:column;} }
@media (max-width:620px){ .review-metrics,.filters { grid-template-columns:1fr; } .table-head{flex-direction:column;} }
</style>
