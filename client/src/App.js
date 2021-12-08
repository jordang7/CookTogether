import logo from "./logo.svg";
import "./App.css";

import RecipeUpload from "./components/RecipeUpload";
import NFTDashboard from "./components/NFTDashboard";
import AccountPage from "./components/AccountPage";
import AdminPanel from "./components/AdminPanel";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useState } from "react";
function App() {
  const [account, setAccountState] = useState("");
  const connectUsersMeta = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  };
  let handleSubmit = async (e) => {
    e.preventDefault();
    let account0 = await connectUsersMeta();
    setAccountState(account0);
  };

  window.ethereum.on("accountsChanged", function (accounts) {
    setAccountState(accounts[0]);
  });
  return (
    <div>
      <BrowserRouter>
        <Container>
          <Navbar bg="light" expand="lg">
            <Nav className="mr-auto">
              <LinkContainer className="home-link item" to="/">
                <Nav.Link>Home</Nav.Link>
              </LinkContainer>
              <LinkContainer
                className="stock-chart-link item"
                to="/recipeUpload"
              >
                <Nav.Link>Recipe Upload</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/seeNFTs">
                <Nav.Link>See your NFTs</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/adminPanel">
                <Nav.Link>Admin Panel</Nav.Link>
              </LinkContainer>
            </Nav>
            <Nav className="ms-auto">
              {!account ? (
                <Button onClick={handleSubmit}>Connect Wallet</Button>
              ) : (
                <div>
                  Connected: {account.substring(2, 6)} ...
                  {account.substring(37, 41)}
                </div>
              )}
            </Nav>
          </Navbar>
        </Container>

        <Routes>
          <Route path="/" element={<NFTDashboard account={account} />} />
          <Route
            path="/recipeUpload"
            element={<RecipeUpload account={account} />}
          />
          <Route path="/seeNFTs" element={<AccountPage account={account} />} />
          <Route
            path="/adminPanel"
            element={<AdminPanel account={account} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
