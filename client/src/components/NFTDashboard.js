import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Form from "react-bootstrap/Form";

const NFTDashboard = () => {
  const [address, setUserAddress] = useState("");

  let handleSubmit = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];
    


  };

  const createCards = (NFTs) => {
    return (
      <div class="card" style="width: 18rem;">
        <img class="card-img-top" src="..." alt="Card image cap"></img>
        <div class="card-body">
          <h5 class="card-title">Card title</h5>
          <p class="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </p>
          <a href="#" class="btn btn-primary">
            Go somewhere
          </a>
        </div>
      </div>
    );
  };
  return (
    <div className="RecipeUpload">
      <Form onSubmit={handleSubmit}>
        <h5 class="text-center">Connect your wallet to see your NFTs!</h5>
        <div class="text-center pb-3">
          <Button variant="primary">Connect Wallet</Button>
        </div>
      </Form>
    </div>
  );
};

export default NFTDashboard;
