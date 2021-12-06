import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ArrowDownCircleFill, ArrowUpCircleFill } from "react-bootstrap-icons";
import { getRecipesByChef, getAllRecipes } from "../actions/MarketActions";

const axios = require("axios");
async function getIPFSData(recipeList) {
  return Promise.all(
    recipeList.map(async (recipe) => {
      const res = await axios.get(
        `https://gateway.ipfs.io/ipfs/${recipe.tokenUri}`
      );
      recipe.data = res.data;
      return recipe;
    })
  );
}

const NFTDashboard = (props) => {
  const [recipes, setChefNfts] = useState([]);
  const [karma, setKarmaValue] = useState([]);
  let card = null;

  useEffect(() => {
    async function fetchData() {
      let recipeList, karma0;
      //console.log(props.account);
      if (props.type == "dashboard") {
        [recipeList, karma0] = await getRecipesByChef(props.account);
        console.log(recipeList);
      } else if (props.type == "homepage") {
        recipeList = await getAllRecipes(props.account);
      }
      let comb = await getIPFSData(recipeList);
      setChefNfts(comb);
      if (karma0) {
        setKarmaValue(karma0.toString());
      }
    }
    if (props.account) {
      fetchData();
    }
  }, [props.account]);

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
    <div>
      <div>{karma ? <div>Your Karma count is: {karma}</div> : ""}</div>
      <div className="RecipeUpload">
        {recipes.length ? (
          card
        ) : (
          <div>
            <h5 class="text-center">Connect your wallet to see your NFTs!</h5>
            <div class="text-center mx-2"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTDashboard;
