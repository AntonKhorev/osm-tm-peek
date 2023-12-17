declare global {
	
interface Window {
	wrappedJSObject: any
}

// copied from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0da9f0c859e1ad3ee2d040e561c80129e12ef724/types/firemonkey-browser/index.d.ts#L183C1-L200C6

/**
 * This function provides a safe way to take an object defined in a privileged scope and create a structured clone of it in a less-privileged scope
 * @param obj The object to clone.
 * @param targetScope The object to attach the object to.
 * @param options.cloneFunctions if functions should be cloned. Cloned functions have the same semantics as functions exported using exportFunction()
 * @param options.wrapReflectors if objects reflected from C++, such as DOM objects, should be cloned.
 * @returns A reference to the cloned object.
 * @example // object without methods
 * unsafeWindow.messenger = cloneInto(obj, unsafeWindow);
 * @example // object with methods
 * unsafeWindow.messenger = cloneInto(obj, unsafeWindow, {cloneFunctions: true});
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#cloneinto}
 */
function cloneInto<T>(
	obj: T,
	targetScope: object,
	options?: { cloneFunctions?: boolean; wrapReflectors?: boolean },
): T;

}

export {}
