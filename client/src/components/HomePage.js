import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ArrowDownCircleFill } from "react-bootstrap-icons";
import { ArrowUpCircleFill } from "react-bootstrap-icons";
import { getAllRecipes } from "../actions/MarketActions";

const axios = require("axios");
async function getIPFSData(recipeList) {
  console.log(recipeList);
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

const HomePage = () => {
  const [recipes, setChefNfts] = useState("");
  let card = null;
  useEffect(() => {
    async function fetch() {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      let recipeList = await getAllRecipes(account);
      console.log(recipeList);
      let comb = await getIPFSData(recipeList);
      setChefNfts(comb);
    }

    fetch();
  });

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

  return <div className="RecipeUpload">{recipes.length ? card : ""}</div>;
};

export default HomePage;
