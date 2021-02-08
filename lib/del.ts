import * as rimraf from 'rimraf';

export function rmdir(dir: string) {
	return new Promise<void>((c, e) => {
		rimraf(dir, err => {
			if (err) {
				return e(err);
			}
			c();
		});
	});
}
