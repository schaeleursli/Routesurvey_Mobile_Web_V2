import { describe, it, expect } from 'vitest'
import { validateScanRecord } from './scanRecord.js'
const fixture = {
  projectId: 'p', surveyId: 's', obstructionId: 'o', scanId: 'id',
  status: 'captured', images: ['frames/001.jpg'], measurementStatus: 'unmeasured'
}
describe('3D scan contract', () => {
  it('accepts unmeasured captures', () => expect(validateScanRecord(fixture)).toBe(fixture))
  it('rejects missing obstruction links', () => expect(() => validateScanRecord({ ...fixture, obstructionId: '' })).toThrow())
  it('prevents unsupported measurements', () => expect(() => validateScanRecord({ ...fixture, measurementStatus: 'field_verified' })).toThrow())
  it('validates asset format', () => expect(() => validateScanRecord({ ...fixture, asset: { format: 'xyz', uri: 'a' } })).toThrow())
})
