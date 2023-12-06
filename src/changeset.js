(async()=>{

const {default:getHotosmApiProjectUrl}=await import(browser.runtime.getURL('tm.js'))

const $sidebarContent=document.getElementById('sidebar_content')
if (!$sidebarContent) return

let aoiLayer

insertDetails()
new MutationObserver(()=>{
	clearAoiLayer()
	insertDetails()
}).observe($sidebarContent,{childList:true})

function insertDetails() {
	let $browseSection,hotosmProjectId
	if (location.pathname.startsWith('/changeset/')) {
		$browseSection=$sidebarContent.querySelector(':scope > .browse-section')
	}
	if ($browseSection) {
		const $comment=$browseSection.querySelector(':scope > p.fst-italic')
		if ($comment) {
			hotosmProjectId=matchHotosmProjectId($comment.textContent)
		}
		const $tagsContainer=$browseSection.querySelector(':scope > .rounded')
		if ($tagsContainer) {
			const $tags=$browseSection.querySelector('table.browse-tag-list')
			// TODO parse tags
		}
	}
	let $oldTmDetails=document.getElementById('osm-tm-peek-details')
	if ($oldTmDetails && (hotosmProjectId==null || hotosmProjectId!=$oldTmDetails.dataset.id)) {
		$oldTmDetails.remove()
		$oldTmDetails=null
	}
	if ($browseSection && !$oldTmDetails && hotosmProjectId!=null) {
		const $discussion=$browseSection.querySelector(':scope > .row')
		if ($discussion) {
			const $tmDetails=makeProjectDetails(hotosmProjectId)
			$discussion.prepend($tmDetails)
		}
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
	clearAoiLayer()
	const $details=this
	if (!$details.open) return // TODO cancel on close
	const id=$details.dataset.id
	if (id==null) return
	const $article=$details.querySelector(':scope > article')
	if (!$article) return
	{
		const $spinner=document.createElement('div')
		$spinner.classList.add('mt-2','text-center')
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
		if (window.osmTmPeekHookedMap) {
			if (data?.areaOfInterest) {
				const geometry=cloneInto(data.areaOfInterest,window)
				aoiLayer=window.wrappedJSObject.L.geoJSON(geometry)
			} else if (data?.aoiBBOX) {
				const [minLon,minLat,maxLon,maxLat]=data.aoiBBOX
				const bounds=cloneInto([[minLat,minLon],[maxLat,maxLon]],window)
				aoiLayer=window.wrappedJSObject.L.rectangle(bounds)
				// window.osmTmPeekHookedMap.wrappedJSObject.fitBounds(bounds)
			}
			aoiLayer?.addTo(window.osmTmPeekHookedMap)
		}
		if (data?.projectInfo?.name) {
			const $name=document.createElement('h5')
			$name.classList.add('mt-2')
			$name.textContent=data.projectInfo.name
			$article.append($name)
		}
		if (data?.projectInfo?.shortDescription || data?.projectInfo?.longDescription) {
			let $shortDescription,$longDescription
			if (data?.projectInfo?.shortDescription) {
				$shortDescription=document.createElement('div')
				$shortDescription.classList.add('mb-3')
				$shortDescription.id='osm-tm-peek-details-short-description'
				$shortDescription.style.whiteSpace='pre-wrap'
				$shortDescription.textContent=data.projectInfo.shortDescription
				$article.append($shortDescription)
			}
			if (data?.projectInfo?.description && data?.projectInfo?.description!=data?.projectInfo?.shortDescription) {
				$longDescription=document.createElement('div')
				$longDescription.classList.add('mb-3')
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
		if (data?.organisationName || data?.organisationLogo) {
			const $card=document.createElement('div')
			$card.classList.add('card')
			const $row=document.createElement('div')
			$row.classList.add('row','g-0','align-items-center')
			const $bodyContainer=document.createElement('div')
			if (data?.organisationLogo) {
				const $logoContainer=document.createElement('div')
				$logoContainer.classList.add('col-4')
				const $logo=document.createElement('img')
				$logo.classList.add('img-fluid','rounded-start')
				$logo.src=data.organisationLogo
				$logoContainer.append($logo)
				$row.append($logoContainer)
				$bodyContainer.classList.add('col-8')
			} else {
				$bodyContainer.classList.add('col-12')
			}
			const $body=document.createElement('div')
			$body.classList.add('card-body')
			if (data?.organisationName) {
				let $name
				if (data?.organisationSlug) {
					$name=document.createElement('a')
					$name.classList.add('fs-6','stretched-link')
					$name.href=`https://tasks.hotosm.org/organisations/${data.organisationSlug}`
				} else {
					$name=document.createElement('span')
				}
				$name.textContent=data.organisationName
				$body.append($name)
			}
			$bodyContainer.append($body)
			$row.append($bodyContainer)
			$card.append($row)
			$article.append($card)
		}
	}
}

function clearAoiLayer() {
	aoiLayer?.remove()
	aoiLayer=undefined
}

})()
