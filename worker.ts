/// <reference lib="deno.worker" />

import { FileRequest, searchFile } from "./mod.ts";

onmessage = async (ev: MessageEvent & { data: FileRequest }) => {
  postMessage(await searchFile(ev.data.location, ev.data.regexp));
};
