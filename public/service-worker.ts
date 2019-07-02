// Don't Change Next Line Code, You Can Change Default Version Value, Replace by -> ../script/watchSourceFile.js
const VERSION = "2.6.8";
const dataCacheName = `dataCache-${VERSION}`;
const staticCacheName = `staticCache-${VERSION}`;
const filesToCache: string[] = [
	"/",
	"/init.js",
	"/uglify.js",
	"/index.html",
	"/404.html",
	"/browserconfig.xml",
	"/favicon.ico",
	"/manifest.json",
	/*ReplaceStaticFiles*/
	// "/static/js/index.js",
	// "/static/js/common.js",
	// "/static/js/index-index.chunk.js",
	// "/static/vendors.dev.dll.js",
	// "/static/vendors.prod.dll.js"
];
const dataUrlPattern = /https?\:\/\/(w{3})?(\w+\.?)+(\:\d+)?\/(api|__webpack_hmr)/;
const domainToCachePattern = /classroom\.com\/static/;
// const domainExcludeCachePattern = /classroom\.com\/static\/js\//;
const fileToCachePtn = /\.(jpe?g|png|gif|svg|mp4|mov|woff2?|eot|mp3|wav)/i;

// tslint:disable-next-line:no-console
// console.log(`Service Worker Current Version is : ${VERSION}`);

function syncGetCache(e: FetchEvent) {
	const { url } = e.request;
	return new Promise((resolve, reject) => {
		if (
			!navigator.onLine ||
			domainToCachePattern.test(url) ||
			fileToCachePtn.test(url)
		) {
			caches.match(e.request).then((response: Response) => {
				if (response) {
					resolve(response);
				} else {
					caches.open(staticCacheName).then((cache: Cache) => {
						fetch(e.request).then((response: Response) => {
							cache.put(url, response.clone());
							resolve(response);
						});
					});
				}
			});
		} else {
			caches.open(dataCacheName).then((cache: Cache) => {
				fetch(e.request).then((response: Response) => {
					cache.put(url, response.clone());
					resolve(response);
				});
			});
		}
	});
}

self.addEventListener("install", (e: InstallEvent) => {
	// tslint:disable-next-line:no-console
	console.log("[ServiceWorker] Install");
	e.waitUntil(
		caches.open(staticCacheName).then((cache: Cache) => {
			// tslint:disable-next-line:no-console
			console.log("[ServiceWorker] Caching app shell");
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener("activate", (e: InstallEvent) => {
	// tslint:disable-next-line:no-console
	console.log("[ServiceWorker] Activate");
	e.waitUntil(
		caches.keys().then((keyList: string[]) => {
			return Promise.all(keyList.map((key: string) => {
				if (key !== staticCacheName && key !== dataCacheName) {
					// console.log("[ServiceWorker] Removing old cache", key);
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
});

self.addEventListener("fetch", (e: FetchEvent) => {
	const { url } = e.request;
	if (dataUrlPattern.test(url)) {
		// tslint:disable-next-line:no-console
		// console.log("[Service Worker] Fetch: ", url);
		e.respondWith(
			caches.open(dataCacheName).then((cache: Cache) =>  {
				return fetch(e.request).then((response: Response) => {
					cache.put(url, response.clone());
					return response;
				});
			})
		);
	} else {
		e.respondWith(syncGetCache(e));
	}
});
