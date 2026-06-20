import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";

const ID = "com.example.show-token";
const CLOSE_BROADCAST_CHANNEL = `${ID}/close-token-channel`;

const gmOnlyHint = document.getElementById("gm-only-hint");
const gmControls = document.getElementById("gm-controls");
const closeAllBtn = document.getElementById("close-all-btn");

function applyTheme(theme) {
  const isLight = theme?.mode === "LIGHT";
  document.documentElement.classList.toggle("light", isLight);
}

closeAllBtn.addEventListener("click", async () => {
  await OBR.broadcast.sendMessage(CLOSE_BROADCAST_CHANNEL, {}, { destination: "ALL" });
  closeAllBtn.textContent = "Closed ✓";
  setTimeout(() => {
    closeAllBtn.textContent = "Close shown token for everyone";
  }, 1500);
});

OBR.onReady(async () => {
  const theme = await OBR.theme.getTheme();
  applyTheme(theme);
  OBR.theme.onChange(applyTheme);

  const role = await OBR.player.getRole();
  if (role === "GM") {
    gmOnlyHint.hidden = true;
    gmControls.hidden = false;
  }
});
