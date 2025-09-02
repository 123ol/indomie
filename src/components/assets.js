import Scorereveal from "../assets/Score reveal.png";
import backgroundImage from "../assets/Intro Background.png";
import replay from "../assets/Replay.png";
import task from "../assets/Next task button.png";
import appleImg from "../assets/Crayfish.png";
import mangoImg from "../assets/Layer 3 copy 5.png";
import nutImg from "../assets/Egg.png";
import bombImg from "../assets/Layer 5.png";
import bombImg2 from "../assets/Layer 10.png";
import bombImg3 from "../assets/Layer 4 copy.png"; // Placeholder for third bomb image
import basketImg from "../assets/Arena Male Character.png";

export const images = {
  apple: Object.assign(new Image(), { src: appleImg }),
  mango: Object.assign(new Image(), { src: mangoImg }),
  nut: Object.assign(new Image(), { src: nutImg }),
  bomb: Object.assign(new Image(), { src: bombImg }),
  bomb2: Object.assign(new Image(), { src: bombImg2 }), // Added bomb2
  bomb3: Object.assign(new Image(), { src: bombImg3 }), // Added bomb3
  basket: Object.assign(new Image(), { src: basketImg }),
};

export { Scorereveal, backgroundImage, replay, task };