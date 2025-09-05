import Scorereveal from "../assets/Score reveal.png";
import backgroundImage from "../assets/Intro Background.png";
import replay from "../assets/Replay.png";
import task from "../assets/Next task button.png";
import mangoImg from "../assets/Layer 3 copy 5.png";
import nutImg from "../assets/Egg.png";
import bombImg from "../assets/Layer 5.png";
import bombImg2 from "../assets/Layer 10.png";
import bombImg3 from "../assets/Layer 4 copy.png";
import Crayfish from "../assets/Crayfish.png";
import Peppersoup from "../assets/Pepper soup noodle.png";
import OrientalNoodle from "../assets/Oriental Noodle.png";
import basketImg from "../assets/Arena Male Character.png";

// Mapping of flavor names to their images
const flavorImages = {
  Crayfish: Crayfish,
  Peppersoup: Peppersoup,
  Oriental: OrientalNoodle,
};

export const getImages = (taskNumber, selectedFlavors) => {
  // Fallback to an empty array if selectedFlavors is undefined or null
  const flavors = Array.isArray(selectedFlavors) ? selectedFlavors : [null, null, null];
  const selectedFlavor = flavors[taskNumber - 1] || "Crayfish"; // Fallback to Crayfish
  console.log(`getImages: taskNumber=${taskNumber}, selectedFlavor=${selectedFlavor}, selectedFlavors=${JSON.stringify(flavors)}`);

  return {
    apple: Object.assign(new Image(), { src: flavorImages[selectedFlavor] || Crayfish }),
    mango: Object.assign(new Image(), { src: mangoImg }),
    nut: Object.assign(new Image(), { src: nutImg }),
    bomb: Object.assign(new Image(), { src: bombImg }),
    bomb2: Object.assign(new Image(), { src: bombImg2 }),
    bomb3: Object.assign(new Image(), { src: bombImg3 }),
    basket: Object.assign(new Image(), { src: basketImg }),
  };
};

export { Scorereveal, backgroundImage, replay, task };