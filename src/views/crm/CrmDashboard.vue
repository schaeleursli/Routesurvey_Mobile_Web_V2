<template>
  <div class="crm-page">
    <BasePanel
      title="RouteSurvey CRM"
      subtitle="Trial-user intelligence and conversion pipeline"
      elevation="level2"
    >
      <div class="crm-content">
        <section class="crm-metrics" aria-label="CRM overview">
          <BaseCard v-for="metric in metrics" :key="metric.label" class="crm-metric">
            <div class="crm-metric__label">{{ metric.label }}</div>
            <div class="crm-metric__value">{{ metric.value }}</div>
            <div class="crm-metric__hint">{{ metric.hint }}</div>
          </BaseCard>
        </section>

        <BaseCard class="crm-filters">
          <div class="crm-filters__row">
            <label class="crm-field">
              <span>Search</span>
              <input
                v-model.trim="query"
                type="search"
                placeholder="Name, email, company or domain"
              />
            </label>
            <label class="crm-field">
              <span>Lifecycle</span>
              <select v-model="segment">
                <option value="all">All contacts</option>
                <option value="trial">Active trial</option>
                <option value="expired">Expired trial</option>
                <option value="customer">Customer</option>
                <option value="company">Company identified</option>
              </select>
            </label>
          </div>
        </BaseCard>

        <BaseCard class="crm-table-card">
          <div class="crm-table-head">
            <div>
              <h2>Contacts</h2>
              <p>{{ filteredContacts.length }} matching records · showing up to {{ displayLimit }}</p>
            </div>
            <router-link class="crm-link" to="/admin/users">Open user administration</router-link>
          </div>

          <div class="crm-table-wrap">
            <table class="crm-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Lifecycle</th>
                  <th>Email type</th>
                  <th>Priority signal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="contact in visibleContacts" :key="contact.userId || contact.email">
                  <td>
                    <strong>{{ fullName(contact) }}</strong>
                    <span>{{ contact.email || "No email" }}</span>
                  </td>
                  <td>
                    <strong>{{ companyName(contact) }}</strong>
                    <span v-if="contact.companyWebsite">{{ contact.companyWebsite }}</span>
                  </td>
                  <td>
                    <span class="crm-pill" :class="'crm-pill--' + lifecycle(contact).tone">
                      {{ lifecycle(contact).label }}
                    </span>
                  </td>
                  <td>
                    <span>{{ emailType(contact).label }}</span>
                    <small>{{ emailType(contact).detail }}</small>
                  </td>
                  <td>
                    <span class="crm-priority" :class="'crm-priority--' + priority(contact).tone">
                      {{ priority(contact).label }}
                    </span>
                    <small>{{ priority(contact).detail }}</small>
                  </td>
                </tr>
                <tr v-if="visibleContacts.length === 0">
                  <td colspan="5" class="crm-empty">No contacts match the current filters.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>

        <BaseCard class="crm-next">
          <div>
            <strong>CRM v1 boundary</strong>
            <p>
              This view is read-only over the existing RouteSurvey user API. Email validation,
              LinkedIn enrichment, notes, outreach history and opportunity stages require the
              CRM persistence/API sprint and are intentionally not stored in browser state.
            </p>
          </div>
        </BaseCard>
      </div>
    </BasePanel>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useUsersAdmin } from "@/composables/users_admin/useUsersAdmin";
import { BaseCard, BasePanel } from "@/components/ui";

const showMessage = inject("showMessage", null);
const { users, getData } = useUsersAdmin(showMessage);

const query = ref("");
const segment = ref("all");
const displayLimit = 50;

const personalDomains = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "gmx.com",
  "gmx.de",
  "gmx.ch",
  "comcast.net"
]);

const getDomain = (email = "") => {
  const parts = String(email).toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
};

const hasCompany = (user) =>
  Boolean(user?.companyName?.trim() || user?.companyWebsite?.trim());

const fullName = (user) => {
  const value = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return value || user?.username || "Unnamed contact";
};

const companyName = (user) => {
  if (user?.companyName?.trim()) return user.companyName.trim();
  const domain = getDomain(user?.email);
  if (domain && !personalDomains.has(domain)) return domain;
  return "Not identified";
};

const lifecycle = (user) => {
  if (user?.plan) return { label: "Customer", tone: "customer" };
  if (user?.isExpired) return { label: "Trial expired", tone: "expired" };
  return { label: "Active trial", tone: "trial" };
};

const emailType = (user) => {
  const domain = getDomain(user?.email);
  if (!domain) return { label: "Missing", detail: "No usable address" };
  if (personalDomains.has(domain)) {
    return { label: "Personal", detail: domain };
  }
  return { label: "Corporate", detail: domain };
};

const priority = (user) => {
  if (user?.plan) {
    return { label: "Customer", tone: "customer", detail: "Retention / expansion" };
  }
  if (!user?.isExpired && hasCompany(user) && emailType(user).label === "Corporate") {
    return { label: "High", tone: "high", detail: "Active trial + company" };
  }
  if (!user?.isExpired) {
    return { label: "Medium", tone: "medium", detail: "Active trial" };
  }
  if (hasCompany(user)) {
    return { label: "Medium", tone: "medium", detail: "Expired but company known" };
  }
  return { label: "Low", tone: "low", detail: "Needs enrichment" };
};

const metrics = computed(() => {
  const total = users.value.length;
  const customers = users.value.filter((u) => Boolean(u.plan)).length;
  const activeTrials = users.value.filter((u) => !u.plan && !u.isExpired).length;
  const expiredTrials = users.value.filter((u) => !u.plan && u.isExpired).length;
  const companies = users.value.filter(hasCompany).length;
  const coverage = total ? Math.round((companies / total) * 100) : 0;

  return [
    { label: "Contacts", value: total, hint: "Existing RouteSurvey users" },
    { label: "Active trials", value: activeTrials, hint: "Conversion candidates" },
    { label: "Expired trials", value: expiredTrials, hint: "Reactivation candidates" },
    { label: "Customers", value: customers, hint: "Retention / expansion" },
    { label: "Company coverage", value: coverage + "%", hint: companies + " contacts identified" }
  ];
});

const filteredContacts = computed(() => {
  const needle = query.value.toLowerCase();

  return users.value
    .filter((user) => {
      if (segment.value === "trial" && (user.plan || user.isExpired)) return false;
      if (segment.value === "expired" && (user.plan || !user.isExpired)) return false;
      if (segment.value === "customer" && !user.plan) return false;
      if (segment.value === "company" && !hasCompany(user)) return false;

      if (!needle) return true;

      const haystack = [
        fullName(user),
        user.email,
        user.companyName,
        user.companyWebsite,
        getDomain(user.email)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    })
    .sort((a, b) => {
      const rank = { high: 0, customer: 1, medium: 2, low: 3 };
      return rank[priority(a).tone] - rank[priority(b).tone];
    });
});

const visibleContacts = computed(() => filteredContacts.value.slice(0, displayLimit));

onMounted(getData);
</script>

<style scoped>
.crm-page {
  padding: 0;
}

.crm-content {
  display: grid;
  gap: 1rem;
}

.crm-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}

.crm-metric {
  min-height: 116px;
}

.crm-metric__label {
  color: var(--text-secondary, #667085);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.crm-metric__value {
  margin-top: 0.35rem;
  font-size: 2rem;
  line-height: 1;
  font-weight: 700;
}

.crm-metric__hint,
.crm-table-head p,
.crm-next p {
  margin: 0.45rem 0 0;
  color: var(--text-secondary, #667085);
  font-size: 0.85rem;
}

.crm-filters__row {
  display: grid;
  grid-template-columns: minmax(240px, 2fr) minmax(180px, 1fr);
  gap: 0.75rem;
}

.crm-field {
  display: grid;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.crm-field input,
.crm-field select {
  min-height: 40px;
  border: 1px solid var(--border-color, #d0d5dd);
  border-radius: 8px;
  background: var(--surface-primary, #fff);
  color: inherit;
  padding: 0 0.75rem;
}

.crm-table-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.crm-table-head h2 {
  margin: 0;
  font-size: 1.05rem;
}

.crm-link {
  font-size: 0.85rem;
  font-weight: 600;
}

.crm-table-wrap {
  overflow-x: auto;
}

.crm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.crm-table th,
.crm-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color, #eaecf0);
  text-align: left;
  vertical-align: top;
}

.crm-table th {
  color: var(--text-secondary, #667085);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.035em;
}

.crm-table td strong,
.crm-table td span,
.crm-table td small {
  display: block;
}

.crm-table td span,
.crm-table td small {
  margin-top: 0.2rem;
  color: var(--text-secondary, #667085);
}

.crm-pill,
.crm-priority {
  display: inline-block !important;
  width: max-content;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.76rem;
  font-weight: 700;
}

.crm-pill--customer,
.crm-priority--customer {
  background: #e8f5e9;
  color: #1b5e20 !important;
}

.crm-pill--trial {
  background: #e8f0fe;
  color: #174ea6 !important;
}

.crm-pill--expired {
  background: #fce8e6;
  color: #a50e0e !important;
}

.crm-priority--high {
  background: #e6f4ea;
  color: #137333 !important;
}

.crm-priority--medium {
  background: #fef7e0;
  color: #b06000 !important;
}

.crm-priority--low {
  background: #f2f4f7;
  color: #475467 !important;
}

.crm-empty {
  padding: 2rem !important;
  text-align: center !important;
  color: var(--text-secondary, #667085);
}

@media (max-width: 1100px) {
  .crm-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .crm-metrics,
  .crm-filters__row {
    grid-template-columns: 1fr;
  }

  .crm-table-head {
    flex-direction: column;
  }
}
</style>
