import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ArrowDownCircleFill } from "react-bootstrap-icons";
import { ArrowUpCircleFill } from "react-bootstrap-icons";
import { getRecipesByChef } from "../actions/MarketActions";

const axios = require("axios");
async function getIPFSData(recipeList) {
  return Promise.all(
    recipeList.map(async (recipe) => {
      //console.log(recipe);
      const res = await axios.get(
        `https://gateway.ipfs.io/ipfs/${recipe.tokenUri}`
      );
      recipe.data = res.data;
      return recipe;
    })
  );
}

const NFTDashboard = () => {
  const [recipes, setChefNfts] = useState("");
  let card = null;
  let handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handlesub");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];

    let recipeList = await getRecipesByChef(account);
    console.log(recipeList);
    let comb = await getIPFSData(recipeList);
    setChefNfts(comb);
  };

  const createCards = (recipes) => {
    return (
      <Row xs={2} md={3} className="g-4">
        {recipes.map((recipe) => {
          return (
            <Col>
              <Card bg={"info"} style={{ width: "18rem" }}>
                <Card.Img variant="top" src={recipe.data.image} />
                <Card.Header>{recipe.data.name}</Card.Header>
                <Card.Body>
                  <Card.Text>{recipe.data.description}</Card.Text>
                  <Button variant="info">
                    <ArrowUpCircleFill />
                  </Button>
                  {Number(recipe.upCount) - Number(recipe.downCount)}
                  <Button variant="info">
                    <ArrowDownCircleFill />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  if (recipes.length) {
    card = createCards(recipes);
  }

  return (
    <div className="RecipeUpload">
      {recipes.length ? (
        card
      ) : (
        <div>
          <h5 class="text-center">Connect your wallet to see your NFTs!</h5>
          <div class="text-center mx-2">
            <Button onClick={handleSubmit} variant="primary">
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTDashboard;
