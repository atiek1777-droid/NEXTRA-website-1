(function(){
  "use strict";

  const STORAGE_KEY = "nextra-lang";
  const html = document.documentElement;

  function getLang(){
    return localStorage.getItem(STORAGE_KEY) || "en";
  }

  function get(obj, path){
    return path.split(".").reduce((o,k)=> (o && o[k] !== undefined) ? o[k] : undefined, obj);
  }

  function render(lang){
    const dict = NEXTRA_I18N[lang];
    if(!dict) return;

    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    document.title = dict.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if(metaDesc) metaDesc.setAttribute("content", dict.meta.description);

    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      const val = get(dict, key);
      if(val !== undefined) el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
      const key = el.getAttribute("data-i18n-ph");
      const val = get(dict, key);
      if(val !== undefined) el.setAttribute("placeholder", val);
    });

    // select options rendered from arrays
    document.querySelectorAll("[data-i18n-options]").forEach(el=>{
      const key = el.getAttribute("data-i18n-options");
      const phKey = el.getAttribute("data-i18n-ph");
      const opts = get(dict, key);
      const placeholder = phKey ? get(dict, phKey) : "";
      if(Array.isArray(opts)){
        el.innerHTML = "";
        const phOpt = document.createElement("option");
        phOpt.value = ""; phOpt.disabled = true; phOpt.selected = true;
        phOpt.textContent = placeholder || "";
        el.appendChild(phOpt);
        opts.forEach(o=>{
          const opt = document.createElement("option");
          opt.value = o; opt.textContent = o;
          el.appendChild(opt);
        });
      }
    });

    const langBtn = document.getElementById("langSwitch");
    if(langBtn) langBtn.textContent = dict.nav.langBtn;

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function initLangSwitch(){
    const btn = document.getElementById("langSwitch");
    if(!btn) return;
    btn.addEventListener("click", ()=>{
      const next = getLang() === "en" ? "ar" : "en";
      render(next);
    });
  }

  function initNav(){
    const nav = document.getElementById("siteNav");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");

    window.addEventListener("scroll", ()=>{
      if(window.scrollY > 20) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }, {passive:true});

    if(toggle && links){
      toggle.addEventListener("click", ()=>{
        const isOpen = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
      links.querySelectorAll("a").forEach(a=>{
        a.addEventListener("click", ()=> links.classList.remove("open"));
      });
    }
  }

  function initReveal(){
    const els = document.querySelectorAll("[data-reveal]");
    if(!("IntersectionObserver" in window)){
      els.forEach(el=> el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15 });
    els.forEach(el=> io.observe(el));
  }

  function initForm(){
    const form = document.getElementById("contactForm");
    if(!form) return;
    const status = document.getElementById("formStatus");
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const lang = getLang();
      const msg = lang === "ar"
        ? "شكرًا لتواصلك. تم استلام طلبك وسنعاود التواصل خلال يوم عمل واحد."
        : "Thank you — your assessment request has been received. We'll be in touch within one working day.";
      if(status){
        status.textContent = msg;
        status.style.color = "var(--gold-400)";
      }
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    render(getLang());
    initLangSwitch();
    initNav();
    initReveal();
    initForm();
  });
})();
