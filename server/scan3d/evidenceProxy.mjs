/**
 * Server-only RouteSurvey evidence handler.
 * Integration MUST inject real session authentication and project/point ACLs.
 * No default permissive auth is provided.
 */
const valid = x => typeof x === 'string' && x.length > 0 && x.length <= 150

export function createEvidenceHandler({ authenticate, authorizePoint, upstreamFetch = fetch,
  upstreamOrigin, serviceToken }) {
  if (typeof authenticate !== 'function' || typeof authorizePoint !== 'function') {
    throw new Error('Authentication and point authorization are mandatory')
  }
  const url = new URL(upstreamOrigin || 'https://unconfigured.invalid')
  if (url.protocol !== 'https:' || !upstreamOrigin || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash || !serviceToken) {
    throw new Error('HTTPS upstream origin and service credential are required')
  }
  return async function evidenceHandler(req, res) {
    const reject = (code, message) => {
      res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(JSON.stringify({ error: message }))
    }
    if (req.method !== 'GET') return reject(405, 'Method not allowed')
    try {
      const user = await authenticate(req)
      if (!user || !valid(user.id)) return reject(401, 'Authentication required')
      const input = new URL(req.url, 'http://localhost')
      const projectId = input.searchParams.get('project_id')
      const surveyId = input.searchParams.get('survey_id')
      const obstructionId = input.searchParams.get('obstruction_id')
      if (![projectId,surveyId,obstructionId].every(valid)) return reject(400, 'Invalid canonical IDs')
      // Authorization must check authoritative project membership and canonical
      // point ownership in the same survey, NEVER the request parameters alone.
      const authorized = await authorizePoint({ user, projectId, surveyId, obstructionId })
      if (authorized !== true) return reject(403, 'Not authorized')
      const target = new URL('/api/routesurvey/v1/evidence', url)
      target.searchParams.set('project_id', projectId)
      target.searchParams.set('survey_id', surveyId)
      target.searchParams.set('obstruction_id', obstructionId)
      const response = await upstreamFetch(target, {
        method: 'GET', headers: { Authorization: 'Bearer ' + serviceToken, Accept: 'application/json' },
        signal: AbortSignal.timeout(10000), redirect: 'error'
      })
      if (!response.ok) return reject(502, 'Evidence service unavailable')
      const data = await response.json()
      if (data.projectId !== projectId || data.surveyId !== surveyId ||
          data.obstructionId !== obstructionId || !Array.isArray(data.jobs)) {
        return reject(502, 'Evidence service returned mismatched identity')
      }
      // Existing World Studio prototype produces job metadata, not finalized
      // report evidence. Expose state as metadata; DO NOT manufacture sections.
      const jobs = data.jobs.map(j => ({
        jobId: String(j.jobId || ''), scanId: String(j.scanId || ''),
        state: String(j.state || 'unknown'), archiveSha256: String(j.archiveSha256 || '')
      }))
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(JSON.stringify({ projectId, surveyId, obstructionId, jobs, sections: [] }))
    } catch {
      return reject(503, 'Evidence lookup unavailable')
    }
  }
}
