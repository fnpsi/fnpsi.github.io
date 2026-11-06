/* =========================================================
   Function Psi — contact brief builder
   Everything happens in this tab. Nothing is submitted.
   ========================================================= */
(function () {
  "use strict";

  var form = document.querySelector("[data-brief-form]");
  var output = document.querySelector("[data-brief-output]");
  if (!form || !output) return;

  var nameInput = document.querySelector("[data-brief-name]");
  var ideaInput = document.querySelector("[data-brief-idea]");
  var notesInput = document.querySelector("[data-brief-notes]");
  var timelineInput = document.querySelector("[data-brief-timeline]");
  var scopeInput = document.querySelector("[data-brief-scope]");
  var kindInputs = Array.prototype.slice.call(document.querySelectorAll("[data-brief-kind]"));
  var copyButton = document.querySelector("[data-brief-copy]");
  var downloadButton = document.querySelector("[data-brief-download]");
  var resetButton = document.querySelector("[data-brief-reset]");
  var openLink = document.querySelector("[data-brief-open]");
  var hint = document.querySelector("[data-brief-hint]");
  var count = document.querySelector("[data-brief-count]");

  var defaultHint = "Nothing leaves this page until you copy it.";
  var copyTimer = null;

  function selectedKind() {
    var checked = kindInputs.filter(function (input) { return input.checked; })[0];
    return checked ? checked.value : "3D";
  }

  function compose() {
    var name = nameInput ? nameInput.value.trim() : "";
    var idea = ideaInput ? ideaInput.value.trim() : "";
    var notes = notesInput ? notesInput.value.trim() : "";
    var timeline = timelineInput ? timelineInput.value : "No fixed date";
    var scope = scopeInput ? scopeInput.value : "Not sure yet";

    var lines = [];
    lines.push("Hi Rendani — " + (name ? "I'm " + name + "." : "I have an idea."));
    lines.push("");
    lines.push("Project: " + selectedKind());
    lines.push("Timeline: " + timeline);
    lines.push("Scope: " + scope);
    lines.push("");
    lines.push("The idea:");
    lines.push(idea || "[Write the idea here — the preview updates as you type.]");

    if (notes) {
      lines.push("");
      lines.push("Links / constraints:");
      lines.push(notes);
    }

    lines.push("");
    lines.push("Composed at fnpsi.env.pm/contact.html");

    return lines.join("\n");
  }

  function isReady() {
    return Boolean(ideaInput && ideaInput.value.trim().length > 0);
  }

  function update() {
    var message = compose();
    var ready = isReady();

    output.textContent = message;

    if (count) {
      count.textContent = ready
        ? new Intl.NumberFormat("en-GB").format(message.length) + " chars"
        : "0 chars";
    }

    if (copyButton) copyButton.disabled = !ready;
    if (downloadButton) downloadButton.disabled = !ready;
  }

  function setHint(message) {
    if (!hint) return;
    hint.textContent = message;
  }

  function resetCopyButton() {
    if (!copyButton) return;
    copyButton.querySelector("span").textContent = "Copy brief";
    copyButton.querySelector("span:last-child").textContent = "⧉";
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "0";
      field.style.left = "-9999px";
      document.body.append(field);
      field.select();

      try {
        var copied = document.execCommand("copy");
        document.body.removeChild(field);
        if (copied) resolve();
        else reject(new Error("Copy command was rejected."));
      } catch (error) {
        document.body.removeChild(field);
        reject(error);
      }
    });
  }

  function selectPreview() {
    var range = document.createRange();
    range.selectNodeContents(output);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function handleCopy() {
    if (!isReady()) {
      setHint("Add the idea first. Then the brief is ready to copy.");
      if (ideaInput) ideaInput.focus();
      return;
    }

    copyText(compose()).then(function () {
      setHint("Copied. Open X and paste it into a DM to @fnpsi_.");
      if (copyButton) {
        copyButton.querySelector("span").textContent = "Copied";
        copyButton.querySelector("span:last-child").textContent = "✓";
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(resetCopyButton, 2600);
      }
    }).catch(function () {
      setHint("The browser blocked automatic copying. Select the preview and copy it manually.");
      selectPreview();
    });
  }

  function handleDownload() {
    if (!isReady()) return;

    var blob = new Blob([compose()], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "fnpsi-brief.txt";
    document.body.append(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);

    setHint("Downloaded as fnpsi-brief.txt. Send it however you like.");
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);

  if (copyButton) copyButton.addEventListener("click", handleCopy);
  if (downloadButton) downloadButton.addEventListener("click", handleDownload);

  if (openLink) {
    openLink.addEventListener("click", function () {
      if (!isReady()) {
        setHint("The X profile is open. Add the idea here when you are ready to send the brief.");
        return;
      }

      copyText(compose()).then(function () {
        setHint("Brief copied. Paste it into the DM once X opens.");
      }).catch(function () {
        setHint("X is opening. Select the preview and copy the brief manually.");
        selectPreview();
      });
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      form.reset();
      window.clearTimeout(copyTimer);
      resetCopyButton();
      update();
      setHint(defaultHint);
      if (nameInput) nameInput.focus();
    });
  }

  update();
})();
