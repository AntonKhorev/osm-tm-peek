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
	const $tmDetails=document.createElement('details')
	$tmDetails.id='osm-tm-peek-details'
	$tmDetails.classList.add('mb-3')
	const $tmSummary=document.createElement('summary')
	$tmSummary.textContent=`#hotosm-project-${id}`
	$tmDetails.append($tmSummary)
	const $homeDiv=document.createElement('div')
	const $homeLink=document.createElement('a')
	$homeLink.href=`https://tasks.hotosm.org/projects/${id}`
	$homeLink.textContent=`project homepage`
	$homeDiv.append($homeLink)
	$tmDetails.append($homeDiv)
	return $tmDetails
}
