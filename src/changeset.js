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
		$a.href=`https://tasking-manager-tm4-production-api.hotosm.org/api/v2/projects/${id}`
		$a.textContent=`project json info`
		$div.append($a)
		$details.append($div)
	}
	return $details
}
