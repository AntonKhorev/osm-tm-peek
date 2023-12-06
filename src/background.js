import getHotosmApiProjectUrl from './tm.js'

const projectDataCache=new Map()

browser.runtime.onMessage.addListener(message=>{
	if (message.action=='fetchProjectData') {
		// can't do it from the content script because CSP header: content-security-policy: ... connect-src ...
		return fetchProjectData(message.id)
	}
	return false
})

async function fetchProjectData(id) {
	const now=Date.now()
	if (projectDataCache.has(id)) {
		const {timestamp,data}=projectDataCache.get(id)
		if (timestamp>=now-5*60*1000) {
			return data
		}
	}
	let data
	try {
		const response=await fetch(getHotosmApiProjectUrl(id))
		if (!response.ok) throw new Error
		data=await response.json()
	} catch {
		return null
	}
	projectDataCache.set(id,{timestamp:now,data})
	return data
}
