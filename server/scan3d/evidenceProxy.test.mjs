import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createEvidenceHandler } from './evidenceProxy.mjs'

function response() {
  return { status: null, body: '',
    writeHead(code) { this.status=code },
    end(body) { this.body=JSON.parse(body) } }
}
const req = { method: 'GET', url: '/api/scan3d/evidence?project_id=p&survey_id=s&obstruction_id=o' }
const settings = { upstreamOrigin:'https://world.example.org', serviceToken:'server-only' }
test('denies unauthenticated requests without calling upstream', async()=>{
  let calls=0
  const handler=createEvidenceHandler({...settings,authenticate:async()=>null,
    authorizePoint:async()=>true,upstreamFetch:async()=>{calls++;return {}}})
  const res=response();await handler(req,res)
  assert.equal(res.status,401);assert.equal(calls,0)
})
test('rejects unauthorized point ownership',async()=>{
  let calls=0
  const handler=createEvidenceHandler({...settings,authenticate:async()=>({id:'user'}),
    authorizePoint:async()=>false,upstreamFetch:async()=>{calls++;return {}}})
  const res=response();await handler(req,res)
  assert.equal(res.status,403);assert.equal(calls,0)
})
test('server forwards service token only after ACL and strips model URLs',async()=>{
  let authorization
  const handler=createEvidenceHandler({...settings,authenticate:async()=>({id:'user'}),
    authorizePoint:async()=>true,upstreamFetch:async(_,opts)=>{
      authorization=opts.headers.Authorization
      return {ok:true,json:async()=>({projectId:'p',surveyId:'s',obstructionId:'o',
        jobs:[{jobId:'j',scanId:'scan',state:'queued',archiveSha256:'hash',asset:{uri:'secret'}}]})}
    }})
  const res=response();await handler(req,res)
  assert.equal(res.status,200)
  assert.equal(authorization,'Bearer server-only')
  assert.equal(res.body.jobs[0].asset,undefined)
  assert.deepEqual(res.body.sections,[])
})
test('fails closed when ACL hooks absent',()=>{
  assert.throws(()=>createEvidenceHandler({...settings}),/mandatory/)
})
