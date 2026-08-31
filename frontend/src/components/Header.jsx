import {
  Search,
  Bell,
  User,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useRef, useState } from "react";


// =========================================================
// PAGE CONFIG
// =========================================================

const pageTitles = {
  "/dashboard": {
    title: "Dashboard",
    description: "Real-time traffic operations overview",
  },

  "/monitoring": {
    title: "Live Monitoring",
    description: "Monitor cameras and vehicle detection",
  },

  "/signals": {
    title: "Traffic Signals",
    description: "Manage intersection signal operations",
  },

  "/analytics": {
    title: "Analytics",
    description: "Traffic trends and historical insights",
  },

  "/alerts": {
    title: "Alerts",
    description: "Monitor traffic and system alerts",
  },

  "/settings": {
    title: "Settings",
    description: "Configure traffic AI system",
  },
};


// =========================================================
// SEARCH DATA
// =========================================================

const searchItems = [
  {
    title: "Dashboard",
    description: "Real-time traffic operations overview",
    path: "/dashboard",
    keywords: "home traffic overview vehicles",
  },

  {
    title: "Live Monitoring",
    description: "Monitor cameras and vehicle detection",
    path: "/monitoring",
    keywords: "camera monitoring vehicle detection live",
  },

  {
    title: "Traffic Signals",
    description: "Manage intersection signal operations",
    path: "/signals",
    keywords: "signals lights intersection traffic",
  },

  {
    title: "Analytics",
    description: "Traffic trends and historical insights",
    path: "/analytics",
    keywords: "analytics trends charts history traffic",
  },

  {
    title: "Alerts",
    description: "Monitor traffic and system alerts",
    path: "/alerts",
    keywords: "alerts warning incidents emergency",
  },

  {
    title: "Settings",
    description: "Configure traffic AI system",
    path: "/settings",
    keywords: "settings configuration system admin",
  },
];


// =========================================================
// HEADER
// =========================================================

export default function Header() {

  const location = useLocation();

  const navigate = useNavigate();

  const searchRef = useRef(null);


  // -------------------------------------------------------
  // STATE
  // -------------------------------------------------------

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");


  // -------------------------------------------------------
  // CURRENT PAGE
  // -------------------------------------------------------

  const page =
    pageTitles[location.pathname] ||
    pageTitles["/dashboard"];


  // -------------------------------------------------------
  // SEARCH RESULTS
  // -------------------------------------------------------

  const filteredResults =
    searchQuery.trim() === ""
      ? []
      : searchItems.filter((item) => {

          const query =
            searchQuery.toLowerCase().trim();

          return (
            item.title
              .toLowerCase()
              .includes(query) ||

            item.description
              .toLowerCase()
              .includes(query) ||

            item.keywords
              .toLowerCase()
              .includes(query)
          );
        });


  // -------------------------------------------------------
  // OPEN SEARCH
  // -------------------------------------------------------

  const openSearch = () => {

    setSearchOpen(true);

    setTimeout(() => {
      searchRef.current?.focus();
    }, 50);
  };


  // -------------------------------------------------------
  // CLOSE SEARCH
  // -------------------------------------------------------

  const closeSearch = () => {

    setSearchOpen(false);

    setSearchQuery("");
  };


  // -------------------------------------------------------
  // NAVIGATE TO RESULT
  // -------------------------------------------------------

  const goToPage = (path) => {

    navigate(path);

    closeSearch();
  };


  // -------------------------------------------------------
  // ENTER KEY
  // -------------------------------------------------------

  const handleSearchKeyDown = (event) => {

    if (event.key === "Escape") {

      closeSearch();

      return;
    }


    if (
      event.key === "Enter" &&
      filteredResults.length > 0
    ) {

      goToPage(
        filteredResults[0].path
      );
    }
  };


  // -------------------------------------------------------
  // CLOSE SEARCH WITH ESC
  // -------------------------------------------------------

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (
        event.key === "/" &&
        !searchOpen &&
        document.activeElement?.tagName !== "INPUT"
      ) {

        event.preventDefault();

        openSearch();
      }

      if (
        event.key === "Escape" &&
        searchOpen
      ) {

        closeSearch();
      }
    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [searchOpen]);


  return (

    <header className="header">

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="header-left">

        <h1>
          {page.title}
        </h1>

        <p>
          {page.description}
        </p>

      </div>


      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="header-right">

        {/* SYSTEM LIVE */}

        <div className="system-live">

          <span></span>

          LIVE

        </div>


        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="header-search-wrapper">

          <button
            className={`header-icon ${
              searchOpen ? "active" : ""
            }`}
            onClick={openSearch}
            title="Search"
            aria-label="Search"
          >

            <Search size={19} />

          </button>


          {searchOpen && (

            <div className="header-search-box">

              <div className="search-input-wrapper">

                <Search
                  size={17}
                  className="search-input-icon"
                />


                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  placeholder="Search dashboard..."
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleSearchKeyDown
                  }
                />


                <button
                  className="search-close"
                  onClick={closeSearch}
                  aria-label="Close search"
                >

                  <X size={16} />

                </button>

              </div>


              {/* SEARCH RESULTS */}

              {searchQuery.trim() !== "" && (

                <div className="search-results">

                  {filteredResults.length > 0 ? (

                    filteredResults.map(
                      (item) => (

                        <button
                          key={item.path}
                          className="search-result"
                          onClick={() =>
                            goToPage(
                              item.path
                            )
                          }
                        >

                          <div className="search-result-icon">

                            <Search
                              size={15}
                            />

                          </div>


                          <div className="search-result-content">

                            <strong>
                              {item.title}
                            </strong>

                            <span>
                              {item.description}
                            </span>

                          </div>

                        </button>

                      )
                    )

                  ) : (

                    <div className="search-no-result">

                      <Search size={18} />

                      <span>
                        No results found
                      </span>

                    </div>

                  )}

                </div>

              )}


              {/* SEARCH HINT */}

              {searchQuery.trim() === "" && (

                <div className="search-hint">

                  <span>
                    Search pages, traffic,
                    cameras, signals...
                  </span>

                  <kbd>
                    ESC
                  </kbd>

                </div>

              )}

            </div>

          )}

        </div>


        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <button
          className="header-icon notification"
          title="Notifications"
          aria-label="Notifications"
        >

          <Bell size={19} />

          <span></span>

        </button>


        {/* =================================================
            USER
        ================================================= */}

        <div className="user-profile">

          <div className="avatar">

            <User size={18} />

          </div>


          <div className="user-info">

            <strong>
              Traffic Admin
            </strong>

            <small>
              Administrator
            </small>

          </div>

        </div>

      </div>

    </header>

  );
}