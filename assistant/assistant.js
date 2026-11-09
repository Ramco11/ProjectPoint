document.addEventListener("DOMContentLoaded", () => {

  const conversation =
    document.getElementById("conversation");

  const form =
    document.getElementById("questionForm");

  const questionInput =
    document.getElementById("questionInput");

  const photoButton =
    document.getElementById("photoButton");

  const photoInput =
    document.getElementById("photoInput");

  const clearButton =
    document.getElementById("clearChat");

  const responses = {

    crop:
      "Tell me the crop name, crop age, location and the condition you are seeing. You can also upload a clear photo.",

    pest:
      "Please upload a clear photo of the affected leaf, stem or fruit and describe how long the problem has been present.",

    weather:
      "The production version can connect to a verified weather service. Your location and crop can then be used to display farming-relevant forecasts.",

    irrigation:
      "Tell me the crop, growth stage, soil type and recent rainfall. Those details are important before estimating irrigation needs.",

    organic:
      "Tell me the crop and the specific problem. I can then organize possible organic management options for review.",

    market:
      "Open Market Prices to compare crop prices. Live market information will be connected to a verified data source during the backend phase."

  };

  document
    .querySelectorAll(
      ".assistant-options button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const topic =
            button.dataset.topic;

          addUserMessage(
            button.querySelector("b")
              .textContent
          );

          setTimeout(() => {

            addAssistantMessage(
              responses[topic]
            );

          }, 250);

        }
      );

    });

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const question =
        questionInput.value.trim();

      if (!question) {
        questionInput.focus();
        return;
      }

      addUserMessage(question);

      questionInput.value = "";

      setTimeout(() => {

        addAssistantMessage(
          createDemoResponse(question)
        );

      }, 350);

    }
  );

  photoButton.addEventListener(
    "click",
    () => {

      photoInput.click();

    }
  );

  photoInput.addEventListener(
    "change",
    () => {

      const file =
        photoInput.files[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {

        addAssistantMessage(
          "Please select an image file."
        );

        photoInput.value = "";
        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        event => {

          const wrapper =
            document.createElement("div");

          wrapper.className =
            "message user-message";

          wrapper.innerHTML =
            "<strong>Crop photo</strong>";

          const image =
            document.createElement("img");

          image.src =
            event.target.result;

          image.className =
            "photo-preview";

          image.alt =
            "Uploaded crop";

          wrapper.appendChild(image);

          conversation.appendChild(
            wrapper
          );

          scrollConversation();

          setTimeout(() => {

            addAssistantMessage(
              "Photo received. The current frontend does not perform crop diagnosis yet. When the secure AI backend is connected, the photo can be analyzed together with crop, location and symptom information."
            );

          }, 350);

        };

      reader.readAsDataURL(file);

      photoInput.value = "";

    }
  );

  clearButton.addEventListener(
    "click",
    () => {

      conversation.innerHTML = "";

      addAssistantMessage(
        "Conversation cleared. What can I help you with?"
      );

    }
  );

  function addUserMessage(text) {

    const message =
      document.createElement("div");

    message.className =
      "message user-message";

    message.textContent = text;

    conversation.appendChild(
      message
    );

    scrollConversation();

  }

  function addAssistantMessage(text) {

    const message =
      document.createElement("div");

    message.className =
      "message assistant-message";

    const title =
      document.createElement("strong");

    title.textContent =
      "FarmSetu AI";

    const paragraph =
      document.createElement("p");

    paragraph.textContent = text;

    message.appendChild(title);
    message.appendChild(paragraph);

    conversation.appendChild(
      message
    );

    scrollConversation();

  }

  function createDemoResponse(question) {

    const lower =
      question.toLowerCase();

    if (
      lower.includes("price") ||
      lower.includes("market")
    ) {

      return "For market prices, use the Market Prices screen. Live mandi pricing should be connected through a verified agricultural market data source.";

    }

    if (
      lower.includes("water") ||
      lower.includes("irrigation")
    ) {

      return "For irrigation guidance, provide the crop, growth stage, soil type, location and recent rainfall. Avoid making irrigation decisions from crop name alone.";

    }

    if (
      lower.includes("pest") ||
      lower.includes("disease") ||
      lower.includes("leaf")
    ) {

      return "Please upload a clear photo and provide the crop name, plant age, affected plant part and how quickly symptoms are spreading. Image-based identification should be treated as preliminary guidance.";

    }

    if (
      lower.includes("organic")
    ) {

      return "I can help organize organic farming options. Tell me the crop and problem so that possible cultural, biological and organic treatment approaches can be considered.";

    }

    return "I received your farming question. This screen is currently running in frontend demonstration mode. The production version will send the question securely to the FarmSetu AI backend.";

  }

  function scrollConversation() {

    conversation.lastElementChild
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

  }

});