import logo from "./logo.svg";
import "./App.css";
import RecipeUpload from "./components/RecipeUpload";
import NFTDashboard from "./components/NFTDashboard";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
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
    console.log("handlesub");
    let account0 = await connectUsersMeta();
    setAccountState(account0);
  };
  console.log(account);
  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">Recipe-Book</Navbar.Brand>
          <Navbar aria-controls="basic-navbar-nav" />

          <Navbar id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/recipeUpload">Recipe Upload</Nav.Link>
              <Nav.Link href="/seeNFTs">See your NFTs</Nav.Link>
              {!account ? (
                <Button onClick={handleSubmit}>Connect Wallet</Button>
              ) : (
                <Nav.Link>
                  Connected:{account.substring(2, 6)} ...
                  {account.substring(37, 41)}
                </Nav.Link>
              )}
            </Nav>
          </Navbar>
        </Container>
      </Navbar>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<NFTDashboard type="homepage" account={account} />}
          />
          <Route
            path="/recipeUpload"
            element={<RecipeUpload account={account} />}
          />
          <Route
            path="/seeNFTs"
            element={<NFTDashboard type="dashboard" account={account} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
