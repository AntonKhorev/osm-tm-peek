declare global {
	interface Window {
		browserExtensionHookedMap: any
	}
}

export function setupMapHook(): void {
	document.addEventListener('DOMContentLoaded',()=>{
		const hook=function(){
			if (this.wrappedJSObject.getContainer().id!='map') return
			window.browserExtensionHookedMap=this
		}
		window.wrappedJSObject.L.Map.addInitHook(cloneInto(hook,window,{cloneFunctions:true}));
	})
}
