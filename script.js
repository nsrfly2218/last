// Inject Tags column into Contacts table (runs only on contacts page)
document.addEventListener("DOMContentLoaded", function () {
  var contactsTable = document.querySelector(".wd-contacts-table");
  if (!contactsTable) return;

  var headerRow = contactsTable.querySelector(".wd-table-header .wd-table-row");
  var bodyRows = contactsTable.querySelectorAll(".wd-table-body .wd-table-row");
  if (!headerRow || !bodyRows.length) return;

  // Mark header cells for fit-content behavior
  Array.prototype.forEach.call(headerRow.children, function (cell) {
    if (!cell || !cell.textContent) return;
    var text = cell.textContent.trim();
    if (text === "الإجراءات") cell.classList.add("wd-cell-actions");
    if (text === "الحالة") cell.classList.add("wd-cell-status");
    if (text === "المجموعة") cell.classList.add("wd-cell-group");
    if (text === "الوسوم") cell.classList.add("wd-cell-tags");
  });

  function updateTagsDisplay(row) {
    try {
      var cell =
        row.querySelector(".wd-table-cell.wd-cell-tags") ||
        Array.prototype.find.call(row.children, function (c) {
          return c && c.querySelector && c.querySelector(".wd-primary-tags");
        });
      if (!cell) return;
      var wrapper = cell.querySelector(".wd-primary-tags");
      if (!wrapper) return;

      var toggle = wrapper.querySelector(".wd-tag-toggle");
      if (toggle) {
        var tagsArr = Array.isArray(row._tags) ? row._tags : null;
        var extra = 0;
        if (tagsArr && tagsArr.length) {
          extra = Math.max(0, tagsArr.length - 1);
        } else {
          var existing = wrapper.querySelectorAll(".wd-tag");
          extra = Math.max(0, existing.length - 1);
        }
        toggle.innerHTML =
          "+" + extra + ' <i class="fas fa-chevron-right"></i>';
      }
    } catch (e) {}
  }

  // Removed auto-creation of tags cells; handled manually in HTML

  // Ensure manually added tags cells/buttons work: bind toggle and set counts only
  bodyRows.forEach(function (row) {
    try {
      var manualCell = Array.prototype.find.call(row.children, function (c) {
        return (
          c &&
          c.querySelector &&
          (c.classList.contains("wd-cell-tags") ||
            c.querySelector(".wd-primary-tags"))
        );
      });
      if (!manualCell) return; // no JS insertion; manual-only
      var wrapper = manualCell.querySelector(".wd-primary-tags");
      if (!wrapper) return;

      var toggle = wrapper.querySelector(".wd-tag-toggle");
      if (!toggle) return; // do not create toggles via JS

      // Rebind click to open modal
      var newToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(newToggle, toggle);
      newToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var contactNameEl = row.querySelector(".wd-contact-info span");
        var contactName = contactNameEl ? contactNameEl.textContent.trim() : "";
        ensureTagsModal();
        openTagsModal(contactName, row);
      });

      // Initialize tags array from existing HTML tags only (no JS additions)
      if (!Array.isArray(row._tags) || row._tags.length === 0) {
        var existingTagEls = wrapper.querySelectorAll(".wd-tag");
        var collected = [];
        existingTagEls.forEach(function (el) {
          var t = (el.textContent || "").trim();
          if (t) collected.push(t);
        });
        row._tags = collected.slice();
      }

      // Reflect current count and ensure only one primary shown
      updateTagsDisplay(row);
    } catch (e) {}
  });

  // Removed auto-insertion/marking of tags cells; only bind existing ones

  // Tags popup implementation
  function ensureTagsModal() {
    if (document.querySelector(".wd-tags-modal")) return;
    var modal = document.createElement("div");
    modal.className = "wd-tags-modal";
    modal.innerHTML =
      "" +
      '<div class="wd-tags-modal-content">' +
      '<div class="wd-tags-modal-header">' +
      '<h3 class="wd-tags-title">إدارة الوسوم</h3>' +
      '<button type="button" class="wd-modal-close" aria-label="إغلاق">&times;</button>' +
      "</div>" +
      '<div class="wd-tags-modal-body">' +
      '<div class="wd-tags-list"></div>' +
      '<div class="wd-tags-add">' +
      '<input type="text" class="wd-tags-input" placeholder="أدخل وسمًا" />' +
      '<button type="button" class="wd-tags-add-btn">إضافة</button>' +
      "</div>" +
      '<div class="wd-suggested-tags"></div>' +
      "</div>" +
      '<div class="wd-tags-actions">' +
      '<button type="button" class="wd-tags-cancel">إلغاء</button>' +
      '<button type="button" class="wd-tags-save">حفظ</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(modal);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeTagsModal();
    });
    modal
      .querySelector(".wd-modal-close")
      .addEventListener("click", closeTagsModal);
    modal
      .querySelector(".wd-tags-cancel")
      .addEventListener("click", closeTagsModal);

    modal
      .querySelector(".wd-tags-add-btn")
      .addEventListener("click", function () {
        var input = modal.querySelector(".wd-tags-input");
        var val = (input.value || "").trim();
        if (!val) return;
        renderTagChip(modal, val);
        input.value = "";
        input.focus();
      });
    modal
      .querySelector(".wd-tags-input")
      .addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          modal.querySelector(".wd-tags-add-btn").click();
        }
      });

    // Default suggestions (can be overridden elsewhere)
    if (!window.WD_DEFAULT_TAG_SUGGESTIONS) {
      window.WD_DEFAULT_TAG_SUGGESTIONS = [
        "VIP",
        "مهم",
        "جديد",
        "متابع",
        "عميل محتمل",
        "معتمد",
        "مميز",
        "محلي",
        "دولي",
      ];
    }
  }

  function renderTagChip(modal, tagText) {
    var list = modal.querySelector(".wd-tags-list");
    var chip = document.createElement("span");
    chip.className = "wd-tag wd-chip";
    chip.textContent = tagText;
    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "wd-chip-remove";
    remove.setAttribute("aria-label", "إزالة");
    remove.innerHTML = "&times;";
    remove.addEventListener("click", function () {
      chip.remove();
    });
    chip.appendChild(remove);
    list.appendChild(chip);
  }

  function openTagsModal(contactName, row) {
    var modal = document.querySelector(".wd-tags-modal");
    if (!modal) return;
    modal.classList.add("show");
    var title = modal.querySelector(".wd-tags-title");
    title.textContent =
      "إدارة الوسوم" + (contactName ? " - " + contactName : "");
    var list = modal.querySelector(".wd-tags-list");
    list.innerHTML = "";
    var current = Array.isArray(row._tags) ? row._tags.slice() : [];
    current.forEach(function (t) {
      renderTagChip(modal, String(t));
    });

    // Populate suggested tags
    var suggestedWrap = modal.querySelector(".wd-suggested-tags");
    if (suggestedWrap) {
      suggestedWrap.innerHTML = "";
      var suggestions = Array.isArray(window.WD_DEFAULT_TAG_SUGGESTIONS)
        ? window.WD_DEFAULT_TAG_SUGGESTIONS
        : [];
      suggestions.forEach(function (s) {
        var btn = document.createElement("span");
        btn.className = "wd-tag";
        btn.textContent = s;
        btn.title = "إضافة هذا الوسم";
        btn.addEventListener("click", function () {
          // Avoid duplicates
          var exists = false;
          list.querySelectorAll(".wd-chip").forEach(function (chip) {
            var txt =
              chip.firstChild && chip.firstChild.nodeValue
                ? chip.firstChild.nodeValue.trim()
                : "";
            if (txt === s) exists = true;
          });
          if (!exists) {
            renderTagChip(modal, s);
          }
        });
        suggestedWrap.appendChild(btn);
      });
    }
    var saveBtn = modal.querySelector(".wd-tags-save");
    var newSave = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSave, saveBtn);
    newSave.addEventListener("click", function () {
      var chips = list.querySelectorAll(".wd-chip");
      var updated = [];
      chips.forEach(function (chip) {
        var txt =
          chip.firstChild && chip.firstChild.nodeValue
            ? chip.firstChild.nodeValue.trim()
            : "";
        if (txt) updated.push(txt);
      });
      row._tags = updated;
      updateTagsDisplay(row);
      closeTagsModal();
    });
  }

  function closeTagsModal() {
    var modal = document.querySelector(".wd-tags-modal");
    if (modal) modal.classList.remove("show");
  }
});
// Pagination functionality for errors page ONLY (namespaced to avoid conflicts)
const errorItemsPerPage = 5;
const errorTotalItems = 20;

// Help Center functionality
document.addEventListener("DOMContentLoaded", function () {
  // تأكد من الانتظار حتى يتم تحميل جميع العناصر
  setTimeout(function () {
    const helpCenterBtn = document.getElementById("helpCenterBtn");
    const helpWindow = document.getElementById("helpWindow");
    const closeHelpWindow = document.getElementById("closeHelpWindow");
    const helpWindowHeader = document.getElementById("helpWindowHeader");

    // إضافة العناصر الجديدة للفيديوهات التعليمية
    const videoTutorialsItem = document.getElementById("videoTutorialsItem");
    const videoTutorialsContent = document.getElementById(
      "videoTutorialsContent"
    );

    // فحص وجود العناصر قبل الاستمرار
    if (helpCenterBtn && helpWindow && closeHelpWindow) {
      console.log("Help center elements found");

      // تعيين موقع افتراضي للنافذة (استخدام left/top بدلاً من right/bottom للتناسق مع السحب)
      helpWindow.style.opacity = "1";
      helpWindow.style.right = "70px";
      helpWindow.style.bottom = "70px";
      helpWindow.style.display = "none"; // إخفاء النافذة افتراضياً

      // إضافة حدث النقر الصريح
      helpCenterBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation(); // منع انتشار الحدث

        console.log("Help center button clicked");

        // تبديل حالة العرض بشكل صريح
        if (
          helpWindow.style.display === "none" ||
          helpWindow.style.display === ""
        ) {
          helpWindow.style.display = "block";
          console.log("Window should show now");
        } else {
          helpWindow.style.display = "none";
          console.log("Window should hide now");

          // Reset window to default state when closing
          helpWindow.classList.remove("expanded", "animating");
          if (videoTutorialsContent) {
            videoTutorialsContent.style.display = "none";
          }
        }

        return false; // منع أي سلوك افتراضي
      };

      // إضافة حدث إغلاق النافذة
      closeHelpWindow.onclick = function () {
        helpWindow.style.display = "none";
        console.log("Window closed by button");

        // إعادة تعيين حالة النافذة عند الإغلاق
        helpWindow.classList.remove("expanded", "animating");

        // إخفاء محتوى الفيديوهات التعليمية
        if (videoTutorialsContent) {
          videoTutorialsContent.style.display = "none";
        }

        // إعادة إظهار أقسام المساعدة
        const helpCategoriesSection = document.getElementById(
          "helpCategoriesSection"
        );
        if (helpCategoriesSection) {
          helpCategoriesSection.style.display = "block";
        }

        return false;
      };

      // إضافة التفاعل مع فيديوهات تعليمية
      if (videoTutorialsItem && videoTutorialsContent) {
        videoTutorialsItem.addEventListener("click", function () {
          console.log("Video tutorials clicked");

          // إضافة تأثير الحركة لتوسيع النافذة
          helpWindow.classList.add("animating");

          // إظهار محتوى الفيديوهات بعد انتهاء الحركة
          setTimeout(function () {
            helpWindow.classList.remove("animating");
            helpWindow.classList.add("expanded");

            // إخفاء أقسام المساعدة
            const helpCategoriesSection = document.getElementById(
              "helpCategoriesSection"
            );
            if (helpCategoriesSection) {
              helpCategoriesSection.style.display = "none";
            }

            // إظهار قسم الفيديوهات التعليمية
            videoTutorialsContent.style.display = "block";
            console.log("Video tutorials content should be visible now");
          }, 400);
        });

        // زر العودة إلى أقسام المساعدة
        const backToHelpBtn = document.getElementById("backToHelpBtn");
        if (backToHelpBtn) {
          backToHelpBtn.addEventListener("click", function () {
            console.log("Back to help categories clicked");

            // إخفاء قسم الفيديوهات التعليمية
            videoTutorialsContent.style.display = "none";

            // إظهار أقسام المساعدة
            const helpCategoriesSection = document.getElementById(
              "helpCategoriesSection"
            );
            if (helpCategoriesSection) {
              helpCategoriesSection.style.display = "block";
            }

            // إعادة النافذة إلى الحجم الأصلي
            helpWindow.classList.remove("expanded");
          });
        }

        // إضافة تفاعل عند النقر على عناصر الفيديو
        const tutorialItems = document.querySelectorAll(".wd-tutorial-item");
        tutorialItems.forEach(function (item) {
          item.addEventListener("click", function () {
            const title = this.querySelector(".wd-tutorial-title").textContent;
            console.log("Tutorial clicked:", title);
            // هنا يمكن إضافة المزيد من التفاعل مثل تشغيل الفيديو
            alert("سيتم تشغيل الفيديو: " + title);
          });
        });
      }

      // جعل النافذة قابلة للتحريك في جميع الاتجاهات
      let isDragging = false;
      let offsetX, offsetY;

      helpWindowHeader.onmousedown = function (e) {
        isDragging = true;
        offsetX = e.clientX - helpWindow.getBoundingClientRect().left;
        offsetY = e.clientY - helpWindow.getBoundingClientRect().top;
        helpWindowHeader.style.cursor = "grabbing";
        e.preventDefault();

        // إضافة فئة تشير إلى حالة السحب
        helpWindow.classList.add("dragging");
      };

      document.onmousemove = function (e) {
        if (isDragging) {
          const newLeft = e.clientX - offsetX;
          const newTop = e.clientY - offsetY;

          // التأكد من عدم تجاوز حدود النافذة
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const helpWindowWidth = helpWindow.offsetWidth;
          const helpWindowHeight = helpWindow.offsetHeight;

          // التأكد من بقاء النافذة ضمن حدود الصفحة بحد أدنى
          const boundedLeft = Math.max(0, Math.min(windowWidth - 50, newLeft));
          const boundedTop = Math.max(0, Math.min(windowHeight - 50, newTop));

          // تحديث الموقع
          helpWindow.style.left = boundedLeft + "px";
          helpWindow.style.top = boundedTop + "px";

          // إزالة right و bottom للتأكد من عدم تعارضها مع left و top
          helpWindow.style.right = "auto";
          helpWindow.style.bottom = "auto";
        }
      };

      document.onmouseup = function () {
        if (isDragging) {
          isDragging = false;
          helpWindowHeader.style.cursor = "move";

          // إزالة فئة السحب
          helpWindow.classList.remove("dragging");
        }
      };
    }

    // Restore contact info sidebar state
    restoreContactInfoSidebarState();
  }, 500); // انتظر 500 مللي ثانية بعد تحميل الصفحة
});

function updateErrorPagination() {
  const currentPageElement = document.getElementById("currentPage");
  const totalPagesElement = document.getElementById("totalPages");

  if (currentPageElement && typeof currentPage !== "undefined") {
    currentPageElement.textContent = currentPage;
  }
  if (totalPagesElement && typeof totalPages !== "undefined") {
    totalPagesElement.textContent = totalPages;
  }

  const errorItems = document.querySelectorAll(".wd-error-item");
  errorItems.forEach((item, index) => {
    const startIndex = (currentPage - 1) * errorItemsPerPage;
    const endIndex = startIndex + errorItemsPerPage;
    item.style.display =
      index >= startIndex && index < endIndex ? "flex" : "none";
  });
}

function prevErrorPage() {
  if (typeof currentPage !== "undefined" && currentPage > 1) {
    currentPage--;
    updateErrorPagination();
  }
}

function nextErrorPage() {
  if (
    typeof currentPage !== "undefined" &&
    typeof totalPages !== "undefined" &&
    currentPage < totalPages
  ) {
    currentPage++;
    updateErrorPagination();
  }
}

// Initialize pagination
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".wd-error-item")) {
    updateErrorPagination();
  }

  // Initialize notifications page functionality if we're on that page
  initNotificationsPage();
});

// Secondary sidebar toggle
function toggleSecondarySidebar() {
  const secondarySidebar = document.querySelector(".wd-secondary-sidebar");
  const mainContent = document.querySelector(".wd-main-content");
  const contentBody = document.querySelector(".wd-content-body");
  const contentHeader = document.querySelector(".wd-content-header");

  if (secondarySidebar && mainContent && contentBody && contentHeader) {
    secondarySidebar.classList.toggle("hidden");
    mainContent.classList.toggle("secondary-hidden");
    contentBody.classList.toggle("secondary-hidden");
    contentHeader.classList.toggle("secondary-hidden");

    // حفظ حالة القسم الثاني
    if (secondarySidebar.classList.contains("hidden")) {
      localStorage.setItem("secondarySidebarHidden", "true");
    } else {
      localStorage.setItem("secondarySidebarHidden", "false");
    }
  }
}

// تحميل حالة القسم الثاني عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  const secondarySidebar = document.querySelector(".wd-secondary-sidebar");
  const mainContent = document.querySelector(".wd-main-content");
  const contentBody = document.querySelector(".wd-content-body");
  const contentHeader = document.querySelector(".wd-content-header");

  // التحقق من وجود حالة محفوظة
  const savedState = localStorage.getItem("secondarySidebarHidden");
  if (savedState === "true") {
    secondarySidebar.classList.add("hidden");
    mainContent.classList.add("secondary-hidden");
    contentBody.classList.add("secondary-hidden");
    contentHeader.classList.add("secondary-hidden");
  }
});

// Filter dropdown functionality
function toggleFilterDropdown() {
  const dropdown = document.querySelector(".wd-filter-dropdown");
  dropdown.classList.toggle("hidden");
}

function toggleSubmenu(submenuId) {
  const submenu = document.getElementById(submenuId);
  submenu.classList.toggle("hidden");
}

function updateOptionHeader(optionId, value) {
  const header = document.querySelector(
    `#${optionId} .wd-filter-option-header span`
  );
  header.textContent = value;
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".wd-filter-dropdown");
  const filterBtn = document.querySelector(".wd-filter-action-btn");

  if (
    dropdown &&
    filterBtn &&
    !dropdown.contains(event.target) &&
    !filterBtn.contains(event.target)
  ) {
    dropdown.classList.add("hidden");
  }
});

// Chat sidebar toggle
function toggleChatSidebar() {
  const chatSidebar = document.querySelector(".wd-chat-sidebar");
  const chatMain = document.querySelector(".wd-chat-main");
  const expandBtn = document.querySelector(".wd-chat-expand-btn i");

  chatSidebar.classList.toggle("expanded");
  chatMain.classList.toggle("hidden");

  if (chatSidebar.classList.contains("expanded")) {
    expandBtn.classList.remove("fa-expand");
    expandBtn.classList.add("fa-compress");
    // حفظ حالة التكبير
    localStorage.setItem("chatSidebarExpanded", "true");
  } else {
    expandBtn.classList.remove("fa-compress");
    expandBtn.classList.add("fa-expand");
    // حفظ حالة التصغير
    localStorage.setItem("chatSidebarExpanded", "false");
  }
}

// تحميل حالة قسم المحادثات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  const chatSidebar = document.querySelector(".wd-chat-sidebar");
  const chatMain = document.querySelector(".wd-chat-main");
  const expandBtn = document.querySelector(".wd-chat-expand-btn i");

  // التحقق من وجود حالة محفوظة
  const savedState = localStorage.getItem("chatSidebarExpanded");
  if (savedState === "true") {
    chatSidebar.classList.add("expanded");
    chatMain.classList.add("hidden");
    expandBtn.classList.remove("fa-expand");
    expandBtn.classList.add("fa-compress");
  }
});

// Activate chats
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".wd-chat-item")) {
    document.querySelectorAll(".wd-chat-item").forEach((item) => {
      item.addEventListener("click", function () {
        // Remove active class from all chats
        document.querySelectorAll(".wd-chat-item").forEach((chat) => {
          chat.classList.remove("active");
        });

        // Add active class to selected chat
        this.classList.add("active");

        // Hide default content
        const defaultContent = document.querySelector(".wd-chat-default");
        defaultContent.classList.add("hidden");

        // Show chat window and input field
        const chatContent = document.querySelector(".wd-chat-content");
        chatContent.classList.remove("hidden");

        // Check expand button state
        const expandBtn = document.querySelector(".wd-chat-expand-btn i");
        const chatSidebar = document.querySelector(".wd-chat-sidebar");
        const chatMain = document.querySelector(".wd-chat-main");

        if (expandBtn.classList.contains("fa-compress")) {
          chatSidebar.classList.add("hidden");
          chatMain.classList.remove("hidden");
          expandBtn.classList.remove("fa-compress");
          expandBtn.classList.add("fa-expand");
        }
      });
    });
  }
});

// Toggle conversation status menu
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".wd-conversation-status-btn")) {
    document
      .querySelector(".wd-conversation-status-btn")
      .addEventListener("click", function (e) {
        e.stopPropagation();
        const menu = this.nextElementSibling;
        menu.classList.toggle("active");
      });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      const menu = document.querySelector(".wd-conversation-status-menu");
      if (menu && !menu.contains(e.target)) {
        menu.classList.remove("active");
      }
    });

    // Update conversation status when selecting an option
    document
      .querySelectorAll(".wd-conversation-status-item")
      .forEach((item) => {
        item.addEventListener("click", function () {
          const statusBtn = document.querySelector(
            ".wd-conversation-status-btn"
          );
          const icon = this.querySelector("i").cloneNode(true);
          const text = this.querySelector("span").textContent;

          statusBtn.innerHTML = "";
          statusBtn.appendChild(icon);
          statusBtn.appendChild(document.createTextNode(text));
          statusBtn.appendChild(document.createElement("i")).className =
            "fas fa-chevron-down";

          document
            .querySelector(".wd-conversation-status-menu")
            .classList.remove("active");
        });
      });
  }
});

// Go back to chat list
function goBackToSidebar() {
  // Hide chat content
  const chatContent = document.querySelector(".wd-chat-content");
  chatContent.classList.add("hidden");

  // Show default content
  const defaultContent = document.querySelector(".wd-chat-default");
  defaultContent.classList.add("hidden");

  // Show chat sidebar
  const chatSidebar = document.querySelector(".wd-chat-sidebar");
  chatSidebar.classList.remove("hidden");

  // Remove active class from all chats
  document.querySelectorAll(".wd-chat-item").forEach((chat) => {
    chat.classList.remove("active");
  });

  // Reset expand button
  const expandBtn = document.querySelector(".wd-chat-expand-btn i");
  expandBtn.classList.remove("fa-compress");
  expandBtn.classList.add("fa-expand");

  // Reset chat sidebar and main content based on saved state
  const chatMain = document.querySelector(".wd-chat-main");
  const savedState = localStorage.getItem("chatSidebarExpanded");

  if (savedState === "true") {
    chatSidebar.classList.add("expanded");
    chatMain.classList.add("hidden");
    expandBtn.classList.remove("fa-expand");
    expandBtn.classList.add("fa-compress");
  } else {
    chatSidebar.classList.remove("expanded");
    chatSidebar.classList.remove("hidden");
    chatMain.classList.remove("hidden");
  }
}

// Message type buttons
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".wd-reply-type-btn")) {
    // Activate reply button
    document
      .querySelector(".wd-reply-type-btn")
      .addEventListener("click", function () {
        this.classList.toggle("active");
        const noteBtn = document.querySelector(".wd-note-type-btn");
        if (noteBtn.classList.contains("active")) {
          noteBtn.classList.remove("active");
        }

        // Reset colors
        const messageInput = document.querySelector("#messageInput");
        const messageActions = document.querySelector(".wd-message-actions");
        const sendBtn = document.querySelector(".wd-send-btn");

        messageInput.style.backgroundColor = "";
        messageActions.style.backgroundColor = "";
        sendBtn.style.backgroundColor = "#00BC60";
        sendBtn.style.color = "#fff";
      });

    // Activate note button
    document
      .querySelector(".wd-note-type-btn")
      .addEventListener("click", function () {
        this.classList.toggle("active");
        const replyBtn = document.querySelector(".wd-reply-type-btn");
        if (replyBtn.classList.contains("active")) {
          replyBtn.classList.remove("active");
        }

        // Check note button state and change colors
        const messageInput = document.querySelector("#messageInput");
        const messageActions = document.querySelector(".wd-message-actions");
        const sendBtn = document.querySelector(".wd-send-btn");

        if (this.classList.contains("active")) {
          messageInput.style.backgroundColor = "#fffbd1";
          messageActions.style.backgroundColor = "#fffbd1";
          sendBtn.style.backgroundColor = "#ffd700";
          sendBtn.style.color = "#333";
        } else {
          messageInput.style.backgroundColor = "";
          messageActions.style.backgroundColor = "";
          sendBtn.style.backgroundColor = "#00BC60";
          sendBtn.style.color = "#fff";
        }
      });
  }
});

// Shortcuts menu
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("messageInput")) {
    const messageInput = document.getElementById("messageInput");
    const shortcutsMenu = document.querySelector(".wd-shortcuts-menu");

    messageInput.addEventListener("input", function (e) {
      if (e.target.value.startsWith("/")) {
        shortcutsMenu.classList.remove("hidden");
      } else {
        shortcutsMenu.classList.add("hidden");
      }
    });

    // Add shortcut description to message box when clicked
    document.querySelectorAll(".wd-shortcut-item").forEach((item) => {
      item.addEventListener("click", function () {
        const desc = this.querySelector(".wd-shortcut-desc").textContent;
        messageInput.value = desc;
        shortcutsMenu.classList.add("hidden");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !messageInput.contains(e.target) &&
        !shortcutsMenu.contains(e.target)
      ) {
        shortcutsMenu.classList.add("hidden");
      }
    });
  }
});

function toggleContactInfo() {
  const sidebar = document.querySelector(".wd-contact-info-sidebar");
  const chatContent = document.querySelector(".wd-chat-content");
  const chatWindow = document.querySelector(".wd-chat-window");
  const toggleButton = document.querySelector(".wd-contact-info-toggle i");

  sidebar.classList.toggle("active");
  chatContent.classList.toggle("sidebar-active");
  chatWindow.classList.toggle("sidebar-active");

  // Save sidebar state to localStorage
  const isActive = sidebar.classList.contains("active");
  localStorage.setItem("contactInfoSidebarOpen", isActive);

  if (isActive) {
    toggleButton.classList.remove("fa-chevron-right");
    toggleButton.classList.add("fa-chevron-left");
  } else {
    toggleButton.classList.remove("fa-chevron-left");
    toggleButton.classList.add("fa-chevron-right");
  }
}

// Restore contact info sidebar state on page load
function restoreContactInfoSidebarState() {
  const sidebar = document.querySelector(".wd-contact-info-sidebar");
  const chatContent = document.querySelector(".wd-chat-content");
  const chatWindow = document.querySelector(".wd-chat-window");
  const toggleButton = document.querySelector(".wd-contact-info-toggle i");

  if (sidebar && chatContent && chatWindow && toggleButton) {
    const savedState = localStorage.getItem("contactInfoSidebarOpen");
    const isOpen = savedState === "true";

    if (isOpen) {
      sidebar.classList.add("active");
      chatContent.classList.add("sidebar-active");
      chatWindow.classList.add("sidebar-active");
      toggleButton.classList.remove("fa-chevron-right");
      toggleButton.classList.add("fa-chevron-left");
    } else {
      sidebar.classList.remove("active");
      chatContent.classList.remove("sidebar-active");
      chatWindow.classList.remove("sidebar-active");
      toggleButton.classList.remove("fa-chevron-left");
      toggleButton.classList.add("fa-chevron-right");
    }
  }
}

// Copy text to clipboard
function copyText(text) {
  // Use the Clipboard API to copy text
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Show success message
      const toast = document.createElement("div");
      toast.className = "wd-toast";
      toast.textContent = "تم نسخ النص بنجاح";
      document.body.appendChild(toast);

      // Remove toast after 2 seconds
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}

// التحكم في قائمة الحساب العائمة
const profileBtn = document.querySelector(".wd-profile-floating-btn");
const profileMenu = document.querySelector(".wd-profile-floating-menu");
const statusOptions = document.querySelectorAll(
  ".wd-profile-floating-status-option"
);

// فتح وإغلاق القائمة
if (profileBtn && profileMenu) {
  profileBtn.addEventListener("click", () => {
    profileMenu.classList.toggle("show");
  });

  // إغلاق القائمة عند النقر خارجها
  document.addEventListener("click", (e) => {
    if (
      profileBtn &&
      profileMenu &&
      !profileBtn.contains(e.target) &&
      !profileMenu.contains(e.target)
    ) {
      profileMenu.classList.remove("show");
    }
  });

  // تغيير حالة المستخدم
  statusOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // إزالة الفئة النشطة من جميع الخيارات
      statusOptions.forEach((opt) => opt.classList.remove("active"));
      // إضافة الفئة النشطة للخيار المحدد
      option.classList.add("active");

      // تغيير لون زر الحساب حسب الحالة
      const status = option.getAttribute("data-status");
      if (status === "available") {
        profileBtn.style.background = "#00BC60";
      } else if (status === "busy") {
        profileBtn.style.background = "#FFD700";
      } else {
        profileBtn.style.background = "#666";
      }
    });
  });
}

// Emoji Picker Functionality
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.querySelector(".wd-emoji-picker");
const emojiList = document.querySelector(".wd-emoji-list");
const messageInput = document.getElementById("messageInput");

// Emoji categories and their emojis
const emojiCategories = {
  recent: ["😊", "👍", "❤️", "😂", "🔥", "✨", "🎉", "💯"],
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "🥲",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "🥴",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "🥸",
    "😎",
    "🤓",
    "🧐",
    "😕",
    "😟",
    "🙁",
    "☹️",
    "😮",
    "😯",
    "😲",
    "😳",
    "🥺",
    "😦",
    "😧",
    "😨",
    "😰",
    "😥",
    "😢",
    "😭",
    "😱",
    "😖",
    "😣",
    "😞",
    "😓",
    "😩",
    "😫",
    "🥱",
    "😤",
    "😡",
    "😠",
    "🤬",
    "😈",
    "👿",
    "💀",
    "☠️",
    "💩",
    "🤡",
    "👹",
    "👺",
    "👻",
    "👽",
    "👾",
    "🤖",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💅",
    "🤳",
    "💪",
    "🦾",
    "🦿",
    "🦵",
    "🦶",
    "👂",
    "🦻",
    "👃",
    "🧠",
    "🫀",
    "🫁",
    "🦷",
    "🦴",
    "👀",
    "👁️",
    "👅",
    "👄",
  ],
  animals: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐽",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",
    "🐒",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🐣",
    "🐥",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🦟",
    "🦗",
    "🕷️",
    "🦂",
    "🐢",
    "🐍",
    "🦎",
    "🦖",
    "🦕",
    "🐙",
    "🦑",
    "🦐",
    "🦞",
    "🦀",
    "🐡",
    "🐠",
    "🐟",
    "🐬",
    "🐳",
    "🐋",
    "🦈",
    "🐊",
    "🐅",
    "🐆",
    "🦓",
    "🦍",
    "🦧",
    "🦣",
    "🐘",
    "🦛",
    "🦏",
    "🐪",
    "🐫",
    "🦒",
    "🦘",
    "🦬",
    "🐃",
    "🐂",
    "🐄",
    "🐎",
    "🐖",
    "🐏",
    "🐑",
    "🦙",
    "🐐",
    "🦌",
    "🐕",
    "🐩",
    "🦮",
    "🐕‍🦺",
    "🐈",
    "🐈‍⬛",
    "🦴",
    "🦜",
    "🦚",
    "🦤",
    "🦢",
    "🦩",
    "🕊️",
    "🐇",
    "🦝",
    "🦨",
    "🦡",
    "🦫",
    "🦦",
    "🦥",
    "🐁",
    "🐀",
    "🐿️",
    "🦔",
    "🐾",
    "🐉",
    "🐲",
    "🌵",
    "🎄",
    "🌲",
    "🌳",
    "🌴",
    "🌱",
    "🌿",
    "☘️",
    "🍀",
    "🎍",
    "🎋",
    "🍃",
    "🍂",
    "🍁",
    "🌾",
    "🌺",
    "🌻",
    "🌹",
    "🥀",
    "🌷",
    "🌼",
    "🌸",
    "💐",
    "🍄",
    "🌰",
  ],
  food: [
    "🍏",
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
    "🥬",
    "🥒",
    "🌶️",
    "🫑",
    "🌽",
    "🥕",
    "🫒",
    "🧄",
    "🧅",
    "🥔",
    "🍠",
    "🥐",
    "🥯",
    "🍞",
    "🥖",
    "🥨",
    "🧀",
    "🥚",
    "🍳",
    "🧈",
    "🥞",
    "🧇",
    "🥓",
    "🥩",
    "🍗",
    "🍖",
    "🦴",
    "🌭",
    "🍔",
    "🍟",
    "🍕",
    "🫓",
    "🥪",
    "🥙",
    "🧆",
    "🌮",
    "🌯",
    "🫔",
    "🥗",
    "🥘",
    "🫕",
    "🥫",
    "🍝",
    "🍜",
    "🍲",
    "🍛",
    "🍣",
    "🍱",
    "🥟",
    "🦪",
    "🍤",
    "🍙",
    "🍚",
    "🍘",
    "🍥",
    "🥠",
    "🥮",
    "🍢",
    "🍡",
    "🍧",
    "🍨",
    "🍦",
    "🥧",
    "🧁",
    "🍰",
    "🎂",
    "🍮",
    "🍭",
    "🍬",
    "🍫",
    "🍿",
    "🍩",
    "🍪",
    "🌰",
    "🥜",
    "🍯",
    "🥛",
    "🍼",
    "☕",
    "🫖",
    "🍵",
    "🧃",
    "🥤",
    "🧋",
    "🍶",
    "🍺",
    "🍻",
    "🥂",
    "🍷",
    "🥃",
    "🍸",
    "🍹",
    "🧉",
    "🍾",
    "🧊",
    "🥄",
    "🍴",
    "🍽️",
    "🥣",
    "🥡",
    "🥢",
    "🧂",
  ],
  activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
    "🪁",
    "🏹",
    "🎣",
    "🤿",
    "🥊",
    "🥋",
    "🎽",
    "🛹",
    "🛼",
    "🛷",
    "⛸️",
    "🥌",
    "🎿",
    "⛷️",
    "🏂",
    "🪂",
    "🏋️",
    "🤼",
    "🤸",
    "🤺",
    "⛹️",
    "🤾",
    "🏌️",
    "🧘",
    "🏇",
    "🧗",
    "🚴",
    "🚵",
    "🎪",
    "🎭",
    "🎨",
    "🎬",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🥁",
    "🪘",
    "🎷",
    "🎺",
    "🪗",
    "🎸",
    "🪕",
    "🎻",
    "🎲",
    "♟️",
    "🎯",
    "🎳",
    "🎮",
    "🎰",
    "🧩",
  ],
  travel: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🦯",
    "🦽",
    "🦼",
    "🛴",
    "🚲",
    "🛵",
    "🏍️",
    "🛺",
    "🚨",
    "🚔",
    "🚍",
    "🚘",
    "🚖",
    "🚡",
    "🚠",
    "🚟",
    "🚃",
    "🚋",
    "🚞",
    "🚝",
    "🚄",
    "🚅",
    "🚈",
    "🚂",
    "🚆",
    "🚇",
    "🚊",
    "🚉",
    "✈️",
    "🛫",
    "🛬",
    "🛩️",
    "💺",
    "🛰️",
    "🚁",
    "🛸",
    "🚀",
    "🛶",
    "⛵",
    "🚤",
    "🛥️",
    "🛳️",
    "⛴️",
    "🚢",
    "⚓",
    "🪝",
    "⛽",
    "🚧",
    "🚦",
    "🚥",
    "🚏",
    "🗺️",
    "🗿",
    "🗽",
    "🗼",
    "🏰",
    "🏯",
    "🏟️",
    "🎡",
    "🎢",
    "🎠",
    "⛲",
    "⛱️",
    "🏖️",
    "🏝️",
    "🏜️",
    "🌋",
    "⛰️",
    "🏔️",
    "🗻",
    "🏕️",
    "⛺",
    "🛖",
    "🏠",
    "🏡",
    "🏘️",
    "🏚️",
    "🏗️",
    "🏭",
    "🏢",
    "🏬",
    "🏣",
    "🏤",
    "🏥",
    "🏦",
    "🏨",
    "🏪",
    "🏫",
    "🏩",
    "💒",
    "🏛️",
    "⛪",
    "🕌",
    "🕍",
    "🛕",
    "🕋",
  ],
  objects: [
    "⌚",
    "📱",
    "📲",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "🕹️",
    "🗜️",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
    "🎙️",
    "🎚️",
    "🎛️",
    "🧭",
    "⏱️",
    "⏲️",
    "⏰",
    "🕰️",
    "⌛",
    "⏳",
    "📡",
    "🔋",
    "🔌",
    "💡",
    "🔦",
    "🕯️",
    "🪔",
    "🧯",
    "🛢️",
    "💸",
    "💵",
    "💴",
    "💶",
    "💷",
    "🪙",
    "💰",
    "💳",
    "💎",
    "⚖️",
    "🪜",
    "🧰",
    "🪛",
    "🔧",
    "🔨",
    "⚒️",
    "🛠️",
    "⛏️",
    "🪚",
    "🔩",
    "⚙️",
    "🪤",
    "🧱",
    "⛓️",
    "🧲",
    "🔫",
    "💣",
    "🧨",
    "🪓",
    "🔪",
    "🗡️",
    "⚔️",
    "🛡️",
    "🚬",
    "⚰️",
    "🪦",
    "⚱️",
    "🏺",
    "🔮",
    "📿",
    "🧿",
    "💈",
    "⚗️",
    "🔭",
    "🔬",
    "🕳️",
    "🩹",
    "🩺",
    "💊",
    "💉",
    "🩸",
    "🧬",
    "🦠",
    "🧫",
    "🧪",
    "🌡️",
    "🧹",
    "🪠",
    "🧺",
    "🧻",
    "🚽",
    "🚰",
    "🚿",
    "🛁",
    "🛀",
    "🧼",
    "🪒",
    "🪥",
    "🧽",
    "🧴",
    "🛎️",
    "🔑",
    "🗝️",
    "🚪",
    "🪑",
    "🛋️",
    "🛏️",
    "🧸",
    "🪆",
    "🖼️",
    "🪟",
    "🪞",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
    "🆔",
    "⚛️",
    "🉑",
    "☢️",
    "☣️",
    "📴",
    "📳",
    "🈶",
    "🈚",
    "🈸",
    "🈺",
    "🈷️",
    "✴️",
    "🆚",
    "💮",
    "🉐",
    "㊙️",
    "㊗️",
    "🈴",
    "🈵",
    "🈹",
    "🈲",
    "🅰️",
    "🅱️",
    "🆎",
    "🆑",
    "🅾️",
    "🆘",
    "❌",
    "⭕",
    "🛑",
    "⛔",
    "📛",
    "🚫",
    "💯",
    "💢",
    "♨️",
    "🚷",
    "🚯",
    "🚳",
    "🚱",
    "🔞",
    "📵",
    "🚭",
    "❗",
    "❕",
    "❓",
    "❔",
    "‼️",
    "⁉️",
    "🔅",
    "🔆",
    "〽️",
    "⚠️",
    "🚸",
    "🔱",
    "⚜️",
    "🔰",
    "♻️",
    "✅",
    "🈯",
    "💹",
    "❇️",
    "✳️",
    "❎",
    "🌐",
    "💠",
    "Ⓜ️",
    "🌀",
    "💤",
    "🏧",
    "🚾",
    "♿",
    "🅿️",
    "🛗",
    "🈳",
    "🈂️",
    "🛂",
    "🛃",
    "🛄",
    "🛅",
    "🚹",
    "🚺",
    "🚼",
    "⚧️",
    "🚻",
    "🚮",
    "🎦",
    "📶",
    "🈁",
    "🔣",
    "ℹ️",
    "🔤",
    "🔡",
    "🔠",
    "🆖",
    "🆗",
    "🆙",
    "🆒",
    "🆕",
    "🆓",
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
    "🔢",
    "#️⃣",
    "*️⃣",
    "⏏️",
    "▶️",
    "⏸️",
    "⏯️",
    "⏹️",
    "⏺️",
    "⏭️",
    "⏮️",
    "⏩",
    "⏪",
    "⏫",
    "⏬",
    "◀️",
    "🔼",
    "🔽",
    "➡️",
    "⬅️",
    "⬆️",
    "⬇️",
    "↗️",
    "↘️",
    "↙️",
    "↖️",
    "↕️",
    "↔️",
    "↪️",
    "↩️",
    "⤴️",
    "⤵️",
    "🔀",
    "🔁",
    "🔂",
    "🔄",
    "🔃",
    "🎵",
    "🎶",
    "➕",
    "➖",
    "➗",
    "✖️",
    "♾️",
    "💲",
    "💱",
    "™️",
    "©️",
    "®️",
    "〰️",
    "➰",
    "➿",
    "🔚",
    "🔙",
    "🔛",
    "🔝",
    "🔜",
    "✔️",
    "☑️",
    "🔘",
    "🔴",
    "🟠",
    "🟡",
    "🟢",
    "🔵",
    "🟣",
    "⚫",
    "⚪",
    "🟤",
    "🔺",
    "🔻",
    "🔸",
    "🔹",
    "🔶",
    "🔷",
    "🔳",
    "🔲",
    "▪️",
    "▫️",
    "◾",
    "◽",
    "◼️",
    "◻️",
    "🟥",
    "🟧",
    "🟨",
    "🟩",
    "🟦",
    "🟪",
    "⬛",
    "⬜",
    "🟫",
    "🔈",
    "🔇",
    "🔉",
    "🔊",
    "🔔",
    "🔕",
    "📣",
    "📢",
    "💬",
    "💭",
    "🗯️",
    "♠️",
    "♣️",
    "♥️",
    "♦️",
    "🃏",
    "🎴",
    "🀄",
    "🕐",
    "🕑",
    "🕒",
    "🕓",
    "🕔",
    "🕕",
    "🕖",
    "🕗",
    "🕘",
    "🕙",
    "🕚",
    "🕛",
  ],
};

// Load emojis for a category
function loadEmojis(category) {
  if (!emojiList || !messageInput) return;

  emojiList.innerHTML = "";
  emojiCategories[category].forEach((emoji) => {
    const emojiItem = document.createElement("div");
    emojiItem.className = "wd-emoji-item";
    emojiItem.textContent = emoji;
    emojiItem.addEventListener("click", () => {
      messageInput.value += emoji;
      messageInput.focus();
    });
    emojiList.appendChild(emojiItem);
  });
}

// Toggle emoji picker
if (emojiBtn && emojiPicker) {
  emojiBtn.addEventListener("click", () => {
    emojiPicker.classList.toggle("hidden");
    if (!emojiPicker.classList.contains("hidden")) {
      loadEmojis("recent");
    }
  });
}

// Handle emoji category selection
if (emojiPicker) {
  document.querySelectorAll(".wd-emoji-category").forEach((category) => {
    category.addEventListener("click", () => {
      const activeCategory = document.querySelector(
        ".wd-emoji-category.active"
      );
      if (activeCategory) {
        activeCategory.classList.remove("active");
      }
      category.classList.add("active");
      loadEmojis(category.dataset.category);
    });
  });
}

// File Upload Functionality
const imageBtn = document.getElementById("imageBtn");
const videoBtn = document.getElementById("videoBtn");
const fileBtn = document.getElementById("fileBtn");
const imageInput = document.getElementById("imageInput");
const videoInput = document.getElementById("videoInput");
const fileInput = document.getElementById("fileInput");

// Handle file uploads
function handleFileUpload(input, type) {
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.createElement("div");
        preview.className = "wd-file-preview";

        if (type === "image") {
          preview.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <div class="wd-file-info">
              <div class="wd-file-name">${file.name}</div>
              <div class="wd-file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="wd-file-remove">×</div>
          `;
        } else if (type === "video") {
          preview.innerHTML = `
            <video src="${e.target.result}" controls></video>
            <div class="wd-file-info">
              <div class="wd-file-name">${file.name}</div>
              <div class="wd-file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="wd-file-remove">×</div>
          `;
        } else {
          preview.innerHTML = `
            <i class="fas fa-file"></i>
            <div class="wd-file-info">
              <div class="wd-file-name">${file.name}</div>
              <div class="wd-file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="wd-file-remove">×</div>
          `;
        }

        const messagePreview =
          document.querySelector(".wd-message-preview") ||
          document.createElement("div");
        messagePreview.className = "wd-message-preview";
        messagePreview.appendChild(preview);
        document.querySelector(".wd-message-input").appendChild(messagePreview);

        // Handle file removal
        preview
          .querySelector(".wd-file-remove")
          .addEventListener("click", () => {
            preview.remove();
            if (messagePreview.children.length === 0) {
              messagePreview.remove();
            }
          });
      };
      reader.readAsDataURL(file);
    }
  });
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Initialize file upload handlers
if (imageInput) {
  handleFileUpload(imageInput, "image");
}
if (videoInput) {
  handleFileUpload(videoInput, "video");
}
if (fileInput) {
  handleFileUpload(fileInput, "file");
}

// Trigger file input clicks
if (imageBtn && imageInput) {
  imageBtn.addEventListener("click", () => imageInput.click());
}
if (videoBtn && videoInput) {
  videoBtn.addEventListener("click", () => videoInput.click());
}
if (fileBtn && fileInput) {
  fileBtn.addEventListener("click", () => fileInput.click());
}

// Voice Recording Functionality
const voiceBtn = document.getElementById("voiceBtn");
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Start recording
async function startRecording() {
  try {
    // Request microphone permissions
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio preview
      const audioPreview = document.createElement("audio");
      audioPreview.src = audioUrl;
      audioPreview.controls = true;
      audioPreview.style.width = "250px";

      // Add to message preview
      const messagePreview =
        document.querySelector(".wd-message-preview") ||
        document.createElement("div");
      messagePreview.className = "wd-message-preview";
      messagePreview.innerHTML = "";
      messagePreview.appendChild(audioPreview);

      // Add to message input area if not already there
      if (!document.querySelector(".wd-message-preview")) {
        document.querySelector(".wd-message-input").appendChild(messagePreview);
      }
    };

    // Start recording with 100ms timeslice for better performance
    mediaRecorder.start(100);
    isRecording = true;

    // Update button appearance
    if (voiceBtn) {
      voiceBtn.classList.add("recording");
      voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
    }

    // Add recording indicator
    const recordingIndicator = document.createElement("div");
    recordingIndicator.className = "wd-recording-indicator";
    recordingIndicator.innerHTML = '<i class="fas fa-circle"></i> تسجيل...';
    document
      .querySelector(".wd-message-actions")
      .appendChild(recordingIndicator);
  } catch (err) {
    console.error("Error accessing microphone:", err);
    alert("تعذر الوصول إلى الميكروفون. يرجى التحقق من الإعدادات وإعطاء الإذن.");
    if (voiceBtn) {
      voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    }
  }
}

// Stop recording
function stopRecording() {
  if (mediaRecorder && isRecording) {
    try {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      isRecording = false;

      // Update button appearance
      if (voiceBtn) {
        voiceBtn.classList.remove("recording");
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      }

      // Remove recording indicator
      const indicator = document.querySelector(".wd-recording-indicator");
      if (indicator) {
        indicator.remove();
      }
    } catch (err) {
      console.error("Error stopping recording:", err);
      alert("حدث خطأ أثناء إيقاف التسجيل");
    }
  }
}

// Toggle recording
if (voiceBtn) {
  voiceBtn.addEventListener("click", () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  });
}

// Message Template Functionality
const templateBtn = document.getElementById("templateBtn");
const templatePicker = document.createElement("div");
templatePicker.className = "wd-template-picker hidden";
templatePicker.innerHTML = `
  <div class="wd-template-categories">
    <div class="wd-template-category active" data-category="greetings">الترحيب</div>
    <div class="wd-template-category" data-category="support">الدعم الفني</div>
    <div class="wd-template-category" data-category="sales">المبيعات</div>
    <div class="wd-template-category" data-category="marketing">التسويق</div>
  </div>
  <div class="wd-template-list">
    <!-- Templates will be loaded here -->
  </div>
`;

// WhatsApp templates
const whatsappTemplates = {
  greetings: [
    {
      title: "ترحيب عام",
      content: "مرحباً بك في خدمة العملاء! كيف يمكنني مساعدتك اليوم؟",
    },
    {
      title: "ترحيب بالاسم",
      content: "مرحباً {name}! يسعدنا تواصلك معنا. كيف يمكننا مساعدتك؟",
    },
  ],
  support: [
    {
      title: "طلب معلومات",
      content:
        "نشكرك على تواصلك معنا. هل يمكنك تزويدنا بمزيد من المعلومات حول المشكلة التي تواجهها؟",
    },
    {
      title: "حل المشكلة",
      content:
        "نفهم مشكلتك. سنقوم بمساعدتك في حل هذه المشكلة في أقرب وقت ممكن.",
    },
  ],
  sales: [
    {
      title: "عرض المنتج",
      content:
        "نقدم لك عرضاً خاصاً على منتجنا {product}. هل ترغب في معرفة المزيد؟",
    },
    {
      title: "تأكيد الطلب",
      content: "تم استلام طلبك بنجاح! سنقوم بتوصيله خلال {time}.",
    },
  ],
  marketing: [
    {
      title: "عرض ترويجي",
      content:
        "استفد من عرضنا الترويجي الحصري! خصم {discount}% على جميع المنتجات.",
    },
    {
      title: "إشعار جديد",
      content: "لدينا أخبار سارة! منتجنا الجديد {product} متوفر الآن.",
    },
  ],
};

// Load templates for a category
function loadTemplates(category) {
  const templateList = templatePicker.querySelector(".wd-template-list");
  templateList.innerHTML = "";

  whatsappTemplates[category].forEach((template) => {
    const templateItem = document.createElement("div");
    templateItem.className = "wd-template-item";
    templateItem.innerHTML = `
      <div class="wd-template-title">${template.title}</div>
      <div class="wd-template-preview">${template.content}</div>
    `;

    templateItem.addEventListener("click", () => {
      const templateContent = document.createElement("div");
      templateContent.className = "wd-whatsapp-template";
      templateContent.innerHTML = `
        <div class="wd-whatsapp-header">
          <img src="imgs/whatsapp-logo.png" alt="واتساب" class="wd-whatsapp-logo">
          <div class="wd-whatsapp-title">${template.title}</div>
        </div>
        <div class="wd-whatsapp-content">${template.content}</div>
        <div class="wd-whatsapp-footer">
          <div class="wd-whatsapp-actions">
            <button class="wd-whatsapp-btn">إرسال</button>
          </div>
          <div class="wd-whatsapp-time">${new Date().toLocaleTimeString()}</div>
        </div>
      `;

      const messagePreview =
        document.querySelector(".wd-message-preview") ||
        document.createElement("div");
      messagePreview.className = "wd-message-preview";
      messagePreview.appendChild(templateContent);
      document.querySelector(".wd-message-input").appendChild(messagePreview);

      templatePicker.classList.add("hidden");
    });

    templateList.appendChild(templateItem);
  });
}

// Toggle template picker
if (templateBtn) {
  templateBtn.addEventListener("click", () => {
    templatePicker.classList.toggle("hidden");
    if (!templatePicker.classList.contains("hidden")) {
      loadTemplates("greetings");
    }
  });
}

// Handle template category selection
templatePicker.querySelectorAll(".wd-template-category").forEach((category) => {
  category.addEventListener("click", () => {
    templatePicker
      .querySelector(".wd-template-category.active")
      .classList.remove("active");
    category.classList.add("active");
    loadTemplates(category.dataset.category);
  });
});

// Add template picker to the DOM
const messageInputContainer = document.querySelector(".wd-message-input");
if (messageInputContainer) {
  messageInputContainer.appendChild(templatePicker);
}

// Close pickers when clicking outside
document.addEventListener("click", (e) => {
  if (
    emojiBtn &&
    emojiPicker &&
    !emojiBtn.contains(e.target) &&
    !emojiPicker.contains(e.target)
  ) {
    emojiPicker.classList.add("hidden");
  }

  if (
    templateBtn &&
    templatePicker &&
    !templateBtn.contains(e.target) &&
    !templatePicker.contains(e.target)
  ) {
    templatePicker.classList.add("hidden");
  }
});

// Message Sending Functionality
const sendBtn = document.querySelector(".wd-send-btn");
const chatWindow = document.querySelector(".wd-chat-window");

// Handle message sending
function sendMessage() {
  if (!messageInput) return;

  const messageText = messageInput.value.trim();
  const messagePreview = document.querySelector(".wd-message-preview");

  if (messageText || messagePreview) {
    // Create message element
    const messageElement = document.createElement("div");
    messageElement.className = "wd-message sent";

    // Create message content
    const messageContent = document.createElement("div");
    messageContent.className = "wd-message-content";

    // Add text content if exists
    if (messageText) {
      const textContent = document.createElement("div");
      textContent.className = "wd-message-text";
      textContent.innerHTML = messageText;
      messageContent.appendChild(textContent);
    }

    // Add preview content if exists
    if (messagePreview) {
      const previewContent = messagePreview.cloneNode(true);

      // Handle different types of content
      const imagePreview = previewContent.querySelector("img");
      const videoPreview = previewContent.querySelector("video");
      const audioPreview = previewContent.querySelector("audio");
      const filePreview = previewContent.querySelector(".wd-file-info");

      if (imagePreview) {
        const imageContainer = document.createElement("div");
        imageContainer.className = "wd-message-image";
        imagePreview.style.maxWidth = "200px";
        imagePreview.style.maxHeight = "200px";
        imagePreview.style.objectFit = "contain";
        imageContainer.appendChild(imagePreview);
        messageContent.appendChild(imageContainer);
      }

      if (videoPreview) {
        const videoContainer = document.createElement("div");
        videoContainer.className = "wd-message-video";
        videoPreview.style.maxWidth = "300px";
        videoPreview.style.maxHeight = "200px";
        videoPreview.style.objectFit = "contain";
        videoContainer.appendChild(videoPreview);
        messageContent.appendChild(videoContainer);
      }

      if (audioPreview) {
        const audioContainer = document.createElement("div");
        audioContainer.className = "wd-message-audio";
        audioPreview.style.width = "250px";
        audioContainer.appendChild(audioPreview);
        messageContent.appendChild(audioContainer);
      }

      if (filePreview) {
        const fileContainer = document.createElement("div");
        fileContainer.className = "wd-message-file";
        filePreview.style.maxWidth = "250px";
        fileContainer.appendChild(filePreview);
        messageContent.appendChild(fileContainer);
      }
    }

    // Add timestamp
    const timestamp = document.createElement("div");
    timestamp.className = "wd-message-time";
    const now = new Date();
    timestamp.textContent = `${now.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${now.toLocaleDateString("ar-SA")}`;
    messageContent.appendChild(timestamp);

    // Add message to chat window
    messageElement.appendChild(messageContent);
    if (chatWindow) {
      chatWindow.appendChild(messageElement);
    }

    // Clear input and preview
    if (messageInput) {
      messageInput.value = "";
    }
    if (messagePreview) {
      messagePreview.remove();
    }

    // Scroll to bottom
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }
}

// Send message on button click
if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

// Send message on Enter key
if (messageInput) {
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function createMessageElement(message, isSent) {
  const messageElement = document.createElement("div");
  messageElement.className = `wd-message ${isSent ? "sent" : "received"}`;

  // Add action menu
  const actionMenu = document.createElement("div");
  actionMenu.className = "wd-message-actions-menu";

  const replyBtn = document.createElement("button");
  replyBtn.className = "wd-message-action-btn";
  replyBtn.innerHTML = '<i class="fas fa-reply"></i>';
  replyBtn.title = "Reply";
  replyBtn.onclick = (e) => {
    e.stopPropagation();
    handleReply(message);
  };

  const forwardBtn = document.createElement("button");
  forwardBtn.className = "wd-message-action-btn";
  forwardBtn.innerHTML = '<i class="fas fa-share"></i>';
  forwardBtn.title = "Forward";
  forwardBtn.onclick = (e) => {
    e.stopPropagation();
    handleForward(message);
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "wd-message-action-btn";
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.title = "Delete";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    handleDelete(message);
  };

  actionMenu.appendChild(replyBtn);
  actionMenu.appendChild(forwardBtn);
  actionMenu.appendChild(deleteBtn);
  messageElement.appendChild(actionMenu);

  // Add message content
  const contentElement = document.createElement("div");
  contentElement.className = "wd-message-content";

  if (message.type === "text") {
    contentElement.textContent = message.content;
  } else if (message.type === "image") {
    const img = document.createElement("img");
    img.src = message.content;
    contentElement.appendChild(img);
  } else if (message.type === "video") {
    const video = document.createElement("video");
    video.src = message.content;
    video.controls = true;
    contentElement.appendChild(video);
  } else if (message.type === "audio") {
    const audio = document.createElement("audio");
    audio.src = message.content;
    audio.controls = true;
    contentElement.appendChild(audio);
  } else if (message.type === "file") {
    const fileLink = document.createElement("a");
    fileLink.href = message.content;
    fileLink.textContent = message.fileName;
    fileLink.download = message.fileName;
    contentElement.appendChild(fileLink);
  }

  messageElement.appendChild(contentElement);

  // Add timestamp
  const timestamp = document.createElement("div");
  timestamp.className = "wd-message-timestamp";
  timestamp.textContent = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  messageElement.appendChild(timestamp);

  return messageElement;
}

function handleReply(message) {
  // Implement reply functionality
  console.log("Replying to message:", message);
}

function handleForward(message) {
  // Implement forward functionality
  console.log("Forwarding message:", message);
}

function handleDelete(message) {
  // Implement delete functionality
  console.log("Deleting message:", message);
}

function toggleProcedures(button) {
  const dropdown = button.nextElementSibling;
  const isShowing = dropdown.classList.contains("show");

  // Hide all other dropdowns
  document
    .querySelectorAll(".wd-procedures-dropdown.show")
    .forEach((dropdown) => {
      if (dropdown !== button.nextElementSibling) {
        dropdown.classList.remove("show");
      }
    });

  // Toggle current dropdown
  dropdown.classList.toggle("show");
}

function replyMessage(button) {
  const message = button.closest(".wd-message");
  const messageContent = message.querySelector(".wd-message-content");
  const textContent = messageContent.childNodes[0].textContent.trim();
  const messageTime = message.querySelector(".wd-message-time").textContent;

  // Create reply container
  const replyContainer = document.createElement("div");
  replyContainer.className = "wd-reply-container";
  replyContainer.innerHTML = `
    <div class="wd-reply-header">
      <i class="fas fa-reply"></i>
      <span>رد على رسالة</span>
      <button class="wd-close-reply" onclick="closeReply(this)">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="wd-reply-content">
      <div class="wd-reply-text">${textContent}</div>
      <div class="wd-reply-time">${messageTime}</div>
    </div>
  `;

  // Add reply container above input
  const inputContainer = document.querySelector(".wd-message-input");
  inputContainer.parentNode.insertBefore(replyContainer, inputContainer);

  // Hide dropdown
  button.closest(".wd-procedures-dropdown").classList.remove("show");
}

function closeReply(button) {
  button.closest(".wd-reply-container").remove();
}

function addReaction(button) {
  const message = button.closest(".wd-message");
  if (!message) {
    console.error("Message element not found");
    return;
  }

  const messageContent = message.querySelector(".wd-message-content");
  if (!messageContent) {
    console.error("Message content element not found");
    return;
  }

  // Create reaction picker
  const reactionPicker = document.createElement("div");
  reactionPicker.className = "wd-reaction-picker";
  reactionPicker.innerHTML = `
    <div class="wd-reaction-grid">
      <button onclick="addEmoji(this, '👍')" class="wd-reaction-btn">
        <span class="wd-reaction-emoji">👍</span>
      </button>
      <button onclick="addEmoji(this, '❤️')" class="wd-reaction-btn">
        <span class="wd-reaction-emoji">❤️</span>
      </button>
      <button onclick="addEmoji(this, '😂')" class="wd-reaction-btn">
        <span class="wd-reaction-emoji">😂</span>
      </button>
      <button onclick="addEmoji(this, '😮')" class="wd-reaction-btn">
        <span class="wd-reaction-emoji">😮</span>
      </button>
      <button onclick="addEmoji(this, '😢')" class="wd-reaction-btn">
        <span class="wd-reaction-emoji">😢</span>
      </button>
      <button onclick="addEmoji(this, '🙏')" class="wd-reaction-btn">
        <span class="wd-reaction-emoji">🙏</span>
      </button>
    </div>
  `;

  // Position reaction picker relative to the message
  const rect = messageContent.getBoundingClientRect();
  reactionPicker.style.position = "absolute";
  reactionPicker.style.top = `${rect.top - 50}px`;
  reactionPicker.style.left = `${rect.left}px`;
  reactionPicker.style.zIndex = "1000";

  // Add to document
  document.body.appendChild(reactionPicker);

  // Hide dropdown
  const dropdown = button.closest(".wd-procedures-dropdown");
  if (dropdown) {
    dropdown.classList.remove("show");
  }

  // Close picker when clicking outside
  const closePicker = (e) => {
    if (!reactionPicker.contains(e.target)) {
      reactionPicker.remove();
      document.removeEventListener("click", closePicker);
    }
  };
  setTimeout(() => document.addEventListener("click", closePicker), 0);
}

function addEmoji(button, emoji) {
  // Find the closest message element
  const message = button.closest(".wd-message");
  if (!message) {
    console.error("Message element not found");
    return;
  }

  const messageContent = message.querySelector(".wd-message-content");
  if (!messageContent) {
    console.error("Message content element not found");
    return;
  }

  // Get or create reactions container
  let reactionsContainer = messageContent.querySelector(
    ".wd-message-reactions"
  );
  if (!reactionsContainer) {
    reactionsContainer = document.createElement("div");
    reactionsContainer.className = "wd-message-reactions";
    messageContent.appendChild(reactionsContainer);
  }

  // Check if reaction already exists
  let existingReaction = reactionsContainer.querySelector(
    `[data-emoji="${emoji}"]`
  );

  if (existingReaction) {
    // Toggle reaction
    const count = parseInt(existingReaction.dataset.count);
    if (count > 1) {
      existingReaction.dataset.count = count - 1;
      existingReaction.querySelector(".wd-reaction-count").textContent =
        count - 1;
    } else {
      existingReaction.remove();
    }
  } else {
    // Add new reaction
    const reaction = document.createElement("div");
    reaction.className = "wd-message-reaction";
    reaction.dataset.emoji = emoji;
    reaction.dataset.count = "1";
    reaction.innerHTML = `
      <span class="wd-reaction-emoji">${emoji}</span>
      <span class="wd-reaction-count">1</span>
    `;
    reactionsContainer.appendChild(reaction);
  }

  // Remove picker
  const picker = button.closest(".wd-reaction-picker");
  if (picker) {
    picker.remove();
  }
}

function copyMessage(button) {
  const message = button.closest(".wd-message");
  const messageContent = message.querySelector(".wd-message-content");
  // Get only the text content without time and date
  const textContent = messageContent.childNodes[0].textContent.trim();

  // Copy to clipboard
  navigator.clipboard.writeText(textContent).then(() => {
    // Show success feedback
    const feedback = document.createElement("div");
    feedback.className = "wd-copy-feedback";
    feedback.textContent = "تم النسخ بنجاح";
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  });

  // Hide dropdown
  button.closest(".wd-procedures-dropdown").classList.remove("show");
}

function deleteMessage(button) {
  const message = button.closest(".wd-message");

  // Show confirmation
  if (confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
    message.remove();
  }

  // Hide dropdown
  button.closest(".wd-procedures-dropdown").classList.remove("show");
}

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".wd-procedure-btn") &&
    !e.target.closest(".wd-procedures-dropdown")
  ) {
    document
      .querySelectorAll(".wd-procedures-dropdown.show")
      .forEach((dropdown) => {
        dropdown.classList.remove("show");
      });
  }
});

// Drag and drop functionality for contact sections with persistent saving (معطلة)
document.addEventListener("DOMContentLoaded", function () {
  return; // تعطيل وظيفة drag and drop

  const sectionsContainer = document.querySelector(".wd-contact-sections");
  let draggedSection = null;

  // Function to save sections order to localStorage
  function saveSectionsOrder() {
    const sections = document.querySelectorAll(".wd-contact-section");
    const sectionsOrder = [];

    sections.forEach((section, index) => {
      const header = section.querySelector(".wd-section-header h4");
      const sectionId = section.getAttribute("data-section-id");
      if (header && sectionId) {
        sectionsOrder.push({
          id: sectionId,
          title: header.textContent.trim(),
          order: index,
          collapsed: section
            .querySelector(".wd-section-content")
            .classList.contains("collapsed"),
        });
      }
    });

    localStorage.setItem(
      "wd-contact-sections-order",
      JSON.stringify(sectionsOrder)
    );
    console.log("تم حفظ ترتيب الأقسام:", sectionsOrder);
  }

  // Function to restore sections order from localStorage (with migration)
  function restoreSectionsOrder() {
    let savedOrder = localStorage.getItem("wd-contact-sections-order");
    // Migrate from legacy key if needed
    if (!savedOrder) {
      const legacy = localStorage.getItem("contactSectionsOrder");
      if (legacy) {
        try {
          localStorage.setItem("wd-contact-sections-order", legacy);
          savedOrder = legacy;
          // Optional: clean legacy keys
          localStorage.removeItem("contactSectionsOrder");
          localStorage.removeItem("contactSectionsBackup");
        } catch (e) {}
      }
    }
    if (!savedOrder) return;

    try {
      const sectionsOrder = JSON.parse(savedOrder);
      const sections = Array.from(
        document.querySelectorAll(".wd-contact-section")
      );
      const container = sectionsContainer;

      // Sort sections based on saved order
      sectionsOrder.forEach((savedSection) => {
        const section = sections.find((sec) => {
          const sectionId = sec.getAttribute("data-section-id");
          // Use ID if available, otherwise fallback to title
          return savedSection.id
            ? sectionId === savedSection.id
            : sec.querySelector(".wd-section-header h4")?.textContent.trim() ===
                savedSection.title;
        });

        if (section) {
          container.appendChild(section);

          // Restore collapsed/expanded state (active => expanded)
          const content = section.querySelector(".wd-section-content");
          const toggle = section.querySelector(".wd-section-toggle");
          const icon = toggle ? toggle.querySelector("i") : null;
          if (savedSection.collapsed) {
            if (content) content.classList.add("collapsed");
            if (toggle) toggle.classList.remove("active");
            if (icon) icon.className = "fas fa-chevron-right";
          } else {
            if (content) content.classList.remove("collapsed");
            if (toggle) toggle.classList.add("active");
            if (icon) icon.className = "fas fa-chevron-down";
          }
        }
      });

      console.log("تم استعادة ترتيب الأقسام:", sectionsOrder);
    } catch (error) {
      console.error("خطأ في استعادة ترتيب الأقسام:", error);
    }
  }

  // Restore saved order on page load
  restoreSectionsOrder();

  // Add drag and drop event listeners
  function initDragAndDrop() {
    const sections = document.querySelectorAll(".wd-contact-section");

    sections.forEach((section) => {
      // Remove existing listeners to prevent duplicates
      section.removeEventListener("dragstart", handleDragStart);
      section.removeEventListener("dragend", handleDragEnd);
      section.removeEventListener("dragover", handleDragOver);
      section.removeEventListener("dragleave", handleDragLeave);
      section.removeEventListener("drop", handleDrop);

      // Add new listeners
      section.addEventListener("dragstart", handleDragStart);
      section.addEventListener("dragend", handleDragEnd);
      section.addEventListener("dragover", handleDragOver);
      section.addEventListener("dragleave", handleDragLeave);
      section.addEventListener("drop", handleDrop);
    });
  }

  function handleDragStart(e) {
    draggedSection = this;
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    this.classList.remove("dragging");
    draggedSection = null;
    // Save new order after drag ends
    saveSectionsOrder();
  }

  function handleDragOver(e) {
    e.preventDefault();
    this.classList.add("drag-over");
  }

  function handleDragLeave() {
    this.classList.remove("drag-over");
  }

  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove("drag-over");

    if (draggedSection !== this) {
      const allSections = Array.from(
        document.querySelectorAll(".wd-contact-section")
      );
      const draggedIndex = allSections.indexOf(draggedSection);
      const dropIndex = allSections.indexOf(this);

      if (draggedIndex < dropIndex) {
        this.parentNode.insertBefore(draggedSection, this.nextSibling);
      } else {
        this.parentNode.insertBefore(draggedSection, this);
      }
    }
  }

  // Initialize drag and drop
  initDragAndDrop();

  // Toggle section content with saving state
  function initToggleButtons() {
    const toggleButtons = document.querySelectorAll(".wd-section-toggle");
    toggleButtons.forEach((button) => {
      // Remove existing listeners to prevent duplicates
      button.removeEventListener("click", handleToggleClick);
      // Add new listener
      button.addEventListener("click", handleToggleClick);
    });
  }

  function handleToggleClick() {
    const section = this.closest(".wd-contact-section");
    const content = section.querySelector(".wd-section-content");
    this.classList.toggle("active");
    content.classList.toggle("collapsed");

    // Save sections order and state after toggle
    saveSectionsOrder();
  }

  // Initialize toggle buttons
  initToggleButtons();

  // Function to reset sections to default order (optional)
  window.resetSectionsOrder = function () {
    localStorage.removeItem("wd-contact-sections-order");
    localStorage.removeItem("contactSectionsOrder");
    localStorage.removeItem("contactSectionsBackup");
    location.reload(); // Reload page to show default order
  };

  // Function to manually save current order (for debugging)
  window.saveSectionsOrder = saveSectionsOrder;

  // Dropdown functionality
  const dropdownButtons = document.querySelectorAll(".wd-dropdown-btn");
  dropdownButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const dropdown = this.nextElementSibling;
      dropdown.classList.toggle("show");
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".wd-dropdown")) {
      document.querySelectorAll(".wd-dropdown-menu").forEach((menu) => {
        menu.classList.remove("show");
      });
      document.querySelectorAll(".wd-dropdown-submenu").forEach((submenu) => {
        submenu.style.display = "none";
      });
    }
  });

  // Handle dropdown item selection
  const dropdownItems = document.querySelectorAll(".wd-dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function () {
      const dropdown = this.closest(".wd-dropdown");
      const button = dropdown.querySelector(".wd-dropdown-btn");
      const selectedText = this.querySelector("span").textContent;
      button.querySelector("span").textContent = selectedText;
      dropdown.querySelector(".wd-dropdown-menu").classList.remove("show");
    });
  });
});

function initTagsFunctionality() {
  const tagsContainer = document.querySelector(".wd-tags-container");
  if (!tagsContainer) return; // Exit if container doesn't exist

  const tagsDropdown = tagsContainer.querySelector(".wd-tags-dropdown");
  const tagsSearch = tagsContainer.querySelector(".wd-tags-search-input");
  const tagsOptions = tagsContainer.querySelector(".wd-tags-options");
  const addTagBtn = tagsContainer.querySelector(".wd-add-tag-btn");

  if (!tagsDropdown || !tagsSearch || !tagsOptions || !addTagBtn) return; // Exit if any required element is missing

  // Available tags data
  const availableTags = [
    { id: 1, name: "عميل جديد", color: "#28a745" },
    { id: 2, name: "طلب استفسار", color: "#17a2b8" },
    { id: 3, name: "طلب دعم فني", color: "#ffc107" },
    { id: 4, name: "شكوى", color: "#dc3545" },
    { id: 5, name: "اقتراح", color: "#6f42c1" },
  ];

  // Show/hide dropdown
  addTagBtn.addEventListener("click", () => {
    tagsDropdown.classList.toggle("show");
    if (tagsDropdown.classList.contains("show")) {
      tagsSearch.focus();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (tagsContainer && !tagsContainer.contains(e.target)) {
      tagsDropdown.classList.remove("show");
    }
  });

  // Filter tags based on search input
  tagsSearch.addEventListener("input", () => {
    const searchTerm = tagsSearch.value.toLowerCase();
    const filteredTags = availableTags.filter((tag) =>
      tag.name.toLowerCase().includes(searchTerm)
    );
    renderTagsOptions(filteredTags);
  });

  // Render tags options
  function renderTagsOptions(tags) {
    tagsOptions.innerHTML = "";
    tags.forEach((tag) => {
      const option = document.createElement("div");
      option.className = "wd-tag-option";
      option.innerHTML = `
        <div class="wd-tag-color" style="background-color: ${tag.color}"></div>
        <span>${tag.name}</span>
      `;
      option.addEventListener("click", () => addTag(tag));
      tagsOptions.appendChild(option);
    });
  }

  // Add tag to the list
  function addTag(tag) {
    const tagsList = tagsContainer.querySelector(".wd-tags-list");
    const existingTag = tagsList.querySelector(`[data-tag-id="${tag.id}"]`);

    if (!existingTag) {
      const tagElement = document.createElement("div");
      tagElement.className = "wd-tag";
      tagElement.dataset.tagId = tag.id;
      tagElement.innerHTML = `
        <div class="wd-tag-color" style="background-color: ${tag.color}"></div>
        <span>${tag.name}</span>
        <i class="fas fa-times wd-tag-remove"></i>
      `;

      const removeBtn = tagElement.querySelector(".wd-tag-remove");
      removeBtn.addEventListener("click", () => tagElement.remove());

      tagsList.appendChild(tagElement);
    }

    tagsDropdown.classList.remove("show");
    tagsSearch.value = "";
    renderTagsOptions(availableTags);
  }

  // Initial render of tags options
  renderTagsOptions(availableTags);
}

// Initialize tags functionality when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initTagsFunctionality();
});

// Variable Type Dropdown Functions
function toggleVariableTypeDropdown() {
  const menu = document.getElementById("variableTypeMenu");
  menu.classList.toggle("show");
}

function selectVariableType(type) {
  const selectedText = document.getElementById("selectedVariableType");
  const hiddenInput = document.getElementById("variableType");
  const menu = document.getElementById("variableTypeMenu");

  // Update selected text based on type
  switch (type) {
    case "text":
      selectedText.innerHTML =
        '<i class="fas fa-font" style="color: #28a745"></i> نص';
      break;
    case "number":
      selectedText.innerHTML =
        '<i class="fas fa-hashtag" style="color: #17a2b8"></i> رقم';
      break;
    case "boolean":
      selectedText.innerHTML =
        '<i class="fas fa-toggle-on" style="color: #ffc107"></i> قيمة منطقية';
      break;
    case "date":
      selectedText.innerHTML =
        '<i class="fas fa-calendar" style="color: #6f42c1"></i> تاريخ';
      break;
    case "datetime":
      selectedText.innerHTML =
        '<i class="fas fa-clock" style="color: #dc3545"></i> تاريخ ووقت';
      break;
  }

  // Update hidden input value
  hiddenInput.value = type;

  // Hide dropdown
  menu.classList.remove("show");

  // Update preview
  updateVariablePreview();
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const menu = document.getElementById("variableTypeMenu");
  const dropdown = document.querySelector(".wd-variable-type-dropdown");

  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.classList.remove("show");
  }
});

// Contact info navigation functionality
function switchContactInfoSection(section) {
  console.log("Switching to section:", section); // للتأكد من عمل الدالة

  try {
    // Update active state of nav items
    const navItems = document.querySelectorAll(".wd-contact-info-nav-item");
    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.section === section) {
        item.classList.add("active");
        console.log("تم تفعيل التبويب:", item.textContent.trim());
      }
    });

    // Update header title
    const header = document.querySelector(".wd-contact-info-header h3");
    if (header) {
      switch (section) {
        case "info":
          header.textContent = "معلومات جهة الاتصال";
          break;
        case "activity":
          header.textContent = "تحديثات جهة الاتصال";
          break;
        case "orders":
          header.textContent = "طلبات العميل";
          break;
        case "ai":
          header.textContent = "نمط رسائل الذكاء الاصطناعي";
          break;
        case "journeys":
          header.textContent = "رحلات جهة الاتصال";
          break;
        case "reservations":
          header.textContent = "الحجوزات";
          break;
        case "email":
          header.textContent = "البريد الإلكتروني";
          break;
        case "notes":
          header.textContent = "الملاحظات";
          break;
        default:
          header.textContent = "معلومات جهة الاتصال";
          break;
      }
      console.log("تم تحديث العنوان:", header.textContent);
    }

    // Update content
    const content = document.querySelector(".wd-contact-info-content");
    if (content) {
      const newContent = getSectionContent(section);
      console.log("New content:", newContent); // للتأكد من المحتوى
      content.innerHTML = newContent;

      // إعادة تهيئة وظائف السحب والإفلات بعد تغيير المحتوى
      setTimeout(() => {
        console.log("إعادة تهيئة وظائف السحب والإفلات بعد تغيير التبويب...");
        initSectionDragAndDrop();

        // تطبيق الحالات المحفوظة بعد تحميل المحتوى الجديد
        setTimeout(() => {
          console.log("تطبيق الحالات المحفوظة بعد تغيير التبويب...");
          applySectionsState();
        }, 100);
      }, 200);

      console.log("تم تبديل التبويب بنجاح إلى:", section);
    } else {
      console.error("Content element not found");
    }
  } catch (error) {
    console.error("خطأ في تبديل التبويب:", error);
  }
}

function getSectionContent(section) {
  switch (section) {
    case "info":
      return `
        <!-- القسم الأول: معلومات جهة الاتصال الأساسية -->
        <div class="wd-contact-info-main">
          <div class="wd-contact-avatar">
            <span>أ م</span>
          </div>
          <div class="wd-contact-name">أحمد محمد</div>
          <div class="wd-contact-details">
            <div class="wd-contact-detail">
              <i class="fas fa-phone"></i>
              <span>+966501234567</span>
              <button class="wd-copy-btn" onclick="copyText('+966501234567')">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <div class="wd-contact-detail">
              <i class="fas fa-envelope"></i>
              <span>ahmed@example.com</span>
              <button class="wd-copy-btn" onclick="copyText('ahmed@example.com')">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <div class="wd-contact-detail">
              <i class="fas fa-globe"></i>
              <span>المملكة العربية السعودية</span>
            </div>
            <div class="wd-contact-detail">
              <i class="fas fa-circle"></i>
              <span>مشترك</span>
            </div>
          </div>

          <div class="wd-contact-actions">
            <button class="wd-action-btn" title="بدء محادثة جديدة">
              <i class="fas fa-comment"></i>
            </button>
            <button class="wd-action-btn" title="تعديل جهة الاتصال">
              <i class="fas fa-edit"></i>
            </button>
            <button class="wd-action-btn" title="حذف المحادثة">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- القسم الثاني: أقسام المحادثة التفصيلية -->
        <div class="wd-contact-sections">

          <!-- قسم إجراءات المحادثة -->
          <div class="wd-contact-section" data-section-id="conversation-actions">
            <div class="wd-section-header">
              <h4>إجراءات المحادثة</h4>
            </div>
            <div class="wd-section-content">
              <div class="wd-conversation-action">
                <label>الموظف المكلف</label>
                <div class="wd-dropdown">
                  <button class="wd-dropdown-btn">
                    <span>اختر موظف</span>
                    <i class="fas fa-chevron-down"></i>
                  </button>
                  <div class="wd-dropdown-menu">
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>نورة</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>أحمد</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>سارة</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>سارة</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>سارة</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>سارة</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>سارة</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>سارة</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>سارة</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-user"></i>
                      <span>سارة</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="wd-conversation-action">
                <label>الفريق المكلف</label>
                <div class="wd-dropdown">
                  <button class="wd-dropdown-btn">
                    <span>اختر فريق</span>
                    <i class="fas fa-chevron-down"></i>
                  </button>
                  <div class="wd-dropdown-menu">
                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق الدعم الفني</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق التسويق</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق المبيعات</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق المبيعات</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق المبيعات</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق المبيعات</span>
                    </div>

                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق المبيعات</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق المبيعات</span>
                    </div>
                    <div class="wd-dropdown-item">
                      <i class="fas fa-users"></i>
                      <span>فريق المبيعات</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="wd-conversation-action">
                <label>وسوم المحادثة</label>
                <div class="wd-tags-container">
                  <button class="wd-add-tag-btn" onclick="toggleTagsDropdown(this)">
                    <i class="fas fa-plus"></i>
                    إضافة وسم
                  </button>
                  <div class="wd-tags-list">
                    <!-- سيتم إضافة الوسوم هنا ديناميكياً -->
                  </div>
                </div>

                <div class="wd-tags-dropdown" id="tagsDropdown">
                  <div class="wd-tags-search">
                    <input type="text" placeholder="ابحث عن وسم..." class="wd-tags-search-input" oninput="filterTags(this.value)">
                    <i class="fas fa-search"></i>
                  </div>
                  <div class="wd-tags-options">
                    <div class="wd-tag-option" onclick="addTag('باقة الأعمال', '#ff6b6b')">
                      <span class="wd-tag-color" style="background-color: #ff6b6b"></span>
                      <span>باقة الأعمال</span>
                    </div>
                    <div class="wd-tag-option" onclick="addTag('باقة الأعمال برو', '#4ecdc4')">
                      <span class="wd-tag-color" style="background-color: #4ecdc4"></span>
                      <span>باقة الأعمال برو</span>
                    </div>
                    <div class="wd-tag-option" onclick="addTag('الباقة الاحترافية', '#45b7d1')">
                      <span class="wd-tag-color" style="background-color: #45b7d1"></span>
                      <span>الباقة الاحترافية</span>
                    </div>
                    <div class="wd-tag-option" onclick="addTag('عميل مهم', '#f39c12')">
                      <span class="wd-tag-color" style="background-color: #f39c12"></span>
                      <span>عميل مهم</span>
                    </div>
                    <div class="wd-tag-option" onclick="addTag('متابعة مطلوبة', '#e74c3c')">
                      <span class="wd-tag-color" style="background-color: #e74c3c"></span>
                      <span>متابعة مطلوبة</span>
                    </div>
                    <div class="wd-tag-option" onclick="addTag('عميل جديد', '#27ae60')">
                      <span class="wd-tag-color" style="background-color: #27ae60"></span>
                      <span>عميل جديد</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

                    <!-- قسم متغيرات المحادثة -->
          <div class="wd-contact-section" data-section-id="conversation-variables">
            <div class="wd-section-header">
              <h4>متغيرات المحادثة</h4>
            </div>
            <div class="wd-section-content">
              <div class="wd-variable-item">
                <div class="wd-variable-header">
                  <span class="wd-variable-name">اسم العميل</span>
                  <div class="wd-variable-actions">
                    <button class="wd-variable-action-btn" onclick="editVariable(this)" title="تعديل">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="wd-variable-action-btn" onclick="copyVariable(this)" title="نسخ">
                      <i class="fas fa-copy"></i>
                    </button>
                    <button class="wd-variable-action-btn wd-delete-btn" onclick="deleteVariable(this)" title="حذف">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <span class="wd-variable-value" data-variable="اسم العميل">أحمد محمد</span>
              </div>
              <div class="wd-variable-item">
                <div class="wd-variable-header">
                  <span class="wd-variable-name">رقم الهاتف</span>
                  <div class="wd-variable-actions">
                    <button class="wd-variable-action-btn" onclick="editVariable(this)" title="تعديل">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="wd-variable-action-btn" onclick="copyVariable(this)" title="نسخ">
                      <i class="fas fa-copy"></i>
                    </button>
                    <button class="wd-variable-action-btn wd-delete-btn" onclick="deleteVariable(this)" title="حذف">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <span class="wd-variable-value" data-variable="رقم الهاتف">+966501234567</span>
              </div>
              <div class="wd-variable-item">
                <div class="wd-variable-header">
                  <span class="wd-variable-name">البريد الإلكتروني</span>
                  <div class="wd-variable-actions">
                    <button class="wd-variable-action-btn" onclick="editVariable(this)" title="تعديل">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="wd-variable-action-btn" onclick="copyVariable(this)" title="نسخ">
                      <i class="fas fa-copy"></i>
                    </button>
                    <button class="wd-variable-action-btn wd-delete-btn" onclick="deleteVariable(this)" title="حذف">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <span class="wd-variable-value" data-variable="البريد الإلكتروني">ahmed@example.com</span>
              </div>
              <div class="wd-variable-item">
                <div class="wd-variable-header">
                  <span class="wd-variable-name">المدينة</span>
                  <div class="wd-variable-actions">
                    <button class="wd-variable-action-btn" onclick="editVariable(this)" title="تعديل">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="wd-variable-action-btn" onclick="copyVariable(this)" title="نسخ">
                      <i class="fas fa-copy"></i>
                    </button>
                    <button class="wd-variable-action-btn wd-delete-btn" onclick="deleteVariable(this)" title="حذف">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <span class="wd-variable-value" data-variable="المدينة">الرياض</span>
              </div>
            </div>
          </div>


          <!-- قسم معلومات المحادثة -->
          <div class="wd-contact-section" data-section-id="conversation-info">
            <div class="wd-section-header">
              <h4>معلومات المحادثة</h4>
            </div>
            <div class="wd-section-content">
              <div class="wd-contact-detail">
                <i class="fas fa-calendar"></i>
                <span>تاريخ الإنشاء: 2024-03-15</span>
              </div>
              <div class="wd-contact-detail">
                <i class="fas fa-circle"></i>
                <span>الحالة: نشط</span>
              </div>
              <div class="wd-contact-detail">
                <i class="fas fa-clock"></i>
                <span>آخر نشاط: منذ 5 دقائق</span>
              </div>
              <div class="wd-contact-detail">
                <i class="fas fa-language"></i>
                <span>اللغة: العربية</span>
              </div>
              <div class="wd-contact-detail">
                <i class="fas fa-robot"></i>
                <span>الرد الآلي: مفعل</span>
                <button class="wd-action-btn" title="تفعيل/إلغاء تفعيل الرد الآلي">
                  <i class="fas fa-toggle-on"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- قسم المحادثات السابقة -->
          <div class="wd-contact-section" data-section-id="previous-conversations">
            <div class="wd-section-header">
              <h4>المحادثات السابقة</h4>
            </div>
            <div class="wd-section-content">
              <div class="wd-previous-conversations">
                <div class="wd-conversation-item">
                  <div class="wd-conversation-preview">
                    <span>مرحباً، كيف يمكنني مساعدتك اليوم؟</span>
                  </div>
                  <div class="wd-conversation-meta">
                    <span class="wd-conversation-time">10:30 ص</span>
                    <span class="wd-conversation-date">2024-03-20</span>
                  </div>
                </div>
                <div class="wd-conversation-item">
                  <div class="wd-conversation-preview">
                    <span>شكراً على مساعدتك</span>
                  </div>
                  <div class="wd-conversation-meta">
                    <span class="wd-conversation-time">09:15 ص</span>
                    <span class="wd-conversation-date">2024-03-19</span>
                  </div>
                </div>
                <div class="wd-conversation-item">
                  <div class="wd-conversation-preview">
                    <span>هل يمكنني تغيير موعد التسليم؟</span>
                  </div>
                  <div class="wd-conversation-meta">
                    <span class="wd-conversation-time">02:45 م</span>
                    <span class="wd-conversation-date">2024-03-18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    case "ai":
      return `

        <!-- قسم نمط الرسالة -->
        <div class="wd-ai-section-container">
          <div class="wd-ai-section">
            <div class="wd-ai-section-header">
              <h4><i class="fas fa-palette"></i> نمط الرسالة</h4>
            </div>
            <div class="wd-ai-section-content">
              <div class="wd-ai-style">
                <textarea class="wd-ai-textarea" placeholder="اكتب الرسالة هنا..."></textarea>
                <div class="wd-ai-options">
                  <div class="wd-ai-option professional" onclick="selectAIStyle('professional')">احترافي</div>
                  <div class="wd-ai-option relaxed" onclick="selectAIStyle('relaxed')">مرن</div>
                  <div class="wd-ai-option friendly" onclick="selectAIStyle('friendly')">ودي</div>
                  <div class="wd-ai-option formal" onclick="selectAIStyle('formal')">رسمي</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- قسم توليد الملخص -->
        <div class="wd-ai-section-container">
          <div class="wd-ai-section">
            <div class="wd-ai-section-header">
              <h4><i class="fas fa-file-alt"></i>ملخص المحادثة</h4>
            </div>
            <div class="wd-ai-section-content">
              <div class="wd-ai-summary">
                <button class="wd-ai-btn" onclick="generateSummary()">توليد ملخص المحادثة</button>
              </div>
            </div>
          </div>
        </div>

        <!-- قسم الأسئلة للذكاء الاصطناعي -->
        <div class="wd-ai-section-container">
          <div class="wd-ai-section">
            <div class="wd-ai-section-header">
              <h4><i class="fas fa-robot"></i>اسأل الذكاء الاصطناعي</h4>
            </div>
            <div class="wd-ai-section-content">
              <div class="wd-ai-question">
                <textarea placeholder="اكتب سؤالك للذكاء الاصطناعي هنا..."></textarea>
                <button class="wd-ai-btn" onclick="askAI()">اسأل الذكاء الاصطناعي</button>
              </div>
            </div>
          </div>
        </div>
      `;
    case "journeys":
      return `
        <div class="wd-journeys-section">
          <div class="wd-journey-item">
            <div class="wd-journey-info">
              <h4>رحلة المبيعات</h4>
              <p>تم إنشاؤها في 2024-03-15</p>
            </div>
            <div class="wd-journey-actions">
              <button class="wd-journey-btn edit" title="تعديل الرحلة">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
          
          <div class="wd-journey-item">
            <div class="wd-journey-info">
              <h4>رحلة الدعم الفني</h4>
              <p>تم إنشاؤها في 2024-03-10</p>
            </div>
            <div class="wd-journey-actions">
              <button class="wd-journey-btn edit" title="تعديل الرحلة">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>

          <div class="wd-journey-manage">
            <button class="wd-journey-btn manage">
              <i class="fas fa-cog"></i>
              <span>إدارة الرحلات</span>
            </button>
          </div>
        </div>
      `;
    case "email":
      return `
        <div class="wd-email-section">
          <div class="wd-email-form">
            <div class="wd-email-field">
              <label>إرسال بريد إلكتروني</label>
              <input type="email" class="wd-email-input" placeholder="البريد الإلكتروني للمستلم">
            </div>
            <div class="wd-email-field">
              <label>قالب البريد الإلكتروني</label>
              <select class="wd-email-select">
                <option>اختر قالب...</option>
                <option>ترحيب</option>
                <option>متابعة</option>
                <option>تأكيد</option>
              </select>
            </div>
            <div class="wd-email-field">
              <label>الموضوع</label>
              <input type="text" class="wd-email-input" placeholder="موضوع البريد الإلكتروني">
            </div>
            <div class="wd-email-field">
              <label>الرسالة</label>
              <textarea class="wd-email-textarea" placeholder="اكتب رسالتك هنا..."></textarea>
            </div>
            <button class="wd-email-send">إرسال البريد الإلكتروني</button>
            <div class="wd-email-warning hidden">
              لم يتم تعيين عنوان بريد إلكتروني لهذه جهة الاتصال. يرجى إضافة عنوان بريد إلكتروني قبل الإرسال.
            </div>
          </div>
        </div>
      `;
    case "notes":
      return `
        <div class="wd-notes-section">
          <div class="wd-notes-input">
            <textarea class="wd-notes-textarea" placeholder="أضف ملاحظة..."></textarea>
            <button class="wd-notes-add">إضافة ملاحظة</button>
          </div>
          <div class="wd-notes-list">
            <div class="wd-note-item">
              <p>ملاحظة مهمة للعميل</p>
              <span class="wd-note-time">2024-03-15 14:30</span>
            </div>
          </div>
        </div>
      `;
    case "reservations":
      return `
        <div class="wd-reservations-section">
          <div class="wd-reservation-item">
            <div class="wd-reservation-info">
              <h4>حجز رقم #12345</h4>
              <p>تاريخ الحجز: 2024-03-18</p>
              <p>الحالة: مكتمل</p>
            </div>
          </div>
          
          <div class="wd-reservation-item">
            <div class="wd-reservation-info">
              <h4>حجز رقم #12344</h4>
              <p>تاريخ الحجز: 2024-03-15</p>
              <p>الحالة: مكتمل</p>
            </div>
          </div>

          <div class="wd-reservation-item">
            <div class="wd-reservation-info">
              <h4>حجز رقم #12343</h4>
              <p>تاريخ الحجز: 2024-03-10</p>
              <p>الحالة: مكتمل</p>
            </div>
          </div>
        </div>
      `;
    case "orders":
      return `
        <div>
          <div class="wd-contact-orders">
            <div class="wd-contact-order">
              <div class="wd-contact-order-header">
                <div class="wd-contact-order-header-left">
                  <span class="wd-contact-order-number">#1254</span>
                  <span class="wd-contact-order-name">باقة الأعمال برو</span>
                </div>
                <span class="wd-contact-order-status completed">مكتمل</span>
              </div>
              <div class="wd-contact-order-meta">
                <span>199 ر.س</span>
                <span>20/01/2025</span>
              </div>
            </div>
            <div class="wd-contact-order">
              <div class="wd-contact-order-header">
                <div class="wd-contact-order-header-left">
                  <span class="wd-contact-order-number">#1240</span>
                  <span class="wd-contact-order-name">باقة الأعمال</span>
                </div>
                <span class="wd-contact-order-status pending">قيد المعالجة</span>
              </div>
              <div class="wd-contact-order-meta">
                <span>149 ر.س</span>
                <span>12/01/2025</span>
              </div>
            </div>
            <div class="wd-contact-order">
              <div class="wd-contact-order-header">
                <div class="wd-contact-order-header-left">
                  <span class="wd-contact-order-number">#1205</span>
                  <span class="wd-contact-order-name">الباقة التجريبية</span>
                </div>
                <span class="wd-contact-order-status cancelled">ملغي</span>
              </div>
              <div class="wd-contact-order-meta">
                <span>0 ر.س</span>
                <span>01/01/2025</span>
              </div>
            </div>
          </div>
        </div>
      `;
    case "activity":
      return `
        <div>
          <div class="wd-activity-message">
            <div class="wd-activity-content">
              <span class="wd-activity-user">أنس</span>
              حدث
              <strong>البريد الإلكتروني</strong>
              من
              <span class="wd-activity-old-value">old@example.com</span>
              إلى
              <span class="wd-activity-new-value">ahmed@example.com</span>
              <span class="wd-activity-time">10:15 ص - 2025-01-10</span>
            </div>
          </div>
          <div class="wd-activity-message">
            <div class="wd-activity-content">
              <span class="wd-activity-user">أنس</span>
              حدث
              <strong>حالة العميل</strong>
              من
              <span class="wd-activity-old-value">مهتم</span>
              إلى
              <span class="wd-activity-new-value">مشترك</span>
              <span class="wd-activity-time">11:05 ص - 2025-01-12</span>
            </div>
          </div>
          <div class="wd-activity-message">
            <div class="wd-activity-content">
              <span class="wd-activity-user">أنس</span>
              أضاف وسم
              <strong class="wd-activity-new-value">عميل مميز</strong>
              <span class="wd-activity-time">09:30 م - 2025-01-15</span>
            </div>
          </div>
        </div>
      `;
  }
}

// Initialize contact info navigation
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing contact info navigation");

  const navItems = document.querySelectorAll(".wd-contact-info-nav-item");
  console.log("Found nav items:", navItems.length);

  if (navItems.length > 0) {
    navItems.forEach((item) => {
      console.log("إضافة event listener للتبويب:", item.dataset.section);

      item.addEventListener("click", function () {
        console.log("Nav item clicked:", this.dataset.section);
        switchContactInfoSection(this.dataset.section);
      });
    });

    // تهيئة المحتوى الأولي
    switchContactInfoSection("info");
    console.log("تم تهيئة التبويبات بنجاح");
  } else {
    console.warn("لم يتم العثور على أزرار التبويبات في التهيئة الأولية");
  }
});

// إضافة event delegation شامل للتبويبات والأقسام
document.addEventListener("click", function (event) {
  // السماح بالتنقل الطبيعي خارج مكون معلومات جهة الاتصال
  const contactInfoRoot = document.querySelector(".wd-contact-info");
  if (!contactInfoRoot) return; // لا يوجد مكون، لا نتدخل
  if (!event.target.closest(".wd-contact-info")) {
    return; // النقر خارج المكون، لا نتدخل
  }

  // السماح للروابط الحقيقية داخل المكون بالتنقل إذا كانت تحتوي على href صالح
  const anchorEl = event.target.closest("a[href]");
  if (anchorEl) {
    const href = anchorEl.getAttribute("href");
    if (href && href !== "#" && !href.startsWith("javascript:")) {
      return; // دع المتصفح يتنقل بشكل طبيعي
    }
  }

  // منع السلوك الافتراضي داخل المكون فقط
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  console.log("تم النقر على:", event.target.tagName, event.target.className);

  // 1. معالجة التبويبات
  const navItem = event.target.closest(".wd-contact-info-nav-item");
  if (navItem && navItem.dataset.section) {
    console.log("تم النقر على التبويب:", navItem.dataset.section);

    // تبديل التبويب
    switchContactInfoSection(navItem.dataset.section);

    // حفظ الحالة بعد التبديل
    setTimeout(() => {
      console.log("حفظ الحالة بعد التبديل...");
      saveSectionsOrder();
    }, 300);

    return; // إيقاف المعالجة
  }

  // 2. معالجة أزرار التبديل والأقسام
  let toggleButton = null;
  let clickedElement = event.target;

  // البحث عن زر التبديل
  if (
    clickedElement.matches(
      ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
    )
  ) {
    toggleButton = clickedElement;
  } else if (clickedElement.matches("i.fas")) {
    // البحث عن الأيقونة
    toggleButton = clickedElement.closest(
      ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
    );
  } else if (clickedElement.matches("h4")) {
    // البحث عن العنوان
    toggleButton = clickedElement.closest(
      ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
    );
  } else if (clickedElement.closest(".wd-section-header")) {
    // البحث عن header القسم
    toggleButton = clickedElement.closest(
      ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
    );
  } else if (
    clickedElement.closest(
      ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
    )
  ) {
    // البحث عن أي عنصر داخل زر التبديل
    toggleButton = clickedElement.closest(
      ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
    );
  }

  // إذا لم نجد زر التبديل، ابحث عن أي عنصر يحتوي على أيقونة
  if (
    !toggleButton &&
    clickedElement.matches("i.fas.fa-chevron-down, i.fas.fa-chevron-up")
  ) {
    toggleButton = clickedElement.closest(
      ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
    );
  }

  // إذا لم نجد زر التبديل، ابحث عن أي عنصر يحتوي على أيقونة
  if (!toggleButton && clickedElement.matches("i.fas")) {
    toggleButton = clickedElement.closest(
      ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
    );
  }

  if (toggleButton) {
    console.log("تم النقر على زر التبديل:", toggleButton.className);

    const section = toggleButton.closest(
      ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
    );

    if (section) {
      const sectionContent = section.querySelector(
        ".wd-section-content, .wd-ai-section-content, .wd-journeys-content, .wd-email-content, .wd-notes-content, .wd-reservations-content"
      );

      if (sectionContent) {
        // تبديل الحالة
        const isCurrentlyOpen = sectionContent.style.display !== "none";
        sectionContent.style.display = isCurrentlyOpen ? "none" : "block";

        // تحديث الزر
        if (isCurrentlyOpen) {
          toggleButton.classList.remove("active");
          toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        } else {
          toggleButton.classList.add("active");
          toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }

        // حفظ الحالة الجديدة
        setTimeout(() => {
          console.log("حفظ الحالة بعد تغيير القسم");
          saveSectionsOrder();
        }, 100);

        console.log("تم تبديل حالة القسم:", {
          section: section.className,
          newState: isCurrentlyOpen ? "مغلق" : "مفتوح",
        });

        return; // إيقاف المعالجة
      }
    }
  }

  // إذا لم يتم التعامل مع الحدث، إعادة تفعيل السلوك الافتراضي
  event.preventDefault = function () {};
  event.stopPropagation = function () {};
  event.stopImmediatePropagation = function () {};
});

// دالة جديدة لتطبيق الحالات المحفوظة بشكل دقيق
function applySectionsState() {
  console.log("بدء تطبيق الحالات المحفوظة...");

  const sectionsContainer = document.querySelector(".wd-contact-sections");
  if (!sectionsContainer) {
    console.warn("لم يتم العثور على حاوية الأقسام");
    return;
  }

  const savedOrder = localStorage.getItem("wd-contact-sections-order");
  if (!savedOrder) {
    console.log("لا توجد بيانات محفوظة");
    return;
  }

  try {
    const parsedData = JSON.parse(savedOrder);
    if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
      console.warn("بيانات غير صحيحة");
      return;
    }

    console.log(`تم العثور على ${parsedData.sections.length} قسم محفوظ`);

    parsedData.sections.forEach((item, index) => {
      if (item.isOpen !== undefined) {
        // البحث عن القسم باستخدام عدة طرق
        let section = null;

        // البحث بالـ ID أولاً
        if (item.id) {
          section = sectionsContainer.querySelector(`[id="${item.id}"]`);
        }

        // البحث بالـ className
        if (!section && item.className) {
          const classNames = item.className.split(" ");
          for (const className of classNames) {
            section = sectionsContainer.querySelector(`.${className}`);
            if (section) break;
          }
        }

        // البحث بالـ type
        if (!section && item.type) {
          section = sectionsContainer.querySelector(`.${item.type}`);
        }

        // البحث بالعنوان
        if (!section && item.sectionTitle) {
          const allSections = sectionsContainer.querySelectorAll(
            ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
          );
          section = Array.from(allSections).find((s) => {
            const titleElement = s.querySelector("h4");
            return (
              titleElement &&
              titleElement.textContent.includes(item.sectionTitle)
            );
          });
        }

        if (section) {
          const sectionContent = section.querySelector(
            ".wd-section-content, .wd-ai-section-content, .wd-journeys-content, .wd-email-content, .wd-notes-content, .wd-reservations-content"
          );
          const toggleButton = section.querySelector(
            ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
          );

          if (sectionContent && toggleButton) {
            // تطبيق الحالة المحفوظة
            if (item.isOpen) {
              sectionContent.style.display = "block";
              toggleButton.classList.add("active");
              toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
            } else {
              sectionContent.style.display = "none";
              toggleButton.classList.remove("active");
              toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }

            // تطبيق حالة الزر
            if (item.isToggleActive !== undefined) {
              if (item.isToggleActive) {
                toggleButton.classList.add("active");
              } else {
                toggleButton.classList.remove("active");
              }
            }

            console.log(`تم تطبيق الحالة للقسم ${index + 1}:`, {
              type: item.type,
              isOpen: item.isOpen,
              isToggleActive: item.isToggleActive,
              sectionFound: true,
            });
          }
        } else {
          console.warn(`لم يتم العثور على القسم:`, item.type, item.id);
        }
      }
    });

    console.log("تم تطبيق جميع الحالات المحفوظة بنجاح");
  } catch (error) {
    console.error("خطأ في تطبيق الحالات:", error);
  }
}

// دوال التفاعل مع قسم الذكاء الاصطناعي
function selectAIStyle(style) {
  // إزالة التحديد من جميع الخيارات
  document.querySelectorAll(".wd-ai-option").forEach((option) => {
    option.classList.remove("selected");
  });

  // تحديد الخيار المختار
  const selectedOption = document.querySelector(`.wd-ai-option.${style}`);
  if (selectedOption) {
    selectedOption.classList.add("selected");
  }

  // تحديث نص النمط في textarea
  const textarea = document.querySelector(".wd-ai-textarea");
  if (textarea) {
    const styleTexts = {
      professional:
        "أنت مساعد احترافي ومهني. استخدم لغة رسمية ومهنية في ردودك.",
      relaxed: "أنت مساعد ودود ومرن. استخدم لغة بسيطة ومريحة في ردودك.",
      friendly: "أنت مساعد ودود ومحب. استخدم لغة دافئة ومشجعة في ردودك.",
      formal: "أنت مساعد رسمي ومحترم. استخدم لغة رسمية ومهذبة في ردودك.",
    };
    textarea.value = styleTexts[style] || "";
  }
}

function generateSummary() {
  const button = event.target;
  const originalText = button.textContent;
  const summaryContainer = button.parentElement;

  // تغيير نص الزر لإظهار التحميل
  button.textContent = "جاري التوليد...";
  button.disabled = true;

  // إزالة مربع الملخص السابق إن وجد
  const existingSummary = summaryContainer.querySelector(".wd-summary-box");
  if (existingSummary) {
    existingSummary.remove();
  }

  // محاكاة عملية التوليد
  setTimeout(() => {
    button.textContent = "تم التوليد بنجاح!";

    // إنشاء مربع الملخص
    const summaryBox = document.createElement("div");
    summaryBox.className = "wd-summary-box";
    summaryBox.innerHTML = `
      <div class="wd-summary-header">
        <h5><i class="fas fa-file-alt"></i> ملخص المحادثة</h5>
        <button class="wd-copy-summary-btn" onclick="copySummary(this)" title="نسخ الملخص">
          <i class="fas fa-copy"></i>
        </button>
      </div>
              <div class="wd-summary-content">
          <p>المستخدم مهتم باستئجار مساحة لحفلة بطابع "ريترو آركيد" تتسع لحوالي 50-60 ضيفًا في الخامس عشر من الشهر المقبل. يوفر الوكيل مساحات مناسبة للفعاليات، ويمكنه تنسيق ديكورات تتناسب مع الطابع. يناقشان وسائل الراحة، مثل أنظمة الصوت وخدمات الطعام، ويعرض الوكيل قائمة بالخيارات وقوائم الطعام المتاحة. يسأل المستخدم عن مدة الإيجار والأسعار وتوافر مواقف السيارات، فيقدم الوكيل تفاصيل ويعرض إرسال بريد إلكتروني يتضمن خيارات التسعير المفصلة. يشكر المستخدم الوكيل ويؤكد أنه سيراجع التفاصيل ويتواصل معه قريبًا.</p>
        </div>
    `;

    // إضافة مربع الملخص بعد الزر
    summaryContainer.appendChild(summaryBox);

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }, 2000);
}

function askAI() {
  const textarea = event.target.previousElementSibling;
  const question = textarea.value.trim();

  if (!question) {
    alert("يرجى كتابة سؤال للذكاء الاصطناعي");
    return;
  }

  const button = event.target;
  const originalText = button.textContent;
  const questionContainer = button.parentElement;

  // تغيير نص الزر لإظهار التحميل
  button.textContent = "جاري الإجابة...";
  button.disabled = true;

  // إزالة مربع الإجابة السابق إن وجد
  const existingAnswer = questionContainer.querySelector(".wd-answer-box");
  if (existingAnswer) {
    existingAnswer.remove();
  }

  // محاكاة عملية الإجابة
  setTimeout(() => {
    button.textContent = "تم الإجابة!";

    // إنشاء مربع الإجابة
    const answerBox = document.createElement("div");
    answerBox.className = "wd-answer-box";
    answerBox.innerHTML = `
      <div class="wd-answer-header">
        <h5><i class="fas fa-robot"></i> إجابة الذكاء الاصطناعي</h5>
        <button class="wd-copy-answer-btn" onclick="copyAnswer(this)" title="نسخ الإجابة">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="wd-answer-content">
        <div class="wd-answer-text">
          <p>كيف يمكن للوكيل مساعدة المستخدم في مراجعة التفاصيل واتخاذ قرار بشأن استئجار مساحة الحدث للحفلة ذات الطابع "الريترو آركيد"؟</p>
        </div>
      </div>
    `;

    // إضافة مربع الإجابة بعد الزر
    questionContainer.appendChild(answerBox);

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }, 2000);
}

function copySummary(button) {
  const summaryBox = button.closest(".wd-summary-box");
  const summaryText = summaryBox.querySelector(
    ".wd-summary-content p"
  ).textContent;

  // نسخ النص إلى الحافظة
  navigator.clipboard
    .writeText(summaryText)
    .then(() => {
      // تغيير أيقونة الزر مؤقتاً
      const icon = button.querySelector("i");
      const originalClass = icon.className;
      icon.className = "fas fa-check";
      button.style.color = "#00bc60";

      setTimeout(() => {
        icon.className = originalClass;
        button.style.color = "";
      }, 2000);
    })
    .catch(() => {
      alert("فشل في نسخ الملخص");
    });
}

function copyAnswer(button) {
  const answerBox = button.closest(".wd-answer-box");
  const answerText = answerBox.querySelector(".wd-answer-text").textContent;

  // نسخ النص إلى الحافظة
  navigator.clipboard
    .writeText(answerText)
    .then(() => {
      // تغيير أيقونة الزر مؤقتاً
      const icon = button.querySelector("i");
      const originalClass = icon.className;
      icon.className = "fas fa-check";
      button.style.color = "#00bc60";

      setTimeout(() => {
        icon.className = originalClass;
        button.style.color = "";
      }, 2000);
    })
    .catch(() => {
      alert("فشل في نسخ الإجابة");
    });
}

// دوال التفاعل مع أقسام معلومات جهة الاتصال (معطلة - القوائم مفتوحة دائماً)
function toggleSection(sectionId) {
  return; // تعطيل toggle - القوائم مفتوحة دائماً

  const section = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (section) {
    const content = section.querySelector(".wd-section-content");
    const toggle = section.querySelector(".wd-section-toggle");
    const icon = toggle.querySelector("i");

    if (content.classList.contains("collapsed")) {
      content.classList.remove("collapsed");
      toggle.classList.add("active");
      icon.className = "fas fa-chevron-down";
    } else {
      content.classList.add("collapsed");
      toggle.classList.remove("active");
      icon.className = "fas fa-chevron-right";
    }
  }
}

function toggleTagsDropdown(button) {
  const dropdown = document.getElementById("tagsDropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

function filterTags(searchTerm) {
  const options = document.querySelectorAll(".wd-tag-option");
  options.forEach((option) => {
    const text = option
      .querySelector("span:last-child")
      .textContent.toLowerCase();
    if (text.includes(searchTerm.toLowerCase())) {
      option.style.display = "flex";
    } else {
      option.style.display = "none";
    }
  });
}

function addTag(tagName, color) {
  const tagsList = document.querySelector(".wd-tags-list");
  if (tagsList) {
    const tagElement = document.createElement("div");
    tagElement.className = "wd-tag";
    tagElement.innerHTML = `
      <span class="wd-tag-color" style="background-color: ${color}"></span>
      <span>${tagName}</span>
      <button class="wd-remove-tag-btn" onclick="removeTag(this)">
        <i class="fas fa-times"></i>
      </button>
    `;
    tagsList.appendChild(tagElement);
  }

  // إغلاق القائمة المنسدلة
  const dropdown = document.getElementById("tagsDropdown");
  if (dropdown) {
    dropdown.classList.remove("show");
  }
}

function removeTag(button) {
  const tag = button.parentElement;
  tag.remove();
}

// إضافة مستمعي الأحداث للأقسام القابلة للطي
document.addEventListener("DOMContentLoaded", function () {
  // ربط أحداث الأقسام القابلة للطي
  document.addEventListener("click", function (event) {
    if (event.target.closest(".wd-section-toggle")) {
      const toggle = event.target.closest(".wd-section-toggle");
      const section = toggle.closest(".wd-contact-section");
      const sectionId = section.dataset.sectionId;
      toggleSection(sectionId);
    }
  });

  // إغلاق قائمة الوسوم عند النقر خارجها
  document.addEventListener("click", function (event) {
    const tagsDropdown = document.getElementById("tagsDropdown");
    if (
      tagsDropdown &&
      !event.target.closest(".wd-tags-container") &&
      !event.target.closest("#tagsDropdown")
    ) {
      tagsDropdown.classList.remove("show");
    }
  });

  // ربط أحداث الأزرار في الأقسام
  document.addEventListener("click", function (event) {
    // زر تفعيل/إلغاء تفعيل الرد الآلي
    if (event.target.closest('.wd-action-btn[title*="الرد الآلي"]')) {
      const button = event.target.closest(".wd-action-btn");
      const icon = button.querySelector("i");
      if (icon.classList.contains("fa-toggle-on")) {
        icon.className = "fas fa-toggle-off";
        icon.style.color = "#999";
      } else {
        icon.className = "fas fa-toggle-on";
        icon.style.color = "#00bc60";
      }
    }

    // أزرار القوائم المنسدلة
    if (event.target.closest(".wd-dropdown-btn")) {
      const dropdown = event.target.closest(".wd-dropdown");
      const menu = dropdown.querySelector(".wd-dropdown-menu");
      const allMenus = document.querySelectorAll(".wd-dropdown-menu");

      // إغلاق جميع القوائم المفتوحة
      allMenus.forEach((m) => {
        if (m !== menu) m.classList.remove("show");
      });

      // تبديل القائمة الحالية
      menu.classList.toggle("show");
    }

    // اختيار عنصر من القائمة المنسدلة
    if (event.target.closest(".wd-dropdown-item")) {
      const item = event.target.closest(".wd-dropdown-item");
      const dropdown = item.closest(".wd-dropdown");
      const button = dropdown.querySelector(".wd-dropdown-btn span");
      const text = item.querySelector("span").textContent;

      button.textContent = text;
      dropdown.querySelector(".wd-dropdown-menu").classList.remove("show");
    }
  });
});

// وظائف قائمة الفلتر الجديدة
function toggleFilterMenu() {
  const filterMenu = document.getElementById("filterMenu");
  filterMenu.classList.toggle("show");
  event.stopPropagation(); // منع انتشار الحدث
}

function toggleFilterOptions(optionsId) {
  const options = document.getElementById(optionsId);
  const allOptions = document.querySelectorAll(".wd-filter-options");
  const button = event.currentTarget;

  // إغلاق جميع القوائم المفتوحة الأخرى
  allOptions.forEach((item) => {
    if (item.id !== optionsId && item.classList.contains("show")) {
      item.classList.remove("show");
      item.previousElementSibling.classList.remove("expanded");
    }
  });

  // تبديل حالة القائمة الحالية
  options.classList.toggle("show");
  button.classList.toggle("expanded");

  event.stopPropagation(); // منع انتشار الحدث
}

function selectFilterOption(optionsId, value) {
  const options = document.getElementById(optionsId);
  const button = options.previousElementSibling;
  const span = button.querySelector("span");

  // تعيين القيمة المحددة
  span.textContent = value;

  // إغلاق القائمة
  options.classList.remove("show");
  button.classList.remove("expanded");

  // تطبيق الفلتر (هنا يمكن إضافة منطق الفلترة الفعلي)
  applyFilters();

  event.stopPropagation(); // منع انتشار الحدث
}

function applyFilters() {
  // هنا يمكن إضافة منطق تطبيق الفلاتر على قائمة المحادثات
  console.log("تطبيق الفلاتر");
}

// إغلاق القوائم عند النقر في أي مكان آخر
document.addEventListener("click", function (event) {
  // إغلاق قائمة الفلتر الرئيسية
  const filterMenu = document.getElementById("filterMenu");
  if (filterMenu && !event.target.closest(".wd-filter-dropdown-container")) {
    filterMenu.classList.remove("show");
  }

  // إغلاق قوائم الخيارات
  const allOptions = document.querySelectorAll(".wd-filter-options");
  allOptions.forEach((options) => {
    if (
      options.classList.contains("show") &&
      !event.target.closest(".wd-filter-select")
    ) {
      options.classList.remove("show");
      options.previousElementSibling.classList.remove("expanded");
    }
  });
});

// التحكم في زر الدعم الفني المباشر - تنفيذ فوري
(function () {
  console.log("تهيئة زر الدعم الفني");

  // طريقة 1: إضافة الكود مباشرة بعد تحميل الصفحة
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initSupportButton();
  } else {
    document.addEventListener("DOMContentLoaded", initSupportButton);
  }

  // طريقة 2: تنفيذ بعد تأخير قصير للتأكد من تحميل جميع العناصر
  setTimeout(initSupportButton, 1000);

  // طريقة 3: محاولة التنفيذ مرة أخرى بعد تحميل الصفحة بالكامل
  window.addEventListener("load", initSupportButton);

  function initSupportButton() {
    try {
      const supportBtn = document.getElementById("supportFloatingBtn");
      const supportMenu = document.getElementById("supportFloatingMenu");
      const closeSupportMenu = document.getElementById("closeSupportMenu");

      // فحص وجود العناصر قبل الاستمرار
      if (!supportBtn) {
        // لا نطبع خطأ إذا لم يكن العنصر موجوداً في هذه الصفحة
        return;
      }

      if (!supportMenu) {
        return;
      }

      if (!closeSupportMenu) {
        return;
      }

      console.log("تم العثور على جميع عناصر الدعم الفني:", {
        supportBtn,
        supportMenu,
        closeSupportMenu,
      });

      // إضافة وظيفة النقر على الزر
      const clickHandler = function (e) {
        console.log("تم النقر على زر الدعم الفني!", e);
        e.preventDefault();
        e.stopPropagation();
        supportMenu.classList.toggle("show");
        return false;
      };

      // إضافة عدة أنواع من أحداث النقر لضمان العمل
      supportBtn.onclick = clickHandler;
      supportBtn.addEventListener("click", clickHandler);
      supportBtn.addEventListener("mousedown", function (e) {
        console.log("تم الضغط على زر الدعم الفني!", e);
      });

      // إضافة نمط مباشر لتأكيد فابلية النقر
      supportBtn.style.pointerEvents = "auto";
      supportBtn.style.cursor = "pointer";
      supportBtn.style.zIndex = "10001";

      // إغلاق القائمة عند النقر على زر الإغلاق
      closeSupportMenu.onclick = function (e) {
        console.log("تم النقر على زر الإغلاق");
        e.preventDefault();
        supportMenu.classList.remove("show");
        return false;
      };

      // إغلاق القائمة عند النقر خارجها
      document.addEventListener("click", function (e) {
        if (
          supportBtn &&
          supportMenu &&
          !supportBtn.contains(e.target) &&
          !supportMenu.contains(e.target)
        ) {
          supportMenu.classList.remove("show");
        }
      });

      console.log("تمت تهيئة الدعم الفني بنجاح!");
    } catch (error) {
      console.error("خطأ في تهيئة زر الدعم الفني:", error);
    }
  }
})();

function initNotificationsPage() {
  // Check if we're on the notifications page
  if (!window.location.pathname.includes("notifications.html")) {
    return;
  }

  console.log("Initializing notifications page functionality");

  // Mark all notifications as read
  const markAllReadBtn = document.querySelector(".wd-btn-mark-read");
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", function () {
      const unreadItems = document.querySelectorAll(
        ".wd-notification-item.unread"
      );
      unreadItems.forEach((item) => {
        item.classList.remove("unread");
      });

      // Update the badge count
      const badge = document.querySelector(".wd-notifications-badge");
      if (badge) {
        badge.textContent = "0";
      }
    });
  }

  // Mark individual notifications as read
  const markReadBtns = document.querySelectorAll(".wd-notification-action");
  markReadBtns.forEach((btn) => {
    if (btn.textContent.trim() === "تحديد كمقروء") {
      btn.addEventListener("click", function (e) {
        const notificationItem = this.closest(".wd-notification-item");
        if (notificationItem.classList.contains("unread")) {
          notificationItem.classList.remove("unread");

          // Update the badge count
          const badge = document.querySelector(".wd-notifications-badge");
          if (badge && parseInt(badge.textContent) > 0) {
            badge.textContent = parseInt(badge.textContent) - 1;
          }
        }
        e.stopPropagation();
      });
    }
  });

  // Update notification count to reflect all notifications
  const notificationItems = document.querySelectorAll(".wd-notification-item");
  const notificationsTitle = document.querySelector(".wd-notifications-title");
  if (notificationsTitle && notificationItems) {
    notificationsTitle.textContent = `جميع الإشعارات (${notificationItems.length})`;
  }

  // Settings button
  const settingsBtn = document.querySelector(".wd-btn-settings");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", function () {
      window.location.href = "settings/notifications.html";
    });
  }
}

// The function for dynamically adding notifications has been removed as all notifications now display at once

// Chat Context Menu Functionality
let selectedMessage = null;
let contextMenuPosition = { x: 0, y: 0 };

// Initialize context menu for chat items
function initChatContextMenu() {
  const chatItems = document.querySelectorAll(".wd-chat-item");

  chatItems.forEach((item) => {
    item.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      selectedMessage = this;
      showContextMenu(e.clientX, e.clientY);
    });
  });
}

// Show context menu at specified position
function showContextMenu(x, y) {
  const contextMenu = document.getElementById("chatContextMenu");
  if (!contextMenu) return;

  // Calculate position to keep menu within viewport
  const menuWidth = 200;
  const menuHeight = 250;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let posX = x;
  let posY = y;

  // Adjust horizontal position if menu would go off-screen
  if (x + menuWidth > viewportWidth) {
    posX = x - menuWidth;
  }

  // Adjust vertical position if menu would go off-screen
  if (y + menuHeight > viewportHeight) {
    posY = y - menuHeight;
  }

  contextMenu.style.left = posX + "px";
  contextMenu.style.top = posY + "px";
  contextMenu.style.display = "block";

  contextMenuPosition = { x: posX, y: posY };
}

// Hide context menu
function hideContextMenu() {
  const contextMenu = document.getElementById("chatContextMenu");
  if (contextMenu) contextMenu.style.display = "none";
}

// Context menu actions
function markAsUnread() {
  if (!selectedMessage) return;

  // Add unread styling to chat item
  selectedMessage.classList.add("unread");

  // Show success message
  showSuccessMessage("تم وضع علامة كغير مقروء");

  hideContextMenu();
}

function closeConversation() {
  if (!selectedMessage) return;

  // Hide the chat item
  selectedMessage.style.display = "none";
  showSuccessMessage("تم إغلاق المحادثة");

  hideContextMenu();
}

function assignTag(tagName) {
  if (!selectedMessage) return;

  // Add tag to chat item
  const chatInfo = selectedMessage.querySelector(".wd-chat-info");
  if (chatInfo) {
    const tagElement = document.createElement("div");
    tagElement.className = "wd-chat-classification";
    tagElement.textContent = tagName;
    tagElement.style.cssText = `
      display: inline-block;
      background-color: #007bff;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      margin: 2px;
    `;
    chatInfo.appendChild(tagElement);
  }

  showSuccessMessage(`تم إضافة الوسم: ${tagName}`);
  hideContextMenu();
}

function assignEmployee(employeeName) {
  if (!selectedMessage) return;

  // Add employee assignment to chat item
  const chatMeta = selectedMessage.querySelector(".wd-chat-meta");
  if (chatMeta) {
    const employeeElement = document.createElement("div");
    employeeElement.className = "wd-employee-info";
    employeeElement.innerHTML = `
      <i class="fas fa-user"></i>
      <span>${employeeName}</span>
    `;
    employeeElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #28a745;
      margin-bottom: 5px;
    `;
    chatMeta.appendChild(employeeElement);
  }

  showSuccessMessage(`تم تعيين الموظف: ${employeeName}`);
  hideContextMenu();
}

function assignTeam(teamName) {
  if (!selectedMessage) return;

  // Add team assignment to chat item
  const chatInfo = selectedMessage.querySelector(".wd-chat-info");
  if (chatInfo) {
    const teamElement = document.createElement("div");
    teamElement.className = "wd-chat-team";
    teamElement.innerHTML = `
      <i class="fas fa-users"></i>
      <span>${teamName}</span>
    `;
    teamElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #17a2b8;
      margin-top: 5px;
    `;
    chatInfo.appendChild(teamElement);
  }

  showSuccessMessage(`تم تعيين الفريق: ${teamName}`);
  hideContextMenu();
}

// Show success message
function showSuccessMessage(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "wd-success-message";
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 10002;
    animation: slideInRight 0.3s ease-out;
  `;

  document.body.appendChild(successDiv);

  // Remove after 3 seconds
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

// Close context menu when clicking outside
document.addEventListener("click", function (e) {
  const contextMenu = document.getElementById("chatContextMenu");
  if (contextMenu && !contextMenu.contains(e.target)) {
    hideContextMenu();
  }
});

// Close context menu on escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    hideContextMenu();
  }
});

// Initialize context menu when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on the chat page
  if (window.location.pathname.includes("chat.html")) {
    initChatContextMenu();
    initSubmenuHover();
  }
});

// Initialize submenu hover functionality
function initSubmenuHover() {
  const submenuItems = document.querySelectorAll(
    ".wd-context-menu-item.has-submenu"
  );

  submenuItems.forEach((item) => {
    let hideTimeout;
    let showTimeout;

    item.addEventListener("mouseenter", function () {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);

      const submenu = this.querySelector(".wd-context-submenu");
      if (submenu) {
        showTimeout = setTimeout(() => {
          submenu.style.display = "block";
        }, 100); // Small delay before showing
      }
    });

    item.addEventListener("mouseleave", function () {
      const submenu = this.querySelector(".wd-context-submenu");
      if (submenu) {
        hideTimeout = setTimeout(() => {
          submenu.style.display = "none";
        }, 100); // 1200ms delay before hiding - much longer - much longer
      }
    });

    // Prevent hiding when hovering over submenu
    const submenu = item.querySelector(".wd-context-submenu");
    if (submenu) {
      submenu.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
        clearTimeout(showTimeout);
      });

      submenu.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(() => {
          this.style.display = "none";
        }, 100); // 1200ms delay before hiding
      });
    }
  });
}

// ===== وظيفة Drag and Drop للأقسام معطلة =====

// تهيئة وظيفة السحب والإفلات للأقسام (معطلة)
function initSectionDragAndDrop() {
  console.log("وظيفة السحب والإفلات معطلة");
  return; // تعطيل الوظيفة بالكامل

  console.log("تهيئة وظيفة السحب والإفلات للأقسام...");

  const sectionsContainer = document.querySelector(".wd-contact-sections");
  if (!sectionsContainer) {
    console.warn("لم يتم العثور على حاوية الأقسام");
    return;
  }

  console.log("تم العثور على حاوية الأقسام:", sectionsContainer);

  // تحميل الترتيب المحفوظ
  console.log("تحميل الترتيب المحفوظ...");
  loadSectionsOrder();

  // تحميل حالة الفتح والإغلاق
  console.log("تحميل حالة الفتح والإغلاق...");
  loadSectionsState();

  // إضافة event listeners لجميع الأقسام
  const sections = sectionsContainer.querySelectorAll(
    ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
  );

  console.log(`تم العثور على ${sections.length} قسم`);

  if (sections.length === 0) {
    console.warn("لم يتم العثور على أي قسم");
    return;
  }

  sections.forEach((section, index) => {
    console.log(`إعداد القسم ${index + 1}:`, section.className);

    // تم تعطيل وظيفة drag and drop
    // section.setAttribute("draggable", "true");
    // section.addEventListener("dragstart", handleDragStart);
    // section.addEventListener("dragend", handleDragEnd);
    // section.addEventListener("dragover", handleDragOver);
    // section.addEventListener("drop", handleDrop);
    // section.addEventListener("dragenter", handleDragEnter);
    // section.addEventListener("dragleave", handleDragLeave);
  });

  // إضافة event listeners لحالة الفتح والإغلاق
  console.log("تهيئة event listeners لحالة الفتح والإغلاق...");
  initSectionToggleListeners();

  // تطبيق الحالات المحفوظة بعد التهيئة
  setTimeout(() => {
    console.log("تطبيق الحالات المحفوظة بعد التهيئة...");
    applySectionsState();
  }, 150);

  console.log("تم إكمال تهيئة وظيفة السحب والإفلات للأقسام");
}

// بداية السحب
function handleDragStart(e) {
  e.target.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.outerHTML);
}

// نهاية السحب
function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  // إزالة جميع classes
  document
    .querySelectorAll(
      ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
    )
    .forEach((section) => {
      section.classList.remove("drag-over");
    });
}

// أثناء السحب فوق منطقة
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

// دخول منطقة الإفلات
function handleDragEnter(e) {
  e.preventDefault();
  const target = e.target.closest(
    ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
  );
  if (target && !target.classList.contains("dragging")) {
    target.classList.add("drag-over");
  }
}

// مغادرة منطقة الإفلات
function handleDragLeave(e) {
  const target = e.target.closest(
    ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
  );
  if (target) {
    target.classList.remove("drag-over");
  }
}

// إفلات العنصر
function handleDrop(e) {
  e.preventDefault();
  const target = e.target.closest(
    ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
  );
  if (!target) return;

  target.classList.remove("drag-over");

  const draggedSection = document.querySelector(".dragging");
  if (!draggedSection || draggedSection === target) return;

  // إعادة ترتيب العناصر
  const sectionsContainer = target.parentNode;
  const draggedIndex = Array.from(sectionsContainer.children).indexOf(
    draggedSection
  );
  const targetIndex = Array.from(sectionsContainer.children).indexOf(target);

  if (draggedIndex < targetIndex) {
    target.parentNode.insertBefore(draggedSection, target.nextSibling);
  } else {
    target.parentNode.insertBefore(draggedSection, target);
  }

  // حفظ الترتيب الجديد مع معلومات مفصلة
  setTimeout(() => {
    saveSectionsOrder();
    console.log("تم حفظ الحالة بعد تغيير أماكن الأقسام");

    // إظهار رسالة نجاح
    showReorderSuccessMessage();
  }, 100);
}

// حفظ ترتيب الأقسام وحالتهم
function saveSectionsOrder() {
  try {
    console.log("بدء حفظ حالة الأقسام...");

    const sectionsContainer = document.querySelector(".wd-contact-sections");
    if (!sectionsContainer) {
      console.warn("لم يتم العثور على حاوية الأقسام");
      return false;
    }

    console.log(
      "تم العثور على حاوية الأقسام، عدد الأقسام:",
      sectionsContainer.children.length
    );

    const sections = Array.from(sectionsContainer.children).map(
      (section, index) => {
        console.log(`معالجة القسم ${index + 1}:`, section.className);

        // البحث عن محتوى القسم
        const sectionContent = section.querySelector(
          ".wd-section-content, .wd-ai-section-content, .wd-journeys-content, .wd-email-content, .wd-notes-content, .wd-reservations-content"
        );

        // البحث عن زر التبديل
        const toggleButton = section.querySelector(
          ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
        );

        // تحديد حالة الفتح بناءً على الصنف collapsed (بدون الاعتماد على inline style)
        const isOpen =
          sectionContent && !sectionContent.classList.contains("collapsed");
        console.log(`  - حالة الفتح: ${isOpen}`);

        // تحديد حالة الزر (فعال أم لا)
        const isToggleActive =
          toggleButton && toggleButton.classList.contains("active");
        console.log(`  - حالة الزر: ${isToggleActive}`);

        // مفتاح القسم الموحّد: data-section-id ثم id
        const sectionKey =
          section.getAttribute("data-section-id") ||
          section.id ||
          `section-${Date.now()}-${index}`;

        // حفظ معلومات إضافية للقسم
        const sectionInfo = {
          id: sectionKey,
          isOpen: isOpen,
          order: index,
        };

        // لا نحتاج لمعلومات إضافية

        console.log(`  - معلومات القسم:`, sectionInfo);
        return sectionInfo;
      }
    );

    // حفظ في localStorage مع timestamp
    const saveData = {
      sections: sections,
      lastUpdated: Date.now(),
      version: "2.0", // تحديث الإصدار
    };

    localStorage.setItem("wd-contact-sections-order", JSON.stringify(saveData));

    console.log("تم حفظ حالة الأقسام بنجاح:", saveData);
    return true;
  } catch (error) {
    console.error("خطأ في حفظ حالة الأقسام:", error);
    return false;
  }
}

// تحميل ترتيب الأقسام
function loadSectionsOrder() {
  const sectionsContainer = document.querySelector(".wd-contact-sections");
  if (!sectionsContainer) return;

  const savedOrder = localStorage.getItem("wd-contact-sections-order");
  if (!savedOrder) return;

  try {
    let order;

    // محاولة تحليل البيانات الجديدة
    try {
      const parsedData = JSON.parse(savedOrder);
      if (parsedData.sections && Array.isArray(parsedData.sections)) {
        order = parsedData.sections;
        console.log("تم تحميل البيانات الجديدة:", parsedData);
      } else {
        // البيانات القديمة
        order = parsedData;
        console.log("تم تحميل البيانات القديمة:", order);
      }
    } catch (parseError) {
      console.error("خطأ في تحليل البيانات:", parseError);
      return;
    }

    if (!order || !Array.isArray(order)) {
      console.error("بيانات غير صحيحة:", order);
      return;
    }

    const sections = Array.from(sectionsContainer.children);

    // ترتيب الأقسام حسب الترتيب المحفوظ باستخدام data-section-id/id
    order.forEach((item) => {
      const section = sections.find((s) => {
        const key = s.getAttribute("data-section-id") || s.id;
        return key && key === item.id;
      });
      if (section) {
        sectionsContainer.appendChild(section);
      }
    });

    console.log("تم إعادة ترتيب الأقسام بنجاح");
  } catch (error) {
    console.error("Error loading sections order:", error);

    // محاولة استعادة من النسخة الاحتياطية
    try {
      const backup = localStorage.getItem("contactSectionsBackup");
      if (backup) {
        console.log("محاولة استعادة من النسخة الاحتياطية...");
        const backupData = JSON.parse(backup);
        if (backupData.sections) {
          loadSectionsOrderFromData(backupData.sections);
        }
      }
    } catch (backupError) {
      console.error("فشل في استعادة النسخة الاحتياطية:", backupError);
    }
  }
}

// دالة مساعدة لتحميل البيانات
function loadSectionsOrderFromData(order) {
  const sectionsContainer = document.querySelector(".wd-contact-sections");
  if (!sectionsContainer) return;

  const sections = Array.from(sectionsContainer.children);

  order.forEach((item) => {
    const section = sections.find(
      (s) => s.id === item.id || s.className.includes(item.type)
    );
    if (section) {
      sectionsContainer.appendChild(section);
    }
  });
}

// تحميل حالة الفتح والإغلاق للأقسام
function loadSectionsState() {
  console.log("بدء تحميل حالة الأقسام...");

  const sectionsContainer = document.querySelector(".wd-contact-sections");
  if (!sectionsContainer) {
    console.warn("لم يتم العثور على حاوية الأقسام");
    return;
  }

  const savedOrder = localStorage.getItem("wd-contact-sections-order");
  if (!savedOrder) {
    console.log("لا توجد بيانات محفوظة");
    return;
  }

  try {
    let order;
    let parsedData;

    // محاولة تحليل البيانات
    try {
      parsedData = JSON.parse(savedOrder);
      if (parsedData.sections && Array.isArray(parsedData.sections)) {
        order = parsedData.sections;
      } else {
        // البيانات القديمة
        order = parsedData;
      }
    } catch (parseError) {
      console.error("خطأ في تحليل البيانات:", parseError);
      return;
    }

    if (!order || !Array.isArray(order)) {
      console.error("بيانات غير صحيحة:", order);
      return;
    }

    console.log("تم العثور على", order.length, "قسم محفوظ");

    // تطبيق الحالات على الأقسام
    order.forEach((item, index) => {
      if (item.isOpen !== undefined) {
        // البحث عن القسم باستخدام عدة طرق
        let section = null;

        // البحث بالمعرّف الموحّد: data-section-id ثم id
        if (item.id) {
          section = sectionsContainer.querySelector(
            `[data-section-id="${item.id}"]`
          );
          if (!section) {
            section = sectionsContainer.querySelector(`[id="${item.id}"]`);
          }
        }

        if (!section && item.sectionTitle) {
          // البحث بالعنوان
          const allSections = sectionsContainer.querySelectorAll(
            ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
          );
          section = Array.from(allSections).find(
            (s) =>
              s.querySelector("h4") &&
              s.querySelector("h4").textContent.includes(item.sectionTitle)
          );
        }

        if (section) {
          const sectionContent = section.querySelector(
            ".wd-section-content, .wd-ai-section-content, .wd-journeys-content, .wd-email-content, .wd-notes-content, .wd-reservations-content"
          );
          const toggleButton = section.querySelector(
            ".wd-section-toggle, .wd-ai-toggle, .wd-journeys-toggle, .wd-email-toggle, .wd-notes-toggle, .wd-reservations-toggle"
          );

          if (sectionContent && toggleButton) {
            // تطبيق الحالة المحفوظة اعتمادًا على الصنف collapsed + حالة الزر + الأيقونة
            const icon = toggleButton.querySelector("i");
            if (item.isOpen) {
              sectionContent.classList.remove("collapsed");
              toggleButton.classList.add("active");
              if (icon) icon.className = "fas fa-chevron-down";
            } else {
              sectionContent.classList.add("collapsed");
              toggleButton.classList.remove("active");
              if (icon) icon.className = "fas fa-chevron-right";
            }

            // تطبيق حالة الزر
            if (item.isToggleActive !== undefined) {
              if (item.isToggleActive) {
                toggleButton.classList.add("active");
              } else {
                toggleButton.classList.remove("active");
              }
            }

            console.log(`تم تطبيق الحالة للقسم ${index + 1}:`, {
              type: item.type,
              isOpen: item.isOpen,
              isToggleActive: item.isToggleActive,
              sectionFound: true,
            });
          } else {
            console.warn(`لم يتم العثور على محتوى أو زر للقسم:`, item.type);
          }
        } else {
          console.warn(`لم يتم العثور على القسم:`, item.type, item.id);
        }
      }
    });

    console.log("تم تحميل حالة جميع الأقسام بنجاح");
  } catch (error) {
    console.error("خطأ في تحميل حالة الأقسام:", error);
  }
}

// تهيئة event listeners لحالة الفتح والإغلاق
function initSectionToggleListeners() {
  console.log("تهيئة event listeners للأقسام...");

  const sectionsContainer = document.querySelector(".wd-contact-sections");
  if (!sectionsContainer) return;

  // لا نحتاج لإضافة event listeners هنا لأننا نستخدم event delegation
  // فقط نقوم بتهيئة مراقب التغييرات
  initSectionChangeListeners();

  console.log("تم إكمال تهيئة event listeners للأقسام");
}

// إضافة event listeners للتغييرات في الأقسام
function initSectionChangeListeners() {
  const sectionsContainer = document.querySelector(".wd-contact-sections");
  if (!sectionsContainer) return;

  // مراقبة التغييرات في الأقسام
  const observer = new MutationObserver((mutations) => {
    let shouldSave = false;

    mutations.forEach((mutation) => {
      if (
        mutation.type === "childList" ||
        (mutation.type === "attributes" &&
          (mutation.attributeName === "style" ||
            mutation.attributeName === "class"))
      ) {
        shouldSave = true;
      }
    });

    if (shouldSave) {
      // تأخير لحفظ الحالة
      clearTimeout(window.sectionChangeTimeout);
      window.sectionChangeTimeout = setTimeout(() => {
        saveSectionsOrder();
        console.log("تم حفظ الحالة بعد تغيير في الأقسام");
      }, 200);
    }
  });

  // مراقبة التغييرات في الأقسام
  observer.observe(sectionsContainer, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });
}

// إظهار رسالة نجاح إعادة الترتيب
function showReorderSuccessMessage() {
  const message = "تم إعادة ترتيب الأقسام بنجاح!";
  showSuccessMessage(message);
}

// تهيئة وظيفة السحب والإفلات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded - بدء التهيئة");

  // محاولة التهيئة عدة مرات للتأكد من وجود العناصر
  let initAttempts = 0;
  const maxAttempts = 10;

  function attemptInitialization() {
    initAttempts++;
    console.log(`محاولة التهيئة رقم ${initAttempts}`);

    const sectionsContainer = document.querySelector(".wd-contact-sections");
    const tabButtons = document.querySelectorAll(".wd-contact-info-nav-item");

    if (sectionsContainer && tabButtons.length > 0) {
      console.log("تم العثور على العناصر المطلوبة - بدء التهيئة");

      // تهيئة وظائف السحب والإفلات
      initSectionDragAndDrop();
      initScrollListener();
      initTabChangeListener();

      // تهيئة event listeners للأقسام
      initSectionToggleListeners();

      console.log("تم إكمال التهيئة بنجاح");
    } else if (initAttempts < maxAttempts) {
      console.log(`العناصر غير موجودة - إعادة المحاولة بعد 500ms`);
      setTimeout(attemptInitialization, 500);
    } else {
      console.error("فشل في العثور على العناصر المطلوبة بعد جميع المحاولات");
    }
  }

  // بدء محاولات التهيئة
  attemptInitialization();
});

// تنظيف event listeners القديمة عند الحاجة فقط
function cleanupOldEventListeners() {
  console.log("تنظيف event listeners القديمة...");

  try {
    // تنظيف event listeners من الأقسام فقط (وليس من التبويبات)
    const sections = document.querySelectorAll(
      ".wd-contact-section, .wd-ai-section, .wd-journeys-section, .wd-email-section, .wd-notes-section, .wd-reservations-section"
    );

    // تنظيف event listeners فقط بدون حذف الأقسام
    sections.forEach((section) => {
      // إزالة event listeners القديمة فقط
      const newSection = section.cloneNode(true);
      section.parentNode.replaceChild(newSection, section);
    });

    console.log("تم تنظيف event listeners من الأقسام بنجاح");

    // إعادة تهيئة event listeners للأقسام بعد التنظيف
    setTimeout(() => {
      console.log("إعادة تهيئة event listeners للأقسام...");
      initSectionToggleListeners();
    }, 100);
  } catch (error) {
    console.error("خطأ في تنظيف event listeners:", error);
  }
}

// حفظ الحالة عند تغيير التبويبات
function initTabChangeListener() {
  console.log("تهيئة مراقب تغيير التبويبات...");

  const tabButtons = document.querySelectorAll(".wd-contact-info-nav-item");
  console.log(`تم العثور على ${tabButtons.length} تبويب`);

  if (tabButtons.length === 0) {
    console.warn("لم يتم العثور على أزرار التبويبات");
    return;
  }

  // إضافة event listener للحفظ فقط (بدون التداخل مع switchContactInfoSection)
  tabButtons.forEach((button, index) => {
    console.log(
      `إضافة event listener للحفظ للتبويب ${index + 1}:`,
      button.textContent.trim()
    );

    // إضافة event listener للحفظ فقط
    button.addEventListener("click", function (e) {
      console.log("تم النقر على التبويب للحفظ:", this.textContent.trim());

      // تأخير قليل لضمان تحميل المحتوى الجديد
      setTimeout(() => {
        console.log("بدء حفظ الحالة بعد تغيير التبويب...");
        const saveResult = saveSectionsOrder();

        if (saveResult) {
          console.log(
            "تم حفظ الحالة بعد تغيير التبويب بنجاح:",
            this.textContent.trim()
          );
        } else {
          console.error(
            "فشل في حفظ الحالة بعد تغيير التبويب:",
            this.textContent.trim()
          );
        }
      }, 500); // زيادة التأخير لضمان تحميل المحتوى
    });
  });

  console.log("تم إكمال تهيئة مراقب تغيير التبويبات");
}

// دالة للتحقق من حالة localStorage
function checkLocalStorageStatus() {
  console.log("=== فحص حالة localStorage ===");

  try {
    const savedData = localStorage.getItem("wd-contact-sections-order");
    const backupData = null;

    if (savedData) {
      const parsed = JSON.parse(savedData);
      console.log("البيانات المحفوظة:", parsed);
      console.log("آخر تحديث:", new Date(parsed.lastUpdated).toLocaleString());
      console.log("عدد الأقسام:", parsed.sections ? parsed.sections.length : 0);
    } else {
      console.log("لا توجد بيانات محفوظة");
    }

    if (backupData) {
      const parsed = JSON.parse(backupData);
      console.log("النسخة الاحتياطية:", parsed);
    } else {
      console.log("لا توجد نسخة احتياطية");
    }

    console.log("=== انتهاء الفحص ===");
  } catch (error) {
    console.error("خطأ في فحص localStorage:", error);
  }
}

// فحص localStorage عند تحميل الصفحة
window.addEventListener("load", function () {
  setTimeout(() => {
    checkLocalStorageStatus();
  }, 1000);
});

// حفظ الحالة عند تغيير حجم النافذة
window.addEventListener("resize", function () {
  // تأخير لحفظ الحالة بعد انتهاء تغيير الحجم
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    saveSectionsOrder();
  }, 250);
});

// حفظ الحالة عند التمرير
function initScrollListener() {
  const contactInfoContent = document.querySelector(".wd-contact-info-content");
  if (contactInfoContent) {
    let scrollTimeout;
    contactInfoContent.addEventListener("scroll", function () {
      // تأخير لحفظ الحالة بعد انتهاء التمرير
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        saveSectionsOrder();
      }, 500);
    });
  }
}
