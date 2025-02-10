export function isBlank(s: string) {
	return s == null || s.length == 0;
}

export function isEmail(s: string) {
	return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s);
}

export function isMobile(s: string) {
	return /^1[1-9]\d{9}$/.test(s);
}

export function isURL(s: string) {
	return /^http[s]?:\/\/.*/.test(s);
}

export function isUsername(s: string) {
	return /^[a-zA-Z0-9]{5,50}$/.test(s);
}

export function isPassword(s: string) {
	return /^[a-zA-Z0-9]{6,20}$/.test(s);
}

export function isSmsCode(s: string) {
	return /^\d{6}$/.test(s);
}