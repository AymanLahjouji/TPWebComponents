
import './lib/webaudio-controls.js';

const getBaseURL = () => {
	return new URL('.', import.meta.url);
};

class myComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.src = this.getAttribute('src');

    // pour faire du WebAudio
    this.ctx = new AudioContext();
  }

  connectedCallback() {
    // Do something
    this.shadowRoot.innerHTML = `
        <style>
            h1 {
                color:green;
            }
            #myCanvas {
              border:1px solid;
            }
        </style>
        <h1>Lecteur audio amélioré </h1>
        <canvas id="myCanvas" width=400 height=100></canvas>
        <br>
        <audio id="player" src="${this.src}" controls crossorigin="anonymous"></audio>
        <br>
        <webaudio-knob 
          id="play" 
          src="./assets/knobs/1.png" 
          value="1" max="2" step="0.1" diameter="60"
          valuetip="0" tooltip="  Play">
        </webaudio-knob>
        <webaudio-knob 
          id="pause" 
          src="./assets/knobs/off.png" 
          value="1" max="2" step="0.1" diameter="60"
          valuetip="0" tooltip="Pause">
        </webaudio-knob>
        <webaudio-knob 
          id="stop" 
          src="./assets/knobs/stop.png" 
          value="1" max="2" step="0.1" diameter="60"
          valuetip="0" tooltip="Stop">
        </webaudio-knob>
        <br>
        <br>
        <webaudio-knob 
          id="volumeKnob" 
          src="./assets/knobs/Knob_orange.png" 
          value="1" max="2" step="0.1" diameter="75"
          valuetip="0" tooltip="Volume:%s">
        </webaudio-knob>
        <webaudio-switch 
          id="switch"
          src="./assets/switches/switch1.png"
          value="1" diameter="75"
          valuetip="0" tooltip="+10s" type="kick" >
        </webaudio-switch>
        <webaudio-switch 
          id="switch2"
          src="./assets/switches/switch2.png"
          value="1" diameter="75"
          valuetip="0" tooltip="-10s" type="kick" >
        </webaudio-switch>
        <webaudio-knob 
          id="balance" 
          src="./assets/knobs/Knob_yellow.png" 
          value="0" min="-1" max="1" step="0.1" diameter="75"
          valuetip="0" tooltip="Balance:%s">
        </webaudio-knob>
    `;

    this.fixRelativeURLs();

    this.player = this.shadowRoot.querySelector('#player');

    this.ctx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new this.ctx();
    this.buildGraph();

    // pour dessiner/animer
    this.canvas = this.shadowRoot.querySelector('#myCanvas');
    this.canvasCtx = this.canvas.getContext('2d');

    this.player.onplay = () => {
      // pour démarrer webaudio lors d'un click...
      console.log("play");
      this.ctx.resume()
    }

    this.defineListeners();

    // on démarre l'animation
    requestAnimationFrame(() => {
      this.animation();
    });
  }

  animation() {
    // 1 - on efface le canvas
    this.canvasCtx.clearRect(1, 1, this.canvas.width, this.canvas.height);

    // 2 - je dessine la waveform
    this.canvasCtx.fillRect(10+Math.random()*10, 10, 20, 20);

    // 3 - on rappelle la fonction dans 1/60ème de seconde
    requestAnimationFrame(() => {
      this.animation();
    });
  }

  buildGraph() {

    this.source = this.audioContext.createMediaElementSource(this.player);
    this.pannerNode = this.audioContext.createStereoPanner();

    this.source.connect(this.pannerNode);
    this.pannerNode.connect(this.audioContext.destination);

    this.analyser = this.audioContext.createAnalyser();
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

  }



  fixRelativeURLs() {
    const baseURL = getBaseURL();
    console.log('baseURL', baseURL);

    const knobs = this.shadowRoot.querySelectorAll('webaudio-knob');
    const switchs = this.shadowRoot.querySelectorAll('webaudio-switch');

    for (const knob of knobs) {
      console.log("fixing " + knob.getAttribute('src'));

      const src = knob.src;
      knob.src =  baseURL  + src;

      console.log("new value : " + knob.src);
    }
    for (const sw of switchs) {
      console.log("fixing " + sw.getAttribute('src'));

      const src = sw.src;
      sw.src =  baseURL  + src;

      console.log("new value : " + sw.src);
    }
    
  }

  defineListeners() {
    this.shadowRoot.querySelector('#play').addEventListener('click', () => {
      this.player.play();
    });

    this.shadowRoot.querySelector('#pause').addEventListener('click', () => {
      this.player.pause();
    });
    this.shadowRoot.querySelector('#stop').addEventListener('click', () => {
      this.player.pause();
      this.player.currentTime = 0;
    });
    this.shadowRoot.querySelector('#volumeKnob').addEventListener('input', (evt) => {
      this.player.volume = evt.target.value;
    });
    this.shadowRoot.querySelector('#switch').addEventListener('click', (evt) => {
      this.player.currentTime += 10;
    });
    this.shadowRoot.querySelector('#switch2').addEventListener('click', (evt) => {
      this.player.currentTime -= 10;
    });
    this.shadowRoot.querySelector('#balance').addEventListener('input', (evt) => {
      this.pannerNode.pan.value = evt.target.value;
    });
    
  }
}

customElements.define("my-audio", myComponent);