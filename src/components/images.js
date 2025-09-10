import Scorereveal from "../assets/Score reveal.png";
import backgroundImage from "../assets/Other stage background.webp";
import replay from "../assets/Replay.png";
import task from "../assets/Next task button.png";
import chicken from "../assets/Layer 3 copy 5.png";
import leaf from "../assets/Asset 8-8.png";
import egg from "../assets/Egg.png";
import bombImg from "../assets/Layer 5.png";
import bombImg2 from "../assets/Layer 10.png";
import bombImg3 from "../assets/Layer 4 copy.png";
import Crayfish from "../assets/newCrayfish.svg";
import Peppersoup from "../assets/New chicken pepper soup.svg";
import OrientalNoodle from "../assets/New Oriental.svg";
import Housemate1 from "../assets/Arena Male Character.webp";
import Housemate2 from "../assets/Female carrying Charater.webp";
import pepper from "../assets/Vector Smart Object4.png";
import crayfish from "../assets/Crayfsih.png";
import carrot from "../assets/pepper.png";

// Unified mapping of flavors to their images for apple and mango
const flavorImageMap = {
  Crayfish: { apple: Crayfish, mango: crayfish ,nut:egg },
  Peppersoup: { apple: Peppersoup, mango: pepper,nut:chicken },
  Oriental: { apple: OrientalNoodle, mango: carrot,nut:leaf  },
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
    nut: Object.assign(new Image(), { src: images.nut }),
    bomb: Object.assign(new Image(), { src: bombImg }),
    bomb2: Object.assign(new Image(), { src: bombImg2 }),
    bomb3: Object.assign(new Image(), { src: bombImg3 }),
    basket: Object.assign(new Image(), { src: housemateImages[selectedHousemate] || Housemate1 }),
  };
};

export { Scorereveal, backgroundImage, replay, task };