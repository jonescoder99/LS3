
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "getMeaning",
    title: "Get Meaning of '%s'",
    contexts: ["selection"],
  });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getMeaning" && info.selectionText) {
    handleMeaningRequest(tab, info.selectionText);
  }
});
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "get-word-meaning") return;

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) return;

  const [{ result: selectedText }] = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => window.getSelection().toString() || null,
  });

  if (selectedText) {
    handleMeaningRequest(activeTab, selectedText);
  } else {
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => alert("Please highlight a word to find its meaning."),
    });
  }
});
async function handleMeaningRequest(tab, word) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    chrome.tabs.sendMessage(tab.id, { action: "showMeaning", word });
  } catch (error) {
    console.error("Error injecting content script or sending message:", error);
  }
}
