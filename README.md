# AudioWorkletFetchWorker
Control Fetch in SharedWorker from and stream data to AudioWorklet

**Firefox**
- Set `media.autoplay.default` to	`0` for `AudioContext` to run without user action.
- Set `security.fileuri.strict_origin_policy` to `false` to run on `file:` protocol.

**Chromium and Chrome**
- Set flag `--disable-audio-focus-enforment` to run without the document being focused.

# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
