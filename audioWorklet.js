globalThis.console.log(globalThis);
let workerPort;
// Promise.withResolvers() not implemented in Firefox Nightly 120
const promiseWithResolvers = () => {
  let resolve, reject;
  const promise = new Promise(
    (_resolve, _reject) => ((resolve = _resolve), (reject = _reject)),
  );
  return { resolve, reject, promise };
};
class AudioWorkletFetchWorker extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    // There are several ways to do this. We'll use Array here.
    // We could use a Map or resizable AyyarBuffer, where implemented (not implemented on Firefox 120).
    this.array = new Array();
    this.offset = 0;
    this.writes = 0;
    this.bytesRead = 0;
    this.port.onmessage = async (e) => {
      if (!workerPort) {
        [workerPort] = e.ports;
        const readable = await this.sharedWorkerFetch("1_channel.pcm");
        await readable.pipeTo(
          new WritableStream({
            start: () => {
              console.log("Start reading/writing fetch response stream", this.writes);
            },
            write: (value) => {
              // We might only get 1 to 2 writes on file: protocol
              ++this.writes;
              for (let i = 0; i < value.length; i++) {
                this.array[this.array.length] = value[i];
              }
              this.bytesRead += value.length;
            },
            close: () => {
              console.log("Stream closed", this.writes);
            },
          }),
        );
      }
    };
  }
  async sharedWorkerFetch(url = "", options = {}) {
    const { resolve, promise } = promiseWithResolvers();
    if (workerPort) {
      workerPort.onmessage = (e) => {
        resolve(e.data);
      };
      workerPort.postMessage({ url, options });
    }
    return promise;
  }
  process(inputs, [[output]]) {
    if (
      this.bytesRead > 512 && this.array.length
    ) {
      const data = this.array.splice(0, 512);
      this.offset += data.length;
      output.set(
        new Float32Array(
          new Uint8Array(data)
            .buffer,
        ),
      );
    } else if (this.offset > 0 && this.offset === this.bytesRead) { 
      console.log(this.bytesRead, this.offset, this.writes, this.array);
      workerPort.postMessage("close");
      this.port.postMessage("Done streaming in AudioWorklet");
      return false;
    }
    return true;
  }
}
registerProcessor("audio-worklet-fetch-worker", AudioWorkletFetchWorker);
