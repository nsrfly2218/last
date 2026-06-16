    // التحكم في إظهار/إخفاء الأقسام بناءً على نوع القالب
    function handleTemplateTypeChange() {
      const templateTypeEl = document.getElementById("templateType");
      if (!templateTypeEl) return;
      const templateType = templateTypeEl.value;
      const contentSection = document.getElementById("contentSection");
      const buttonsSection = document.getElementById("buttonsSection");
      const authenticationSection = document.getElementById(
        "authenticationSection"
      );
      const templateHeader = document.getElementById("templateHeader");
      const headerFields = document.getElementById("headerFields");
      const headerTextGroup = document.getElementById("headerTextGroup");
      const templateHeaderGroup = templateHeader
        ? templateHeader.closest(".wd-form-group")
        : null;
      const templateFooter = document.getElementById("templateFooter");
      const templateFooterGroup = templateFooter
        ? templateFooter.closest(".wd-form-group")
        : null;
      const templateContent = document.getElementById("templateContent");
      const templateContentGroup = templateContent
        ? templateContent.closest(".wd-form-group")
        : null;
      const carouselCardsSection = document.getElementById("carouselCardsSection");
      const limitedOfferSection = document.getElementById("limitedOfferSection");

      if (templateType === "authentication") {
        setHeaderAllowedTypes(["none", "text", "image", "video", "document", "location"]);
        // إخفاء قسم المحتوى والأزرار
        if (contentSection) contentSection.style.display = "none";
        if (buttonsSection) buttonsSection.style.display = "none";
        if (carouselCardsSection) carouselCardsSection.style.display = "none";
        if (limitedOfferSection) limitedOfferSection.style.display = "none";
        // إظهار قسم المصادقة
        if (authenticationSection)
          authenticationSection.style.display = "block";
      } else {
        // إظهار قسم المحتوى والأزرار
        if (contentSection) contentSection.style.display = "block";
        // إخفاء قسم المصادقة
        if (authenticationSection)
          authenticationSection.style.display = "none";

        // القيم الافتراضية العامة لغير المصادقة
        if (templateHeaderGroup) templateHeaderGroup.style.display = "block";
        if (templateFooterGroup) templateFooterGroup.style.display = "block";
        if (templateContentGroup) templateContentGroup.style.display = "block";
        if (buttonsSection) buttonsSection.style.display = "block";
        if (carouselCardsSection) carouselCardsSection.style.display = "none";
        if (limitedOfferSection) limitedOfferSection.style.display = "none";
        setHeaderAllowedTypes(["none", "text", "image", "video", "document", "location"]);

        // تخصيص الحقول حسب النوع
        if (templateType === "carousel") {
          // عرض متعدد البطاقات: بدون رأس + بدون تذييل + بدون أزرار
          if (templateHeader) {
            templateHeader.value = "none";
            handleHeaderChange();
          }
          if (templateHeaderGroup) templateHeaderGroup.style.display = "none";
          if (templateFooterGroup) templateFooterGroup.style.display = "none";
          if (templateContentGroup) templateContentGroup.style.display = "block";
          if (buttonsSection) buttonsSection.style.display = "none";
          if (carouselCardsSection) {
            carouselCardsSection.style.display = "block";
            handleCarouselCardsConfigChange();
          }
        } else if (templateType === "single-product") {
          // منتج واحد: محتوى + تذييل فقط
          if (templateHeader) {
            templateHeader.value = "none";
            handleHeaderChange();
          }
          if (templateHeaderGroup) templateHeaderGroup.style.display = "none";
          if (templateFooterGroup) templateFooterGroup.style.display = "block";
          if (templateContentGroup) templateContentGroup.style.display = "block";
          if (buttonsSection) buttonsSection.style.display = "none";
          if (carouselCardsSection) carouselCardsSection.style.display = "none";
        } else if (templateType === "multiple-products") {
          // متعدد المنتجات: نص الرأس + محتوى + تذييل
          if (templateHeader) {
            templateHeader.value = "text";
            handleHeaderChange();
          }
          if (templateHeaderGroup) templateHeaderGroup.style.display = "none";
          if (headerFields) headerFields.style.display = "block";
          if (headerTextGroup) headerTextGroup.style.display = "block";
          if (templateFooterGroup) templateFooterGroup.style.display = "block";
          if (templateContentGroup) templateContentGroup.style.display = "block";
          if (buttonsSection) buttonsSection.style.display = "none";
          if (carouselCardsSection) carouselCardsSection.style.display = "none";
        } else if (templateType === "product-card-slider") {
          // عرض متعدد لبطاقات المنتجات: محتوى فقط
          if (templateHeader) {
            templateHeader.value = "none";
            handleHeaderChange();
          }
          if (templateHeaderGroup) templateHeaderGroup.style.display = "none";
          if (templateFooterGroup) templateFooterGroup.style.display = "none";
          if (templateContentGroup) templateContentGroup.style.display = "block";
          if (buttonsSection) buttonsSection.style.display = "none";
          if (carouselCardsSection) carouselCardsSection.style.display = "none";
        } else if (templateType === "limited-offer") {
          if (templateHeaderGroup) templateHeaderGroup.style.display = "block";
          if (templateFooterGroup) templateFooterGroup.style.display = "none";
          if (templateContentGroup) templateContentGroup.style.display = "none";
          if (buttonsSection) buttonsSection.style.display = "none";
          if (carouselCardsSection) carouselCardsSection.style.display = "none";
          if (limitedOfferSection) limitedOfferSection.style.display = "block";
          setHeaderAllowedTypes(["none", "image", "video"]);
          if (templateHeader && !["none", "image", "video"].includes(templateHeader.value)) {
            templateHeader.value = "none";
            handleHeaderChange();
          }
        }
      }

      updateTemplatePreview();
    }

    function switchTemplateCategoryTab(category) {
      document.querySelectorAll(".wd-category-tab").forEach((tab) => {
        tab.classList.toggle(
          "active",
          tab.getAttribute("data-category-tab") === category
        );
      });

      document.querySelectorAll(".wd-category-options").forEach((options) => {
        options.classList.toggle(
          "active",
          options.getAttribute("data-category-options") === category
        );
      });

      const activeOption = document.querySelector(
        `.wd-category-options[data-category-options="${category}"] .wd-category-option.selected`
      );
      if (activeOption) {
        applyTemplateTypeFromCategoryOption(activeOption);
      }
    }

    function selectTemplateCategoryOption(optionElement, category) {
      const parent = optionElement.closest(".wd-category-options");
      if (!parent) return;

      parent.querySelectorAll(".wd-category-option").forEach((opt) => {
        opt.classList.remove("selected");
      });
      optionElement.classList.add("selected");

      document.querySelectorAll(".wd-category-tab").forEach((tab) => {
        tab.classList.toggle(
          "active",
          tab.getAttribute("data-category-tab") === category
        );
      });

      applyTemplateTypeFromCategoryOption(optionElement);
    }

    function applyTemplateTypeFromCategoryOption(optionElement) {
      const templateTypeSelect = document.getElementById("templateType");
      if (!templateTypeSelect || !optionElement) return;

      const templateValue = optionElement.getAttribute("data-template-value");
      if (!templateValue) return;

      templateTypeSelect.value = templateValue;
      handleTemplateTypeChange();
    }

    function setHeaderAllowedTypes(allowedTypes) {
      const headerSelect = document.getElementById("templateHeader");
      if (!headerSelect) return;
      const allowedSet = new Set(allowedTypes || []);
      Array.from(headerSelect.options).forEach((option) => {
        option.hidden = !allowedSet.has(option.value);
      });
    }

    function buildLimitedOfferPreviewMessageHtml() {
      const title =
        document.getElementById("limitedOfferTitle")?.value.trim() || "عنوان العرض";
      const bodyRaw = document.getElementById("limitedOfferBody")?.value || "";
      const bodyHtml = bodyRaw
        ? escapeHtml(bodyRaw).replace(/\n/g, "<br>")
        : "&nbsp;";
      const expiryEnabled =
        document.getElementById("limitedOfferEnableExpiry")?.checked || false;
      const expiryText = expiryEnabled
        ? "ينتهي العرض في MMM YY"
        : "";

      return `
        <div class="wd-lo-card">
          <div class="wd-lo-card-head">
            <i class="fas fa-gift wd-lo-card-icon"></i>
            <div class="wd-lo-card-content">
              <div class="wd-lo-card-title">${escapeHtml(title)}</div>
              ${expiryText ? `<div class="wd-lo-card-meta">${expiryText}</div>` : ""}
              <div class="wd-lo-card-meta">رمز: SPECIAL</div>
            </div>
          </div>
        </div>
        <div class="wd-lo-body">${bodyHtml}</div>
      `;
    }

    function buildLimitedOfferPreviewButtonsElement() {
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "wd-preview-buttons wd-preview-limited-buttons";
      buttonsContainer.style.width = "280px";
      buttonsContainer.style.maxWidth = "85%";

      const copyEnabled =
        document.getElementById("limitedOfferEnableCopy")?.checked ?? true;
      const linkText =
        document.getElementById("limitedOfferLinkText")?.value.trim() || "فتح العرض";

      if (copyEnabled) {
        buttonsContainer.innerHTML += `
          <button class="wd-preview-button">
            <i class="fas fa-copy"></i>
            نسخ الكود
          </button>
        `;
      }

      buttonsContainer.innerHTML += `
        <button class="wd-preview-button">
          <i class="fas fa-link"></i>
          ${escapeHtml(linkText)}
        </button>
      `;

      return buttonsContainer;
    }

    const carouselCardsState = {
      activeIndex: 1,
      cards: [],
    };

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function handleCarouselCardsConfigChange() {
      const countEl = document.getElementById("carouselCardsCount");
      if (!countEl) return;
      const count = parseInt(countEl.value, 10) || 1;

      while (carouselCardsState.cards.length < count) {
        carouselCardsState.cards.push({
          content: "",
          mediaFile: null,
          mediaName: "",
          button1: { label: "", value: "" },
          button2: { label: "", value: "" },
        });
      }
      if (carouselCardsState.cards.length > count) {
        carouselCardsState.cards = carouselCardsState.cards.slice(0, count);
      }

      if (carouselCardsState.activeIndex > count) {
        carouselCardsState.activeIndex = count;
      }
      if (carouselCardsState.activeIndex < 1) {
        carouselCardsState.activeIndex = 1;
      }

      renderCarouselCardsUI();
      updateTemplatePreview();
    }

    function renderCarouselCardsUI() {
      const tabsContainer = document.getElementById("carouselCardsTabs");
      const panelsContainer = document.getElementById("carouselCardsPanels");
      const count = parseInt(
        document.getElementById("carouselCardsCount")?.value || "1",
        10
      );
      const headerType =
        document.getElementById("carouselCardsHeaderType")?.value || "image";
      const button1Type =
        document.getElementById("carouselCardsButton1Type")?.value || "none";
      const button2Type =
        document.getElementById("carouselCardsButton2Type")?.value || "none";

      if (!tabsContainer || !panelsContainer) return;

      let tabsHtml = "";
      let panelsHtml = "";

      for (let i = 1; i <= count; i++) {
        const isActive = carouselCardsState.activeIndex === i;
        const card = carouselCardsState.cards[i - 1] || {
          content: "",
          mediaFile: null,
          mediaName: "",
          button1: { label: "", value: "" },
          button2: { label: "", value: "" },
        };

        tabsHtml += `
          <button type="button" data-card-index="${i}" class="wd-carousel-card-tab ${isActive ? "active" : ""}"
            onclick="setCarouselCardTab(${i})">
            بطاقة ${i}
          </button>
        `;

        panelsHtml += `
          <div class="wd-carousel-card-panel" data-card-index="${i}" style="display:${isActive ? "block" : "none"}">
            <div class="wd-form-group">
              <label for="carouselCardMedia_${i}">${headerType === "video" ? "ارفع فيديو البطاقة" : "ارفع صورة البطاقة"
          }</label>
              <input type="file" id="carouselCardMedia_${i}" class="wd-form-control"
                accept="${headerType === "video" ? "video/*" : "image/*"}"
                onchange="updateCarouselCardMedia(${i}, this)" />
              ${card.mediaName
            ? `<div class="wd-char-counter">${escapeHtml(card.mediaName)}</div>`
            : ""
          }
            </div>
            <div class="wd-form-group">
              <label for="carouselCardContent_${i}">محتوى البطاقة ${i}</label>
              <textarea id="carouselCardContent_${i}" class="wd-form-control" rows="4"
                placeholder="أدخل محتوى البطاقة" oninput="updateCarouselCardContent(${i}, this.value)">${escapeHtml(
            card.content
          )}</textarea>
            </div>
            <div class="wd-carousel-card-buttons-row">
              ${getCarouselCardButtonFieldsHtml(i, "button1", "زر 1", button1Type, card.button1)}
              ${getCarouselCardButtonFieldsHtml(i, "button2", "زر 2", button2Type, card.button2)}
            </div>
          </div>
        `;
      }

      tabsContainer.innerHTML = tabsHtml;
      panelsContainer.innerHTML = panelsHtml;
    }

    function getCarouselCardButtonFieldsHtml(
      cardIndex,
      buttonKey,
      buttonTitle,
      buttonType,
      buttonState
    ) {
      if (buttonType === "none") {
        return `
          <div class="wd-form-group">
            <label>${buttonTitle}</label>
            <div class="wd-buttons-info" style="margin-bottom:0;">بدون</div>
          </div>
        `;
      }

      if (buttonType === "quick_reply") {
        return `
          <div class="wd-form-group">
            <label for="carousel_${buttonKey}_label_${cardIndex}">${buttonTitle} - نص الزر</label>
            <input type="text" id="carousel_${buttonKey}_label_${cardIndex}" class="wd-form-control"
              maxlength="25" value="${escapeHtml(buttonState?.label)}"
              oninput="updateCarouselCardButtonField(${cardIndex}, '${buttonKey}', 'label', this.value)" />
          </div>
        `;
      }

      if (buttonType === "phone") {
        return `
          <div class="wd-form-group">
            <label for="carousel_${buttonKey}_label_${cardIndex}">${buttonTitle} - نص الزر</label>
            <input type="text" id="carousel_${buttonKey}_label_${cardIndex}" class="wd-form-control"
              maxlength="25" value="${escapeHtml(buttonState?.label)}"
              oninput="updateCarouselCardButtonField(${cardIndex}, '${buttonKey}', 'label', this.value)" />
            <label for="carousel_${buttonKey}_value_${cardIndex}" style="margin-top:8px;">${buttonTitle} - رقم الهاتف</label>
            <input type="tel" id="carousel_${buttonKey}_value_${cardIndex}" class="wd-form-control"
              value="${escapeHtml(buttonState?.value)}"
              oninput="updateCarouselCardButtonField(${cardIndex}, '${buttonKey}', 'value', this.value)" />
          </div>
        `;
      }

      return `
        <div class="wd-form-group">
          <label for="carousel_${buttonKey}_label_${cardIndex}">${buttonTitle} - نص الزر</label>
          <input type="text" id="carousel_${buttonKey}_label_${cardIndex}" class="wd-form-control"
            maxlength="25" value="${escapeHtml(buttonState?.label)}"
            oninput="updateCarouselCardButtonField(${cardIndex}, '${buttonKey}', 'label', this.value)" />
          <label for="carousel_${buttonKey}_value_${cardIndex}" style="margin-top:8px;">${buttonTitle} - الرابط</label>
          <input type="url" id="carousel_${buttonKey}_value_${cardIndex}" class="wd-form-control"
            value="${escapeHtml(buttonState?.value)}"
            oninput="updateCarouselCardButtonField(${cardIndex}, '${buttonKey}', 'value', this.value)" />
        </div>
      `;
    }

    function setCarouselCardTab(index) {
      carouselCardsState.activeIndex = index;
      const tabs = document.querySelectorAll(".wd-carousel-card-tab");
      const panels = document.querySelectorAll(".wd-carousel-card-panel");

      tabs.forEach((tab) => {
        tab.classList.toggle(
          "active",
          parseInt(tab.getAttribute("data-card-index"), 10) === index
        );
      });

      panels.forEach((panel) => {
        panel.style.display =
          parseInt(panel.getAttribute("data-card-index"), 10) === index
            ? "block"
            : "none";
      });
    }

    function updateCarouselCardContent(index, value) {
      if (!carouselCardsState.cards[index - 1]) return;
      carouselCardsState.cards[index - 1].content = value;
      updateTemplatePreview();
    }

    function updateCarouselCardMedia(index, inputElement) {
      if (!carouselCardsState.cards[index - 1]) return;
      const mediaFile =
        inputElement && inputElement.files && inputElement.files[0]
          ? inputElement.files[0]
          : null;
      carouselCardsState.cards[index - 1].mediaFile = mediaFile;
      carouselCardsState.cards[index - 1].mediaName = mediaFile
        ? mediaFile.name
        : "";
      updateTemplatePreview();
    }

    function updateCarouselCardButtonField(index, buttonKey, field, value) {
      if (!carouselCardsState.cards[index - 1]) return;
      if (!carouselCardsState.cards[index - 1][buttonKey]) {
        carouselCardsState.cards[index - 1][buttonKey] = { label: "", value: "" };
      }
      carouselCardsState.cards[index - 1][buttonKey][field] = value;
      updateTemplatePreview();
    }

    function showCarouselCardsValidationError(message, cardIndex) {
      const carouselError = document.getElementById("carouselCardsError");
      if (carouselError) {
        carouselError.style.display = "block";
        carouselError.textContent = message;
      }
      if (cardIndex) {
        setCarouselCardTab(cardIndex);
      }
    }

    // التحكم في إظهار/إخفاء حقل دقائق الانتهاء
    function toggleExpirationInput() {
      const expirationToggle = document.getElementById(
        "expirationWarningToggle"
      );
      const expirationInputGroup = document.getElementById(
        "expirationInputGroup"
      );

      if (expirationToggle && expirationInputGroup) {
        if (expirationToggle.checked) {
          expirationInputGroup.style.display = "block";
        } else {
          expirationInputGroup.style.display = "none";
        }
        updateTemplatePreview();
      }
    }

    function handleHeaderChange() {
      const headerType = document.getElementById("templateHeader").value;
      const headerFields = document.getElementById("headerFields");
      const headerRequired = document.getElementById("headerRequired");

      // إخفاء جميع حقول الرأس
      document
        .querySelectorAll("#headerFields .wd-form-group")
        .forEach((group) => {
          group.style.display = "none";
        });

      // إخفاء رسائل الخطأ
      document
        .querySelectorAll("#headerFields .wd-error-message")
        .forEach((error) => {
          error.style.display = "none";
        });

      if (headerType !== "none") {
        headerFields.style.display = "block";
        headerRequired.style.display = "inline";
        document.getElementById(
          `header${headerType.charAt(0).toUpperCase() + headerType.slice(1)
          }Group`
        ).style.display = "block";

        if (headerType === "text") {
          const headerText = document.getElementById("headerText");
          headerText.addEventListener("input", function () {
            updateCharCounter(this, "headerTextCounter", 60);
            updateTemplatePreview();
          });
        }
      } else {
        headerFields.style.display = "none";
        headerRequired.style.display = "none";
      }

      updateTemplatePreview();
    }

    let variableCount = 0;
    const MAX_TEMPLATE_VARIABLES = 10;
    const variableTexts = {};
    const variableInputs = new Set();
    const deletedVariables = new Set();

    function validateTemplateVariables(
      contentText,
      options = { checkEdges: true, checkMax: true }
    ) {
      const matches = contentText.match(/{{\d+}}/g) || [];
      const uniqueMatchesCount = new Set(matches).size;

      if (options.checkMax && uniqueMatchesCount > MAX_TEMPLATE_VARIABLES) {
        return {
          isValid: false,
          message: `الحد الأقصى لعدد المتغيرات هو ${MAX_TEMPLATE_VARIABLES}`,
        };
      }

      if (options.checkEdges && contentText && /^{{\d+}}/.test(contentText)) {
        return {
          isValid: false,
          message: "لا يمكن أن تبدأ الرسالة بمتغير",
        };
      }

      if (options.checkEdges && contentText && /{{\d+}}$/.test(contentText)) {
        return {
          isValid: false,
          message: "لا يمكن أن تنتهي الرسالة بمتغير",
        };
      }

      return { isValid: true, message: "" };
    }

    function showTemplateContentVariableError(message) {
      const contentInput = document.getElementById("templateContent");
      const contentError = document.getElementById("templateContentError");
      if (!contentInput || !contentError) return;

      contentInput.classList.add("error");
      contentError.style.display = "block";
      contentError.textContent = message;
    }

    function showVariables() {
      const content = document.getElementById("templateContent");
      if (!content) return;

      const currentMatches = content.value.match(/{{\d+}}/g) || [];
      const currentUniqueCount = new Set(currentMatches).size;
      if (currentUniqueCount >= MAX_TEMPLATE_VARIABLES) {
        showTemplateContentVariableError(
          `الحد الأقصى لعدد المتغيرات هو ${MAX_TEMPLATE_VARIABLES}`
        );
        return;
      }

      let variable;
      let reusedDeletedNumber = null;

      if (deletedVariables.size > 0) {
        reusedDeletedNumber = Math.min(...Array.from(deletedVariables));
        variable = `{{${reusedDeletedNumber}}}`;
      } else {
        variable = `{{${variableCount + 1}}}`;
      }

      const start = content.selectionStart;
      const end = content.selectionEnd;
      const text = content.value;
      const nextContent =
        text.substring(0, start) + variable + text.substring(end);
      const validation = validateTemplateVariables(nextContent, {
        checkEdges: false,
        checkMax: true,
      });

      if (!validation.isValid) {
        showTemplateContentVariableError(validation.message);
        return;
      }

      if (reusedDeletedNumber !== null) {
        deletedVariables.delete(reusedDeletedNumber);
      } else {
        variableCount++;
      }

      content.value = nextContent;
      content.selectionStart = content.selectionEnd = start + variable.length;

      variableInputs.add(variable);
      addVariableInput(variable);
      updateTemplatePreview();
    }

    function addVariableInput(variable) {
      const variablesSection = document.getElementById("variablesSection");
      if (!variablesSection) {
        const section = document.createElement("div");
        section.className = "wd-variables-section";
        section.id = "variablesSection";
        section.innerHTML = `
            <h4>نصوص المتغيرات</h4>
          `;
        const contentSection = document.getElementById("contentSection");
        if (contentSection) {
          contentSection.appendChild(section);
        }
      }

      const inputGroup = document.createElement("div");
      inputGroup.className = "wd-variable-input-group";
      inputGroup.id = `variable-input-${variable}`;
      inputGroup.innerHTML = `
          <span class="wd-variable-label">${variable}</span>
          <input type="text" class="wd-variable-input"
            placeholder="أدخل نص المتغير"
            oninput="handleVariableTextInput('${variable}', this.value)"
            value="${variableTexts[variable] || ""}">
        `;

      document.getElementById("variablesSection").appendChild(inputGroup);
    }

    function handleVariableTextInput(variable, text) {
      variableTexts[variable] = text;
      updateTemplatePreview();
    }

    function checkVariablesInContent() {
      const content = document.getElementById("templateContent").value;
      const currentVariables = new Set();

      const matches = content.match(/{{(\d+)}}/g) || [];
      matches.forEach((match) => currentVariables.add(match));

      variableInputs.forEach((variable) => {
        if (!currentVariables.has(variable)) {
          variableInputs.delete(variable);
          delete variableTexts[variable];

          const number = parseInt(variable.match(/\d+/)[0]);
          deletedVariables.add(number);

          const inputElement = document.getElementById(
            `variable-input-${variable}`
          );
          if (inputElement) {
            inputElement.remove();
          }
        }
      });

      matches.forEach((match) => {
        if (!variableInputs.has(match)) {
          variableInputs.add(match);
          addVariableInput(match);
          const number = parseInt(match.match(/\d+/)[0]);
          deletedVariables.delete(number);
        }
      });

      const variablesSection = document.getElementById("variablesSection");
      if (variablesSection && variableInputs.size === 0) {
        variablesSection.remove();
      }
    }

    function updateButtonFields() {
      const buttonFields = document.getElementById("buttonFields");
      const maxButtons = 10;
      const maxByType = { link: 2, phone: 1, copy: 1 };
      const counts = getButtonTypeCounts();
      const totalCount = buttonFields.children.length;
      const disableByTotal = totalCount >= maxButtons;

      if (totalCount > 0) {
        buttonFields.style.display = "flex";
      } else {
        buttonFields.style.display = "none";
      }

      document.getElementById("addQuickReplyBtn").disabled = disableByTotal;
      document.getElementById("addLinkBtn").disabled =
        disableByTotal || counts.link >= maxByType.link;
      document.getElementById("addPhoneBtn").disabled =
        disableByTotal || counts.phone >= maxByType.phone;
      document.getElementById("addCopyBtn").disabled =
        disableByTotal || counts.copy >= maxByType.copy;

      // تحديث المعاينة فوراً
      updateTemplatePreview();
    }

    function getButtonTypeCounts() {
      const buttonFields = document.getElementById("buttonFields");
      const counts = {
        quickReply: 0,
        link: 0,
        phone: 0,
        copy: 0,
      };

      if (!buttonFields) return counts;

      Array.from(buttonFields.children).forEach((buttonGroup) => {
        const type = buttonGroup.id.split("_")[0];
        if (Object.prototype.hasOwnProperty.call(counts, type)) {
          counts[type]++;
        }
      });

      return counts;
    }

    function updateTemplatePreview() {
      checkVariablesInContent();
      const previewContentEl = document.getElementById("previewContent");
      if (!previewContentEl) return;
      const previewWrap = previewContentEl.closest(".wd-template-preview");
      if (!previewWrap) return;

      const headerType = document.getElementById("templateHeader").value;
      const content = document.getElementById("templateContent");
      const footer = document.getElementById("templateFooter");
      const footerGroup = footer ? footer.closest(".wd-form-group") : null;
      const footerIsVisible = footerGroup
        ? footerGroup.style.display !== "none"
        : true;
      const buttonsSection = document.getElementById("buttonsSection");
      const buttonsSectionVisible = buttonsSection
        ? buttonsSection.style.display !== "none"
        : true;
      const templateName = document.getElementById("templateName").value;
      const templateType = document.getElementById("templateType").value;
      const isLimitedOffer = templateType === "limited-offer";
      const templateLanguage =
        document.getElementById("templateLanguage").value;

      updateCharCounter(content, "templateContentCounter", 1024);
      updateCharCounter(footer, "templateFooterCounter", 60);

      if (templateType !== "authentication" && !isLimitedOffer) {
        const variableValidation = validateTemplateVariables(content.value, {
          checkEdges: false,
          checkMax: true,
        });
        if (!variableValidation.isValid) {
          showTemplateContentVariableError(variableValidation.message);
        } else if (content.value.trim()) {
          const contentError = document.getElementById("templateContentError");
          if (contentError && contentError.textContent !== "الرجاء إدخال محتوى القالب") {
            contentError.style.display = "none";
          }
          content.classList.remove("error");
        }
      }

      // Hide any example buttons when showing real ones (preview-scoped)
      const oldExampleButtons = previewWrap.querySelector(
        ".wd-preview-buttons-example"
      );
      if (oldExampleButtons) {
        oldExampleButtons.remove();
      }
      const oldLimitedButtons = previewWrap.querySelector(".wd-preview-limited-buttons");
      if (oldLimitedButtons) {
        oldLimitedButtons.remove();
      }

      // Remove previous carousel slider preview if it exists
      const oldCarouselSlider = previewWrap.querySelector(".wd-preview-carousel-slider");
      if (oldCarouselSlider) {
        oldCarouselSlider.remove();
      }

      // Remove previous product preview blocks if they exist
      previewWrap
        .querySelectorAll(".wd-preview-product-wrap, .wd-preview-products-slider")
        .forEach((el) => el.remove());

      // Update contact name in WhatsApp header if template name is provided
      if (templateName) {
        document.querySelector(
          ".wd-whatsapp-header .contact-name"
        ).textContent = templateName;
      }

      let previewHTML = "";

      // إخفاء رأس الرسالة في فئة المصادقة
      if (templateType === "authentication") {
        headerPreview.style.display = "none";
      } else if (headerType !== "none") {
        let headerContent = "";
        switch (headerType) {
          case "text":
            headerContent = document.getElementById("headerText").value;
            if (headerContent) {
              previewHTML += `<div class="wd-preview-header-text">${headerContent}</div>`;
            }
            break;
          case "image":
            const imageFile = document.getElementById("headerImage").files[0];
            if (imageFile) {
              const imageUrl = URL.createObjectURL(imageFile);
              previewHTML += `<img src="${imageUrl}" alt="معاينة الصورة" class="wd-preview-image">`;
              headerPreview.style.display = "none";
            } else {
              headerContent =
                '<i class="fas fa-image wd-file-icon"></i><br>لم يتم اختيار صورة';
              headerPreview.innerHTML = headerContent;
              headerPreview.style.display = "block";
            }
            break;
          case "video":
            const videoFile = document.getElementById("headerVideo").files[0];
            if (videoFile) {
              const videoUrl = URL.createObjectURL(videoFile);
              previewHTML += `<video src="${videoUrl}" controls class="wd-preview-image"></video>`;
              headerPreview.style.display = "none";
            } else {
              headerContent =
                '<i class="fas fa-video wd-file-icon"></i><br>لم يتم اختيار فيديو';
              headerPreview.innerHTML = headerContent;
              headerPreview.style.display = "block";
            }
            break;
          case "document":
            const docFile =
              document.getElementById("headerDocument").files[0];
            if (docFile) {
              previewHTML += `<div class="wd-preview-doc"><i class="fas fa-file wd-file-icon"></i><br>${docFile.name}</div>`;
              headerPreview.style.display = "none";
            } else {
              headerContent =
                '<i class="fas fa-file wd-file-icon"></i><br>لم يتم اختيار ملف';
              headerPreview.innerHTML = headerContent;
              headerPreview.style.display = "block";
            }
            break;
          case "location":
            const location = document.getElementById("headerLocation").value;
            if (location) {
              previewHTML += `<div class="wd-preview-location"><i class="fas fa-map-marker-alt wd-location-icon"></i>${location}</div>`;
              headerPreview.style.display = "none";
            } else {
              headerContent =
                '<i class="fas fa-map-marker-alt wd-location-icon"></i>لم يتم تحديد الموقع';
              headerPreview.innerHTML = headerContent;
              headerPreview.style.display = "block";
            }
            break;
        }
      } else {
        headerPreview.style.display = "none";
      }

      // التحقق من نوع القالب
      if (templateType === "limited-offer") {
        previewHTML += buildLimitedOfferPreviewMessageHtml();
      } else if (templateType === "authentication") {
        // معاينة خاصة بفئة المصادقة
        let authContent = "{{1}} هو كود التحقق الخاص بك.";

        // استبدال المتغيرات إذا كانت موجودة
        Object.keys(variableTexts).forEach((variable) => {
          const text = variableTexts[variable] || variable;
          authContent = authContent.replace(
            new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            text
          );
        });

        // إضافة تنويه الأمان إذا كان مفعلاً
        const securityWarningToggle = document.getElementById(
          "securityWarningToggle"
        );
        if (securityWarningToggle && securityWarningToggle.checked) {
          authContent +=
            "<br>للحفاظ على أمانك، لا تشارك هذا الكود مع أي شخص.";
        }

        previewHTML += `<div class="wd-preview-body">${authContent}</div>`;

        // إضافة تحذير الانتهاء كتذييل إذا كان مفعلاً
        const expirationWarningToggle = document.getElementById(
          "expirationWarningToggle"
        );
        if (expirationWarningToggle && expirationWarningToggle.checked) {
          const expirationMinutes =
            document.getElementById("expirationMinutes")?.value || "1";
          const expirationText = `تنتهي صلاحيتها خلال ${expirationMinutes} دقائق.`;
          previewHTML += `<div class="wd-preview-footer">${expirationText}</div>`;
        }
      } else {
        // المعاينة العادية للتسويق وأداة مساعدة
        if (content.value) {
          let formattedContent = content.value;

          Object.keys(variableTexts).forEach((variable) => {
            const text = variableTexts[variable] || variable;
            formattedContent = formattedContent.replace(
              new RegExp(
                variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "g"
              ),
              text
            );
          });

          formattedContent = formattedContent
            .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
            .replace(/_([^_]+)_/g, "<em>$1</em>")
            .replace(/~([^~]+)~/g, "<del>$1</del>")
            .replace(/\n/g, "<br>");

          previewHTML += `<div class="wd-preview-body">${formattedContent}</div>`;
        } else {
          // إضافة مساحة فارغة للمحافظة على الحجم الثابت
          previewHTML += `<div class="wd-preview-body">&nbsp;</div>`;
        }

        if (footerIsVisible && footer.value) {
          let formattedFooter = footer.value;

          Object.keys(variableTexts).forEach((variable) => {
            const text = variableTexts[variable] || variable;
            formattedFooter = formattedFooter.replace(
              new RegExp(
                variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "g"
              ),
              text
            );
          });

          // تذييل الرسالة لا يدعم التنسيق (نص عادي فقط)
          previewHTML += `<div class="wd-preview-footer">${formattedFooter}</div>`;
        }
      }

      // Add timestamp
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      previewHTML += `<div class="wd-preview-timestamp">${hours}:${minutes} <i class="fas fa-check-double" style="color: #34b7f1;"></i></div>`;

      // Update message content
      const messageElement = previewContentEl.querySelector(".wd-preview-message");
      if (!messageElement) return;
      messageElement.innerHTML = previewHTML;
      messageElement.classList.toggle(
        "wd-lo-message",
        templateType === "limited-offer"
      );

      // Set the default message styling
      messageElement.style.borderBottomLeftRadius = "7.5px";
      messageElement.style.borderBottomRightRadius = "7.5px";
      messageElement.style.marginBottom = "15px";

      // Handle buttons separately
      const buttonFields = document.getElementById("buttonFields");
      const buttonsContainer = previewWrap.querySelector(
        ".wd-preview-buttons:not(.wd-preview-buttons-example)"
      );

      // Remove previous buttons container if it exists
      if (buttonsContainer) {
        buttonsContainer.remove();
      }

      // Add buttons if they exist (فقط للتسويق وأداة مساعدة)
      if (
        templateType !== "authentication" &&
        templateType !== "limited-offer" &&
        buttonsSectionVisible &&
        buttonFields &&
        buttonFields.children.length > 0
      ) {
        const newButtonsContainer = document.createElement("div");
        newButtonsContainer.className = "wd-preview-buttons";

        // Set fixed width to match the message width
        newButtonsContainer.style.width = "280px";
        newButtonsContainer.style.maxWidth = "85%";

        Array.from(buttonFields.children).forEach((buttonGroup) => {
          const type = buttonGroup.id.split("_")[0];
          let buttonHTML = "";

          switch (type) {
            case "phone":
              const phoneText = document.getElementById(
                `phoneButtonText_${buttonGroup.id}`
              ).value;
              const phoneNumber = document.getElementById(
                `phoneNumber_${buttonGroup.id}`
              ).value;
              if (phoneText || phoneNumber) {
                // Show button even if only one field is filled
                buttonHTML = `
                    <button class="wd-preview-button">
                      <i class="fas fa-phone"></i>
                      ${phoneText || "اتصال"}
                    </button>
                  `;
              }
              break;

            case "link":
              const linkText = document.getElementById(
                `linkButtonText_${buttonGroup.id}`
              ).value;
              const linkUrl = document.getElementById(
                `linkUrl_${buttonGroup.id}`
              ).value;
              if (linkText || linkUrl) {
                // Show button even if only one field is filled
                buttonHTML = `
                    <button class="wd-preview-button">
                      <i class="fas fa-link"></i>
                      ${linkText || "رابط"}
                    </button>
                  `;
              }
              break;

            case "copy":
              const copyText = document.getElementById(
                `copyButtonText_${buttonGroup.id}`
              ).value;
              const copyCode = document.getElementById(
                `copyCode_${buttonGroup.id}`
              ).value;
              if (copyText || copyCode) {
                // Show button even if only one field is filled
                buttonHTML = `
                    <button class="wd-preview-button">
                      <i class="fas fa-copy"></i>
                      ${copyText || "نسخ"}
                    </button>
                  `;
              }
              break;

            case "quickReply":
              const quickReplyText = document.getElementById(
                `quickReplyButtonText_${buttonGroup.id}`
              ).value;
              if (quickReplyText) {
                // Show button even if only one field is filled
                buttonHTML = `
                    <button class="wd-preview-button">
                      <i class="fas fa-reply"></i>
                      ${quickReplyText || "رد سريع"}
                    </button>
                  `;
              }
              break;
          }

          if (buttonHTML) {
            newButtonsContainer.innerHTML += buttonHTML;
          }
        });

        if (newButtonsContainer.innerHTML) {
          // أضف الأزرار مباشرة بعد الرسالة
          messageElement.after(newButtonsContainer);

          // تعديل شكل الرسالة إذا كان هناك أزرار
          messageElement.style.borderBottomLeftRadius = "0";
          messageElement.style.borderBottomRightRadius = "0";
          messageElement.style.marginBottom = "0";
        }
      }

      if (templateType === "limited-offer") {
        const limitedButtons = buildLimitedOfferPreviewButtonsElement();
        messageElement.after(limitedButtons);
        messageElement.style.borderBottomLeftRadius = "0";
        messageElement.style.borderBottomRightRadius = "0";
        messageElement.style.marginBottom = "0";
      }

      if (templateType === "carousel") {
        const carouselSlider = renderCarouselCardsPreviewSlider();
        if (carouselSlider) {
          messageElement.after(carouselSlider);
        }
      }

      if (
        templateType === "single-product" ||
        templateType === "multiple-products" ||
        templateType === "product-card-slider"
      ) {
        const productPreview = renderProductTemplatePreviewByType(templateType);
        if (productPreview) {
          messageElement.before(productPreview);
        }
      }
    }

    function renderCarouselCardsPreviewSlider() {
      const count = parseInt(
        document.getElementById("carouselCardsCount")?.value || "1",
        10
      );
      const headerType =
        document.getElementById("carouselCardsHeaderType")?.value || "image";
      const button1Type =
        document.getElementById("carouselCardsButton1Type")?.value || "none";
      const button2Type =
        document.getElementById("carouselCardsButton2Type")?.value || "none";

      const slider = document.createElement("div");
      slider.className = "wd-preview-carousel-slider";

      for (let i = 1; i <= count; i++) {
        const card = carouselCardsState.cards[i - 1] || {
          content: "",
          mediaFile: null,
          mediaName: "",
          button1: { label: "", value: "" },
          button2: { label: "", value: "" },
        };
        const mediaFile = card.mediaFile || null;
        const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : "";

        const cardEl = document.createElement("div");
        cardEl.className = "wd-preview-carousel-card";

        let mediaHtml = "";
        if (headerType === "video") {
          mediaHtml = mediaUrl
            ? `<video class="wd-preview-carousel-media" src="${mediaUrl}" controls></video>`
            : `<div class="wd-preview-carousel-media"></div>`;
        } else {
          mediaHtml = mediaUrl
            ? `<img class="wd-preview-carousel-media" src="${mediaUrl}" alt="Card ${i}" />`
            : `<div class="wd-preview-carousel-media"></div>`;
        }

        const cardBody = card.content
          ? escapeHtml(card.content).replace(/\n/g, "<br>")
          : "";

        const actions = [];
        const b1 = getCarouselPreviewButtonLabel(button1Type, card.button1, 1);
        const b2 = getCarouselPreviewButtonLabel(button2Type, card.button2, 2);
        if (b1) actions.push(b1);
        if (b2) actions.push(b2);

        const actionsHtml = actions.length
          ? `<div class="wd-preview-carousel-actions">${actions
            .map((label) => `<button class="wd-preview-carousel-action">${escapeHtml(label)}</button>`)
            .join("")}</div>`
          : "";

        cardEl.innerHTML = `
          ${mediaHtml}
          <div class="wd-preview-carousel-body">${cardBody}</div>
          ${actionsHtml}
        `;
        slider.appendChild(cardEl);
      }

      return slider;
    }

    function getCarouselPreviewButtonLabel(buttonType, buttonData, index) {
      if (buttonType === "none") return "";
      if (buttonType === "quick_reply") return buttonData?.label || "";
      if (buttonType === "phone") return buttonData?.label || "";
      if (buttonType === "link") return buttonData?.label || "";
      return "";
    }

    function renderProductTemplatePreviewByType(templateType) {
      if (templateType === "product-card-slider") {
        const slider = document.createElement("div");
        slider.className = "wd-preview-products-slider";

        for (let i = 1; i <= 5; i++) {
          const card = document.createElement("div");
          card.className = "wd-preview-product-card";
          card.innerHTML = `
            <div class="wd-preview-product-image">
              <i class="fas fa-image"></i>
              <span>بدون صورة</span>
            </div>
            <div class="wd-preview-product-info">
              <div class="wd-preview-product-name">اسم المنتج ${i}</div>
              <div class="wd-preview-product-price">السعر</div>
            </div>
            <button class="wd-preview-product-action">عرض</button>
          `;
          slider.appendChild(card);
        }

        return slider;
      }

      const wrap = document.createElement("div");
      wrap.className = "wd-preview-product-wrap";
      const actionText =
        templateType === "multiple-products" ? "عرض العناصر" : "عرض";

      wrap.innerHTML = `
        <div class="wd-preview-product-card">
          <div class="wd-preview-product-image">
            <i class="fas fa-image"></i>
            <span>بدون صورة</span>
          </div>
          <div class="wd-preview-product-info">
            <div class="wd-preview-product-name">اسم المنتج</div>
            <div class="wd-preview-product-price">السعر</div>
          </div>
          <button class="wd-preview-product-action">${actionText}</button>
        </div>
      `;

      return wrap;
    }

    function formatText(type) {
      const content = document.getElementById("templateContent");
      const start = content.selectionStart;
      const end = content.selectionEnd;
      const text = content.value;
      let newText = "";

      switch (type) {
        case "emoji":
          newText = text.substring(0, start) + "😊" + text.substring(end);
          break;
        case "bold":
          newText =
            text.substring(0, start) +
            "*" +
            text.substring(start, end) +
            "*" +
            text.substring(end);
          break;
        case "italic":
          newText =
            text.substring(0, start) +
            "_" +
            text.substring(start, end) +
            "_" +
            text.substring(end);
          break;
        case "strikethrough":
          newText =
            text.substring(0, start) +
            "~" +
            text.substring(start, end) +
            "~" +
            text.substring(end);
          break;
        case "spacing":
          newText =
            text.substring(0, start) +
            "  " +
            text.substring(start, end) +
            "  " +
            text.substring(end);
          break;
      }

      content.value = newText;
      updateTemplatePreview();
    }

    function validateTemplateFormFields() {
      const name = document.getElementById("templateName").value;
      const type = document.getElementById("templateType").value;
      const language = document.getElementById("templateLanguage").value;
      const content = document.getElementById("templateContent").value;
      const headerType = document.getElementById("templateHeader").value;

      // إخفاء جميع رسائل الخطأ وإزالة class error من جميع الحقول
      document
        .querySelectorAll(".wd-error-message")
        .forEach((el) => (el.style.display = "none"));
      document
        .querySelectorAll(".wd-form-control")
        .forEach((el) => el.classList.remove("error"));

      let isValid = true;

      if (!name) {
        const nameInput = document.getElementById("templateName");
        const nameError = document.getElementById("templateNameError");
        nameInput.classList.add("error");
        nameError.style.display = "block";
        nameError.textContent = "الرجاء إدخال اسم القالب";
        isValid = false;
      } else {
        document.getElementById("templateName").classList.remove("error");
      }

      if (!type) {
        const typeInput = document.getElementById("templateType");
        const typeError = document.getElementById("templateTypeError");
        typeInput.classList.add("error");
        typeError.style.display = "block";
        typeError.textContent = "الرجاء اختيار نوع القالب";
        isValid = false;
      } else {
        document.getElementById("templateType").classList.remove("error");
      }

      if (!language) {
        const languageInput = document.getElementById("templateLanguage");
        const languageError = document.getElementById(
          "templateLanguageError"
        );
        languageInput.classList.add("error");
        languageError.style.display = "block";
        languageError.textContent = "الرجاء اختيار لغة القالب";
        isValid = false;
      } else {
        document.getElementById("templateLanguage").classList.remove("error");
      }

      // التحقق من رأس الرسالة (فقط للتسويق وأداة مساعدة)
      if (type !== "authentication" && headerType !== "none") {
        let headerValid = false;
        let headerErrorId = "";
        let headerInputId = "";

        switch (headerType) {
          case "text":
            const headerText = document.getElementById("headerText").value;
            headerInputId = "headerText";
            if (!headerText || headerText.trim() === "") {
              headerErrorId = "headerTextError";
              isValid = false;
            } else {
              headerValid = true;
            }
            break;
          case "image":
            const headerImage =
              document.getElementById("headerImage").files[0];
            headerInputId = "headerImage";
            if (!headerImage) {
              headerErrorId = "headerImageError";
              isValid = false;
            } else {
              headerValid = true;
            }
            break;
          case "video":
            const headerVideo =
              document.getElementById("headerVideo").files[0];
            headerInputId = "headerVideo";
            if (!headerVideo) {
              headerErrorId = "headerVideoError";
              isValid = false;
            } else {
              headerValid = true;
            }
            break;
          case "document":
            const headerDocument =
              document.getElementById("headerDocument").files[0];
            headerInputId = "headerDocument";
            if (!headerDocument) {
              headerErrorId = "headerDocumentError";
              isValid = false;
            } else {
              headerValid = true;
            }
            break;
          case "location":
            const headerLocation =
              document.getElementById("headerLocation").value;
            headerInputId = "headerLocation";
            if (!headerLocation || headerLocation.trim() === "") {
              headerErrorId = "headerLocationError";
              isValid = false;
            } else {
              headerValid = true;
            }
            break;
        }

        if (!headerValid && headerErrorId && headerInputId) {
          const headerInput = document.getElementById(headerInputId);
          const headerError = document.getElementById(headerErrorId);
          headerInput.classList.add("error");
          headerError.style.display = "block";
          headerError.textContent =
            "الرجاء إدخال " +
            (headerType === "text"
              ? "نص الرأس"
              : headerType === "image"
                ? "صورة الرأس"
                : headerType === "video"
                  ? "فيديو الرأس"
                  : headerType === "document"
                    ? "ملف الرأس"
                    : "موقع الرأس");
        } else if (headerValid && headerInputId) {
          document.getElementById(headerInputId).classList.remove("error");
        }
      }

      // التحقق من محتوى القالب (فقط للتسويق وأداة مساعدة)
      if (type !== "authentication" && type !== "limited-offer" && !content) {
        const contentInput = document.getElementById("templateContent");
        const contentError = document.getElementById("templateContentError");
        contentInput.classList.add("error");
        contentError.style.display = "block";
        contentError.textContent = "الرجاء إدخال محتوى القالب";
        isValid = false;
      } else if (type !== "authentication" && type !== "limited-offer") {
        document.getElementById("templateContent").classList.remove("error");
      }

      if (type !== "authentication" && type !== "limited-offer" && content) {
        const variableValidation = validateTemplateVariables(content, {
          checkEdges: true,
          checkMax: true,
        });
        if (!variableValidation.isValid) {
          showTemplateContentVariableError(variableValidation.message);
          isValid = false;
        }
      }

      if (type === "limited-offer") {
        const titleInput = document.getElementById("limitedOfferTitle");
        const bodyInput = document.getElementById("limitedOfferBody");
        const linkTextInput = document.getElementById("limitedOfferLinkText");
        const linkUrlInput = document.getElementById("limitedOfferLinkUrl");

        if (!titleInput.value.trim()) {
          titleInput.classList.add("error");
          const error = document.getElementById("limitedOfferTitleError");
          error.style.display = "block";
          error.textContent = "الرجاء إدخال عنوان البطاقة";
          isValid = false;
        }

        if (!bodyInput.value.trim()) {
          bodyInput.classList.add("error");
          const error = document.getElementById("limitedOfferBodyError");
          error.style.display = "block";
          error.textContent = "الرجاء إدخال جسم البطاقة";
          isValid = false;
        }

        if (!linkTextInput.value.trim()) {
          linkTextInput.classList.add("error");
          const error = document.getElementById("limitedOfferLinkTextError");
          error.style.display = "block";
          error.textContent = "الرجاء إدخال نص زر الرابط";
          isValid = false;
        }

        if (!linkUrlInput.value.trim()) {
          linkUrlInput.classList.add("error");
          const error = document.getElementById("limitedOfferLinkUrlError");
          error.style.display = "block";
          error.textContent = "الرجاء إدخال رابط الزر";
          isValid = false;
        }

        // لا يوجد حقل تاريخ يدوي في هذا النوع
      }

      if (type === "carousel") {
        const carouselError = document.getElementById("carouselCardsError");
        if (carouselError) {
          carouselError.style.display = "none";
          carouselError.textContent = "";
        }

        const cardsCount = parseInt(
          document.getElementById("carouselCardsCount")?.value || "1",
          10
        );
        const button1Type =
          document.getElementById("carouselCardsButton1Type")?.value || "none";
        const button2Type =
          document.getElementById("carouselCardsButton2Type")?.value || "none";

        for (let i = 1; i <= cardsCount; i++) {
          const currentCard = carouselCardsState.cards[i - 1] || {};
          const cardContentInput = document.getElementById(`carouselCardContent_${i}`);

          if (!currentCard.mediaFile) {
            showCarouselCardsValidationError(`الرجاء رفع صورة/فيديو للبطاقة رقم ${i}`, i);
            isValid = false;
            break;
          }

          if (!cardContentInput || !cardContentInput.value.trim()) {
            showCarouselCardsValidationError(`محتوى البطاقة رقم ${i} مطلوب`, i);
            isValid = false;
            break;
          }

          if (button1Type !== "none") {
            const b1Label = document.getElementById(`carousel_button1_label_${i}`);
            if (!b1Label || !b1Label.value.trim()) {
              showCarouselCardsValidationError(`نص زر 1 في البطاقة رقم ${i} مطلوب`, i);
              isValid = false;
              break;
            }

            if (button1Type === "phone" || button1Type === "link") {
              const b1Value = document.getElementById(`carousel_button1_value_${i}`);
              if (!b1Value || !b1Value.value.trim()) {
                showCarouselCardsValidationError(
                  `${button1Type === "phone" ? "رقم هاتف" : "رابط"} زر 1 في البطاقة رقم ${i} مطلوب`,
                  i
                );
                isValid = false;
                break;
              }
            }
          }

          if (button2Type !== "none") {
            const b2Label = document.getElementById(`carousel_button2_label_${i}`);
            if (!b2Label || !b2Label.value.trim()) {
              showCarouselCardsValidationError(`نص زر 2 في البطاقة رقم ${i} مطلوب`, i);
              isValid = false;
              break;
            }

            if (button2Type === "phone" || button2Type === "link") {
              const b2Value = document.getElementById(`carousel_button2_value_${i}`);
              if (!b2Value || !b2Value.value.trim()) {
                showCarouselCardsValidationError(
                  `${button2Type === "phone" ? "رقم هاتف" : "رابط"} زر 2 في البطاقة رقم ${i} مطلوب`,
                  i
                );
                isValid = false;
                break;
              }
            }
          }
        }
      }

      // جمع بيانات المصادقة إذا كان النوع مصادقة
      if (type === "authentication") {
        const securityWarning = document.getElementById(
          "securityWarningToggle"
        ).checked;
        const expirationWarning = document.getElementById(
          "expirationWarningToggle"
        ).checked;
        const expirationMinutes =
          document.getElementById("expirationMinutes").value;

        console.log("Security Warning:", securityWarning);
        console.log("Expiration Warning:", expirationWarning);
        if (expirationWarning) {
          console.log("Expiration Minutes:", expirationMinutes);
        }
      }

      return isValid;
    }

    function createTemplate() {
      if (!validateTemplateFormFields()) return;
      alert("تم إنشاء القالب بنجاح");
      window.location.href =
        window.QS_QUICK_SETUP ? "contents.html" : "../contents.html";
    }

    window.WD_validateTemplateFormFields = validateTemplateFormFields;

    function validateTemplateName(input) {
      const value = input.value;
      const errorElement = document.getElementById("templateNameError");
      updateCharCounter(input, "templateNameCounter", 512);

      if (!/^[A-Za-z_]+$/.test(value)) {
        errorElement.style.display = "block";
        errorElement.textContent =
          "يجب أن يحتوي اسم القالب على أحرف إنجليزية و _ فقط";
        input.value = value.replace(/[^A-Za-z_]/g, "");
      } else {
        errorElement.style.display = "none";
      }

      updateTemplatePreview();
    }

    function validateFooterInput(input) {
      const value = input.value;
      const errorElement = document.getElementById("templateFooterError");
      updateCharCounter(input, "templateFooterCounter", 60);

      // السماح فقط بالأحرف (عربية وإنجليزية) والأرقام والمسافات
      const allowedPattern = /^[A-Za-z0-9\u0600-\u06FF\s]*$/;

      if (!allowedPattern.test(value)) {
        // إزالة الأحرف غير المسموحة
        const cleanedValue = value.replace(
          /[^A-Za-z0-9\u0600-\u06FF\s]/g,
          ""
        );
        input.value = cleanedValue;

        // إظهار رسالة خطأ مؤقتة
        errorElement.style.display = "block";
        errorElement.textContent = "يُسمح فقط بالأحرف والأرقام";
        input.classList.add("error");

        // إخفاء رسالة الخطأ بعد 3 ثوان
        setTimeout(() => {
          errorElement.style.display = "none";
          input.classList.remove("error");
        }, 3000);
      } else {
        errorElement.style.display = "none";
        input.classList.remove("error");
      }

      updateTemplatePreview();
    }

    function updateCharCounter(input, counterId, maxLength) {
      const count = input.value.length;
      const counter = document.getElementById(counterId);
      counter.textContent = `${count}/${maxLength}`;
      if (count > maxLength) {
        counter.classList.add("error");
      } else {
        counter.classList.remove("error");
      }
    }

    document.addEventListener("DOMContentLoaded", function () {
      const content = document.getElementById("templateContent");
      const footer = document.getElementById("templateFooter");
      const name = document.getElementById("templateName");
      const type = document.getElementById("templateType");
      const language = document.getElementById("templateLanguage");
      const headerText = document.getElementById("headerText");
      const headerLocation = document.getElementById("headerLocation");
      const limitedOfferTitle = document.getElementById("limitedOfferTitle");
      const limitedOfferBody = document.getElementById("limitedOfferBody");
      const limitedOfferLinkText = document.getElementById("limitedOfferLinkText");
      const limitedOfferLinkUrl = document.getElementById("limitedOfferLinkUrl");

      // إزالة class error عند إدخال البيانات
      if (name) {
        name.addEventListener("input", function () {
          this.classList.remove("error");
          document.getElementById("templateNameError").style.display = "none";
        });
      }

      if (type) {
        type.addEventListener("change", function () {
          this.classList.remove("error");
          document.getElementById("templateTypeError").style.display = "none";
          handleTemplateTypeChange();
        });
        // التحقق من الحالة الأولية
        handleTemplateTypeChange();
      }

      if (language) {
        language.addEventListener("change", function () {
          this.classList.remove("error");
          document.getElementById("templateLanguageError").style.display =
            "none";
        });
      }

      if (content) {
        content.addEventListener("input", function () {
          updateCharCounter(this, "templateContentCounter", 1024);
          this.classList.remove("error");
          document.getElementById("templateContentError").style.display =
            "none";
          checkVariablesInContent();
        });
      }

      if (headerText) {
        headerText.addEventListener("input", function () {
          this.classList.remove("error");
          document.getElementById("headerTextError").style.display = "none";
        });
      }

      if (headerLocation) {
        headerLocation.addEventListener("input", function () {
          this.classList.remove("error");
          document.getElementById("headerLocationError").style.display =
            "none";
        });
      }

      if (limitedOfferTitle) {
        limitedOfferTitle.addEventListener("input", function () {
          this.classList.remove("error");
          document.getElementById("limitedOfferTitleError").style.display = "none";
        });
      }

      if (limitedOfferBody) {
        limitedOfferBody.addEventListener("input", function () {
          this.classList.remove("error");
          document.getElementById("limitedOfferBodyError").style.display = "none";
        });
      }

      if (limitedOfferLinkText) {
        limitedOfferLinkText.addEventListener("input", function () {
          this.classList.remove("error");
          document.getElementById("limitedOfferLinkTextError").style.display = "none";
        });
      }

      if (limitedOfferLinkUrl) {
        limitedOfferLinkUrl.addEventListener("input", function () {
          this.classList.remove("error");
          document.getElementById("limitedOfferLinkUrlError").style.display = "none";
        });
      }


      // إزالة class error عند اختيار ملف
      const headerImage = document.getElementById("headerImage");
      const headerVideo = document.getElementById("headerVideo");
      const headerDocument = document.getElementById("headerDocument");

      if (headerImage) {
        headerImage.addEventListener("change", function () {
          this.classList.remove("error");
          document.getElementById("headerImageError").style.display = "none";
        });
      }

      if (headerVideo) {
        headerVideo.addEventListener("change", function () {
          this.classList.remove("error");
          document.getElementById("headerVideoError").style.display = "none";
        });
      }

      if (headerDocument) {
        headerDocument.addEventListener("change", function () {
          this.classList.remove("error");
          document.getElementById("headerDocumentError").style.display =
            "none";
        });
      }

      if (footer) {
        footer.addEventListener("input", function () {
          validateFooterInput(this);
        });
      }

      // إضافة مثال للأزرار عند تحميل الصفحة ليظهر الحجم الثابت
      showButtonsExample();

      // تهيئة صندوق اختيار الفئة من أعلى الصفحة
      switchTemplateCategoryTab("marketing");

      updateTemplatePreview();
    });

    // وظيفة لإظهار مثال للأزرار عند تحميل الصفحة
    function showButtonsExample() {
      // التحقق من نوع القالب - لا تظهر الأزرار في المصادقة
      const templateType = document.getElementById("templateType")?.value;
      if (templateType === "authentication") {
        return; // لا تظهر مثال الأزرار في المصادقة
      }

      // إضافة مثال مؤقت للأزرار ليظهر الحجم الثابت
      const previewContent = document.getElementById("previewContent");
      const messageElement = document.querySelector(".wd-preview-message");
      if (!messageElement) return;

      // إزالة أي مثال سابق
      const oldExampleButtons = document.querySelector(
        ".wd-preview-buttons-example"
      );
      if (oldExampleButtons) {
        oldExampleButtons.remove();
      }

      // إنشاء حاوية أزرار مؤقتة
      const exampleButtons = document.createElement("div");
      exampleButtons.className =
        "wd-preview-buttons wd-preview-buttons-example";

      // Set fixed width to match the message width
      exampleButtons.style.width = "280px";
      exampleButtons.style.maxWidth = "85%";

      // إضافة محتوى الأزرار المؤقتة
      exampleButtons.innerHTML = `
          <button class="wd-preview-button">
            <i class="fas fa-reply"></i>
            رد سريع
          </button>
          <button class="wd-preview-button">
            <i class="fas fa-link"></i>
            فتح الرابط
          </button>
          <button class="wd-preview-button">
            <i class="fas fa-phone"></i>
            اتصل بنا
          </button>
        `;

      // إضافة الأزرار بعد الرسالة
      messageElement.after(exampleButtons);

      // تعديل شكل الرسالة
      messageElement.style.borderBottomLeftRadius = "0";
      messageElement.style.borderBottomRightRadius = "0";
      messageElement.style.marginBottom = "0";
    }

    function getLanguageName(code) {
      const languageSelect = document.getElementById("templateLanguage");
      if (!languageSelect) return "";
      const option = languageSelect.querySelector(`option[value="${code}"]`);
      return option ? option.textContent : "";
    }

    function getTemplateTypeName(type) {
      const types = {
        marketing: "تسويق",
        utility: "أداة مساعدة",
        authentication: "المصادقة",
        carousel: "سلايدر",
        "product-card-slider": "سلايدر بطاقة منتجات",
        "single-product": "منتج واحد",
        "multiple-products": "منتجات متعددة",
        "limited-offer": "عرض لفترة محدودة",
      };
      return types[type] || "فئة القالب";
    }

    let buttonCount = 0;

    function addQuickReplyButton() {
      buttonCount++;
      const id = `quickReply_${buttonCount}`;
      const buttonFields = document.getElementById("buttonFields");

      const buttonGroup = document.createElement("div");
      buttonGroup.className = "wd-button-group";
      buttonGroup.id = id;
      buttonGroup.draggable = true;

      buttonGroup.innerHTML = `
          <div class="wd-button-header">
            <div class="wd-button-title">
              <i class="fas fa-reply"></i>
              رد سريع
            </div>
            <div class="wd-button-actions">
              <button type="button" class="wd-button-action delete" onclick="removeButton('${id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="wd-form-row">
            <div class="wd-form-col button-text">
              <label for="quickReplyButtonText_${id}">نص الزر <span class="wd-required">*</span></label>
              <input type="text" id="quickReplyButtonText_${id}" class="wd-form-control"
                placeholder="نص يظهر على الزر" maxlength="25" oninput="updateTemplatePreview()">
              <div class="wd-char-counter" id="quickReplyButtonTextCounter_${id}">0/25</div>
            </div>
          </div>
        `;

      buttonFields.appendChild(buttonGroup);
      setupDragAndDrop(buttonGroup);

      const buttonTextInput = document.getElementById(
        `quickReplyButtonText_${id}`
      );
      buttonTextInput.addEventListener("input", function () {
        updateCharCounter(this, `quickReplyButtonTextCounter_${id}`, 25);
        updateTemplatePreview();
      });

      updateButtonFields();
    }

    function addLinkButton() {
      const buttonFields = document.getElementById("buttonFields");
      const counts = getButtonTypeCounts();
      if (counts.link >= 2 || buttonFields.children.length >= 10) {
        updateButtonFields();
        return;
      }

      buttonCount++;
      const id = `link_${buttonCount}`;

      const buttonGroup = document.createElement("div");
      buttonGroup.className = "wd-button-group";
      buttonGroup.id = id;
      buttonGroup.draggable = true;

      buttonGroup.innerHTML = `
          <div class="wd-button-header">
            <div class="wd-button-title">
              <i class="fas fa-link"></i>
              رابط
            </div>
            <div class="wd-button-actions">
              <button type="button" class="wd-button-action delete" onclick="removeButton('${id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="wd-form-row">
            <div class="wd-form-col button-text">
              <label for="linkButtonText_${id}">نص الزر <span class="wd-required">*</span></label>
              <input type="text" id="linkButtonText_${id}" class="wd-form-control"
                placeholder="نص يظهر على الزر" maxlength="25" oninput="updateTemplatePreview()">
              <div class="wd-char-counter" id="linkButtonTextCounter_${id}">0/25</div>
            </div>
            <div class="wd-form-col button-value">
              <label for="linkUrl_${id}">الرابط <span class="wd-required">*</span></label>
              <input type="url" id="linkUrl_${id}" class="wd-form-control"
                placeholder="أدخل الرابط بتنسيق https://example.com" oninput="updateTemplatePreview()">
            </div>
          </div>
        `;

      buttonFields.appendChild(buttonGroup);
      setupDragAndDrop(buttonGroup);

      const buttonTextInput = document.getElementById(`linkButtonText_${id}`);
      buttonTextInput.addEventListener("input", function () {
        updateCharCounter(this, `linkButtonTextCounter_${id}`, 25);
        updateTemplatePreview();
      });

      updateButtonFields();
    }

    function addPhoneButton() {
      const buttonFields = document.getElementById("buttonFields");
      const counts = getButtonTypeCounts();
      if (counts.phone >= 1 || buttonFields.children.length >= 10) {
        updateButtonFields();
        return;
      }

      buttonCount++;
      const id = `phone_${buttonCount}`;

      const buttonGroup = document.createElement("div");
      buttonGroup.className = "wd-button-group";
      buttonGroup.id = id;
      buttonGroup.draggable = true;

      buttonGroup.innerHTML = `
          <div class="wd-button-header">
            <div class="wd-button-title">
              <i class="fas fa-phone"></i>
              اتصال
            </div>
            <div class="wd-button-actions">
              <button type="button" class="wd-button-action delete" onclick="removeButton('${id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="wd-form-row">
            <div class="wd-form-col button-text">
              <label for="phoneButtonText_${id}">نص الزر <span class="wd-required">*</span></label>
              <input type="text" id="phoneButtonText_${id}" class="wd-form-control"
                placeholder="نص يظهر على الزر" maxlength="25" oninput="updateTemplatePreview()">
              <div class="wd-char-counter" id="phoneButtonTextCounter_${id}">0/25</div>
            </div>
            <div class="wd-form-col button-value">
              <label for="phoneNumber_${id}">رقم الهاتف <span class="wd-required">*</span></label>
              <input type="tel" id="phoneNumber_${id}" class="wd-form-control"
                placeholder="أدخل رقم الهاتف بتنسيق +123456789" oninput="updateTemplatePreview()">
            </div>
          </div>
        `;

      buttonFields.appendChild(buttonGroup);
      setupDragAndDrop(buttonGroup);

      const buttonTextInput = document.getElementById(
        `phoneButtonText_${id}`
      );
      buttonTextInput.addEventListener("input", function () {
        updateCharCounter(this, `phoneButtonTextCounter_${id}`, 25);
        updateTemplatePreview();
      });

      updateButtonFields();
    }

    function addCopyButton() {
      const buttonFields = document.getElementById("buttonFields");
      const counts = getButtonTypeCounts();
      if (counts.copy >= 1 || buttonFields.children.length >= 10) {
        updateButtonFields();
        return;
      }

      buttonCount++;
      const id = `copy_${buttonCount}`;

      const buttonGroup = document.createElement("div");
      buttonGroup.className = "wd-button-group";
      buttonGroup.id = id;
      buttonGroup.draggable = true;

      buttonGroup.innerHTML = `
          <div class="wd-button-header">
            <div class="wd-button-title">
              <i class="fas fa-copy"></i>
              نسخ رمز
            </div>
            <div class="wd-button-actions">
              <button type="button" class="wd-button-action delete" onclick="removeButton('${id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="wd-form-row">
            <div class="wd-form-col button-text">
              <label for="copyButtonText_${id}">نص الزر <span class="wd-required">*</span></label>
              <input type="text" id="copyButtonText_${id}" class="wd-form-control"
                placeholder="نص يظهر على الزر" maxlength="25" oninput="updateTemplatePreview()">
              <div class="wd-char-counter" id="copyButtonTextCounter_${id}">0/25</div>
            </div>
            <div class="wd-form-col button-value">
              <label for="copyCode_${id}">رمز العرض <span class="wd-required">*</span></label>
              <input type="text" id="copyCode_${id}" class="wd-form-control"
                placeholder="النص الذي سيتم نسخه عند النقر على الزر" oninput="updateTemplatePreview()">
            </div>
          </div>
        `;

      buttonFields.appendChild(buttonGroup);
      setupDragAndDrop(buttonGroup);

      const buttonTextInput = document.getElementById(`copyButtonText_${id}`);
      buttonTextInput.addEventListener("input", function () {
        updateCharCounter(this, `copyButtonTextCounter_${id}`, 25);
        updateTemplatePreview();
      });

      updateButtonFields();
    }

    function removeButton(id) {
      const buttonElement = document.getElementById(id);
      if (buttonElement) {
        buttonElement.remove();
        updateButtonFields();
      }
    }

    function setupDragAndDrop(element) {
      element.addEventListener("dragstart", handleDragStart);
      element.addEventListener("dragover", handleDragOver);
      element.addEventListener("dragenter", handleDragEnter);
      element.addEventListener("dragleave", handleDragLeave);
      element.addEventListener("drop", handleDrop);
      element.addEventListener("dragend", handleDragEnd);
    }

    let draggedElement = null;

    function handleDragStart(e) {
      this.classList.add("dragging");
      draggedElement = this;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", this.outerHTML);
    }

    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.dataTransfer.dropEffect = "move";
      return false;
    }

    function handleDragEnter(e) {
      this.classList.add("dragover");
    }

    function handleDragLeave(e) {
      this.classList.remove("dragover");
    }

    function handleDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }

      if (draggedElement !== this) {
        const container = document.getElementById("buttonFields");
        const children = Array.from(container.children);
        const draggedIndex = children.indexOf(draggedElement);
        const targetIndex = children.indexOf(this);

        if (draggedIndex < targetIndex) {
          container.insertBefore(draggedElement, this.nextSibling);
        } else {
          container.insertBefore(draggedElement, this);
        }

        updateTemplatePreview();
      }

      this.classList.remove("dragover");
      return false;
    }

    function handleDragEnd(e) {
      this.classList.remove("dragging");
      document.querySelectorAll(".wd-button-group").forEach(function (item) {
        item.classList.remove("dragover");
      });
    }
