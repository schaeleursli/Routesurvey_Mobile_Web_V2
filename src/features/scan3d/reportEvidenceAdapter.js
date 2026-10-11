/** Import portable RouteSurvey 3D evidence into report models without inventing measurements. */
export function normalize3DEvidence(section, { projectId, surveyId, obstructionId }) {
  if (!section || section.sectionType !== '3d_visual_evidence') throw new Error('Unsupported evidence section')
  for (const [key, expected] of Object.entries({ projectId, surveyId, obstructionId })) {
    if (!expected || section[key] !== expected) throw new Error('Evidence identity mismatch: ' + key)
  }
  if (section.clearanceMeasurementCertified !== false) throw new Error('Reconstructed geometry cannot certify clearance')
  if (!Array.isArray(section.scans)) throw new Error('Missing scan list')
  const scans = section.scans.map(scan => {
    for (const [key, expected] of Object.entries({ projectId, surveyId, obstructionId })) {
      if (scan[key] !== expected) throw new Error('Cross-obstruction scan rejected')
    }
    if (!scan.scanId || !Array.isArray(scan.originalImages) || !scan.originalImages.length) {
      throw new Error('Missing original capture evidence')
    }
    const revisions = scan.assetRevisions ?? []
    if (!Array.isArray(revisions)) throw new Error('Invalid revision history')
    return {
      scanId: scan.scanId,
      captureTimestamp: scan.captureTimestamp ?? null,
      originalImages: [...scan.originalImages],
      modelRevisions: revisions.map(a => ({
        revision: a.revision, format: a.format, uri: a.uri
      })),
      locationStatus: scan.locationStatus ?? 'unverified',
      measurementStatus: scan.measurementStatus ?? 'unmeasured'
    }
  })
  return {
    type: '3d_visual_evidence',
    projectId, surveyId, obstructionId,
    scans,
    measurementAuthority: 'none',
    disclaimer: '3D reconstruction is visual evidence; engineering clearances require independently verified field measurements.'
  }
}
