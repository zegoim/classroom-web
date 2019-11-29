import * as React from "react";
import { __IS_ELECTRON__ } from "@root/common/electron";

import { HashRouter, BrowserRouter, Route, Switch } from "react-router-dom";
import GlobalDialog from "../components/GlobalDialog";
import animalEmojis from "@root/common/emojis";

const Router = window.require ? HashRouter : BrowserRouter;

import DynamicLoad from "../components/DynamicLoad";
import TitleBar from "../components/TitleBar";
import { Theme, getTheme } from "react-uwp/Theme";

const isDarkTheme = false;
let theme: ReactUWP.ThemeType;
if (window.require) {
  theme = getTheme({
    themeName: isDarkTheme ? "dark" : "light",
    accent: "#0D70FF"
  });
} else {
  theme = getTheme({
    themeName: isDarkTheme ? "dark" : "light",
    accent: "#0D70FF"
  });
}

const contentEl = [
  <GlobalDialog key={0} />,
  <Router key={1}>
    <Switch>
      <Route exact path="/" component={(props: any) => <DynamicLoad {...props} dynamicComponent={import ("./Home")} />} />
      <Route path="/Room" component={(props: any) => <DynamicLoad {...props} dynamicComponent={import ("./Room")} />} />
      <Route path="/Replay" component={(props: any) => <DynamicLoad {...props} dynamicComponent={import ("./Replay")} />} />
    </Switch>
  </Router>
];
export default () => (
  <Theme
    style={{ minHeight: `calc(100vh - ${window.menubarHeight}px)` }}
    theme={theme}
  >
  {"require" in window
    ? <TitleBar
      controlledMaximized={true}
      titleBarHeight={window.menubarHeight}
      title="教师端-白板"
      icon={<p style={{ marginRight: 4 }}>{animalEmojis[Math.floor(Math.random() * animalEmojis.length)]}</p>}
    >
      {contentEl}
    </TitleBar>
  : contentEl}
  </Theme>
);
