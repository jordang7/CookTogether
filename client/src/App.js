import logo from "./logo.svg";
import "./App.css";
import RecipeUpload from "./components/RecipeUpload";
import NFTDashboard from "./components/NFTDashboard";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
function App() {
  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">Recipe-Book</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/Home">Home</Nav.Link>
              <Nav.Link href="/seeNFTs">See your NFTs</Nav.Link>
              <Nav.Link href="/Transactions">Transactions</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RecipeUpload />} />
          <Route path="/seeNFTs" element={<NFTDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
