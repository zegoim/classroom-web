import * as React from "react";
import * as ReactDOM from "react-dom";
import { __IS_ELECTRON__ } from "@root/common/electron";
window.menubarHeight = __IS_ELECTRON__ ? 40 : 0;

if (process.env.NODE_ENV !== "production") {
  // const { whyDidYouUpdate } = require("why-did-you-update");
  // whyDidYouUpdate(React);
}

import App from "./routes";

const { render } = ReactDOM;
const rootEl = document.getElementById("app");

const renderToDOM = (AppContainer?: new() => React.Component<any, any>, AppComponent = App) => {
  if (AppContainer) {
    render(
      <AppContainer>
        <AppComponent />
      </AppContainer>,
      rootEl
    );
  } else {
    render(<App />, rootEl);
  }
};

renderToDOM();
if (__DEV__ && module.hot) {
  const { AppContainer } = require<any>("react-hot-loader");

  module.hot.accept("./routes/index.tsx", () => {
    const NextApp = require<any>("./routes/index.tsx").default;
    renderToDOM(AppContainer, NextApp);
  });
}
