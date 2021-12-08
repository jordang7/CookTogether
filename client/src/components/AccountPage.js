import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ArrowDownCircleFill, ArrowUpCircleFill } from "react-bootstrap-icons";
import {
  getRecipesByChef,
  getAllActiveRecipes,
  castVote,
} from "../actions/MarketActions";
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

const AccountPage = (props) => {
  const [recipes, setChefNfts] = useState("");
  const [karma, setKarmaValue] = useState("");
  const [loading, setLoadingValue] = useState(false);
  let card = null;
  useEffect(() => {
    async function fetchData() {
      let recipeList, karma0;
      //console.log(props.account);
      setLoadingValue(true);
      [recipeList, karma0] = await getRecipesByChef(props.account);
      let comb = await getIPFSData(recipeList);
      setChefNfts(comb);
      setLoadingValue(false);
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
            <Col key={recipe.tokenId}>
              <Card bg={"info"} style={{ width: "18rem" }}>
                <Card.Img variant="top" src={recipe.data.image} />
                <Card.Header>{recipe.data.name}</Card.Header>
                <Card.Body>
                  <Card.Text>{recipe.data.description}</Card.Text>
                  <Button variant="info"></Button>
                  {Number(recipe.upCount) - Number(recipe.downCount)}
                  <Button variant="info"></Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };
  if (loading) {
    return <div className="RecipeUpload">loading</div>;
  }
  if (recipes.length) {
    card = createCards(recipes);
  }
  return (
    <div>
      <div>{karma ? <div>Your Karma count is: {karma}</div> : ""}</div>
      <div className="RecipeUpload">
        {recipes.length ? (
          card
        ) : recipes === "" ? (
          <div>
            <h5 class="text-center">Connect your wallet to see your NFTs!</h5>
          </div>
        ) : (
          <div>
            <h5 class="text-center">No Recipes to display!</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
