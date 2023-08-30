/**
 * Helper function to spy on property of a Jasmine SpyObj
 */
export function spyPropertyGetter<T, K extends keyof T>(spyObj: jasmine.SpyObj<T>, propKey: K): jasmine.Spy<() => T[K]> {
	return Object.getOwnPropertyDescriptor(spyObj, propKey)?.get as jasmine.Spy<() => T[K]>;
}
