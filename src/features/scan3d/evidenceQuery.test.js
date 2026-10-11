import { describe,it,expect,vi } from 'vitest'
import { fetchPoint3DEvidence } from './evidenceQuery.js'
const ids={projectId:'p',surveyId:'s',pointId:'o'}
describe('secure evidence query boundary',()=>{
  it('fetches only from same-origin proxy and preserves point identity',async()=>{
    const fetcher=vi.fn(async()=>({ok:true,json:async()=>({
      projectId:'p',surveyId:'s',obstructionId:'o',sections:[]
    })}))
    expect(await fetchPoint3DEvidence({...ids,fetcher})).toEqual([])
    expect(fetcher.mock.calls[0][0]).toContain('/api/scan3d/evidence?')
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })
  it('rejects cross-obstruction responses',async()=>{
    const fetcher=async()=>({ok:true,json:async()=>({
      projectId:'p',surveyId:'s',obstructionId:'other',sections:[]
    })})
    await expect(fetchPoint3DEvidence({...ids,fetcher})).rejects.toThrow(/mismatched/)
  })
})
