// TODO - when i want to add the option to fetch audio from a video, i need to implement this

import { launch, getStream } from "puppeteer-stream";
import fs from "fs";

const file = fs.createWriteStream(import.meta.dirname + "/test.webm");
// const wss = new WebSocket("ws://localhost:8080/ws");

const browser = await launch({
  headless: false, // TODO arg
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
//   executablePath: "google-chrome-stable" // linux?
});

const page = await browser.newPage();
await page.goto("https://www.youtube.com/embed/9bZkp7q19f0?autoplay=1");
const stream = await getStream(page, { audio: true, video: true });
console.log("recording");

stream.pipe(file);
setTimeout(async () => {
  stream.destroy();
  file.close();
  console.log("finished");
  await browser.close();
//   (await wss).close();
}, 1000 * 10);
