import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";

const ID = "com.example.show-token";
const MODAL_ID = `${ID}/select-players-modal`;
const BROADCAST_CHANNEL = `${ID}/show-token-channel`;
const SHOW_NAME_METADATA_KEY = `${ID}/showName`;

const params = new URLSearchParams(window.location.search);
const imageUrl = params.get("imageUrl") || "";
const tokenName = params.get("name") || "";

const previewImage = document.getElementById("preview-image");
const previewName = document.getElementById("preview-name");
const showNameCheckbox = document.getElementById("show-name-checkbox");
const selectAllCheckbox = document.getElementById("select-all");
const playersListEl = document.getElementById("players-list");
const sendBtn = document.getElementById("send-btn");
const cancelBtn = document.getElementById("cancel-btn");

previewImage.src = imageUrl;
previewName.textContent = tokenName || "Token";

/** @type {{id: string, name: string, color: string}[]} */
let players = [];
/** @type {Set<string>} */
const selectedPlayerIds = new Set();

function applyTheme(theme) {
  const isLight = theme?.mode === "LIGHT";
  document.documentElement.classList.toggle("light", isLight);
}

function updateSendButtonState() {
  const anySelected = selectAllCheckbox.checked || selectedPlayerIds.size > 0;
  sendBtn.disabled = !anySelected;
}

function renderPlayers() {
  if (players.length === 0) {
    playersListEl.innerHTML = `<div class="empty-state">No other players in the room.</div>`;
    return;
  }

  playersListEl.innerHTML = "";
  for (const player of players) {
    const row = document.createElement("label");
    row.className = "player-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = player.id;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedPlayerIds.add(player.id);
      } else {
        selectedPlayerIds.delete(player.id);
      }
      updateSendButtonState();
    });

    const dot = document.createElement("span");
    dot.className = "player-color-dot";
    dot.style.background = player.color || "#888888";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = player.name;

    row.appendChild(checkbox);
    row.appendChild(dot);
    row.appendChild(nameSpan);
    playersListEl.appendChild(row);
  }
}

function setIndividualCheckboxesDisabled(disabled) {
  const checkboxes = playersListEl.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    cb.disabled = disabled;
  });
}

selectAllCheckbox.addEventListener("change", () => {
  setIndividualCheckboxesDisabled(selectAllCheckbox.checked);
  updateSendButtonState();
});

showNameCheckbox.addEventListener("change", () => {
  OBR.room.setMetadata({ [SHOW_NAME_METADATA_KEY]: showNameCheckbox.checked });
});

cancelBtn.addEventListener("click", async () => {
  await OBR.modal.close(MODAL_ID);
});

sendBtn.addEventListener("click", async () => {
  const targetAll = selectAllCheckbox.checked;
  const targetIds = targetAll ? [] : Array.from(selectedPlayerIds);

  await OBR.broadcast.sendMessage(
    BROADCAST_CHANNEL,
    {
      targetAll,
      targetIds,
      imageUrl,
      name: tokenName,
      showName: showNameCheckbox.checked,
    },
    { destination: "ALL" }
  );

  await OBR.modal.close(MODAL_ID);
});

async function init() {
  OBR.onReady(async () => {
    const theme = await OBR.theme.getTheme();
    applyTheme(theme);
    OBR.theme.onChange(applyTheme);

    const metadata = await OBR.room.getMetadata();
    const savedShowName = metadata[SHOW_NAME_METADATA_KEY];
    if (typeof savedShowName === "boolean") {
      showNameCheckbox.checked = savedShowName;
    }

    const party = await OBR.party.getPlayers();
    players = party.map((p) => ({ id: p.id, name: p.name, color: p.color }));
    renderPlayers();
    updateSendButtonState();
  });
}

init();
