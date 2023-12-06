import getHotosmApiProjectUrl from './tm.js'

browser.runtime.onMessage.addListener(message=>{
	if (message.action=='fetchProjectData') {
		// can't do it from the content script because CSP header: content-security-policy: ... connect-src ...
		return fetchProjectData(message.id)
	}
	return false
})

async function fetchProjectData(id) {
	let data
	try {
		const response=await fetch(getHotosmApiProjectUrl(id))
		if (!response.ok) throw new Error
		data=await response.json()
	} catch {
		return null
	}
	// TODO cache data
	return data
}
