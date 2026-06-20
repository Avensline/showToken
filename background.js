import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";

const BASE_URL = "https://avensline.github.io/showToken/";

const ID = "com.example.show-token";
const CONTEXT_MENU_ID = `${ID}/context-menu`;
const MODAL_ID = `${ID}/select-players-modal`;
const POPUP_ID = `${ID}/show-token-popup`;
const BROADCAST_CHANNEL = `${ID}/show-token-channel`;

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

    await OBR.modal.open({
      id: POPUP_ID,
      url: `${BASE_URL}show-token.html?imageUrl=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(name || "")}&showName=${showName ? "1" : "0"}`,
      height: 700,
      width: 700,
    });
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
});
