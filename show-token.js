import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";

const ID = "com.example.show-token";
const POPUP_ID = `${ID}/show-token-popup`;

const params = new URLSearchParams(window.location.search);
const imageUrl = params.get("imageUrl") || "";
const tokenName = params.get("name") || "";
const showName = params.get("showName") !== "0";

const viewerImage = document.getElementById("viewer-image");
const viewerName = document.getElementById("viewer-name");
const closeBtn = document.getElementById("close-btn");

viewerImage.src = imageUrl;
viewerName.textContent = showName ? (tokenName || "Token") : "";

function applyTheme(theme) {
  const isLight = theme?.mode === "LIGHT";
  document.documentElement.classList.toggle("light", isLight);
}

closeBtn.addEventListener("click", async () => {
  await OBR.modal.close(POPUP_ID);
});

OBR.onReady(async () => {
  const theme = await OBR.theme.getTheme();
  applyTheme(theme);
  OBR.theme.onChange(applyTheme);
});
