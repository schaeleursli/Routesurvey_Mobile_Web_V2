/** Canonical, same-origin job-status lookup. Server must enforce session and ACL. */
export async function fetchObstructionScanJobs({ projectId, surveyId, obstructionId, fetcher = fetch, signal }) {
  const values = [projectId, surveyId, obstructionId]
  if (values.some(v => typeof v !== 'string' || !v.trim())) throw new Error('Missing canonical identity')
  const qs = new URLSearchParams({ project_id: projectId, survey_id: surveyId, obstruction_id: obstructionId })
  const result = await fetcher('/api/scan3d/evidence?' + qs, {
    method: 'GET', credentials: 'same-origin', signal,
    headers: { Accept: 'application/json' }
  })
  if (!result.ok) throw new Error('Scan jobs unavailable: ' + result.status)
  const data = await result.json()
  if (data.projectId !== projectId || data.surveyId !== surveyId ||
      data.obstructionId !== obstructionId || !Array.isArray(data.jobs)) {
    throw new Error('Mismatched scan job response')
  }
  const allowed = new Set(['queued','uploading','processing','ready','failed'])
  return data.jobs.map(j => {
    if (typeof j.jobId !== 'string' || typeof j.scanId !== 'string' ||
        !allowed.has(j.state)) throw new Error('Malformed scan job metadata')
    return { jobId: j.jobId, scanId: j.scanId, state: j.state,
      archiveSha256: typeof j.archiveSha256 === 'string' ? j.archiveSha256 : '' }
  })
}
