/**
 * Определить браузер
 * @return {String}
 * */
export function detectBrowser() {
	// Opera 8.0+
	if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
		return 'opera';

	// Firefox 1.0+
	if (typeof InstallTrigger !== 'undefined')
		return 'firefox';

	// Safari 3.0+ "[object HTMLElementConstructor]"
	if (
		/constructor/i.test(window.HTMLElement)
		|| (function(p) {
			return p.toString() === "[object SafariRemoteNotification]";
		})(
			!window['safari']
			|| (
				typeof safari !== 'undefined'
				&& safari.pushNotification
			)
		)
	) {
		return 'safari';
	}

	// Internet Explorer 6-11
	if (/*@cc_on!@*/false || !!document.documentMode)
		return 'ie';

	// Edge 20+
	if (!!window.StyleMedia)
		return 'edge';

	// Chrome 1+
	if (!!window.chrome && !!window.chrome.webstore)
		return 'chrome';
}


export default { detectBrowser };