import getHotosmApiProjectUrl from './tm'

let aoiLayer: any
const $sidebarContent=document.getElementById('sidebar_content')

if ($sidebarContent instanceof HTMLElement) {
	insertDetails($sidebarContent)
	new MutationObserver(()=>{
		clearAoiLayer()
		insertDetails($sidebarContent)
	}).observe($sidebarContent,{childList:true})
}

function insertDetails($sidebarContent: HTMLElement) {
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
		if (data?.projectInfo?.name) {
			const $name=document.createElement('h5')
			$name.classList.add('mt-2')
			$name.textContent=data.projectInfo.name
			$article.append($name)
		}
		if (data.areaOfInterest || data.aoiBBOX || data.countryTag) {
			const $div=document.createElement('div')
			$div.classList.add('d-flex','mb-2','align-items-center','gap-1')
			let aoiBounds
			const aoiStyle=cloneInto({color:'#46a',fillOpacity:.1},window)
			if (data.areaOfInterest) {
				const geometry=cloneInto(data.areaOfInterest,window)
				aoiLayer=window.wrappedJSObject.L.geoJSON(geometry,aoiStyle)
			}
			if (data.aoiBBOX) {
				const [minLon,minLat,maxLon,maxLat]=data.aoiBBOX
				aoiBounds=cloneInto([[minLat,minLon],[maxLat,maxLon]],window)
				if (!aoiLayer) {
					aoiLayer=window.wrappedJSObject.L.rectangle(aoiBounds,aoiStyle)
				}
			}
			const $countries=document.createElement('span')
			$countries.classList.add('me-auto')
			if (Array.isArray(data.countryTag)) {
				$div.append(makeIcon('marker',`Location`))
				for (const country of data.countryTag) {
					if ($countries.childElementCount) {
						$countries.append(`, `)
					}
					$countries.append(strong(country))
				}
			}
			$div.append($countries)
			if (window.browserExtensionHookedMap) {
				aoiLayer?.addTo(window.browserExtensionHookedMap)
				const flyOptions=cloneInto({duration:1},window)
				if (window.browserExtensionHookedMap.wrappedJSObject._object) {
					const $fit=document.createElement('button')
					setFitButtonStyle($fit,'#ff9500','#ffffc0')
					$fit.textContent='Cset'
					$fit.onclick=()=>{
						const changesetBounds=window.browserExtensionHookedMap.wrappedJSObject._objectLayer.getBounds()
						window.browserExtensionHookedMap.wrappedJSObject.flyToBounds(changesetBounds,flyOptions)
					}
					$div.append($fit)
					addTooltip($fit,`Zoom to changeset`)
				}
				if (aoiBounds) {
					const $fit=document.createElement('button')
					setFitButtonStyle($fit,'#46a','#8af')
					$fit.textContent='AOI'
					$fit.onclick=()=>{
						window.browserExtensionHookedMap.wrappedJSObject.flyToBounds(aoiBounds,flyOptions)
					}
					$div.append($fit)
					addTooltip($fit,`Zoom to project area of interest`)
				}
			} else {
				const $fit=document.createElement('button')
				$fit.classList.add('btn','btn-outline-warning','btn-sm','border-2')
				$fit.textContent='!!!'
				$div.append($fit)
				addTooltip($fit,`The map object wasn't captured by the extension during the page initialization. Reload the page with the extension enabled to see areas of interest on the map.`)
			}
			$article.append($div)
		}
		if (data.imagery || data.mappingTypes) {
			const $div=document.createElement('div')
			$div.classList.add('d-flex','mb-2','align-items-center','gap-1')
			if (data.imagery) {
				$div.append(makeIcon('imagery',`Imagery`))
				$div.append(strong(data.imagery))
			}
			if (data.imagery && data.mappingTypes) {
				const $arrow=document.createElement('span')
				$arrow.classList.add('mx-auto')
				$arrow.textContent=`→`
				$div.append($arrow)
			}
			let mappingTypes=new Set()
			if (Array.isArray(data.mappingTypes)) {
				mappingTypes=new Set(data.mappingTypes)
			}
			for (const [type,name] of [
				['ROADS','road'],
				['BUILDINGS','building'],
				['WATERWAYS','water'],
				['LAND_USE','landuse'],
				['OTHER','other'],
			]) {
				const $icon=makeIcon(name,mappingTypes.has(type)?type:`NO ${type}`)
				if (!mappingTypes.has(type)) $icon.classList.add('opacity-25')
				$div.append($icon)
			}
			$article.append($div)
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

function addTooltip($e,text) {
	$e.dataset.bsTitle=text
	new window.wrappedJSObject.bootstrap.Tooltip($e)
}

function setFitButtonStyle($fit,strokeColor,fillColor) {
	$fit.classList.add('btn','btn-outline-info','btn-sm','border-2')
	$fit.style.borderStyle='dashed'
	$fit.style.setProperty('--bs-btn-color',strokeColor)
	$fit.style.setProperty('--bs-btn-border-color',strokeColor)
	$fit.style.setProperty('--bs-btn-hover-bg',fillColor)
	$fit.style.setProperty('--bs-btn-hover-border-color',strokeColor)
}

function makeIcon(name,title) {
	const $icon=document.createElement('img')
	$icon.src=browser.runtime.getURL(`svg/${name}.svg`)
	$icon.alt=$icon.title=title
	return $icon
}

function strong(text) {
	const $e=document.createElement('strong')
	$e.textContent=text
	return $e
}
