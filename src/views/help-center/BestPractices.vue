<template>
  <div class="best-practices-container">
    <div class="text-center mb-5">
        <h1 class="display-5 fw-bold text-primary mb-3">{{ $t('bestPractices') }} & Pro Tips</h1>
        <p class="text-muted lead">Expert advice to get the most out of RouteSurvey.</p>
    </div>

    <div class="practices-grid">
        <!-- Safety & Accuracy -->
        <div class="col-12 col-lg-8 mx-auto">
            <Accordion :multiple="true" :activeIndex="[0]">
                <AccordionTab header="Ensuring High Accuracy GPS Data">
                    <p class="m-0">
                        GPS accuracy is critical for transport logistics. To ensure the best results:
                    </p>
                    <ul class="mt-3">
                         <li><strong>Clear Sky View:</strong> Always ensure the device has a clear line of sight to the sky. Inside the cab of a truck, accuracy drops by 20%.</li>
                         <li><strong>Wait for Lock:</strong> Before hitting "Start Recording", wait 30 seconds for the GPS signal to stabilize to &lt; 5m accuracy.</li>
                         <li><strong>External Receivers:</strong> For critical surveys, pair your device with an external Bluetooth GNSS receiver (e.g., Trimble or Garmin).</li>
                    </ul>
                    <Message severity="info" :closable="false" class="mt-3">Pro Tip: Dark clouds and heavy rain can degrade GPS signal. Always annotate weather conditions in the survey notes.</Message>
                </AccordionTab>
                
                <AccordionTab header="Taking Usable Photos">
                    <p>
                        Photos are your proof of clearance. Avoid "dead" photos that don't convey scale.
                    </p>
                    <div class="grid mt-3">
                        <div class="col-6">
                            <div class="text-center p-3 border-round bg-green-50">
                                <i class="bi bi-check-circle-fill text-green-600 text-2xl mb-2"></i>
                                <div class="font-bold text-green-700">Good Photo</div>
                                <div class="text-sm">Includes a reference object (person, car, measuring pole) to show scale.</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-3 border-round bg-red-50">
                                <i class="bi bi-x-circle-fill text-red-600 text-2xl mb-2"></i>
                                <div class="font-bold text-red-700">Bad Photo</div>
                                <div class="text-sm">Blurry, taken from inside the car, or too zoomed in to see context.</div>
                            </div>
                        </div>
                    </div>
                </AccordionTab>

                <AccordionTab header="Offline Workflow Management">
                    <p>
                        Field work often happens in dead zones. Follow this workflow to prevent data loss:
                    </p>
                    <ol class="mt-3">
                        <li><strong>Before leaving office:</strong> Open the app and download the Planned Route while on Wi-Fi.</li>
                        <li><strong>In the field:</strong> Do <strong>not</strong> force close the app. Keep it running in the background.</li>
                        <li><strong>End of day:</strong> Return to Wi-Fi. Open the app and wait for the "Cloud Sync" icon to turn green before logging out.</li>
                    </ol>
                </AccordionTab>

                <AccordionTab header="Collaborating with Authorities">
                    <p>
                         When sharing data with police or permit authorities:
                    </p>
                     <ul class="mt-3">
                        <li>Use the <strong>"Public Link"</strong> feature instead of sending large PDF files.</li>
                        <li>Set an expiration date for the link (e.g., 30 days) to maintain security.</li>
                        <li>Enable "Password Protection" if the route contains sensitive infrastructure data.</li>
                    </ul>
                </AccordionTab>
            </Accordion>
        </div>
    </div>
  </div>
</template>

<script setup>
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Message from 'primevue/message';
</script>

<style scoped>
.best-practices-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Customizing Accordion for cleaner look */
::v-deep(.p-accordion-header-link) {
    background: white !important;
    border: 1px solid #f0f0f0 !important;
    border-radius: 8px !important;
    margin-bottom: 0.5rem;
    padding: 1.25rem !important;
    font-weight: 600;
    color: #333 !important;
    transition: all 0.2s;
}

::v-deep(.p-accordion-header-link:hover) {
    background: #f8f9fa !important;
    padding-left: 1.5rem !important;
}

::v-deep(.p-accordion-tab-active .p-accordion-header-link) {
    background: var(--primary-color-light, #e0f2fe) !important;
    border-color: var(--primary-color, #007bff) !important;
    color: var(--primary-color, #007bff) !important;
}

::v-deep(.p-accordion-content) {
    border: none !important;
    padding: 1.5rem 2rem 2rem !important;
    background: white;
}
</style>
