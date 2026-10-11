import { normalize3DEvidence } from './reportEvidenceAdapter.js'

/** Links persisted scan evidence only to a canonical survey point ID. */
export function indexPointEvidence(point, sections, {projectId, surveyId}) {
  if (!point || typeof point.id !== 'string' || !point.id.trim()) throw new Error('Canonical point.id required')
  if (!Array.isArray(sections)) throw new Error('Evidence sections must be an array')
  return sections.map(section => normalize3DEvidence(section, {
    projectId, surveyId, obstructionId: point.id
  }))
}

export function filterForSelectedPoint(index, pointId) {
  if (!pointId || !index || typeof index !== 'object') return []
  return Array.isArray(index[pointId]) ? index[pointId] : []
}
