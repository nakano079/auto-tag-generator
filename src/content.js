import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model;
async function loadModel() {
  try {
    model = await mobilenet.load();
    console.log("Model loaded");
  } catch (e) {
    console.error("Model loading failed:", e);
  }
}

async function analyzeImage(imageUrl) {
  try {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    await img.decode();

    const tfImg = tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat();
    const offset = tf.scalar(127.5);
    const normalized = tfImg.sub(offset).div(offset);
    const tensor = normalized.expandDims(0);

    const predictions = await model.classify(tensor);
    tf.dispose([tfImg, normalized, tensor]);
    return predictions[0].className.split(",")[0].toLowerCase();
  } catch (e) {
    console.error("Image analysis failed:", e);
    return "error";
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
  if (message.action === "analyzeImage") {
    analyzeImage(message.url).then(tag => {
      console.log("Sending response:", { tag });
      sendResponse({ tag });
    }).catch(e => {
      console.error("Analysis error:", e);
      sendResponse({ tag: "error" });
    });
    return true;
  }
});


loadModel();