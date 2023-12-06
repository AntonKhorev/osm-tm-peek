document.addEventListener('DOMContentLoaded',()=>{
	const hook=function(){
		if (this.wrappedJSObject.getContainer().id!='map') return
		window.osmTmPeekHookedMap=this
	}
	window.wrappedJSObject.L.Map.addInitHook(cloneInto(hook,window,{cloneFunctions:true}));
})
