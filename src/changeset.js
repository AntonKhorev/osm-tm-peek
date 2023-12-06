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
		$div.classList.add('secondary-actions')
		const $aHome=document.createElement('a')
		$aHome.href=`https://tasks.hotosm.org/projects/${id}`
		$aHome.textContent=`Homepage`
		const $aData=document.createElement('a')
		$aData.href=getHotosmApiProjectUrl(id)
		$aData.textContent=`JSON data`
		$div.append($aHome,` · `,$aData)
		$details.append($div)
	}
	return $details
}

async function loadProjectDetails() {
	const $details=this
	if (!$details.open) return // TODO cancel on close
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
		if (data?.projectInfo?.shortDescription || data?.projectInfo?.longDescription) {
			let $shortDescription,$longDescription
			if (data?.projectInfo?.shortDescription) {
				$shortDescription=document.createElement('div')
				$shortDescription.id='osm-tm-peek-details-short-description'
				$shortDescription.style.whiteSpace='pre-wrap'
				$shortDescription.textContent=data.projectInfo.shortDescription
				$article.append($shortDescription)
			}
			if (data?.projectInfo?.description) {
				$longDescription=document.createElement('div')
				$longDescription.id='osm-tm-peek-details-long-description'
				$longDescription.style.whiteSpace='pre-wrap'
				$longDescription.textContent=data.projectInfo.description
				$article.append($longDescription)
			}
			if ($shortDescription && $longDescription) {
				$longDescription.hidden=true
				const $showMore=document.createElement('a')
				$showMore.href='#osm-tm-peek-details-long-description'
				$showMore.textContent=`more...`
				$showMore.onclick=ev=>{
					ev.preventDefault()
					$shortDescription.hidden=true
					$longDescription.hidden=false
				}
				const $showLess=document.createElement('a')
				$showLess.href='#osm-tm-peek-details-short-description'
				$showLess.textContent=`less...`
				$showLess.onclick=ev=>{
					ev.preventDefault()
					$shortDescription.hidden=false
					$longDescription.hidden=true
				}
				$shortDescription.append(` `,$showMore)
				$longDescription.append(` `,$showLess)
			}
		}
	}
}

})()
