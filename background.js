import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";

const BASE_URL = "https://avensline.github.io/showToken/";

const MOBILE_WIDTH_THRESHOLD = 700;

function isMobileScreen() {
  const screenWidth = window.screen?.width || window.innerWidth;
  return screenWidth < MOBILE_WIDTH_THRESHOLD;
}

const ID = "com.example.show-token";
const CONTEXT_MENU_ID = `${ID}/context-menu`;
const MODAL_ID = `${ID}/select-players-modal`;
const POPUP_ID = `${ID}/show-token-popup`;
const BROADCAST_CHANNEL = `${ID}/show-token-channel`;
const CLOSE_BROADCAST_CHANNEL = `${ID}/close-token-channel`;

async function setupContextMenu() {
  const role = await OBR.player.getRole();
  if (role !== "GM") return;

  OBR.contextMenu.create({
    id: CONTEXT_MENU_ID,
    icons: [
      {
        icon: `${BASE_URL}icon.svg`,
        label: "Show token",
        filter: {
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: "type", value: "IMAGE" },
          ],
        },
      },
    ],
    async onClick(context) {

      const item = context.items[0];
      if (!item) return;

      const imageUrl = item.image?.url;
      const name = item.name || "";
      if (!imageUrl) return;

      await OBR.modal.open({
        id: MODAL_ID,
        url: `${BASE_URL}select-players.html?imageUrl=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(name)}`,
        height: 540,
        width: 460,
      });
    },
  });
}

function setupBroadcastListener() {
  OBR.broadcast.onMessage(BROADCAST_CHANNEL, async (event) => {
    const { targetIds, targetAll, imageUrl, name, showName } = event.data || {};
    const myId = await OBR.player.getId();

    const isTarget = targetAll || (Array.isArray(targetIds) && targetIds.includes(myId));
    if (!isTarget) return;

    await OBR.modal.close(POPUP_ID).catch(() => {});

    const modalOptions = isMobileScreen()
      ? { fullScreen: true }
      : { height: 900, width: 900 };

    await OBR.modal.open({
      id: POPUP_ID,
      url: `${BASE_URL}show-token.html?imageUrl=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(name || "")}&showName=${showName ? "1" : "0"}`,
      ...modalOptions,
    });
  });
}

function setupCloseListener() {
  OBR.broadcast.onMessage(CLOSE_BROADCAST_CHANNEL, async () => {
    await OBR.modal.close(POPUP_ID).catch(() => {});
  });
}

OBR.onReady(() => {
  setupContextMenu().catch((err) =>
    console.error("[Show Token] Failed to register context menu:", err)
  );
  try {
    setupBroadcastListener();
  } catch (err) {
    console.error("[Show Token] Failed to register broadcast listener:", err);
  }
  try {
    setupCloseListener();
  } catch (err) {
    console.error("[Show Token] Failed to register close listener:", err);
  }
});
