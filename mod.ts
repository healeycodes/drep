import * as path from "https://deno.land/std@0.182.0/path/mod.ts";
import { readLines } from "https://deno.land/std@0.182.0/io/mod.ts";

export type Flags = {
  i: boolean; // Case insensitive
  n: boolean; // With line numbers
};

export type FileRequest = {
  location: string;
  regexp: RegExp;
};

type FileResult = {
  location: string;
  lines: Line[];
};

type Line = {
  data: string;
  no: number;
};

export function createHandleFile(
  regexp: RegExp,
  flags: Flags,
): (location: string) => void {
  const workers: Worker[] = [];
  let locationsToCheck = 0;
  for (let i = 0; i < navigator.hardwareConcurrency; i++) {
    const w = new Worker(import.meta.resolve("./worker.ts"), {
      type: "module",
    });
    w.onmessage = (e) => {
      printResult(e.data, flags);
      if (--locationsToCheck === 0) workers.forEach((_w) => _w.terminate());
    };
    workers.push(w);
  }

  let workerRoundRobin = 0;
  return function handleFile(location: string) {
    locationsToCheck++;
    workers[workerRoundRobin].postMessage({ location, regexp });
    workerRoundRobin = (workerRoundRobin + 1) % workers.length;
  };
}

export async function getFilePaths(
  target: string,
  handleFile: (location: string) => void,
) {
  const subTasks: Promise<void>[] = [];
  for await (const dirEntry of Deno.readDir(target)) {
    if (dirEntry.isDirectory) {
      subTasks.push(getFilePaths(path.join(target, dirEntry.name), handleFile));
    } else if (dirEntry.isFile) {
      handleFile(path.join(target, dirEntry.name));
    }
  }
  await Promise.all(subTasks);
}

export async function searchFile(
  location: string,
  regexp: RegExp,
): Promise<FileResult> {
  const file = await Deno.open(location);
  const lines: Line[] = [];

  // Handle binary files differently
  const firstByte = new Uint8Array(8);
  file.readSync(firstByte);
  file.seek(0, Deno.SeekMode.Start);
  const firstChar = new DataView(firstByte.buffer).getUint8(0);
  if (firstChar <= 8 || firstChar > 127) {
    for await (const line of readLines(file)) {
      if (line === null) break;
      if (regexp.exec(line)) {
        console.log(`Binary file ${location} matches`);
        break;
      }
    }
    file.close();
    return { location, lines };
  }

  let lineNo = 0;
  for await (const line of readLines(file)) {
    lineNo++;
    if (line === null) break;
    if (line.match(regexp)) {
      lines.push({ data: line, no: lineNo });
      continue;
    }
  }

  file.close();
  return { location, lines };
}

export async function searchStdin(
  stdin: Deno.Reader,
  regexp: RegExp,
) {
  for await (const line of readLines(stdin)) {
    if (line === null) break;
    if (regexp.exec(line)) {
      console.log(line);
      continue;
    }
  }
}

function printResult(result: FileResult, flags: Flags) {
  result.lines.forEach((line) => {
    console.log(
      [
        result.location,
        flags.n ? `:${line.no}` : "",
        ":",
        ...line.data,
      ].join(""),
    );
  });
}
