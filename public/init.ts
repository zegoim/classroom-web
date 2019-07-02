// window.onerror = function (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) {
// 	const lowerString = message.toLowerCase();
// 	const substring = "script error";
// 	if (lowerString.indexOf(substring) > -1) {
// 		alert("Script Error: See Browser Console for Detail");
// 	} else {
// 		message = [
// 			`Message: ${message}`,
// 			`URL: ${filename}`,
// 			`Line: ${lineno}`,
// 			`Column: ${colno}`,
// 			`Error object: ${JSON.stringify(error)}`
// 		].join(" - ");

// 		alert(message);
// 	}

// 	return false;
// };

const register = () => {
  window.navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration: ServiceWorkerRegistration) => {
      // tslint:disable-next-line:no-console
      // console.log("Service Worker Registered");
    })
    .catch(error => {
      // tslint:disable-next-line:no-console
      // console.error(`Registration failed with ${error}`);
    });
};

if ("serviceWorker" in window.navigator) {
  window.navigator.serviceWorker
    .getRegistration()
    .then(registration => {
      // register();
    })
    .catch(err => {
      // tslint:disable-next-line:no-console
      console.error(err);
    });
}

const CORE_JS_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/core-js/2.4.1/core.min.js";
const FETCH_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.1/fetch.min.js";

const addScript = (url: string) => {
  const script = document.createElement("script");
  script.setAttribute("async", "false");
  script.setAttribute("defer", "true");
  script.src = url;
  document.body.insertBefore(script, document.body.firstChild);
};

if (!("assign" in Object && "Promise" in window && "keys" in Object)) {
  addScript(CORE_JS_SCRIPT);
}

if (!("fetch" in window)) {
  addScript(FETCH_SCRIPT);
}
