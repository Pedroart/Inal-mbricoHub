export type AppEvents = {
  'window:ready': { id: number }
  'ingest:filtered': { devId: string; sample: any }
  'proc:reading': { reading: { ts:number; devId:string; value:number; meta?:any } }
  'store:updated': { devId: string }
  'update:available': { version: string }
  'update:progress': { percent: number }
}