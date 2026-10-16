/* Système SMS Iconic Heart, adapté aux templates et au forum SMS de Coming Up Roses. */
(function () {
  "use strict";

  function installSMSDirectionPicker(topic, options) {
    options = options || {};
    var quickReply = options.form || topic.querySelector("#quickreply_content, .quickreply");
    if (!quickReply || quickReply.querySelector(".sms-direction-picker")) return;
    var form = quickReply.matches("form") ? quickReply : quickReply.querySelector("form");
    var textarea = quickReply.querySelector('textarea[name="message"], textarea#text_editor_textarea');
    if (!form || !textarea || form.dataset.curSmsReady) return;
    form.dataset.curSmsReady = "true";

    var storageKey = "coming-up-roses-sms-direction";
    var direction = "droite";
    try {
      var savedDirection = window.localStorage.getItem(storageKey);
      if (!options.newTopic && (savedDirection === "gauche" || savedDirection === "droite")) direction = savedDirection;
    } catch (error) {}

    var picker = document.createElement("div");
    picker.className = "sms-direction-picker";
    picker.innerHTML = '<span><i class="ph-thin ph-chat-circle-dots"></i> position de mes messages</span><div><button type="button" data-sms-direction="gauche"><i class="ph-thin ph-arrow-left"></i> gauche</button><button type="button" data-sms-direction="droite">droite <i class="ph-thin ph-arrow-right"></i></button></div>';
    if (!options.newTopic) (form.querySelector("#textarea_content") || textarea).before(picker);

    function selectDirection(nextDirection) {
      direction = nextDirection;
      picker.querySelectorAll("[data-sms-direction]").forEach(function (button) {
        var active = button.dataset.smsDirection === direction;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      try { if (!options.newTopic) window.localStorage.setItem(storageKey, direction); } catch (error) {}
    }

    picker.addEventListener("click", function (event) {
      var button = event.target.closest("[data-sms-direction]");
      if (button) selectDirection(button.dataset.smsDirection);
    });
    selectDirection(direction);

    function prepareSMS() {
      var editor = null;
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.sceditor) {
        try { editor = window.jQuery(textarea).sceditor("instance"); } catch (error) {}
      }
      var content = editor && typeof editor.val === "function" ? editor.val() : textarea.value;
      if (!content || !content.trim() || /<sms\b/i.test(content)) return;
      var wrapped = content.split(/\r?\n|<br\s*\/?>/i).map(function (line) {
        return line.trim();
      }).filter(Boolean).map(function (line) {
        return '<sms class="' + direction + '">' + line + '</sms>';
      }).join("\n");
      if (!wrapped) return;
      if (editor && typeof editor.val === "function") {
        editor.val(wrapped);
        if (typeof editor.updateOriginal === "function") editor.updateOriginal();
      }
      textarea.value = wrapped;
    }
    form.addEventListener("submit", prepareSMS, true);
    form.addEventListener("click", function (event) {
      var button = event.target.closest('input[type="submit"], button[type="submit"]');
      if (button && button.form === form) prepareSMS();
    }, true);
  }

  function initSMSConversation() {
    var topic = document.querySelector("#page-body") || document.body;
    if (!topic || topic.classList.contains("sms-conversation")) return;
    var smsForum = topic.querySelector('.navigation_links a[href*="/f29-"]');
    if (!smsForum || !topic.querySelector('.topic-post')) return;
    if (smsForum) installSMSDirectionPicker(topic);

    var messages = Array.prototype.filter.call(
      topic.querySelectorAll(".post-prose sms.gauche, .post-prose sms.droite"),
      function (message) {
        return !message.closest("blockquote, .codebox, code, pre");
      }
    );
    if (!messages.length) return;

    topic.classList.add("sms-conversation");
    var posts = topic.querySelector(".topic-posts");
    if (!posts) {
      var firstPost = topic.querySelector(".topic-post");
      var container = firstPost.parentElement;
      posts = document.createElement("div");
      posts.className = "topic-posts";
      firstPost.before(posts);
      Array.from(container.children).filter(function (node) { return node.matches(".topic-post"); }).forEach(function (post) { posts.appendChild(post); });
    }
    var paginations = topic.querySelectorAll(".page-actions .pagination");
    var topPagination = paginations[0];
    var bottomPagination = paginations[1];
    topic.querySelectorAll('.page-actions a[href*="mode=reply"]').forEach(function (link) {
      var url = new URL(link.getAttribute("href"), location.href);
      url.searchParams.set("f", "29");
      link.href = url.href;
    });
    var title = topic.querySelector(".container .page-title");
    var header = document.createElement("header");
    header.className = "sms-phone-head";
    header.innerHTML = '<div class="sms-contact"><i class="ph-thin ph-caret-left"></i><strong></strong><i class="ph-thin ph-video-camera"></i></div>';
    header.querySelector("strong").textContent = title ? title.textContent.trim() : "conversation";
    posts.prepend(header);

    var activePosts = [];
    messages.forEach(function (message) {
      var post = message.closest(".post");
      if (!post) return;
      if (activePosts.indexOf(post) === -1) activePosts.push(post);
    });

    topic.querySelectorAll(".topic-posts > .post").forEach(function (post) {
      if (activePosts.indexOf(post) === -1) {
        post.classList.add("sms-empty-post");
        return;
      }
      post.classList.add("sms-post");
      var content = post.querySelector(".post-prose");
      if (!content) return;
      var list = document.createElement("div");
      list.className = "sms-message-list";
      var authorAvatar = post.querySelector(".post_avatar img");
      var authorLink = post.querySelector(".post_pseudo a");
      var authorName = post.querySelector(".post_pseudo");
      messages.filter(function (message) { return message.closest(".post") === post; }).forEach(function (message) {
        var row = document.createElement("div");
        var side = message.classList.contains("droite") ? "droite" : "gauche";
        row.className = "sms-message-row " + side;
        var avatar = document.createElement("a");
        avatar.className = "sms-message-avatar";
        avatar.href = authorLink ? authorLink.href : "#";
        avatar.title = authorName ? authorName.textContent.trim() : "Voir le profil";
        if (authorAvatar) {
          var image = document.createElement("img");
          image.src = authorAvatar.src;
          image.alt = authorName ? authorName.textContent.trim() : "";
          avatar.appendChild(image);
        } else avatar.innerHTML = '<i class="ph-thin ph-user"></i>';
        if (side === "droite") {
          row.appendChild(message);
          row.appendChild(avatar);
        } else {
          row.appendChild(avatar);
          row.appendChild(message);
        }
        list.appendChild(row);
      });
      content.replaceChildren(list);

      var edit = post.querySelector(".btn-edit");
      if (edit && edit.getAttribute("href")) {
        list.querySelectorAll("sms").forEach(function (message) {
          var link = document.createElement("a");
          link.className = "sms-edit";
          link.href = edit.getAttribute("href");
          link.title = "Éditer ce message";
          link.innerHTML = '<i class="ph-thin ph-pencil-simple"></i>';
          message.appendChild(link);
        });
      }
    });

    var firstMessage = posts.querySelector(".sms-message-row");
    if (firstMessage) firstMessage.classList.add("is-first");

    var composer = document.createElement("footer");
    composer.className = "sms-phone-composer";
    composer.innerHTML = '<i class="ph-thin ph-camera"></i><span>iMessage</span><i class="ph-thin ph-microphone"></i>';
    posts.appendChild(composer);

    var screen = document.createElement("div");
    screen.className = "sms-phone-screen";
    Array.prototype.slice.call(posts.children).forEach(function (child) {
      screen.appendChild(child);
    });
    posts.appendChild(screen);

    if (!bottomPagination && topPagination && (topPagination.children.length || topPagination.textContent.trim())) {
      var paginationBar = document.createElement("nav");
      paginationBar.className = "sms-pagination";
      paginationBar.setAttribute("aria-label", "Pagination de la conversation");
      paginationBar.appendChild(topPagination.cloneNode(true));
      posts.insertAdjacentElement("afterend", paginationBar);
    }

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.style_my_tooltips) {
      window.jQuery(".sms-message-avatar[title]").style_my_tooltips({
        tip_follows_cursor: true,
        tip_delay_time: 100,
        tip_fade_speed: 150
      });
    }
  }

  function initSMSPostingForm() {
    var form = document.querySelector('form[name="post"]');
    if (!form) return;
    var params = new URLSearchParams(location.search);
    var forum = form.querySelector('input[name="f"]');
    var modeField = form.querySelector('input[name="mode"]');
    var forumID = forum ? forum.value : params.get("f");
    var mode = modeField ? modeField.value : params.get("mode");
    if (forumID === "29" && (mode === "newtopic" || mode === "reply")) {
      installSMSDirectionPicker(document, { form: form, newTopic: mode === "newtopic" });
    }
  }

  function start() {
    initSMSPostingForm();
    initSMSConversation();
  }
  function register() {
    window.ComingUpRoses.register("sms", '.topic-post, form[name="post"], #quickreply_content', start);
  }
  if (window.ComingUpRoses && window.ComingUpRoses.register) register();
  else document.addEventListener("cur-core-ready", register, { once: true });
})();
