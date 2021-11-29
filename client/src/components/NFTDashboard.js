import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getRecipesByChef } from "../actions/MarketActions";

const axios = require("axios");
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
    for (let recipe in recipeList) {
      console.log(recipe);
      const res = await axios.get(
        "https://gateway.ipfs.io/ipfs/QmdwBbmneCjbz2GoNmWdRF97gW9TxozWhKRrppUNrLimGv"
      );
      recipe.image = res.data.image;
      recipe.attributes = res.data.attributes;
      recipe.name = res.data.name;
      recipe.description = res.data.description;
      return recipe;
    }
    setChefNfts(recipeList);
  };

  const createCard = (recipe) => {
    console.log(recipe);
    return (
      <Card bg={"info"} style={{ width: "18rem" }}>
        <Card.Img variant="top" src={recipe.image} />
        <Card.Body>
          <Card.Title>{recipe.name}</Card.Title>
          <Card.Text>{recipe.description}</Card.Text>
          {recipe.attributes.map((trait) => {
            return (
              <Row>
                <Col>
                  <Card.Text>Ingredient: {trait.trait_type}</Card.Text>
                </Col>
                <Col>
                  <Card.Text>Amount: {trait.value}</Card.Text>
                </Col>
                )
              </Row>
            );
          })}
          <Button variant="primary pb3">Upvote {recipe.upCount}</Button>
          <Button variant="primary ml-2">Downvote {recipe.downCount}</Button>
        </Card.Body>
      </Card>
    );
  };

  if (recipes.length) {
    card =
      recipes &&
      recipes.map((recipe) => {
        return createCard(recipe);
      });
  }

  return (
    <div className="RecipeUpload">
      <h5 class="text-center">Connect your wallet to see your NFTs!</h5>
      {recipes.length ? (
        card
      ) : (
        <div class="text-center mx-2">
          <Button onClick={handleSubmit} variant="primary">
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
};

export default NFTDashboard;
