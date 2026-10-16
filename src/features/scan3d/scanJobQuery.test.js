import {describe,it,expect,vi} from 'vitest'
import {fetchObstructionScanJobs} from './scanJobQuery.js'
const ids={projectId:'p',surveyId:'s',obstructionId:'o'}
describe('scan job lookup',()=>{
  it('reads a scoped job list without exposing any server credential',async()=>{
    const fetcher=vi.fn(async()=>({ok:true,json:async()=>({...ids,
      jobs:[{jobId:'job',scanId:'scan',state:'queued',archiveSha256:'abc'}]})}))
    const jobs=await fetchObstructionScanJobs({...ids,fetcher})
    expect(jobs[0].state).toBe('queued')
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })
  it('rejects different obstruction',async()=>{
    const fetcher=async()=>({ok:true,json:async()=>({...ids,obstructionId:'wrong',jobs:[]})})
    await expect(fetchObstructionScanJobs({...ids,fetcher})).rejects.toThrow('Mismatched')
  })
})
