try {
  const ac = new AudioContext({
    numberOfChannels: 1,
    sampleRate: 33333,
  });
  await ac.audioWorklet.addModule("audioWorklet.js");
  const worker = new SharedWorker("worker.js", {
    name: "audio-worklet-fetch-worker",
    type: "module",
  });
  ac.onstatechange = (e) => {
    console.log(e.type, ac.state);
  };
  worker.onerror = (e) => {
    console.error(e.message);
  };
  const aw = new AudioWorkletNode(ac, "audio-worklet-fetch-worker", {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCount: 1,
  });
  aw.onprocessorerror = (e) => {
    throw e;
  };
  aw.connect(ac.destination);
  aw.port.postMessage(null, [worker.port]);
  aw.port.onmessage = async (e) => {
    console.log(e.data);
    aw.disconnect();
    aw.port.close();
    await ac.close();
  };
} catch (e) {
  console.error(e);
}
