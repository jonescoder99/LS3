chrome.runtime.onMessage.addListener(async ({ action, word }, sender, sendResponse) => {
  if (action !== "showMeaning" || !word) return;

  document.getElementById("meaningPopup")?.remove(); // Remove existing popup

  const popup = document.createElement("div");
  popup.id = "meaningPopup";
  Object.assign(popup.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "340px",
    background: "#fff",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    color: "#333",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
    zIndex: "10000",
    fontFamily: "Arial, sans-serif",
    transition: "opacity 0.3s ease-in-out"
  });

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; color: #FA9858; font-size: 18px; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">📚 LexiShift</h3>
      <button id="closePopup" style="padding: 5px 12px; background: #FA9858; color: #fff; border: none; border-radius: 12px; font-size: 12px; cursor: pointer; transition: background 0.3s ease;">Close</button>
    </div>
    ${createInfoBox("🔤 Word", word, "#FA9858")}
    ${createInfoBox("💡 Definition", "Loading...", "#5E9FFF", "wordDefinition")}
    ${createInfoBox("📖 Example", "Loading...", "#8BC34A", "wordExample")}
  `;

  document.body.appendChild(popup);
  document.getElementById("closePopup").addEventListener("click", () => fadeOutAndRemove(popup));

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) throw new Error("Word not found");
    
    const [{ meanings }] = await response.json();
    const { definition = "No definition available.", example = "No example available." } = meanings[0].definitions[0] || {};
    
    document.getElementById("wordDefinition").innerText = definition;
    document.getElementById("wordExample").innerText = example;
  } catch ({ message }) {
    document.getElementById("wordDefinition").innerText = `Error: ${message}`;
    document.getElementById("wordExample").innerText = "N/A";
  }
});

function createInfoBox(title, content, borderColor, id = "") {
  return `
    <div style="background: #f5f5f5; padding: 12px; border-radius: 12px; border-left: 4px solid ${borderColor}; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);">
      <p style="margin: 0; font-size: 14px;"><strong>${title}:</strong></p>
      <p style="margin: 5px 0 0; color: #333; font-size: 15px;" id="${id}">${content}</p>
    </div>
  `;
}

function fadeOutAndRemove(element) {
  element.style.opacity = "0";
  setTimeout(() => element.remove(), 300);
}
