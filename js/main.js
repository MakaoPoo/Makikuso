let app;
let container, browContainer, eyeContainer, mouthContainer;
let browId, eyeId, mouthId;
let gamePart = 0;
let touchFlag = false;
let time = 0;
let lastFrame = 0;
let notVee1 = false;
let zoomScale = 1;

const resourceList = [
  "back",
  "hair",
  "brow1",
  "brow2",
  "brow3",
  "brow4",
  "eye1",
  "eye2",
  "eye3",
  "eye4",
  "mouth1",
  "mouth2",
  "mouth3",
  "mouth4",
]
const soundList = {
  "vee1": null,
  "vee2": null,
  "bgm": null,
}

$(function() {
  const $canvas = $('#canvas')

  app = new PIXI.Application({
    view: $canvas[0],
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#000",
    antialias: true,
  });
  app.stop();
  winResize();

  for(const name of resourceList) {
    app.loader.add(name, "resource/maki_chan/" + name + ".png")
  }

  app.loader.load(loadedParts);

  soundList["vee1"] = new Howl({
    src: "resource/maki_chan/VEE1.wav",
  });

  soundList["vee2"] = new Howl({
    src: "resource/maki_chan/VEE2.wav",
    volume: 0.6,
    onend: function() {
      notVee1 = false;
    }
  });

  soundList["bgm"] = new Howl({
    src: "resource/maki_chan/BGM.mp3",
    volume: 0.4
  });
});

const loadedParts = (loader, res) => {
  container = new PIXI.Container();
  container.pivot.set(640 / 2, 480 / 2);
  container.position.set(640 / 2, 480 / 2);

  const back = new PIXI.Sprite(res.back.texture);
  const hair = new PIXI.Sprite(res.hair.texture);

  browContainer = new PIXI.Container();
  browContainer.position.set(180, 150);

  eyeContainer = new PIXI.Container();
  eyeContainer.position.set(180, 190);

  mouthContainer = new PIXI.Container();
  mouthContainer.position.set(270, 310);

  for(let i = 1; i <= 4; i++) {
    const isVisible = (i==1);

    const brow = new PIXI.Sprite(res["brow" + i].texture);
    browContainer.addChild(brow);

    const eye = new PIXI.Sprite(res["eye" + i].texture)
    eyeContainer.addChild(eye);

    const mouth = new PIXI.Sprite(res["mouth" + i].texture)
    mouthContainer.addChild(mouth);
  }

  browId = getRand(1, 3);
  showParts(browContainer, browId);

  eyeId = getRand(1, 3);
  showParts(eyeContainer, eyeId);

  mouthId = getRand(1, 3);
  showParts(mouthContainer, mouthId);

  container.addChild(back);
  container.addChild(browContainer, eyeContainer, mouthContainer);
  container.addChild(hair);

  app.stage.addChild(container);
  app.start();

  lastFrame = new Date().getTime();
  app.ticker.add(mainLoop);

  let touchAction = 'touchstart';
  if(!navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/)){
    touchAction = 'mousedown';
  }
  $('#canvas').on(touchAction, function() {
    touchFlag = true;
  });
}

const mainLoop = function() {
  const startFrame = new Date().getTime();
  const frame = startFrame - lastFrame;
  lastFrame = startFrame;

  if(touchFlag && gamePart <= 3) {
    touchFlag = false;
    gamePart += 1;
    time = 0;

    if(gamePart >= 2) {
      notVee1 = true;
      soundList["vee2"].play()
    }

    if(gamePart == 4) {
      bgmSrc = soundList["bgm"].play();
    }
  }

  if(gamePart >= 1 && gamePart <= 3) {
    time += 2 ** (gamePart - 1);
    const speed = ((130 - gamePart*10) / frame);
    if(time > speed) {
      time = 0;

      if(!notVee1) {
        const se = soundList["vee1"].play();
        const soundLength = {
          1: 1000,
          2: 300,
          3: 200,
        }
        soundList["vee1"].fade(0.5, 0, soundLength[gamePart], se);
      }

      if(gamePart == 1) {
        browId = (browId + 1) % 4;
        showParts(browContainer, browId);
      }

      if(gamePart == 2) {
        mouthId = (mouthId + 1) % 4;
        showParts(mouthContainer, mouthId);
      }

      if(gamePart == 3) {
        eyeId = (eyeId + 1) % 4;
        showParts(eyeContainer, eyeId);
      }
    }
  }

  if(gamePart == 4) {
    zoomScale += frame / 10000;
    container.scale.set(zoomScale);
    if(soundList["bgm"].seek() > 20) {
      gamePart = 5;

      app.stage.removeChild(container);
      const text = new PIXI.Text("真姫ちゃんかわいい", {
        fill : "#ffffff",
        fontSize: 60,
      });
      text.position.set(20, 300);
      app.stage.addChild(text);
    }
  }
}

const showParts = function(container, index) {
  container.children.forEach((child) => {
    child.visible = false;
  });
  container.getChildAt(index).visible = true;
}

$(window).on('resize', function() {
  winResize();
});

const winResize = function() {
  if(app) {
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    app.renderer.resize(winWidth, winHeight);

    const scale = (winWidth / winHeight > 640 / 480)? winHeight / 480: winWidth / 640;
    app.stage.scale.set(scale);
    app.stage.pivot.set(640 / 2, 480 / 2);
    app.stage.position.set(winWidth / 2, winHeight / 2);
  }
}

const getRand = function(min, max) {
  const rand = Math.random();
  return min + Math.floor(rand * (max - min + 1));
}
