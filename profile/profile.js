"use strict";

/*
 * FarmSetu Advanced Farmer Social Profile
 * ---------------------------------------
 * Frontend version.
 *
 * Handles:
 * - profile tabs
 * - follow / unfollow
 * - followers / following
 * - farmer reviews
 * - social posts
 * - likes
 * - comments
 * - saved posts
 * - post composer
 * - photo posts
 * - product posts
 * - profile photo
 * - cover photo
 * - profile sharing
 * - profile menu
 * - notifications
 *
 * Permanent storage will later move to Supabase.
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------
     FARMER PROFILE DATA
  --------------------------------------- */

  const farmer = {
    id: 1,
    name: "Rameshbhai Patel",
    username: "@rameshorganicfarm",
    verified: true,
    location: "Rajkot, Gujarat",
    rating: 4.8,
    reviewCount: 120,
    posts: 24,
    followers: 2500,
    following: 186,
    products: 8
  };


  /* ---------------------------------------
     DEMO POSTS
  --------------------------------------- */

  const farmerPosts = [

    {
      id: 1,

      category: "Farm Update",

      text:
        "Today we harvested the first organic tomato crop of the season. The plants performed well with compost and drip irrigation.",

      mediaType: "image",

      media: "🍅",

      mediaLabel:
        "Fresh organic tomato harvest",

      date:
        "2026-11-09T09:20:00",

      location:
        "Rajkot, Gujarat",

      likes: 128,

      liked: false,

      saved: false,

      comments: [

        {
          author:
            "Kisan Community",

          text:
            "The crop looks excellent. Which tomato variety did you use?"
        },

        {
          author:
            "Green Farm",

          text:
            "Thank you for sharing the irrigation method."
        }

      ]

    },


    {
      id: 2,

      category:
        "Organic Learning",

      text:
        "Compost preparation update: we are mixing dry crop residue, green material and farmyard manure. Moisture is being maintained without allowing standing water.",

      mediaType: "image",

      media: "🌿",

      mediaLabel:
        "Organic compost material",

      date:
        "2026-11-07T16:40:00",

      location:
        "Shree Hari Organic Farm",

      likes: 94,

      liked: true,

      saved: true,

      comments: [

        {
          author:
            "Organic Learner",

          text:
            "Please share the approximate composting time."
        }

      ]

    },


    {
      id: 3,

      category:
        "Crop Update",

      text:
        "Our wheat field after irrigation. We are monitoring soil moisture before the next irrigation cycle to avoid unnecessary water use.",

      mediaType: "image",

      media: "🌾",

      mediaLabel:
        "Wheat crop field",

      date:
        "2026-11-04T07:30:00",

      location:
        "Rajkot District",

      likes: 76,

      liked: false,

      saved: false,

      comments: []

    }

  ];


  /* ---------------------------------------
     SOCIAL USERS
  --------------------------------------- */

  const socialUsers = {

    followers: [

      {
        name: "Kiran Patel",
        username: "@kiranfarms",
        avatar: "🌾",
        detail:
          "Wheat and cotton farmer"
      },

      {
        name: "Mehul Agro",
        username: "@mehulagro",
        avatar: "🚜",
        detail:
          "Farm equipment provider"
      },

      {
        name: "Organic Grower",
        username: "@organicgrower",
        avatar: "🌿",
        detail:
          "Organic vegetable producer"
      },

      {
        name: "Farm Learning",
        username: "@farmlearning",
        avatar: "📚",
        detail:
          "Agricultural education"
      }

    ],


    following: [

      {
        name:
          "Gujarat Farm Network",

        username:
          "@gujaratfarm",

        avatar:
          "🌱",

        detail:
          "Farming community"
      },

      {
        name:
          "Kisan Equipment",

        username:
          "@kisanequipment",

        avatar:
          "🚜",

        detail:
          "Equipment sales and rental"
      },

      {
        name:
          "Soil Health India",

        username:
          "@soilhealth",

        avatar:
          "🌍",

        detail:
          "Soil management information"
      }

    ],


    reviews: [

      {
        name:
          "Verified Buyer",

        username:
          "Product order",

        avatar:
          "🛒",

        detail:
          "⭐ 5.0 · Fresh vegetables and reliable communication."
      },

      {
        name:
          "Equipment Customer",

        username:
          "Equipment rental",

        avatar:
          "🚜",

        detail:
          "⭐ 4.7 · Equipment was supplied as described."
      },

      {
        name:
          "FarmSetu Learner",

        username:
          "Organic course",

        avatar:
          "📚",

        detail:
          "⭐ 4.8 · Practical compost-making information."
      }

    ]

  };


  /* ---------------------------------------
     STATE
  --------------------------------------- */

  let isFollowing = false;

  let selectedPostImage = null;

  let selectedPostProduct = null;

  let toastTimer = null;


  /* ---------------------------------------
     SAVED STATE (browser storage)
     Posts, likes, comments, follow state
     survive a page refresh. Replace with
     Supabase during the backend phase.
  --------------------------------------- */

  const STORAGE_KEY = "farmsetu-profile-state";

  function saveProfileState() {

    const payload = {
      posts: farmerPosts,
      isFollowing: isFollowing,
      followers: farmer.followers,
      postCount: farmer.posts
    };

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(payload)
      );

    } catch (error) {

      /* Storage may be full (large photos) or blocked.
         Retry without uploaded photo data. */

      try {

        payload.posts =
          farmerPosts.map(post =>
            post.mediaType === "uploaded-image"
              ? { ...post, media: "🌾", mediaType: "image" }
              : post
          );

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(payload)
        );

      } catch (secondError) {
        /* App keeps working without saving. */
      }

    }

  }

  (function restoreProfileState() {

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(STORAGE_KEY)
        );

      if (!saved || !Array.isArray(saved.posts)) {
        return;
      }

      farmerPosts.splice(
        0,
        farmerPosts.length,
        ...saved.posts
      );

      isFollowing = Boolean(saved.isFollowing);

      if (Number.isFinite(saved.followers)) {
        farmer.followers = saved.followers;
      }

      if (Number.isFinite(saved.postCount)) {
        farmer.posts = saved.postCount;
      }

    } catch (error) {
      /* Ignore corrupted saved data. */
    }

  })();


  /* ---------------------------------------
     ELEMENTS
  --------------------------------------- */

  const postFeed =
    document.getElementById(
      "farmerPostFeed"
    );

  const postSortSelect =
    document.getElementById(
      "postSortSelect"
    );

  const followButton =
    document.getElementById(
      "followFarmerButton"
    );

  const followerCount =
    document.getElementById(
      "followerCount"
    );

  const profileToast =
    document.getElementById(
      "profileToast"
    );


  /* ---------------------------------------
     PROFILE TABS
  --------------------------------------- */

  document
    .querySelectorAll(
      ".profile-content-tab"
    )
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          const panelId =
            tab.dataset.panel;

          activateProfilePanel(
            panelId
          );

        }
      );

    });


  function activateProfilePanel(
    panelId
  ) {

    document
      .querySelectorAll(
        ".profile-content-tab"
      )
      .forEach(tab => {

        tab.classList.toggle(
          "active",
          tab.dataset.panel === panelId
        );

      });


    document
      .querySelectorAll(
        ".profile-panel"
      )
      .forEach(panel => {

        panel.classList.toggle(
          "active",
          panel.id === panelId
        );

      });

  }


  /* ---------------------------------------
     FOLLOW FARMER
  --------------------------------------- */

  if (followButton) {

    followButton.addEventListener(
      "click",
      () => {

        isFollowing =
          !isFollowing;


        followButton.dataset.following =
          String(isFollowing);


        followButton.textContent =
          isFollowing
            ? "Following"
            : "Follow";


        farmer.followers +=
          isFollowing
            ? 1
            : -1;


        updateFollowerCount();

        saveProfileState();


        showToast(
          isFollowing
            ? "You are now following this farmer."
            : "Farmer unfollowed."
        );

      }
    );

  }


  function updateFollowerCount() {

    if (!followerCount) {
      return;
    }


    followerCount.textContent =
      farmer.followers < 10000
        ? farmer.followers.toLocaleString("en-IN")
        : formatSocialNumber(
            farmer.followers
          );

  }


  /* ---------------------------------------
     MESSAGE FARMER
  --------------------------------------- */

  const messageFarmerButton =
    document.getElementById(
      "messageFarmerButton"
    );


  if (messageFarmerButton) {

    messageFarmerButton.addEventListener(
      "click",
      () => {

        showToast(
          "Secure FarmSetu messaging will connect during the backend phase."
        );

      }
    );

  }


  /* ---------------------------------------
     SHARE PROFILE
  --------------------------------------- */

  const shareProfileButton =
    document.getElementById(
      "shareProfileButton"
    );


  if (shareProfileButton) {

    shareProfileButton.addEventListener(
      "click",
      shareProfile
    );

  }


  async function shareProfile() {

    const profileUrl =
      window.location.href;


    try {

      if (
        navigator.share &&
        window.isSecureContext
      ) {

        await navigator.share({

          title:
            farmer.name +
            " on FarmSetu",

          text:
            "View this farmer profile on FarmSetu.",

          url:
            profileUrl

        });


        return;

      }


      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {

        await navigator.clipboard.writeText(
          profileUrl
        );


        showToast(
          "Profile link copied."
        );


        return;

      }


      showToast(
        "Profile sharing is ready."
      );

    } catch (error) {

      /*
       * Native sharing may be cancelled
       * by the user. No error needs to
       * be displayed.
       */

    }

  }


  /* ---------------------------------------
     PROFILE & COVER IMAGES
  --------------------------------------- */

  const avatarFileInput =
    document.getElementById(
      "avatarFileInput"
    );

  const coverFileInput =
    document.getElementById(
      "coverFileInput"
    );


  const changeAvatarButton =
    document.getElementById(
      "changeAvatarButton"
    );


  const changeCoverButton =
    document.getElementById(
      "changeCoverButton"
    );


  if (
    changeAvatarButton &&
    avatarFileInput
  ) {

    changeAvatarButton.addEventListener(
      "click",
      () => {

        avatarFileInput.click();

      }
    );

  }


  if (
    changeCoverButton &&
    coverFileInput
  ) {

    changeCoverButton.addEventListener(
      "click",
      () => {

        coverFileInput.click();

      }
    );

  }


  if (avatarFileInput) {

    avatarFileInput.addEventListener(
      "change",
      () => {

        const file =
          avatarFileInput.files[0];


        if (!validateImage(file)) {

          avatarFileInput.value =
            "";

          return;

        }


        readImage(
          file,
          imageUrl => {

            const avatar =
              document.getElementById(
                "profileAvatar"
              );


            if (!avatar) {
              return;
            }


            avatar.textContent = "";


            avatar.style.backgroundImage =
              `url("${imageUrl}")`;


            avatar.classList.add(
              "has-profile-image"
            );


            showToast(
              "Profile picture updated."
            );

          }
        );


        avatarFileInput.value =
          "";

      }
    );

  }


  if (coverFileInput) {

    coverFileInput.addEventListener(
      "change",
      () => {

        const file =
          coverFileInput.files[0];


        if (!validateImage(file)) {

          coverFileInput.value =
            "";

          return;

        }


        readImage(
          file,
          imageUrl => {

            const cover =
              document.querySelector(
                ".profile-cover"
              );


            if (!cover) {
              return;
            }


            cover.style.backgroundImage =
              `
              linear-gradient(
                rgba(5,73,30,.16),
                rgba(5,73,30,.55)
              ),
              url("${imageUrl}")
              `;


            cover.style.backgroundSize =
              "cover";


            cover.style.backgroundPosition =
              "center";


            showToast(
              "Cover photo updated."
            );

          }
        );


        coverFileInput.value = "";

      }
    );

  }


  function validateImage(file) {

    if (!file) {
      return false;
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      showToast(
        "Please select an image file."
      );

      return false;

    }


    const maxSize =
      5 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      showToast(
        "Image must be smaller than 5 MB."
      );

      return false;

    }


    return true;

  }


  function readImage(
    file,
    callback
  ) {

    const reader =
      new FileReader();


    reader.onload =
      event => {

        callback(
          event.target.result
        );

      };


    reader.readAsDataURL(
      file
    );

  }


  /* ---------------------------------------
     SOCIAL STATISTICS
  --------------------------------------- */

  document
    .querySelectorAll(
      ".statistic-button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const statistic =
            button.dataset.stat;


          if (
            statistic === "posts"
          ) {

            activateProfilePanel(
              "postsPanel"
            );

            return;

          }


          if (
            statistic === "products"
          ) {

            activateProfilePanel(
              "productsPanel"
            );

            return;

          }


          if (
            statistic ===
            "followers"
          ) {

            openSocialList(
              "followers"
            );

            return;

          }


          if (
            statistic ===
            "following"
          ) {

            openSocialList(
              "following"
            );

          }

        }
      );

    });


  const reviewsButton =
    document.getElementById(
      "openReviewsButton"
    );


  if (reviewsButton) {

    reviewsButton.addEventListener(
      "click",
      () => {

        openSocialList(
          "reviews"
        );

      }
    );

  }


  /* ---------------------------------------
     SOCIAL LIST PANEL
  --------------------------------------- */

  const socialListModal =
    document.getElementById(
      "socialListModal"
    );

  const socialListBackdrop =
    document.getElementById(
      "socialListBackdrop"
    );


  const closeSocialListButton =
    document.getElementById(
      "closeSocialList"
    );


  if (closeSocialListButton) {

    closeSocialListButton.addEventListener(
      "click",
      () => {

        closeSheet(
          socialListModal,
          socialListBackdrop
        );

      }
    );

  }


  if (socialListBackdrop) {

    socialListBackdrop.addEventListener(
      "click",
      () => {

        closeSheet(
          socialListModal,
          socialListBackdrop
        );

      }
    );

  }


  function openSocialList(type) {

    if (
      !socialListModal ||
      !socialListBackdrop
    ) {
      return;
    }


    const titleElement =
      document.getElementById(
        "socialListTitle"
      );


    const content =
      document.getElementById(
        "socialListContent"
      );


    if (
      !titleElement ||
      !content
    ) {
      return;
    }


    const title =
      type === "following"
        ? "Following"
        : type === "reviews"
          ? "Farmer Reviews"
          : "Followers";


    titleElement.textContent =
      title;


    content.innerHTML = "";


    const users =
      socialUsers[type] ||
      [];


    users.forEach(user => {

      const row =
        document.createElement(
          "article"
        );


      row.className =
        "social-user-row";


      row.innerHTML = `
        <div class="social-user-avatar">
          ${escapeHtml(user.avatar)}
        </div>

        <div class="social-user-information">

          <strong>
            ${escapeHtml(user.name)}
          </strong>

          <small>
            ${escapeHtml(user.username)}
          </small>

          <p>
            ${escapeHtml(user.detail)}
          </p>

        </div>

        <button
          type="button"
          class="social-follow-button"
        >
          ${
            type === "reviews"
              ? "View"
              : "Follow"
          }
        </button>
      `;


      const actionButton =
        row.querySelector(
          ".social-follow-button"
        );


      actionButton.addEventListener(
        "click",
        () => {

          if (
            type === "reviews"
          ) {

            showToast(
              "Detailed review view will connect to the backend."
            );

            return;

          }


          const following =
            actionButton.dataset.following ===
            "true";


          actionButton.dataset.following =
            String(!following);


          actionButton.textContent =
            following
              ? "Follow"
              : "Following";

        }
      );


      content.appendChild(
        row
      );

    });


    openSheet(
      socialListModal,
      socialListBackdrop
    );

  }


  /* ---------------------------------------
     PROFILE MENU
  --------------------------------------- */

  const profileMenu =
    document.getElementById(
      "profileMenu"
    );

  const profileMenuBackdrop =
    document.getElementById(
      "profileMenuBackdrop"
    );


  const openProfileMenuButton =
    document.getElementById(
      "openProfileMenu"
    );


  const closeProfileMenuButton =
    document.getElementById(
      "closeProfileMenu"
    );


  if (openProfileMenuButton) {

    openProfileMenuButton.addEventListener(
      "click",
      () => {

        openSheet(
          profileMenu,
          profileMenuBackdrop
        );

      }
    );

  }


  if (closeProfileMenuButton) {

    closeProfileMenuButton.addEventListener(
      "click",
      () => {

        closeSheet(
          profileMenu,
          profileMenuBackdrop
        );

      }
    );

  }


  if (profileMenuBackdrop) {

    profileMenuBackdrop.addEventListener(
      "click",
      () => {

        closeSheet(
          profileMenu,
          profileMenuBackdrop
        );

      }
    );

  }


  document
    .querySelectorAll(
      ".profile-menu-option"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          handleProfileMenuAction(
            button
          );

        }
      );

    });


  function handleProfileMenuAction(
    button
  ) {

    const action =
      button.dataset.menuAction;


    if (
      action === "share"
    ) {

      shareProfile();

    }


    if (
      action ===
      "notifications"
    ) {

      button.classList.toggle(
        "selected-option"
      );


      showToast(
        button.classList.contains(
          "selected-option"
        )
          ? "Post notifications enabled."
          : "Post notifications disabled."
      );

    }


    if (
      action === "report"
    ) {

      const reason =
        window.prompt(
          "Briefly explain why you are reporting this profile."
        );


      if (
        reason &&
        reason.trim()
      ) {

        showToast(
          "Report prepared for moderation review."
        );

      }

    }


    if (
      action === "block"
    ) {

      const confirmed =
        window.confirm(
          "Block this farmer profile?"
        );


      if (confirmed) {

        showToast(
          "Block request prepared."
        );

      }

    }


    closeSheet(
      profileMenu,
      profileMenuBackdrop
    );

  }


  /* ---------------------------------------
     POST COMPOSER
  --------------------------------------- */

  const postComposer =
    document.getElementById(
      "postComposer"
    );

  const postComposerBackdrop =
    document.getElementById(
      "postComposerBackdrop"
    );

  const postText =
    document.getElementById(
      "postText"
    );

  const postPhotoInput =
    document.getElementById(
      "postPhotoInput"
    );

  const postMediaPreview =
    document.getElementById(
      "postMediaPreview"
    );

  const postCharacterCount =
    document.getElementById(
      "postCharacterCount"
    );


  const openPostComposerButton =
    document.getElementById(
      "openPostComposer"
    );


  if (openPostComposerButton) {

    openPostComposerButton.addEventListener(
      "click",
      openComposer
    );

  }


  const closePostComposerButton =
    document.getElementById(
      "closePostComposer"
    );


  if (closePostComposerButton) {

    closePostComposerButton.addEventListener(
      "click",
      closeComposer
    );

  }


  if (postComposerBackdrop) {

    postComposerBackdrop.addEventListener(
      "click",
      closeComposer
    );

  }


  const photoPostButton =
    document.getElementById(
      "photoPostButton"
    );


  if (photoPostButton) {

    photoPostButton.addEventListener(
      "click",
      () => {

        openComposer();

        postPhotoInput?.click();

      }
    );

  }


  const videoPostButton =
    document.getElementById(
      "videoPostButton"
    );


  if (videoPostButton) {

    videoPostButton.addEventListener(
      "click",
      () => {

        openComposer();

        showToast(
          "Video upload will connect to FarmSetu cloud storage."
        );

      }
    );

  }


  const marketPostButton =
    document.getElementById(
      "marketPostButton"
    );


  if (marketPostButton) {

    marketPostButton.addEventListener(
      "click",
      () => {

        openComposer();

        addProductToPost();

      }
    );

  }


  const composerPhotoButton =
    document.getElementById(
      "composerPhotoButton"
    );


  if (composerPhotoButton) {

    composerPhotoButton.addEventListener(
      "click",
      () => {

        postPhotoInput?.click();

      }
    );

  }


  const composerVideoButton =
    document.getElementById(
      "composerVideoButton"
    );


  if (composerVideoButton) {

    composerVideoButton.addEventListener(
      "click",
      () => {

        showToast(
          "Video upload will connect to secure storage."
        );

      }
    );

  }


  const composerProductButton =
    document.getElementById(
      "composerProductButton"
    );


  if (composerProductButton) {

    composerProductButton.addEventListener(
      "click",
      addProductToPost
    );

  }


  if (postText) {

    postText.addEventListener(
      "input",
      () => {

        if (
          postCharacterCount
        ) {

          postCharacterCount.textContent =
            `${postText.value.length} / 500`;

        }

      }
    );

  }


  /* ---------------------------------------
     POST PHOTO
  --------------------------------------- */

  if (postPhotoInput) {

    postPhotoInput.addEventListener(
      "change",
      () => {

        const file =
          postPhotoInput.files[0];


        if (!validateImage(file)) {

          postPhotoInput.value =
            "";

          return;

        }


        readImage(
          file,
          imageUrl => {

            selectedPostImage =
              imageUrl;


            selectedPostProduct =
              null;


            renderSelectedPostImage(
              imageUrl
            );

          }
        );


        postPhotoInput.value =
          "";

      }
    );

  }


  function renderSelectedPostImage(
    imageUrl
  ) {

    if (!postMediaPreview) {
      return;
    }


    postMediaPreview.hidden =
      false;


    postMediaPreview.innerHTML = `
      <div class="selected-media-preview">

        <img
          src="${imageUrl}"
          alt="Selected post"
        >

        <button
          id="removeSelectedMedia"
          type="button"
          aria-label="Remove selected image"
        >
          ×
        </button>

      </div>
    `;


    document
      .getElementById(
        "removeSelectedMedia"
      )
      ?.addEventListener(
        "click",
        clearPostMedia
      );

  }


  /* ---------------------------------------
     ADD PRODUCT TO POST
  --------------------------------------- */

  function addProductToPost() {

    selectedPostImage =
      null;


    selectedPostProduct = {

      id: 1,

      name:
        "Organic Tomatoes",

      icon:
        "🍅",

      price:
        "₹30 / kg"

    };


    if (!postMediaPreview) {
      return;
    }


    postMediaPreview.hidden =
      false;


    postMediaPreview.innerHTML = `
      <div class="selected-product-preview">

        <div class="selected-product-icon">
          🍅
        </div>

        <div>

          <small>
            PRODUCT LISTING
          </small>

          <strong>
            Organic Tomatoes
          </strong>

          <span>
            ₹30 / kg
          </span>

        </div>

        <button
          id="removeSelectedMedia"
          type="button"
          aria-label="Remove product"
        >
          ×
        </button>

      </div>
    `;


    document
      .getElementById(
        "removeSelectedMedia"
      )
      ?.addEventListener(
        "click",
        clearPostMedia
      );

  }


  /* ---------------------------------------
     PUBLISH POST
  --------------------------------------- */

  const publishPostButton =
    document.getElementById(
      "publishPostButton"
    );


  if (publishPostButton) {

    publishPostButton.addEventListener(
      "click",
      publishPost
    );

  }


  function publishPost() {

    const text =
      postText?.value.trim() ||
      "";


    if (
      !text &&
      !selectedPostImage &&
      !selectedPostProduct
    ) {

      showToast(
        "Write an update or add farm content."
      );


      postText?.focus();


      return;

    }


    const newPost = {

      id: Date.now(),

      category:
        selectedPostProduct
          ? "Product"
          : "Farm Update",

      text:
        text ||
        "Shared a new farm update.",

      mediaType:
        selectedPostImage
          ? "uploaded-image"
          : selectedPostProduct
            ? "product"
            : "none",

      media:
        selectedPostImage ||
        selectedPostProduct?.icon ||
        "",

      mediaLabel:
        selectedPostProduct?.name ||
        "Farm update",

      productId:
        selectedPostProduct?.id ||
        null,

      date:
        new Date().toISOString(),

      location:
        farmer.location,

      likes: 0,

      liked: false,

      saved: false,

      comments: []

    };


    farmerPosts.unshift(
      newPost
    );


    farmer.posts += 1;


    const postCount =
      document.getElementById(
        "postCount"
      );


    if (postCount) {

      postCount.textContent =
        String(
          farmer.posts
        );

    }


    renderPosts();

    resetComposer();

    closeComposer();

    activateProfilePanel(
      "postsPanel"
    );


    showToast(
      "Farm post published."
    );

  }


  function openComposer() {

    if (
      !postComposer ||
      !postComposerBackdrop
    ) {
      return;
    }


    openSheet(
      postComposer,
      postComposerBackdrop
    );


    setTimeout(
      () => {

        postText?.focus();

      },
      280
    );

  }


  function closeComposer() {

    closeSheet(
      postComposer,
      postComposerBackdrop
    );

  }


  function resetComposer() {

    if (postText) {
      postText.value = "";
    }


    if (
      postCharacterCount
    ) {

      postCharacterCount.textContent =
        "0 / 500";

    }


    selectedPostImage =
      null;


    selectedPostProduct =
      null;


    if (
      postMediaPreview
    ) {

      postMediaPreview.hidden =
        true;


      postMediaPreview.innerHTML =
        "";

    }

  }


  function clearPostMedia() {

    selectedPostImage =
      null;


    selectedPostProduct =
      null;


    if (
      postMediaPreview
    ) {

      postMediaPreview.hidden =
        true;


      postMediaPreview.innerHTML =
        "";

    }

  }


  /* ---------------------------------------
     POST SORTING
  --------------------------------------- */

  if (postSortSelect) {

    postSortSelect.addEventListener(
      "change",
      renderPosts
    );

  }


  /* ---------------------------------------
     RENDER POSTS
  --------------------------------------- */

  function renderPosts() {

    if (!postFeed) {
      return;
    }

    saveProfileState();


    let posts =
      [...farmerPosts];


    const sortType =
      postSortSelect?.value ||
      "latest";


    if (
      sortType === "popular"
    ) {

      posts.sort(
        (a, b) =>
          b.likes - a.likes
      );

    } else if (
      sortType === "oldest"
    ) {

      posts.sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );

    } else {

      posts.sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

    }


    postFeed.innerHTML = "";


    posts.forEach(post => {

      postFeed.appendChild(
        createPostCard(post)
      );

    });

  }


  function createPostCard(post) {

    const article =
      document.createElement(
        "article"
      );


    article.className =
      "social-post-card";


    const mediaMarkup =
      createPostMediaMarkup(
        post
      );


    const commentsMarkup =
      post.comments
        .slice(0, 2)
        .map(comment => {

          return `
            <div class="post-comment">

              <div class="comment-avatar">
                🌱
              </div>

              <p>

                <strong>
                  ${escapeHtml(comment.author)}
                </strong>

                <span>
                  ${escapeHtml(comment.text)}
                </span>

              </p>

            </div>
          `;

        })
        .join("");


    article.innerHTML = `
      <header class="social-post-header">

        <div class="post-avatar">
          👨‍🌾
        </div>

        <div class="post-author-information">

          <div>

            <strong>
              ${escapeHtml(farmer.name)}
            </strong>

            ${
              farmer.verified
                ? '<span class="post-verified">✓</span>'
                : ""
            }

          </div>

          <small>
            ${formatPostTime(post.date)}
            ·
            ${escapeHtml(post.location)}
          </small>

        </div>

        <button
          class="post-menu-button"
          type="button"
          data-action="menu"
          aria-label="Post options"
        >
          ⋮
        </button>

      </header>


      <div class="social-post-content">

        <span class="post-category">
          ${escapeHtml(post.category)}
        </span>

        <p>
          ${escapeHtml(post.text)}
        </p>

      </div>


      ${mediaMarkup}


      <div class="post-engagement-summary">

        <span>
          👍 ${post.likes}
        </span>

        <span>
          ${post.comments.length}
          ${
            post.comments.length === 1
              ? "comment"
              : "comments"
          }
        </span>

      </div>


      <div class="post-action-row">

        <button
          class="${post.liked ? "active" : ""}"
          type="button"
          data-action="like"
        >
          ${
            post.liked
              ? "👍 Liked"
              : "♡ Like"
          }
        </button>

        <button
          type="button"
          data-action="comment"
        >
          💬 Comment
        </button>

        <button
          type="button"
          data-action="share"
        >
          ↗ Share
        </button>

        <button
          class="${post.saved ? "active" : ""}"
          type="button"
          data-action="save"
          aria-label="Save post"
        >
          ${
            post.saved
              ? "🔖"
              : "▱"
          }
        </button>

      </div>


      <div class="post-comments">
        ${commentsMarkup}
      </div>


      <form class="comment-form">

        <div class="comment-avatar">
          👨‍🌾
        </div>

        <input
          type="text"
          maxlength="200"
          placeholder="Write a comment..."
          aria-label="Write a comment"
        >

        <button
          type="submit"
          aria-label="Post comment"
        >
          ➤
        </button>

      </form>
    `;


    /* Like */

    article
      .querySelector(
        '[data-action="like"]'
      )
      .addEventListener(
        "click",
        () => {

          post.liked =
            !post.liked;


          post.likes +=
            post.liked
              ? 1
              : -1;


          renderPosts();

        }
      );


    /* Save */

    article
      .querySelector(
        '[data-action="save"]'
      )
      .addEventListener(
        "click",
        () => {

          post.saved =
            !post.saved;


          showToast(
            post.saved
              ? "Post saved."
              : "Post removed from saved posts."
          );


          renderPosts();

        }
      );


    /* Comment focus */

    article
      .querySelector(
        '[data-action="comment"]'
      )
      .addEventListener(
        "click",
        () => {

          article
            .querySelector(
              ".comment-form input"
            )
            .focus();

        }
      );


    /* Share */

    article
      .querySelector(
        '[data-action="share"]'
      )
      .addEventListener(
        "click",
        () => {

          sharePost(post);

        }
      );


    /* Menu */

    article
      .querySelector(
        '[data-action="menu"]'
      )
      .addEventListener(
        "click",
        () => {

          handlePostMenu(
            post
          );

        }
      );


    /* Comment */

    article
      .querySelector(
        ".comment-form"
      )
      .addEventListener(
        "submit",
        event => {

          event.preventDefault();


          const input =
            event.currentTarget
              .querySelector(
                "input"
              );


          const comment =
            input.value.trim();


          if (!comment) {
            return;
          }


          post.comments.push({
            author: "You",
            text: comment
          });


          input.value = "";


          renderPosts();

        }
      );


    return article;

  }


  /* ---------------------------------------
     POST MEDIA
  --------------------------------------- */

  function createPostMediaMarkup(
    post
  ) {

    if (
      post.mediaType ===
      "uploaded-image"
    ) {

      return `
        <div class="post-uploaded-image">

          <img
            src="${post.media}"
            alt="${escapeHtml(post.mediaLabel)}"
          >

        </div>
      `;

    }


    if (
      post.mediaType ===
      "product"
    ) {

      const productId =
        post.productId || 1;


      return `
        <a
          class="post-product-listing"
          href="../marketplace/product.html?id=${productId}"
        >

          <div class="post-product-icon">
            ${escapeHtml(post.media)}
          </div>

          <div>

            <small>
              FARMSETU PRODUCT
            </small>

            <strong>
              ${escapeHtml(post.mediaLabel)}
            </strong>

            <span>
              ₹30 / kg
            </span>

          </div>

          <b>›</b>

        </a>
      `;

    }


    if (
      post.mediaType ===
      "image"
    ) {

      return `
        <div class="post-farm-image">

          <div class="post-farm-symbol">
            ${escapeHtml(post.media)}
          </div>

          <span>
            ${escapeHtml(post.mediaLabel)}
          </span>

        </div>
      `;

    }


    return "";

  }


  /* ---------------------------------------
     SHARE POST
  --------------------------------------- */

  async function sharePost(post) {

    try {

      if (
        navigator.share &&
        window.isSecureContext
      ) {

        await navigator.share({

          title:
            `${farmer.name} on FarmSetu`,

          text:
            post.text,

          url:
            window.location.href

        });


        return;

      }


      showToast(
        "Post sharing is ready."
      );

    } catch (error) {

      /* user cancelled sharing */

    }

  }


  /* ---------------------------------------
     POST MENU
  --------------------------------------- */

  function handlePostMenu(post) {

    const action =
      window.prompt(
        "Post options:\n\nType SAVE to save this post\nType HIDE to hide this post",
        ""
      );


    if (!action) {
      return;
    }


    const normalized =
      action.trim().toLowerCase();


    if (
      normalized === "save"
    ) {

      post.saved = true;

      renderPosts();

      showToast(
        "Post saved."
      );

      return;

    }


    if (
      normalized === "hide"
    ) {

      const index =
        farmerPosts.findIndex(
          item =>
            item.id === post.id
        );


      if (index >= 0) {

        farmerPosts.splice(
          index,
          1
        );

      }


      renderPosts();


      showToast(
        "Post hidden."
      );

    }

  }


  /* ---------------------------------------
     EDIT FARM
  --------------------------------------- */

  const editFarmButton =
    document.getElementById(
      "editFarmButton"
    );


  if (editFarmButton) {

    editFarmButton.addEventListener(
      "click",
      () => {

        showToast(
          "Farm editing will connect to the authenticated farmer account."
        );

      }
    );

  }


  /* ---------------------------------------
     EQUIPMENT MESSAGE
  --------------------------------------- */

  document
    .querySelectorAll(
      ".equipment-message-button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showToast(
            "Secure equipment messaging will connect during the backend phase."
          );

        }
      );

    });


  /* ---------------------------------------
     SHEET FUNCTIONS
  --------------------------------------- */

  function openSheet(
    sheet,
    backdrop
  ) {

    if (
      !sheet ||
      !backdrop
    ) {
      return;
    }


    backdrop.hidden = false;


    requestAnimationFrame(
      () => {

        sheet.classList.add(
          "open"
        );

      }
    );


    sheet.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.style.overflow =
      "hidden";

  }


  function closeSheet(
    sheet,
    backdrop
  ) {

    if (
      !sheet ||
      !backdrop
    ) {
      return;
    }


    sheet.classList.remove(
      "open"
    );


    sheet.setAttribute(
      "aria-hidden",
      "true"
    );


    setTimeout(
      () => {

        backdrop.hidden =
          true;

      },
      260
    );


    document.body.style.overflow =
      "";

  }


  /* ---------------------------------------
     ESCAPE KEY
  --------------------------------------- */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Escape"
      ) {
        return;
      }


      if (
        postComposer?.classList.contains(
          "open"
        )
      ) {

        closeComposer();

        return;

      }


      if (
        socialListModal?.classList.contains(
          "open"
        )
      ) {

        closeSheet(
          socialListModal,
          socialListBackdrop
        );

        return;

      }


      if (
        profileMenu?.classList.contains(
          "open"
        )
      ) {

        closeSheet(
          profileMenu,
          profileMenuBackdrop
        );

      }

    }
  );


  /* ---------------------------------------
     TIME FORMAT
  --------------------------------------- */

  function formatPostTime(
    dateValue
  ) {

    const postDate =
      new Date(dateValue);


    const currentDate =
      new Date();


    const difference =
      Math.max(
        0,
        currentDate - postDate
      );


    const minutes =
      Math.floor(
        difference / 60000
      );


    if (
      minutes < 1
    ) {

      return "Just now";

    }


    if (
      minutes < 60
    ) {

      return `${minutes}m`;

    }


    const hours =
      Math.floor(
        minutes / 60
      );


    if (
      hours < 24
    ) {

      return `${hours}h`;

    }


    const days =
      Math.floor(
        hours / 24
      );


    if (
      days < 7
    ) {

      return `${days}d`;

    }


    return postDate.toLocaleDateString(
      "en-CA",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );

  }


  /* ---------------------------------------
     SOCIAL NUMBER FORMAT
  --------------------------------------- */

  function formatSocialNumber(
    number
  ) {

    const safeNumber =
      Number(number) || 0;


    if (
      safeNumber >= 1000000
    ) {

      return (
        safeNumber /
        1000000
      )
        .toFixed(1)
        .replace(".0", "") +
        "M";

    }


    if (
      safeNumber >= 1000
    ) {

      return (
        safeNumber /
        1000
      )
        .toFixed(1)
        .replace(".0", "") +
        "K";

    }


    return String(
      safeNumber
    );

  }


  /* ---------------------------------------
     SECURITY HELPER
  --------------------------------------- */

  function escapeHtml(value) {

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  /* ---------------------------------------
     TOAST
  --------------------------------------- */

  function showToast(message) {

    if (!profileToast) {
      return;
    }


    profileToast.textContent =
      message;


    profileToast.classList.add(
      "show"
    );


    clearTimeout(
      toastTimer
    );


    toastTimer =
      setTimeout(
        () => {

          profileToast.classList.remove(
            "show"
          );

        },
        2400
      );

  }


  /* ---------------------------------------
     START PROFILE
  --------------------------------------- */

  if (followButton) {

    followButton.dataset.following =
      String(isFollowing);

    followButton.textContent =
      isFollowing
        ? "Following"
        : "Follow";

  }

  const postCountElement =
    document.getElementById("postCount");

  if (postCountElement) {

    postCountElement.textContent =
      String(farmer.posts);

  }

  updateFollowerCount();

  renderPosts();

});