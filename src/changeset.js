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
		const $tmSummary=document.createElement('summary')
		$tmSummary.textContent=`#hotosm-project-${hotosmProjectId}`
		const $tmDetails=document.createElement('details')
		$tmDetails.append($tmSummary)
		$discussion.prepend($tmDetails)
	}
}

function matchHotosmProjectId(s) {
	const match=s.match(/#hotosm-project-(\d+)/)
	if (!match) return
	return match[1]
}
