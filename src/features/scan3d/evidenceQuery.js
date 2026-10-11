import { normalize3DEvidence } from './reportEvidenceAdapter.js'

/** Browser client speaks ONLY to a trusted same-origin RouteSurvey backend.
 * Never forward World Studio's development bearer secret to the browser.
 */
export async function fetchPoint3DEvidence({ projectId, surveyId, pointId, fetcher = fetch }) {
  if (![projectId,surveyId,pointId].every(v => typeof v === 'string' && v.trim())) {
    throw new Error('Canonical survey identifiers required')
  }
  const query = new URLSearchParams({ project_id: projectId, survey_id: surveyId, obstruction_id: pointId })
  const response = await fetcher('/api/scan3d/evidence?' + query.toString(), {
    method: 'GET', credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Evidence lookup failed: HTTP ' + response.status)
  const payload = await response.json()
  if (payload.projectId !== projectId || payload.surveyId !== surveyId ||
      payload.obstructionId !== pointId || !Array.isArray(payload.sections)) {
    throw new Error('Invalid or mismatched evidence response')
  }
  return payload.sections.map(section => normalize3DEvidence(section, {
    projectId, surveyId, obstructionId: pointId
  }))
}
