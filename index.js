import { registerRootComponent } from "expo";

import App from "./App";
import { checkUpdate } from "./lib/update";
import { setConfig } from "./lib/config";

setConfig();
checkUpdate();
registerRootComponent(App);
