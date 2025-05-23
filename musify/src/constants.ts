import { AudioServiceEvent } from "./services/audioServices";

export const listeners: { [key in AudioServiceEvent]: Function[] } = {
  play: [],
  pause: [],
  trackChange: [],
  timeUpdate: [],
  queueUpdate: [],
  volumeChange: [],
  end: []
};
