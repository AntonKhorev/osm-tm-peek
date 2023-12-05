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
	$details.classList.add('mb-3')
	$details.dataset.id=id
	$details.ontoggle=loadProjectDetails
	{
		const $summary=document.createElement('summary')
		$summary.textContent=`#hotosm-project-${id}`
		$details.append($summary)
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
	if ($details.dataset.loaded) return
	const id=$details.dataset.id
	if (id==null) return
	const $summary=$details.querySelector(':scope > summary')
	if (!$summary) return
	const $spinner=document.createElement('div')
	$spinner.classList.add('text-center')
	$spinner.innerHTML=`<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`
	$summary.after($spinner)
	let data
	try {
		const response=await fetch(getHotosmApiProjectUrl(id))
		if (!response.ok) throw new Error
		data=await response.json()
	} catch {
		const $errorMessage=document.createElement('div')
		$errorMessage.classList.add('alert','alert-danger')
		$errorMessage.textContent=`failed to load project info`
		$spinner.replaceWith($errorMessage)
		return
	}
	if (data?.projectInfo?.name) {
		const $name=document.createElement('h5')
		$name.textContent=data.projectInfo.name
		$spinner.replaceWith($name)
	}
}

function getHotosmApiProjectUrl(id) {
	return `https://tasking-manager-tm4-production-api.hotosm.org/api/v2/projects/${id}`
}
