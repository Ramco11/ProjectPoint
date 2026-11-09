document.addEventListener(
  "DOMContentLoaded",
  function () {

    /*
     * FarmSetu Equipment Marketplace
     * Frontend demonstration data.
     *
     * Replace this array with Supabase
     * database results during the backend phase.
     */

    const equipmentData = [

      {
        id: 1,
        name: "Mahindra 575 DI Tractor",
        category: "tractor",
        type: "sale",
        condition: "used",
        certified: true,
        verified: true,
        available: true,
        price: 520000,
        rentPrice: null,
        year: 2021,
        power: "45 HP",
        location: "Rajkot",
        state: "Gujarat",
        seller: "Rameshbhai Farm Equipment",
        rating: 4.8,
        reviews: 84,
        icon: "🚜",
        createdAt: "2026-11-06",
        description:
          "Well-maintained Mahindra 575 DI tractor suitable for cultivation, transportation and common farm implements. Service history is available from the seller."
      },

      {
        id: 2,
        name: "Sonalika DI 745 III",
        category: "tractor",
        type: "rent",
        condition: "used",
        certified: true,
        verified: true,
        available: true,
        price: null,
        rentPrice: 1800,
        year: 2022,
        power: "50 HP",
        location: "Ahmedabad",
        state: "Gujarat",
        seller: "Shree Tractor Rental",
        rating: 4.7,
        reviews: 62,
        icon: "🚜",
        createdAt: "2026-11-08",
        description:
          "High-power tractor available for daily and weekly rental. Operator service can be requested separately from the equipment owner."
      },

      {
        id: 3,
        name: "Heavy-Duty Rotavator",
        category: "implement",
        type: "sale",
        condition: "new",
        certified: false,
        verified: true,
        available: true,
        price: 85000,
        rentPrice: null,
        year: 2026,
        power: "7 Feet",
        location: "Ahmedabad",
        state: "Gujarat",
        seller: "Gujarat Agro Implements",
        rating: 4.6,
        reviews: 39,
        icon: "⚙️",
        createdAt: "2026-11-04",
        description:
          "New seven-foot rotavator suitable for medium and larger tractors. Includes standard blades and manufacturer warranty information."
      },

      {
        id: 4,
        name: "Power Tiller",
        category: "implement",
        type: "sale",
        condition: "used",
        certified: false,
        verified: false,
        available: true,
        price: 65000,
        rentPrice: null,
        year: 2020,
        power: "12 HP",
        location: "Vadodara",
        state: "Gujarat",
        seller: "Patel Farm Tools",
        rating: 4.3,
        reviews: 21,
        icon: "🚜",
        createdAt: "2026-10-27",
        description:
          "Compact power tiller suitable for vegetable farms, orchards and smaller plots. Buyers should inspect the machine before completing the purchase."
      },

      {
        id: 5,
        name: "Solar Water Pump System",
        category: "irrigation",
        type: "sale",
        condition: "new",
        certified: true,
        verified: true,
        available: true,
        price: 145000,
        rentPrice: null,
        year: 2026,
        power: "5 HP",
        location: "Surat",
        state: "Gujarat",
        seller: "Surya Irrigation Systems",
        rating: 4.9,
        reviews: 117,
        icon: "☀️",
        createdAt: "2026-11-09",
        description:
          "Five-horsepower solar water pumping package intended for agricultural irrigation. Installation, panel configuration and warranty should be confirmed with the provider."
      },

      {
        id: 6,
        name: "Drip Irrigation Kit",
        category: "irrigation",
        type: "sale",
        condition: "new",
        certified: false,
        verified: true,
        available: true,
        price: 28000,
        rentPrice: null,
        year: 2026,
        power: "1 Acre",
        location: "Rajkot",
        state: "Gujarat",
        seller: "GreenDrop Irrigation",
        rating: 4.7,
        reviews: 74,
        icon: "💧",
        createdAt: "2026-11-02",
        description:
          "One-acre drip irrigation starter kit with lateral pipes, emitters, filters and connectors. Final design depends on crop spacing and water pressure."
      },

      {
        id: 7,
        name: "Mini Combine Harvester",
        category: "harvester",
        type: "rent",
        condition: "certified",
        certified: true,
        verified: true,
        available: false,
        price: null,
        rentPrice: 8500,
        year: 2023,
        power: "70 HP",
        location: "Junagadh",
        state: "Gujarat",
        seller: "Kisan Harvester Services",
        rating: 4.8,
        reviews: 53,
        icon: "🌾",
        createdAt: "2026-11-01",
        description:
          "Mini combine harvester available with a trained operator. The current listing is temporarily reserved, but future dates can be requested."
      },

      {
        id: 8,
        name: "Battery Crop Sprayer",
        category: "sprayer",
        type: "sale",
        condition: "new",
        certified: false,
        verified: true,
        available: true,
        price: 6800,
        rentPrice: null,
        year: 2026,
        power: "16 Litre",
        location: "Jamnagar",
        state: "Gujarat",
        seller: "Khedut Agro Store",
        rating: 4.5,
        reviews: 91,
        icon: "🎒",
        createdAt: "2026-10-30",
        description:
          "Rechargeable sixteen-litre crop sprayer supplied with a standard lance, charger and multiple nozzles."
      },

      {
        id: 9,
        name: "Boom Sprayer",
        category: "sprayer",
        type: "rent",
        condition: "used",
        certified: true,
        verified: true,
        available: true,
        price: null,
        rentPrice: 1200,
        year: 2022,
        power: "400 Litre",
        location: "Vadodara",
        state: "Gujarat",
        seller: "Agro Machine Rentals",
        rating: 4.6,
        reviews: 46,
        icon: "💦",
        createdAt: "2026-11-05",
        description:
          "Tractor-mounted boom sprayer available for short-term rental. Tractor compatibility and operator requirements must be confirmed before booking."
      },

      {
        id: 10,
        name: "Seed Drill Machine",
        category: "implement",
        type: "rent",
        condition: "used",
        certified: false,
        verified: true,
        available: true,
        price: null,
        rentPrice: 950,
        year: 2021,
        power: "9 Row",
        location: "Rajkot",
        state: "Gujarat",
        seller: "FarmSetu Local Rentals",
        rating: 4.4,
        reviews: 33,
        icon: "🌱",
        createdAt: "2026-11-03",
        description:
          "Nine-row seed drill offered for daily rental. Seed size, row spacing and tractor connection should be checked before booking."
      }

    ];


    /*
     * Application state
     */

    const state = {

      search: "",

      category: "all",

      mode: "all",

      sort: "recommended",

      conditions: [],

      maximumPrice: 2500000,

      location: "all",

      verifiedOnly: false,

      availableOnly: false,

      savedOnly: false,

      savedIds: loadSavedEquipment(),

      selectedEquipmentId: null

    };


    /*
     * Elements
     */

    const equipmentList =
      document.getElementById(
        "equipmentList"
      );

    const emptyState =
      document.getElementById(
        "emptyEquipmentState"
      );

    const resultCount =
      document.getElementById(
        "resultCount"
      );

    const resultsDescription =
      document.getElementById(
        "resultsDescription"
      );

    const searchInput =
      document.getElementById(
        "equipmentSearch"
      );

    const clearSearchButton =
      document.getElementById(
        "clearSearchButton"
      );

    const sortSelect =
      document.getElementById(
        "sortSelect"
      );

    const savedCount =
      document.getElementById(
        "savedCount"
      );

    const filterPanel =
      document.getElementById(
        "filterPanel"
      );

    const filterBackdrop =
      document.getElementById(
        "filterBackdrop"
      );

    const filterIndicator =
      document.getElementById(
        "filterIndicator"
      );

    const maximumPriceRange =
      document.getElementById(
        "maximumPriceRange"
      );

    const maximumPriceDisplay =
      document.getElementById(
        "maximumPriceDisplay"
      );

    const detailsModal =
      document.getElementById(
        "equipmentDetailsModal"
      );

    const detailsBackdrop =
      document.getElementById(
        "detailsBackdrop"
      );


    /*
     * Search
     */

    searchInput.addEventListener(
      "input",
      function () {

        state.search =
          searchInput.value
            .trim()
            .toLowerCase();

        clearSearchButton.classList.toggle(
          "visible",
          Boolean(state.search)
        );

        renderEquipment();

      }
    );


    clearSearchButton.addEventListener(
      "click",
      function () {

        searchInput.value = "";

        state.search = "";

        clearSearchButton.classList.remove(
          "visible"
        );

        renderEquipment();

        searchInput.focus();

      }
    );


    /*
     * Transaction tabs
     */

    document
      .querySelectorAll(
        ".transaction-tab"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              document
                .querySelectorAll(
                  ".transaction-tab"
                )
                .forEach(
                  function (tab) {

                    tab.classList.remove(
                      "active"
                    );

                  }
                );

              button.classList.add(
                "active"
              );

              state.mode =
                button.dataset.mode;

              state.savedOnly = false;

              syncFilterMode();

              renderEquipment();

            }
          );

        }
      );


    /*
     * Categories
     */

    document
      .querySelectorAll(
        ".category-tab"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              document
                .querySelectorAll(
                  ".category-tab"
                )
                .forEach(
                  function (tab) {

                    tab.classList.remove(
                      "active"
                    );

                  }
                );

              button.classList.add(
                "active"
              );

              state.category =
                button.dataset.category;

              renderEquipment();

            }
          );

        }
      );


    /*
     * Sorting
     */

    sortSelect.addEventListener(
      "change",
      function () {

        state.sort =
          sortSelect.value;

        renderEquipment();

      }
    );


    /*
     * Browse rentals
     */

    document
      .getElementById(
        "browseRentalButton"
      )
      .addEventListener(
        "click",
        function () {

          state.mode = "rent";

          state.savedOnly = false;

          selectTransactionTab(
            "rent"
          );

          syncFilterMode();

          renderEquipment();

          document
            .getElementById(
              "equipmentList"
            )
            .scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

        }
      );


    /*
     * Saved equipment
     */

    document
      .getElementById(
        "savedHeaderButton"
      )
      .addEventListener(
        "click",
        function () {

          if (
            state.savedIds.length === 0
          ) {

            showToast(
              "Save equipment using the heart button first."
            );

            return;
          }

          state.savedOnly =
            !state.savedOnly;

          renderEquipment();

          showToast(
            state.savedOnly
              ? "Showing saved equipment"
              : "Showing all matching equipment"
          );

        }
      );


    /*
     * Filter panel controls
     */

    document
      .getElementById(
        "openFilterButton"
      )
      .addEventListener(
        "click",
        openFilterPanel
      );


    document
      .getElementById(
        "closeFilterButton"
      )
      .addEventListener(
        "click",
        closeFilterPanel
      );


    filterBackdrop.addEventListener(
      "click",
      closeFilterPanel
    );


    maximumPriceRange.addEventListener(
      "input",
      function () {

        maximumPriceDisplay.textContent =
          formatCurrency(
            Number(
              maximumPriceRange.value
            )
          );

      }
    );


    document
      .getElementById(
        "applyFiltersButton"
      )
      .addEventListener(
        "click",
        function () {

          state.mode =
            document.querySelector(
              'input[name="filterMode"]:checked'
            ).value;

          state.conditions =
            Array
              .from(
                document.querySelectorAll(
                  ".checkbox-option input:checked"
                )
              )
              .map(
                function (input) {

                  return input.value;

                }
              );

          state.maximumPrice =
            Number(
              maximumPriceRange.value
            );

          state.location =
            document.getElementById(
              "locationFilter"
            ).value;

          state.verifiedOnly =
            document.getElementById(
              "verifiedFilter"
            ).checked;

          state.availableOnly =
            document.getElementById(
              "availableFilter"
            ).checked;

          state.savedOnly = false;

          selectTransactionTab(
            state.mode
          );

          closeFilterPanel();

          renderEquipment();

        }
      );


    document
      .getElementById(
        "resetFiltersButton"
      )
      .addEventListener(
        "click",
        function () {

          resetAdvancedFilters();

          showToast(
            "Equipment filters reset"
          );

        }
      );


    document
      .getElementById(
        "resetEmptyButton"
      )
      .addEventListener(
        "click",
        function () {

          resetAllFilters();

          renderEquipment();

        }
      );


    /*
     * Equipment details modal
     */

    document
      .getElementById(
        "closeDetailsButton"
      )
      .addEventListener(
        "click",
        closeDetailsModal
      );


    detailsBackdrop.addEventListener(
      "click",
      closeDetailsModal
    );


    document
      .getElementById(
        "detailsFavoriteButton"
      )
      .addEventListener(
        "click",
        function () {

          if (
            state.selectedEquipmentId
            === null
          ) {
            return;
          }

          toggleSavedEquipment(
            state.selectedEquipmentId
          );

          updateDetailsFavorite();

          renderEquipment();

        }
      );


    document
      .getElementById(
        "detailsChatButton"
      )
      .addEventListener(
        "click",
        function () {

          showToast(
            "Seller chat will connect during the secure backend phase."
          );

        }
      );


    document
      .getElementById(
        "detailsCallButton"
      )
      .addEventListener(
        "click",
        function () {

          showToast(
            "The seller telephone number will appear after account verification."
          );

        }
      );


    document
      .getElementById(
        "detailsProfileButton"
      )
      .addEventListener(
        "click",
        function () {

          window.location.href =
            "../profile/profile.html";

        }
      );


    document
      .getElementById(
        "detailsPrimaryButton"
      )
      .addEventListener(
        "click",
        handlePrimaryDetailsAction
      );


    /*
     * Keyboard handling
     */

    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key !== "Escape") {
          return;
        }

        if (
          detailsModal.classList.contains(
            "open"
          )
        ) {

          closeDetailsModal();

          return;
        }

        if (
          filterPanel.classList.contains(
            "open"
          )
        ) {

          closeFilterPanel();

        }

      }
    );


    /*
     * Rendering
     */

    function renderEquipment() {

      let equipment =
        equipmentData.filter(
          function (item) {

            return matchesEquipmentFilters(
              item
            );

          }
        );


      equipment =
        sortEquipment(equipment);


      equipmentList.innerHTML = "";


      resultCount.textContent =
        equipment.length +
        (
          equipment.length === 1
            ? " Equipment Listing"
            : " Equipment Listings"
        );


      resultsDescription.textContent =
        createResultsDescription();


      if (equipment.length === 0) {

        equipmentList.hidden = true;

        emptyState.hidden = false;

      } else {

        equipmentList.hidden = false;

        emptyState.hidden = true;


        equipment.forEach(
          function (item) {

            equipmentList.appendChild(
              createEquipmentCard(item)
            );

          }
        );

      }


      savedCount.textContent =
        state.savedIds.length;


      updateFilterIndicator();

      renderActiveFilterChips();

    }


    function matchesEquipmentFilters(
      item
    ) {

      const searchContent = [
        item.name,
        item.category,
        item.condition,
        item.location,
        item.state,
        item.seller,
        item.power
      ]
        .join(" ")
        .toLowerCase();


      if (
        state.search &&
        !searchContent.includes(
          state.search
        )
      ) {
        return false;
      }


      if (
        state.category !== "all" &&
        item.category !== state.category
      ) {
        return false;
      }


      if (
        state.mode !== "all" &&
        item.type !== state.mode
      ) {
        return false;
      }


      if (
        state.conditions.length > 0
      ) {

        const conditionMatches =
          state.conditions.includes(
            item.condition
          ) ||
          (
            state.conditions.includes(
              "certified"
            ) &&
            item.certified
          );

        if (!conditionMatches) {
          return false;
        }

      }


      if (
        item.type === "sale" &&
        item.price >
          state.maximumPrice
      ) {
        return false;
      }


      if (
        state.location !== "all" &&
        item.location !== state.location
      ) {
        return false;
      }


      if (
        state.verifiedOnly &&
        !item.verified
      ) {
        return false;
      }


      if (
        state.availableOnly &&
        !item.available
      ) {
        return false;
      }


      if (
        state.savedOnly &&
        !state.savedIds.includes(
          item.id
        )
      ) {
        return false;
      }


      return true;

    }


    function sortEquipment(items) {

      const sortedItems =
        [...items];


      if (
        state.sort === "price-low"
      ) {

        sortedItems.sort(
          function (a, b) {

            return getComparablePrice(a) -
              getComparablePrice(b);

          }
        );

      } else if (
        state.sort === "price-high"
      ) {

        sortedItems.sort(
          function (a, b) {

            return getComparablePrice(b) -
              getComparablePrice(a);

          }
        );

      } else if (
        state.sort === "newest"
      ) {

        sortedItems.sort(
          function (a, b) {

            return new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            );

          }
        );

      } else if (
        state.sort === "rating"
      ) {

        sortedItems.sort(
          function (a, b) {

            return b.rating -
              a.rating;

          }
        );

      } else {

        sortedItems.sort(
          function (a, b) {

            const scoreA =
              (
                a.verified ? 20 : 0
              ) +
              (
                a.available ? 10 : 0
              ) +
              a.rating;

            const scoreB =
              (
                b.verified ? 20 : 0
              ) +
              (
                b.available ? 10 : 0
              ) +
              b.rating;

            return scoreB - scoreA;

          }
        );

      }


      return sortedItems;

    }


    function getComparablePrice(item) {

      if (item.type === "rent") {

        return item.rentPrice || 0;

      }

      return item.price || 0;

    }


    function createEquipmentCard(item) {

      const article =
        document.createElement(
          "article"
        );


      article.className =
        "equipment-card";


      const isSaved =
        state.savedIds.includes(
          item.id
        );


      const transactionText =
        item.type === "rent"
          ? "FOR RENT"
          : "FOR SALE";


      const priceMarkup =
        item.type === "rent"
          ?
            formatCurrency(
              item.rentPrice
            ) +
            "<small> / day</small>"
          :
            formatCurrency(
              item.price
            );


      const availabilityText =
        item.available
          ? "Available"
          : "Reserved";


      article.innerHTML = `
        <div class="equipment-card-main">

          <div class="equipment-image">

            <span class="listing-type ${escapeHtml(item.type)}">
              ${transactionText}
            </span>

            <button
              class="card-favorite ${isSaved ? "saved" : ""}"
              type="button"
              data-action="favorite"
              aria-label="${isSaved ? "Remove from saved equipment" : "Save equipment"}"
            >
              ${isSaved ? "♥" : "♡"}
            </button>

            <div class="equipment-image-symbol">
              ${escapeHtml(item.icon)}
            </div>

          </div>

          <div class="equipment-information">

            <div class="card-heading-row">

              <h2>
                ${escapeHtml(item.name)}
              </h2>

              ${
                item.verified
                  ?
                    '<span class="verified-mini" title="Verified seller">✓ Verified</span>'
                  :
                    ""
              }

            </div>

            <p class="equipment-subtitle">
              ${capitalize(item.condition)}
              · ${escapeHtml(String(item.year))}
              · ${escapeHtml(item.power)}
            </p>

            <div class="equipment-price">
              ${priceMarkup}
            </div>

            <p class="equipment-location">
              📍 ${escapeHtml(item.location)},
              ${escapeHtml(item.state)}
            </p>

            <div class="equipment-tags">

              <span class="equipment-tag">
                ⭐ ${escapeHtml(String(item.rating))}
              </span>

              <span class="equipment-tag">
                ${escapeHtml(String(item.reviews))}
                reviews
              </span>

              <span class="equipment-tag ${item.available ? "availability-tag" : "reserved-tag"}">
                ${availabilityText}
              </span>

            </div>

          </div>

        </div>

        <div class="equipment-card-footer">

          <button
            type="button"
            data-action="view"
          >
            View Details
          </button>

          <button
            type="button"
            data-action="chat"
          >
            Chat
          </button>

          <button
            class="primary"
            type="button"
            data-action="primary"
            ${item.available ? "" : "disabled"}
          >
            ${
              item.type === "rent"
                ? "Request Rental"
                : "Make Offer"
            }
          </button>

        </div>
      `;


      article
        .querySelector(
          '[data-action="favorite"]'
        )
        .addEventListener(
          "click",
          function () {

            toggleSavedEquipment(
              item.id
            );

            renderEquipment();

          }
        );


      article
        .querySelector(
          '[data-action="view"]'
        )
        .addEventListener(
          "click",
          function () {

            openDetailsModal(
              item.id
            );

          }
        );


      article
        .querySelector(
          '[data-action="chat"]'
        )
        .addEventListener(
          "click",
          function () {

            showToast(
              "Opening chat with " +
              item.seller +
              " will require authenticated messaging."
            );

          }
        );


      article
        .querySelector(
          '[data-action="primary"]'
        )
        .addEventListener(
          "click",
          function () {

            if (!item.available) {

              showToast(
                "This equipment is currently reserved."
              );

              return;
            }

            if (
              item.type === "rent"
            ) {

              showToast(
                "Rental request started for " +
                item.name
              );

            } else {

              openDetailsModal(
                item.id
              );

            }

          }
        );


      return article;

    }


    /*
     * Details modal
     */

    function openDetailsModal(
      equipmentId
    ) {

      const item =
        equipmentData.find(
          function (equipment) {

            return equipment.id ===
              equipmentId;

          }
        );


      if (!item) {
        return;
      }


      state.selectedEquipmentId =
        item.id;


      document.getElementById(
        "detailsIcon"
      ).textContent =
        item.icon;


      document.getElementById(
        "detailsTransaction"
      ).textContent =
        item.type === "rent"
          ? "FOR RENT"
          : "FOR SALE";


      document.getElementById(
        "detailsTransaction"
      ).style.background =
        item.type === "rent"
          ? "#1967d2"
          : "#087a36";


      document.getElementById(
        "detailsTitle"
      ).textContent =
        item.name;


      document.getElementById(
        "detailsVerified"
      ).style.display =
        item.verified
          ? "inline"
          : "none";


      document.getElementById(
        "detailsPrice"
      ).textContent =
        item.type === "rent"
          ?
            formatCurrency(
              item.rentPrice
            ) +
            " / day"
          :
            formatCurrency(
              item.price
            );


      document.getElementById(
        "detailsLocation"
      ).textContent =
        "📍 " +
        item.location +
        ", " +
        item.state;


      document.getElementById(
        "detailsCondition"
      ).textContent =
        capitalize(
          item.condition
        );


      document.getElementById(
        "detailsYear"
      ).textContent =
        String(item.year);


      document.getElementById(
        "detailsPower"
      ).textContent =
        item.power;


      document.getElementById(
        "detailsAvailability"
      ).textContent =
        item.available
          ? "Available"
          : "Reserved";


      document.getElementById(
        "detailsDescription"
      ).textContent =
        item.description;


      document.getElementById(
        "detailsSeller"
      ).textContent =
        item.seller;


      document.getElementById(
        "detailsRating"
      ).textContent =
        "⭐ " +
        item.rating +
        " (" +
        item.reviews +
        " reviews)";


      document.getElementById(
        "detailsPrimaryButton"
      ).textContent =
        item.available
          ?
            (
              item.type === "rent"
                ? "Request Rental"
                : "Make Offer"
            )
          :
            "Currently Reserved";


      document.getElementById(
        "detailsPrimaryButton"
      ).disabled =
        !item.available;


      updateDetailsFavorite();


      detailsBackdrop.hidden = false;

      detailsModal.classList.add(
        "open"
      );

      detailsModal.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.style.overflow =
        "hidden";

    }


    function closeDetailsModal() {

      detailsModal.classList.remove(
        "open"
      );

      detailsModal.setAttribute(
        "aria-hidden",
        "true"
      );

      window.setTimeout(
        function () {

          detailsBackdrop.hidden = true;

        },
        260
      );

      document.body.style.overflow =
        "";

    }


    function updateDetailsFavorite() {

      const button =
        document.getElementById(
          "detailsFavoriteButton"
        );


      const saved =
        state.savedIds.includes(
          state.selectedEquipmentId
        );


      button.textContent =
        saved ? "♥" : "♡";


      button.classList.toggle(
        "saved",
        saved
      );

    }


    function handlePrimaryDetailsAction() {

      const item =
        equipmentData.find(
          function (equipment) {

            return equipment.id ===
              state.selectedEquipmentId;

          }
        );


      if (!item) {
        return;
      }


      if (!item.available) {

        showToast(
          "This listing is currently reserved."
        );

        return;
      }


      if (
        item.type === "rent"
      ) {

        const days =
          window.prompt(
            "How many rental days do you need?",
            "1"
          );


        if (!days) {
          return;
        }


        const parsedDays =
          Math.max(
            1,
            Math.min(
              365,
              Number(days) || 1
            )
          );


        const estimate =
          parsedDays *
          item.rentPrice;


        showToast(
          "Estimated rental: " +
          formatCurrency(estimate) +
          " for " +
          parsedDays +
          (
            parsedDays === 1
              ? " day."
              : " days."
          )
        );

      } else {

        const offer =
          window.prompt(
            "Enter your offer amount in ₹",
            String(item.price)
          );


        if (!offer) {
          return;
        }


        const parsedOffer =
          Number(offer);


        if (
          !Number.isFinite(
            parsedOffer
          ) ||
          parsedOffer <= 0
        ) {

          showToast(
            "Enter a valid offer amount."
          );

          return;
        }


        showToast(
          "Offer prepared: " +
          formatCurrency(
            parsedOffer
          ) +
          ". Sending requires seller authentication."
        );

      }

    }


    /*
     * Saved equipment
     */

    function toggleSavedEquipment(
      equipmentId
    ) {

      const existingIndex =
        state.savedIds.indexOf(
          equipmentId
        );


      if (existingIndex >= 0) {

        state.savedIds.splice(
          existingIndex,
          1
        );

        showToast(
          "Removed from saved equipment"
        );

      } else {

        state.savedIds.push(
          equipmentId
        );

        showToast(
          "Equipment saved"
        );

      }


      saveSavedEquipment();

      savedCount.textContent =
        state.savedIds.length;

    }


    function loadSavedEquipment() {

      try {

        const saved =
          JSON.parse(
            localStorage.getItem(
              "farmsetuSavedEquipment"
            ) || "[]"
          );


        if (!Array.isArray(saved)) {
          return [];
        }


        return saved
          .map(Number)
          .filter(
            function (id) {

              return Number.isInteger(id);

            }
          );

      } catch (error) {

        return [];

      }

    }


    function saveSavedEquipment() {

      try {

        localStorage.setItem(
          "farmsetuSavedEquipment",
          JSON.stringify(
            state.savedIds
          )
        );

      } catch (error) {

        /*
         * The interface still works if browser
         * storage is unavailable.
         */

      }

    }


    /*
     * Filter panel
     */

    function openFilterPanel() {

      syncFilterControls();

      filterBackdrop.hidden = false;

      filterPanel.classList.add(
        "open"
      );

      filterPanel.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.style.overflow =
        "hidden";

    }


    function closeFilterPanel() {

      filterPanel.classList.remove(
        "open"
      );

      filterPanel.setAttribute(
        "aria-hidden",
        "true"
      );

      window.setTimeout(
        function () {

          filterBackdrop.hidden = true;

        },
        260
      );

      document.body.style.overflow =
        "";

    }


    function syncFilterControls() {

      const modeControl =
        document.querySelector(
          'input[name="filterMode"][value="' +
          state.mode +
          '"]'
        );


      if (modeControl) {
        modeControl.checked = true;
      }


      document
        .querySelectorAll(
          ".checkbox-option input"
        )
        .forEach(
          function (input) {

            input.checked =
              state.conditions.includes(
                input.value
              );

          }
        );


      maximumPriceRange.value =
        String(
          state.maximumPrice
        );


      maximumPriceDisplay.textContent =
        formatCurrency(
          state.maximumPrice
        );


      document.getElementById(
        "locationFilter"
      ).value =
        state.location;


      document.getElementById(
        "verifiedFilter"
      ).checked =
        state.verifiedOnly;


      document.getElementById(
        "availableFilter"
      ).checked =
        state.availableOnly;

    }


    function syncFilterMode() {

      const control =
        document.querySelector(
          'input[name="filterMode"][value="' +
          state.mode +
          '"]'
        );


      if (control) {
        control.checked = true;
      }

    }


    function resetAdvancedFilters() {

      state.mode = "all";

      state.conditions = [];

      state.maximumPrice = 2500000;

      state.location = "all";

      state.verifiedOnly = false;

      state.availableOnly = false;

      state.savedOnly = false;

      syncFilterControls();

      selectTransactionTab(
        "all"
      );

      renderEquipment();

    }


    function resetAllFilters() {

      state.search = "";

      state.category = "all";

      state.mode = "all";

      state.sort = "recommended";

      state.conditions = [];

      state.maximumPrice = 2500000;

      state.location = "all";

      state.verifiedOnly = false;

      state.availableOnly = false;

      state.savedOnly = false;


      searchInput.value = "";

      clearSearchButton.classList.remove(
        "visible"
      );


      sortSelect.value =
        "recommended";


      selectTransactionTab(
        "all"
      );


      document
        .querySelectorAll(
          ".category-tab"
        )
        .forEach(
          function (button) {

            button.classList.toggle(
              "active",
              button.dataset.category
                === "all"
            );

          }
        );


      syncFilterControls();

      showToast(
        "All filters cleared"
      );

    }


    function selectTransactionTab(
      mode
    ) {

      document
        .querySelectorAll(
          ".transaction-tab"
        )
        .forEach(
          function (button) {

            button.classList.toggle(
              "active",
              button.dataset.mode === mode
            );

          }
        );

    }


    function updateFilterIndicator() {

      const hasAdvancedFilter =
        state.conditions.length > 0 ||
        state.maximumPrice < 2500000 ||
        state.location !== "all" ||
        state.verifiedOnly ||
        state.availableOnly;


      filterIndicator.classList.toggle(
        "active",
        hasAdvancedFilter
      );

    }


    function renderActiveFilterChips() {

      const container =
        document.getElementById(
          "activeFilterChips"
        );


      container.innerHTML = "";


      const filters = [];


      if (
        state.savedOnly
      ) {

        filters.push({
          label: "Saved only ×",
          clear: function () {

            state.savedOnly = false;

          }
        });

      }


      state.conditions.forEach(
        function (condition) {

          filters.push({
            label:
              capitalize(condition) +
              " ×",

            clear: function () {

              state.conditions =
                state.conditions.filter(
                  function (item) {

                    return item !==
                      condition;

                  }
                );

            }
          });

        }
      );


      if (
        state.maximumPrice < 2500000
      ) {

        filters.push({
          label:
            "Under " +
            formatCurrency(
              state.maximumPrice
            ) +
            " ×",

          clear: function () {

            state.maximumPrice =
              2500000;

          }
        });

      }


      if (
        state.location !== "all"
      ) {

        filters.push({
          label:
            state.location +
            " ×",

          clear: function () {

            state.location =
              "all";

          }
        });

      }


      if (
        state.verifiedOnly
      ) {

        filters.push({
          label:
            "Verified ×",

          clear: function () {

            state.verifiedOnly =
              false;

          }
        });

      }


      if (
        state.availableOnly
      ) {

        filters.push({
          label:
            "Available ×",

          clear: function () {

            state.availableOnly =
              false;

          }
        });

      }


      filters.forEach(
        function (filter) {

          const button =
            document.createElement(
              "button"
            );


          button.type = "button";

          button.className =
            "filter-chip";

          button.textContent =
            filter.label;


          button.addEventListener(
            "click",
            function () {

              filter.clear();

              syncFilterControls();

              renderEquipment();

            }
          );


          container.appendChild(
            button
          );

        }
      );

    }


    function createResultsDescription() {

      if (
        state.savedOnly
      ) {

        return "Showing your saved equipment";

      }


      if (
        state.mode === "rent"
      ) {

        return "Equipment available for rental";

      }


      if (
        state.mode === "sale"
      ) {

        return "Equipment available for purchase";

      }


      return "Showing all available equipment";

    }


    /*
     * Utilities
     */

    function formatCurrency(
      amount
    ) {

      const safeAmount =
        Number.isFinite(
          Number(amount)
        )
          ? Number(amount)
          : 0;


      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
        }
      ).format(safeAmount);

    }


    function capitalize(value) {

      const text =
        String(value || "");


      if (!text) {
        return "";
      }


      return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
      );

    }


    function escapeHtml(value) {

      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    }


    let toastTimer;


    function showToast(
      message
    ) {

      const toast =
        document.getElementById(
          "equipmentToast"
        );


      toast.textContent =
        message;


      toast.classList.add(
        "show"
      );


      window.clearTimeout(
        toastTimer
      );


      toastTimer =
        window.setTimeout(
          function () {

            toast.classList.remove(
              "show"
            );

          },
          2400
        );

    }


    /*
     * Initial render
     */

    savedCount.textContent =
      state.savedIds.length;


    maximumPriceDisplay.textContent =
      formatCurrency(
        state.maximumPrice
      );


    renderEquipment();

  }
);