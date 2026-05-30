import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { User, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";

import SearchBar from "./SearchBar";
import { useAuth } from "../../context/AuthContext";
import "../../styles/navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  const closeAccount = () => setAccountOpen(false);

  return (
    <header className="navbar-wrapper">
      <div className="topbar">
        <p>
          ✨{" "}
          {user
            ? `Welcome back, ${user.name}!`
            : "Welcome to Tranquility Beauty — Your One Stop Beauty Store"}
        </p>

        <a href="https://wa.me/254729608929" target="_blank" rel="noreferrer">
          We deliver with love 💛
        </a>
      </div>

      <div className="navbar container">
        <Link to="/" className="logo" onClick={closeAccount}>
          <img
            src="/icons/icon-512.png"
            alt="Tranquility Beauty"
            className="logo-image"
          />

          <div className="logo-text">
            <h2>Tranquility</h2>
            <span>BEAUTY</span>
          </div>
        </Link>

        <SearchBar />

        <div className="navbar-actions">
          <NavLink to="/shop" onClick={closeAccount}>
            Shop
          </NavLink>

          <NavLink to="/shop?category=Lip%20Care" onClick={closeAccount}>
            Lip Care
          </NavLink>

          <NavLink to="/shop?category=Skincare" onClick={closeAccount}>
            Skincare
          </NavLink>

          <a href="/#contact" onClick={closeAccount}>
            Contact
          </a>

          {!user ? (
            <NavLink to="/login" className="nav-login-btn">
              Login
            </NavLink>
          ) : (
            <div className="nav-account-wrap">
              <button
                type="button"
                className="nav-account-btn"
                onClick={() => setAccountOpen((prev) => !prev)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user.name?.charAt(0) || "U"}</span>
                )}

                <div>
                  <strong>{user.name}</strong>
                  <small>{user.isAdmin ? "Admin" : "My Account"}</small>
                </div>
              </button>

              {accountOpen && (
                <div className="account-dropdown">
                  <div className="account-user">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0) || "U"}</span>
                    )}

                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>

                      {user.isAdmin && (
                        <em>
                          <ShieldCheck size={14} /> Admin
                        </em>
                      )}
                    </div>
                  </div>

                  <Link to="/dashboard" onClick={closeAccount}>
                    <User size={17} />
                    My Dashboard
                  </Link>

                  {user.isAdmin && (
                    <Link to="/admin" onClick={closeAccount}>
                      <LayoutDashboard size={17} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeAccount();
                    }}
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <a
            className="nav-whatsapp-btn"
            href="https://wa.me/254729608929"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Order
          </a>
        </div>
      </div>

      <div className="bottom-nav">
        <div className="container bottom-nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/shop?category=Lip%20Care">Lip Care</NavLink>
          <NavLink to="/shop?category=Skincare">Skincare</NavLink>
          <NavLink to="/shop?category=Accessories">Hair Accessories</NavLink>
          <NavLink to="/shop?category=Beauty%20Tools">Beauty Tools</NavLink>
          <a href="/#new-arrivals">New Arrivals</a>
          <a href="/#contact">Contact Us</a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;