import { ref, watch } from "vue";

// Room lights for the hero diorama. Shared by the 3D light switch, the menubar toggle and the terminal.
const STORAGE_KEY = "gionyx-lights";

const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "off";
  } catch {
    return false;
  }
};

export const lightsOff = ref(read());

watch(lightsOff, (off) => {
  try {
    localStorage.setItem(STORAGE_KEY, off ? "off" : "on");
  } catch {
    /* private mode: the choice just won't persist */
  }
});

export const toggleLights = () => {
  lightsOff.value = !lightsOff.value;
};

export const setLights = (on: boolean) => {
  lightsOff.value = !on;
};
