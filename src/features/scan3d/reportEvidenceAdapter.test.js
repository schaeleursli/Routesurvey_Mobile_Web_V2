import { describe, it, expect } from 'vitest'
import { normalize3DEvidence } from './reportEvidenceAdapter.js'
const ids = { projectId: 'p', surveyId: 's', obstructionId: 'o' }
const payload = { sectionType: '3d_visual_evidence', ...ids,
  clearanceMeasurementCertified: false,
  scans: [{ ...ids, scanId: 'scan1', originalImages: ['frames/a.jpg'],
    assetRevisions: [{ revision: 1, format: 'glb', uri: 'assets/a.glb' }] }] }
describe('portable scan to report adapter', () => {
  it('preserves scan identity and revisions', () => {
    const result = normalize3DEvidence(payload, ids)
    expect(result.scans[0].scanId).toBe('scan1')
    expect(result.scans[0].modelRevisions[0].revision).toBe(1)
    expect(result.measurementAuthority).toBe('none')
  })
  it('rejects cross-obstruction evidence', () => {
    expect(() => normalize3DEvidence(payload, { ...ids, obstructionId: 'different' })).toThrow()
  })
  it('rejects certified clearance flags', () => {
    expect(() => normalize3DEvidence({ ...payload, clearanceMeasurementCertified: true }, ids)).toThrow()
  })
})
