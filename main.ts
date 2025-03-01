#!/usr/bin/env -S deno run

import { MocoClient } from './src/moco/client.ts';
import { IntervalTransformer, TimewarriorParser } from './src/mod.ts';

// Buffer to store incoming data
let input = '';

// Read input from stdin (Timewarrior pipes data here)
const decoder = new TextDecoder();
for await (const chunk of Deno.stdin.readable) {
  input += decoder.decode(chunk);
}

// Parse the input using our TimewarriorParser
const mocoClient = new MocoClient(
  'simplificator',
  Deno.env.get('MOCO_API_KEY') || '',
);
const projects = await mocoClient.getAssignedProjects(true);
const transformer = new IntervalTransformer(projects);

const parsedData = TimewarriorParser.parse(input);
const activities = parsedData.intervals.map((interval) =>
  transformer.toActivity(interval)
);

const summarizedActivities = transformer.summarize(activities);
mocoClient.createActivities(summarizedActivities);
console.log(
  `Successfully transmitted ${summarizedActivities.length} activities.`,
);
