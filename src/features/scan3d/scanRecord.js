/** Cross-platform 3D survey-scan metadata contract. No inferred measurements. */
export const SCAN_STATUS = Object.freeze(['captured', 'queued', 'processing', 'ready', 'failed'])
export const SCAN_FORMATS = Object.freeze(['glb', 'gltf', 'gaussian-ply', 'spz'])
export function validateScanRecord(record) {
  if (!record || typeof record !== 'object') throw new Error('Scan record required')
  for (const field of ['projectId', 'surveyId', 'obstructionId', 'scanId']) {
    if (typeof record[field] !== 'string' || !record[field].trim()) throw new Error(`Missing ${field}`)
  }
  if (!SCAN_STATUS.includes(record.status)) throw new Error('Invalid scan status')
  if (!Array.isArray(record.images) || record.images.length === 0) throw new Error('At least one source image required')
  if (record.images.some(x => typeof x !== 'string' || !x.trim())) throw new Error('Invalid source image')
  if (record.asset) {
    if (!SCAN_FORMATS.includes(record.asset.format) || typeof record.asset.uri !== 'string' || !record.asset.uri.trim()) {
      throw new Error('Invalid 3D asset')
    }
  }
  if (!['unmeasured', 'estimated', 'field_verified'].includes(record.measurementStatus)) {
    throw new Error('Explicit measurement status required')
  }
  if (record.measurementStatus === 'field_verified' && (!record.measurementEvidence || !record.measurementEvidence.method)) {
    throw new Error('Verified measurements require method and evidence')
  }
  if (record.location) {
    const { latitude, longitude } = record.location
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new Error('Invalid geographic anchor')
    }
  }
  return record
}
export function newScanRecord({ projectId, surveyId, obstructionId, images, location = null }) {
  return validateScanRecord({
    schemaVersion: '1.0', scanId: globalThis.crypto?.randomUUID?.() ?? `scan-${Date.now()}`,
    projectId, surveyId, obstructionId, images, location, status: 'captured',
    asset: null, measurementStatus: 'unmeasured', measurementEvidence: null,
    reconstructionMethod: 'not_processed', geometryScale: 'unknown'
  })
}
