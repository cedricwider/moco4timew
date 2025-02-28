#!/usr/bin/env -S deno run

import { TimewarriorParser } from "./src/mod.ts";

// Buffer to store incoming data
let input = "";

// Read input from stdin (Timewarrior pipes data here)
const decoder = new TextDecoder();
for await (const chunk of Deno.stdin.readable) {
  input += decoder.decode(chunk);
}

// Parse the input using our TimewarriorParser
const parsedData = TimewarriorParser.parse(input);

// Output the parsed data
console.log("Parsed Timewarrior Data:");
console.log("------------------------");
console.log("Config:", parsedData.config);
console.log("------------------------");
console.log("Intervals:", parsedData.intervals);