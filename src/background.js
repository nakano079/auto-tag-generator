chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "saveWithTags",
      title: "Save with Tags",
      contexts: ["image"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveWithTags") {
      const imageUrl = info.srcUrl;
      chrome.tabs.sendMessage(tab.id, { action: "analyzeImage", url: imageUrl }, (response) => {
        if (!response) {
          console.error("No response from content script");
          const filename = `unknown_${imageUrl.split('/').pop()}`;
          chrome.downloads.download({
            url: imageUrl,
            filename: filename,
            saveAs: true
          });
          return;
        }
        const tag = response.tag || "unknown";
        const filename = `${tag}_${imageUrl.split('/').pop()}`;
        chrome.downloads.download({
          url: imageUrl,
          filename: filename,
          saveAs: true
        });
      });
    }
  });