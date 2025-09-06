import Scorereveal from "../assets/Score reveal.png";
import backgroundImage from "../assets/Other stage background.png";
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
import Housemate1 from "../assets/Arena Male Character.png";
import Housemate2 from "../assets/Female carrying Charater.png";
import pepper from "../assets/Asset 7-8.png";
import crayfish from "../assets/Crayfsih.png";
import carrot from "../assets/carot.png";

// Unified mapping of flavors to their images for apple and mango
const flavorImageMap = {
  Crayfish: { apple: Crayfish, mango: crayfish },
  Peppersoup: { apple: Peppersoup, mango: pepper },
  Oriental: { apple: OrientalNoodle, mango: carrot },
};

// Mapping of housemate names to their images
const housemateImages = {
  Housemate1: Housemate1,
  Housemate2: Housemate2,
};

export const getImages = (taskNumber, selectedFlavors) => {
  // Retrieve selectedHousemate from localStorage, fallback to "Housemate1"
  const selectedHousemate = localStorage.getItem("selectedHousemate") || "Housemate1";

  // Ensure selectedFlavors is an array, fallback to [null, null, null]
  const flavors = Array.isArray(selectedFlavors) ? selectedFlavors : [null, null, null];
  const selectedFlavor = flavors[taskNumber - 1] || "Crayfish"; // Fallback to Crayfish

  console.log(
    `getImages: taskNumber=${taskNumber}, selectedFlavor=${selectedFlavor}, ` +
    `selectedFlavors=${JSON.stringify(flavors)}, selectedHousemate=${selectedHousemate}`
  );

  // Get the image set for the selected flavor, fallback to Crayfish
  const images = flavorImageMap[selectedFlavor] || flavorImageMap.Crayfish;

  return {
    apple: Object.assign(new Image(), { src: images.apple }),
    mango: Object.assign(new Image(), { src: images.mango }), // Always matches the selected flavor
    nut: Object.assign(new Image(), { src: nutImg }),
    bomb: Object.assign(new Image(), { src: bombImg }),
    bomb2: Object.assign(new Image(), { src: bombImg2 }),
    bomb3: Object.assign(new Image(), { src: bombImg3 }),
    basket: Object.assign(new Image(), { src: housemateImages[selectedHousemate] || Housemate1 }),
  };
};

export { Scorereveal, backgroundImage, replay, task };