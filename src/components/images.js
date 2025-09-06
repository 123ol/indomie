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

// Mapping of flavor names to their images
const flavorImages = {
  Crayfish: Crayfish,
  Peppersoup: Peppersoup,
  Oriental: OrientalNoodle,
};

// Mapping of housemate names to their images
const housemateImages = {
  Housemate1: Housemate1,
  Housemate2: Housemate2,
};

export const getImages = (taskNumber, selectedFlavors) => {
  // Retrieve selectedHousemate from localStorage, fallback to "Housemate1" if not found
  const selectedHousemate = localStorage.getItem("selectedHousemate") || "Housemate1";

  // Fallback to an empty array if selectedFlavors is undefined or null
  const flavors = Array.isArray(selectedFlavors) ? selectedFlavors : [null, null, null];
  const selectedFlavor = flavors[taskNumber - 1] || "Crayfish"; // Fallback to Crayfish

  console.log(
    `getImages: taskNumber=${taskNumber}, selectedFlavor=${selectedFlavor}, selectedFlavors=${JSON.stringify(
      flavors
    )}, selectedHousemate=${selectedHousemate}`
  );

  return {
    apple: Object.assign(new Image(), { src: flavorImages[selectedFlavor] || Crayfish }),
    mango: Object.assign(new Image(), { src: mangoImg }),
    nut: Object.assign(new Image(), { src: nutImg }),
    bomb: Object.assign(new Image(), { src: bombImg }),
    bomb2: Object.assign(new Image(), { src: bombImg2 }),
    bomb3: Object.assign(new Image(), { src: bombImg3 }),
    basket: Object.assign(new Image(), { src: housemateImages[selectedHousemate] || Housemate1 }),
  };
};

export { Scorereveal, backgroundImage, replay, task };