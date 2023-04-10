import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";

Deno.test("compile and search a file", async () => {
  // Compile
  const p1 = Deno.run({
    cmd: [
      "bash",
      "build.sh",
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const [{ code: code1 }, rawOutput1, rawError1] = await Promise.all([
    p1.status(),
    p1.output(),
    p1.stderrOutput(),
  ]);
  p1.close();

  if (code1 !== 0) {
    throw `${new TextDecoder().decode(rawOutput1)}\n${
      new TextDecoder().decode(rawError1)
    }`;
  }

  // Search
  const p2 = Deno.run({
    cmd: [
      "./drep",
      "a unique string",
      "fixtures",
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const [{ code: code2 }, rawOutput2, rawError2] = await Promise.all([
    p2.status(),
    p2.output(),
    p2.stderrOutput(),
  ]);
  p2.close();

  const output2 = new TextDecoder().decode(rawOutput2);
  if (code2 !== 0) {
    throw `${output2}\n${new TextDecoder().decode(rawError2)}`;
  }

  assertEquals(output2, "fixtures/some_file.txt:a unique string\n");
});
