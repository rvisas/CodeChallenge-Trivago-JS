import { options } from 'melody-idom';
import { render } from "melody-component";
import view from "./view";
import store from "./store";
import { provide } from "melody-redux";

options.experimentalSyncDeepRendering = true;

const documentRoot = document.getElementById("root");
render(documentRoot, provide(store(), view));
