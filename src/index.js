import satvisSetup from "./app";

const { cc } = satvisSetup({
  sat: {
    enabledTags: ["TinyGS"],
  },
});

// Ensure TinyGS tag is enabled by default
if (cc.sats.enabledTags.length === 0) {
  cc.sats.enabledTags = ["TinyGS"];
}

cc.sats.addFromTleUrls([
  // ["data/tle/groups/cubesat.txt", ["Cubesat"]],
  // ["data/tle/groups/globalstar.txt", ["Globalstar"]],
  // ["data/tle/groups/gnss.txt", ["GNSS"]],
  // ["data/tle/groups/iridium-NEXT.txt", ["IridiumNEXT"]],
  // ["data/tle/groups/last-30-days.txt", ["New"]],
  // ["data/tle/groups/oneweb.txt", ["OneWeb"]],
  // ["data/tle/groups/planet.txt", ["Planet"]],
  // ["data/tle/groups/resource.txt", ["Resource"]],
  // ["data/tle/groups/science.txt", ["Science"]],
  // ["data/tle/groups/spire.txt", ["Spire"]],
  // ["data/tle/groups/starlink.txt", ["Starlink"]],
  // ["data/tle/groups/stations.txt", ["Stations"]],
  // ["data/tle/groups/weather.txt", ["Weather"]],
  // ["data/tle/groups/eutelsat.txt", ["Eutelsat"]],
  ["https://api.tinygs.com/v1/tles.txt", ["TinyGS"]],
  // ["data/tle/groups/active.txt", ["Active"]],
]);

console.log("Satellites loaded from TinyGS TLEs");
console.log("enabledTags:", cc.sats.enabledTags);
