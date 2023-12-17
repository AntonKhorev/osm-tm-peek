import getHotosmApiProjectUrl from './tm'

type ProjectCacheRecord = {
	timestamp: number
	data: object
}

const projectCache=new Map<number,ProjectCacheRecord>()

browser.runtime.onMessage.addListener(message=>{
	if (message.action=='fetchProjectData') {
		// can't do it from the content script because CSP header: content-security-policy: ... connect-src ...
		return fetchProjectData(message.id)
	}
	return false
})

async function fetchProjectData(id: number): Promise<object|null> {
	const now=Date.now()
	const projectCacheRecord=projectCache.get(id)
	if (projectCacheRecord) {
		const {timestamp,data}=projectCacheRecord
		if (timestamp>=now-5*60*1000) {
			return data
		}
	}
	let data: object|null
	try {
		const response=await fetch(getHotosmApiProjectUrl(id))
		if (!response.ok) throw new Error
		data=await response.json()
		if (!data || typeof data != 'object') return null
	} catch {
		return null
	}
	projectCache.set(id,{timestamp:now,data})
	return data
}
