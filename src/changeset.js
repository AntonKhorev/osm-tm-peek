(async()=>{

const {default:getHotosmApiProjectUrl}=await import(browser.runtime.getURL('tm.js'))

const $oldTmDetails=document.getElementById('osm-tm-peek-details')
if ($oldTmDetails) {
	$oldTmDetails.remove()
}

const $browseSection=document.querySelector('#sidebar_content > .browse-section')
if ($browseSection) {
	let hotosmProjectId
	const $comment=$browseSection.querySelector(':scope > p.fst-italic')
	if ($comment) {
		hotosmProjectId=matchHotosmProjectId($comment.textContent)
	}
	const $tagsContainer=$browseSection.querySelector(':scope > .rounded')
	if ($tagsContainer) {
		const $tags=$browseSection.querySelector('table.browse-tag-list')
		// TODO parse tags
	}
	const $discussion=$browseSection.querySelector(':scope > .row')
	if (hotosmProjectId!=null && $discussion) {
		const $tmDetails=makeProjectDetails(hotosmProjectId)
		$discussion.prepend($tmDetails)
	}
}

function matchHotosmProjectId(s) {
	const match=s.match(/#hotosm-project-(\d+)/)
	if (!match) return
	return match[1]
}

function makeProjectDetails(id) {
	const $details=document.createElement('details')
	$details.id='osm-tm-peek-details'
	$details.dataset.id=id
	$details.classList.add('mb-3')
	$details.ontoggle=loadProjectDetails
	{
		const $summary=document.createElement('summary')
		$summary.textContent=`#hotosm-project-${id}`
		$details.append($summary)
	}{
		const $article=document.createElement('article')
		$details.append($article)
	}{
		const $div=document.createElement('div')
		const $a=document.createElement('a')
		$a.href=`https://tasks.hotosm.org/projects/${id}`
		$a.textContent=`project homepage`
		$div.append($a)
		$details.append($div)
	}{
		const $div=document.createElement('div')
		const $a=document.createElement('a')
		$a.href=getHotosmApiProjectUrl(id)
		$a.textContent=`project json info`
		$div.append($a)
		$details.append($div)
	}
	return $details
}

async function loadProjectDetails() {
	const $details=this
	if (!$details.open) return // TODO cancel on close
	// if ($details.dataset.loaded) return // TODO either this or cache in background script
	const id=$details.dataset.id
	if (id==null) return
	const $article=$details.querySelector(':scope > article')
	if (!$article) return
	{
		const $spinner=document.createElement('div')
		$spinner.classList.add('text-center')
		$spinner.innerHTML=`<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`
		$article.replaceChildren($spinner)
	}
	const data=await browser.runtime.sendMessage({action:'fetchProjectData',id})
	if (data==null) {
		const $errorMessage=document.createElement('div')
		$errorMessage.classList.add('alert','alert-danger')
		$errorMessage.textContent=`failed to load project data`
		$article.replaceChildren($errorMessage)
	} else {
		$article.replaceChildren()
		if (data?.projectInfo?.name) {
			const $name=document.createElement('h5')
			$name.textContent=data.projectInfo.name
			$article.append($name)
		}
	}
}

})()
