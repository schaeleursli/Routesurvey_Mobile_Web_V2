import { validateScanRecord } from './scanRecord.js'
export const CURRENT_SCAN_SCHEMA = '1.1'
export function migrateScanRecord(input) {
  if (!input || typeof input !== 'object') throw new Error('Scan record required')
  const version = input.schemaVersion ?? '1.0'
  if (!['1.0', '1.1'].includes(version)) throw new Error('Unsupported scan schema: ' + version)
  const record = structuredClone(input)
  if (version === '1.0') {
    record.schemaVersion = CURRENT_SCAN_SCHEMA
    record.assets = record.asset ? [{ ...record.asset, role: 'primary', version: 1 }] : []
    record.capture = { sourceImages: [...record.images], coordinateFrame: 'unknown', originalRetained: true }
    record.migrationHistory = [{ from: '1.0', to: '1.1', transform: 'v1_to_v1_1' }]
  }
  if (!Array.isArray(record.assets)) record.assets = []
  if (!Array.isArray(record.migrationHistory)) record.migrationHistory = []
  validateScanRecord(record)
  return record
}
export function selectPortableAssets(record) {
  const scan = migrateScanRecord(record)
  return scan.assets.filter(asset => ['glb', 'gltf', 'spz', 'gaussian-ply'].includes(asset.format))
}
