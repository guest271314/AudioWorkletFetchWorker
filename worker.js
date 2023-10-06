globalThis.console.log(globalThis, globalThis.name);

addEventListener("connect", (e) => {
  console.log(e.type);
  const [port] = e.ports;
  port.onmessage = async (e) => {
    if (e.data === "close") {
      self.close();
    }
    globalThis.console.log(e);
    if (e.data?.url) {
      try {
        const request = await fetch(e.data.url, e.data.options);
        const { body } = await request;
        port.postMessage(body, [body]);
      } catch (e) {
        console.log(e);
      }
    }
  };
});
