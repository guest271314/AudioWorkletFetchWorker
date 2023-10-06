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
  /*
  const bc = new BroadcastChannel("worker");
  bc.addEventListener("message", (e) => {
    console.log(e.data);
    //bc.postMessage("BroadcastChannel");
  });
  */
  ac.onstatechange = (e) => {
    console.log(e.type, ac.state);
  };
  const workerPort = worker.port;
  worker.port.onmessage = (e) => {
    console.log(e);
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
  aw.port.postMessage(null, [workerPort]);
  aw.port.onmessage = async (e) => {
    console.log(e.data);
    aw.disconnect();
    aw.port.close();
    workerPort.close();
    await ac.close();
  };
} catch (e) {
  console.error(e);
}
