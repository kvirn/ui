/**
 * A caption track for the Video pattern: a data URI, so no request leaves the page (rule 7) and
 * no media file sits in the repo (plan 0095 Q14). The captions say what is spoken in the
 * transcript next to the video.
 */
export const kvirnbyCaptions: string = `data:text/vtt;charset=utf-8,${encodeURIComponent(
  `WEBVTT

00:00:00.000 --> 00:00:04.000
Welcome to Hillside preschool.

00:00:04.000 --> 00:00:09.000
[Children laughing] This is the hall, where every morning starts.

00:00:09.000 --> 00:00:14.000
Ask us for a visit on any weekday.
`,
)}`
