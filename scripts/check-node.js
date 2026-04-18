var required = { major: 20, minor: 19, patch: 4 };
var current = process.versions.node.split(".").map(function (part) {
  return parseInt(part, 10) || 0;
});

function isSupported(version, minimum) {
  if (version[0] !== minimum.major) {
    return version[0] > minimum.major;
  }

  if (version[1] !== minimum.minor) {
    return version[1] > minimum.minor;
  }

  return version[2] >= minimum.patch;
}

if (!isSupported(current, required)) {
  console.error("");
  console.error("This project requires Node >= 20.19.4.");
  console.error("Current Node: " + process.versions.node);
  console.error("");
  console.error("React Native 0.81 and Expo 54 use syntax that Node 14 cannot parse.");
  console.error("Upgrade Node, then reinstall dependencies:");
  console.error("  1. nvm install 20.19.4");
  console.error("  2. nvm use 20.19.4");
  console.error("  3. npm install");
  console.error("  4. npm run start");
  console.error("");
  process.exit(1);
}
