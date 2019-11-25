// I put it in root, but could be anywhere
// <root>/defs.d.ts
declare module "*.css" {
	let styles: {
		[key: string]: string
	};

	export = styles
}

declare global {
	namespace NodeJS {
		interface Global {
			myConfig: {
				a: number;
				b: number;
			}
		}
	}
}