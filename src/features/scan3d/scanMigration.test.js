import { describe, it, expect } from 'vitest'
import { migrateScanRecord, selectPortableAssets } from './scanMigration.js'
const v1 = { schemaVersion: '1.0', scanId: 'scan-01', projectId: 'p', surveyId: 's', obstructionId: 'o', status: 'ready', images: ['frames/a.jpg'], measurementStatus: 'unmeasured', asset: { format: 'glb', uri: 'assets/a.glb' } }
describe('3D scan portable migration', () => {
  it('upgrades V1 without discarding original asset links', () => {
    const migrated = migrateScanRecord(v1)
    expect(migrated.schemaVersion).toBe('1.1')
    expect(migrated.assets[0].uri).toBe('assets/a.glb')
    expect(migrated.asset.uri).toBe('assets/a.glb')
    expect(v1.schemaVersion).toBe('1.0')
  })
  it('is idempotent on schema 1.1', () => {
    const migrated = migrateScanRecord(v1)
    expect(migrateScanRecord(migrated)).toEqual(migrated)
  })
  it('does not silently downgrade unknown future schema', () => {
    expect(() => migrateScanRecord({ ...v1, schemaVersion: '2.0' })).toThrow(/Unsupported/)
  })
  it('returns portable asset references', () => {
    expect(selectPortableAssets(v1)[0].format).toBe('glb')
  })
})
