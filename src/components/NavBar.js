import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

export default function NavBar() {
  return (
    <NavBarWrapper>
      <nav>
        <div className="nav-item">
          <Link to="/">Home</Link>
        </div>
        <div className="nav-item">
          <Link to="/train">Face Train</Link>
        </div>
        <div className="nav-item">
          <Link to="/match">Face Match</Link>
        </div>
        <div className="nav-item">
          <Link to="/find">Find Face</Link>
        </div>
        <div className="nav-item">
          <Link to="/expression">Faical Expression</Link>
        </div>
      </nav>
    </NavBarWrapper>
  );
}

const NavBarWrapper = styled.div`
  /* background: rgba(0, 0, 0, 0.7);
   */
  border-bottom: 0.25px solid rgba(0, 0, 0, 0.5);

  nav {
    height: 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 80px;
  }

  .nav-item {
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    a {
      color: #fff;
      text-decoration: none;
    }
  }
`;
