const fs = require("fs");
const path = require("path");

const events = [
  {
    id: "auto_retarget",
    icon: "fa-bullseye",
    title: "إعادة استهداف آلي",
    desc: "يعيد جذب العملاء الذين تفاعلوا مع حملاتك السابقة عبر تسلسل رسائل ذكي يعتمد على سلوك الشراء.",
    stats: ["تنبيهات مفعّلة", "سلات أُعيدت", "نقرات بعد التنبيه", "متوسط وقت العودة (س)", "معدل تحويل %"],
    productSwitchLabel: "استهداف منتجات محددة",
    tagSwitchLabel: "استهداف وسوم محددة",
    productPlaceholder: "اكتب SKU المنتج ثم Enter",
  },
  {
    id: "abandoned_cart",
    icon: "fa-shopping-cart",
    title: "السلة المتروكة",
    desc: "يُرسل تذكيراً تلقائياً عند ترك المنتجات في السلة دون إتمام الطلب لزيادة فرص الإكمال.",
    stats: ["سلات مهجورة", "تذكيرات مرسلة", "طلبات مكتملة بعد التذكير", "قيمة مستردة", "متوسط قيمة السلة"],
    productPlaceholder: "اكتب SKU المنتج ثم Enter",
  },
  { id: "customer_created", icon: "fa-user-plus", title: "عميل جديد", desc: "يُشعر فريقك فور تسجيل عميل جديد في المتجر مع إمكانية إرسال ترحيب آلي بالاسم.", stats: ["عملاء جدد اليوم", "دعوات مفعّلة", "ردود على الترحيب", "مصادر التسجيل", "معدل إكمال الملف"] },
  { id: "customer_verification_code", icon: "fa-key", title: "رمز تحقق العميل", desc: "يُرسل رمز التحقق عبر واتساب عند تسجيل الدخول أو تغيير البيانات الحساسة.", stats: ["رموز مرسلة", "محاولات ناجحة", "محاولات فاشلة", "متوسط وقت الإدخال", "إعادة إرسال"] },
  { id: "order_created", icon: "fa-receipt", title: "طلب جديد", desc: "يُعلم العميل والفريق بإنشاء طلب جديد مع رقم الطلب وقيمة الفاتورة.", stats: ["طلبات جديدة", "قيمة الطلبات", "متوسط السلة", "طرق الدفع", "أوقات الذروة"] },
  { id: "order_waiting_payment", icon: "fa-hourglass-half", title: "في انتظار الدفع", desc: "يُذكّر العميل بإكمال الدفع قبل انتهاء مهلة الطلب.", stats: ["طلبات معلقة", "تذكيرات دفع", "مدفوعات مكتملة", "انتهت المهلة", "متوسط وقت الدفع"] },
  { id: "order_processing", icon: "fa-gears", title: "قيد المعالجة", desc: "يُحدّث العميل بأن طلبه قيد التجهيز في المستودع أو قسم الطلبات.", stats: ["طلبات قيد التجهيز", "متوسط وقت التجهيز", "تنبيهات تأخير", "أخطاء تجهيز", "رضا العميل"] },
  { id: "order_under_review", icon: "fa-magnifying-glass", title: "قيد المراجعة", desc: "يُستخدم عند الحاجة لمراجعة يدوية للطلب قبل تأكيده أو رفضه.", stats: ["طلبات بالمراجعة", "مراجعات مكتملة", "متوسط وقت المراجعة", "طلبات مرفوضة", "تنبيهات للمشرف"] },
  { id: "order_completed", icon: "fa-circle-check", title: "مكتمل", desc: "يُعلم العميل بأن طلبه أصبح مكتملاً وجاهزاً للشحن أو الاستلام.", stats: ["طلبات مكتملة", "قيمة مكتملة", "متوسط وقت الإكمال", "إشعارات مرسلة", "إعادة طلب"] },
  { id: "order_shipped", icon: "fa-truck-fast", title: "تم الشحن", desc: "يُرسل رابط التتبع ورقم البوليصة فور تسليم الشحنة لشركة النقل.", stats: ["شحنات اليوم", "متوسط وقت الشحن", "تتبع مفتوح", "استفسارات شحن", "تسليمات في الوقت"] },
  { id: "order_out_for_delivery", icon: "fa-route", title: "قيد التوصيل", desc: "يُخبر العميل أن المندوب في الطريق مع تقدير وقت الوصول.", stats: ["جولات توصيل", "متوسط وقت التوصيل", "محاولات تسليم", "عناوين خاطئة", "تقييم المندوب"] },
  { id: "order_delivered", icon: "fa-box-open", title: "تم التوصيل", desc: "يؤكد تسليم الطلب ويدعو العميل لتقييم التجربة أو طلب المساعدة.", stats: ["تسليمات ناجحة", "تأكيدات استلام", "طلبات تقييم", "شكاوى بعد التسليم", "معدل رضا"] },
  { id: "order_cancelled", icon: "fa-ban", title: "ملغي", desc: "يُرسل إشعار إلغاء مع سبب مختصر وروابط الدعم أو استرداد المبلغ.", stats: ["إلغاءات اليوم", "أسباب الإلغاء", "مبالغ مستردة", "إلغاء من العميل", "إلغاء من المتجر"] },
  { id: "order_deleted", icon: "fa-trash", title: "محذوف", desc: "يُسجّل حذف الطلب من النظام ويُشعر الأطراف المعنية عند تفعيله.", stats: ["طلبات محذوفة", "نسخ احتياطي", "تنبيهات أمنية", "استعادة", "سجل التدقيق"] },
  { id: "order_rating", icon: "fa-star", title: "تقييم الطلب", desc: "يطلب من العميل تقييم المنتج أو الخدمة بعد إغلاق الطلب.", stats: ["دعوات تقييم", "تقييمات مستلمة", "متوسط النجوم", "تقييمات سلبية", "ردود على التقييم"] },
  { id: "order_tracking", icon: "fa-location-dot", title: "تتبع الطلب", desc: "يُرسل تحديثات تلقائية عند تغيّر مراحل الشحنة على الخريطة.", stats: ["تحديثات مرسلة", "نقرات على الرابط", "حالات شحن", "تأخير لوجستي", "استفسارات تتبع"] },
  { id: "order_invoice", icon: "fa-file-invoice", title: "فاتورة الطلب", desc: "يُرسل نسخة من الفاتورة الضريبية أو إيصال الدفع بصيغة مناسبة للعميل.", stats: ["فواتير مرسلة", "قيمة مفوترة", "إعادة إرسال", "أخطاء إرسال", "تخزين أرشيف"] },
];

function timingBlock() {
  return `<div class="wd-send-meta-fields si-time-scope">
      <div class="wd-field-group">
        <label>التوقيت</label>
        <select class="wd-select wd-send-timing-mode">
          <option value="">اختر التوقيت</option>
          <option>فوري</option>
          <option value="after">بعد</option>
        </select>
      </div>
      <div class="wd-grid-2 wd-send-after-fields">
        <div class="wd-field-group">
          <label>الوحدة</label>
          <select class="wd-select wd-send-after-unit">
            <option value="">اختر الوحدة</option>
            <option value="seconds">ثواني</option>
            <option value="minutes">دقائق</option>
            <option value="hours">ساعات</option>
            <option value="days">أيام</option>
          </select>
        </div>
        <div class="wd-field-group">
          <label>الرقم</label>
          <input type="number" min="1" step="1" class="wd-select wd-send-after-value" placeholder="أدخل الرقم" style="display: none" />
        </div>
      </div>
    </div>`;
}

function timingBlockAutoRetarget() {
  return `<div class="wd-send-meta-fields si-time-scope si-time-scope--retarget">
      <div class="wd-field-group">
        <label>التوقيت</label>
        <select class="wd-select wd-send-timing-mode">
          <option value="">اختر التوقيت</option>
          <option>فوري</option>
          <option value="after">بعد</option>
          <option value="scheduled">تاريخ ووقت محدد</option>
        </select>
      </div>
      <div class="wd-grid-2 wd-send-after-fields">
        <div class="wd-field-group">
          <label>الوحدة</label>
          <select class="wd-select wd-send-after-unit">
            <option value="">اختر الوحدة</option>
            <option value="seconds">ثواني</option>
            <option value="minutes">دقائق</option>
            <option value="hours">ساعات</option>
            <option value="days">أيام</option>
          </select>
        </div>
        <div class="wd-field-group">
          <label>الرقم</label>
          <input type="number" min="1" step="1" class="wd-select wd-send-after-value" placeholder="أدخل الرقم" style="display: none" />
        </div>
      </div>
      <div class="wd-send-scheduled-fields">
        <div class="wd-field-group">
          <label>التاريخ والوقت</label>
          <input type="datetime-local" class="wd-select wd-send-scheduled-at" />
        </div>
      </div>
    </div>`;
}

function eventCard(e) {
  const nums = ["142", "68", "94%", "2.4د", "31"];
  const statsHtml = e.stats
    .map((lbl, i) => `<div class="si-stat"><span class="si-stat-val">${nums[i]}</span><span class="si-stat-lbl">${lbl}</span></div>`)
    .join("");
  const productSwitchLabel = e.productSwitchLabel || "تخصيص الرسالة لمنتج";
  const tagSwitchLabel = e.tagSwitchLabel || "إضافة وسم";
  const productPlaceholder = e.productPlaceholder || "اكتب SKU المنتج ثم Enter";
  const productTagExtras = `
                <div class="si-extra-item">
                  <label class="si-inline-switch"><input type="checkbox" class="si-extra-toggle" /><span>${productSwitchLabel}</span></label>
                  <div class="si-extra-panel">
                    <div class="wd-field-group si-product-tags-field">
                      <label>إضافة المنتجات</label>
                      <input type="text" class="wd-select si-product-tag-input" placeholder="${productPlaceholder}" autocomplete="off" />
                      <div class="wd-selected-groups si-product-tag-list" aria-live="polite"></div>
                    </div>
                  </div>
                </div>
                <div class="si-extra-item">
                  <label class="si-inline-switch"><input type="checkbox" class="si-extra-toggle" /><span>${tagSwitchLabel}</span></label>
                  <div class="si-extra-panel">
                    <div class="wd-field-group si-tag-pick-field">
                      <label>الوسوم (يمكن اختيار أكثر من وسم)</label>
                      <div class="wd-group-search">
                        <input
                          type="text"
                          class="wd-select si-tag-search-input"
                          readonly
                          placeholder="انقر لاختيار الوسوم..."
                        />
                        <div class="wd-group-list si-tag-group-list">
                          <div class="wd-group-item" data-group="VIP" data-tone="vip">VIP</div>
                          <div class="wd-group-item" data-group="متابعة" data-tone="followup">متابعة</div>
                          <div class="wd-group-item" data-group="عميل محتمل" data-tone="lead">عميل محتمل</div>
                          <div class="wd-group-item" data-group="تشغيل تلقائي" data-tone="auto">تشغيل تلقائي</div>
                        </div>
                      </div>
                      <div class="wd-selected-groups si-tag-selected-display"></div>
                    </div>
                  </div>
                </div>`;
  const messageAndExtras = `
              <div class="si-subhead"><i class="fas fa-message"></i> الرسالة</div>
              <div class="si-msg-grid">
                <div class="si-msg-col">
                  <label class="si-inline-switch"><input type="checkbox" class="si-tpl-toggle" /><span>إرسال قالب</span></label>
                  <div class="si-msg-template-panel">
                    <div class="wd-whatsapp-template-fields active">
                      <div class="wd-field-group">
                        <label>اختر القالب</label>
                        <select class="wd-select wd-template-name"><option value="">اختر القالب</option></select>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="si-msg-col">
                  <label class="si-inline-switch"><input type="checkbox" class="si-flow-toggle" /><span>إرسال تدفق</span></label>
                  <div class="si-msg-flow-panel">
                    <div class="wd-field-group">
                      <label>اختر التدفق</label>
                      <select class="wd-select wd-flow-name"><option value="">اختر التدفق</option><option value="__si_create_flow__">إنشاء تدفق جديد</option><option>تدفق افتراضي للحدث</option><option>تدفق مخصص</option></select>
                    </div>
                  </div>
                </div>
                <div class="si-msg-preview-host"></div>
              </div>
              <div class="si-extra-list">${productTagExtras}
                <div class="si-extra-item">
                  <label class="si-inline-switch"><input type="checkbox" class="si-extra-toggle" /><span>تخصيص وقت الإرسال</span></label>
                  <div class="si-extra-panel">
                    ${e.id === "auto_retarget" || e.id === "abandoned_cart" ? timingBlockAutoRetarget() : timingBlock()}
                  </div>
                </div>
              </div>`;
  const multiSendEvents = ["auto_retarget", "abandoned_cart"];
  const bodyInner = multiSendEvents.includes(e.id)
    ? `<div class="si-auto-retarget-sends"><div class="si-send-block" data-send-id="main">${messageAndExtras}</div><div class="si-add-send-wrap"><button type="button" class="si-add-send-btn">+ إضافة إرسال جديد</button></div></div>`
    : messageAndExtras;
  return `
          <div class="wd-tt-card si-event-card" data-event-card="${e.id}">
            <div class="wd-tt-card-header">
              <div>
                <div class="wd-tt-card-title"><i class="fas ${e.icon}"></i> ${e.title}</div>
                <p class="si-event-desc">${e.desc}</p>
              </div>
              <label class="wd-tt-switch" title="تفعيل الحدث">
                <input type="checkbox" class="si-event-main-toggle" />
                <span class="wd-tt-slider"></span>
              </label>
            </div>
            <div class="wd-tt-card-body si-event-body">
              <div class="si-stats-grid">${statsHtml}</div>
              ${bodyInner}
            </div>
          </div>`;
}

const inner = `          <div class="wd-events-root">
            <div class="si-events-stack">
${events.map(eventCard).join("\n")}
            </div>
          </div>`;

const file = path.join(__dirname, "salla-integration.html");
let s = fs.readFileSync(file, "utf8");
const a = s.indexOf('<div class="wd-events-root">');
const b = s.indexOf("\n\n        <div class=\"wd-settings-actions\">");
if (a === -1 || b === -1) throw new Error("markers not found");
s = s.slice(0, a) + inner + s.slice(b);
fs.writeFileSync(file, s);
console.log("patched", file);
