import { createHandleFile, Flags, getFilePaths, searchStdin } from "./mod.ts";

const USAGE_INSTRUCTIONS = `Usage: <search> <location> | <search> (via stdin)

Flags:
-n: Include line numbers in the search results.
-i: Perform a case-insensitive search.
`;

function parseArgs(args: string[]) {
  const positionalArgs: string[] = [];
  const flags: Flags = { n: false, i: false };
  args.forEach((arg) => {
    if (arg === "-n") flags.n = true;
    else if (arg === "-i") flags.i = true;
    else positionalArgs.push(arg);
  });
  return { positionalArgs, flags };
}

async function main() {
  const { positionalArgs, flags } = parseArgs(Deno.args);

  if (positionalArgs.length < 2) {
    console.log(USAGE_INSTRUCTIONS);
    Deno.exit(1);
  }
  const regexp = new RegExp(positionalArgs[1], flags.i ? "i" : "");
  if (positionalArgs.length < 3) {
    await searchStdin(Deno.stdin, regexp);
    Deno.exit(0);
  }

  const handleFile = createHandleFile(regexp, flags);

  const location = positionalArgs[2];
  if (Deno.statSync(location).isFile) {
    handleFile(location);
  } else if (location === ".") {
    await getFilePaths("./", handleFile);
  } else if (Deno.lstatSync(location).isDirectory) {
    await getFilePaths(location, handleFile);
  }
}

await main();
