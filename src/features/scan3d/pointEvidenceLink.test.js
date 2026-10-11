import {describe,it,expect} from 'vitest'
import {indexPointEvidence,filterForSelectedPoint} from './pointEvidenceLink.js'
const point={id:'point-01'}
const section={sectionType:'3d_visual_evidence',projectId:'p',surveyId:'s',
  obstructionId:'point-01',clearanceMeasurementCertified:false,
  scans:[{scanId:'scan',projectId:'p',surveyId:'s',obstructionId:'point-01',
    originalImages:['frames/a.jpg'],assetRevisions:[]}]}
describe('canonical survey point evidence',()=>{
  it('links a source to canonical point.id',()=>{
    expect(indexPointEvidence(point,[section],{projectId:'p',surveyId:'s'})[0].scans[0].scanId).toBe('scan')
  })
  it('rejects a cross-point reference',()=>{
    expect(()=>indexPointEvidence({id:'point-02'},[section],{projectId:'p',surveyId:'s'})).toThrow()
  })
  it('does not leak evidence to another selection',()=>{
    const index={'point-01':[section]}
    expect(filterForSelectedPoint(index,'point-02')).toEqual([])
  })
})
