import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Collapse from "react-bootstrap/Collapse";
import Col from "react-bootstrap/Col";
import {
  ArrowDownCircleFill,
  ArrowUpCircleFill,
  ArrowUpCircle,
  ArrowDownCircle,
} from "react-bootstrap-icons";
import {
  getRecipesByChef,
  getAllActiveRecipes,
  castVote,
} from "../actions/MarketActions";
const axios = require("axios");
const { ethers } = require("ethers");
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
  const [recipes, setChefNfts] = useState("");
  const [karma, setKarmaValue] = useState("");
  const [loading, setLoadingValue] = useState(false);
  const [upVote, setUpVote] = useState(false);
  const [downVote, setDownVote] = useState(false);
  const [open, setOpen] = useState(false);

  let card = null;

  useEffect(() => {
    async function fetchData() {
      let recipeList, karma0;
      setLoadingValue(true);
      recipeList = await getAllActiveRecipes(props.account);

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

  let handleVote = async (e, tokenId, support) => {
    e.preventDefault();
    const vote = await castVote(tokenId, support, props.account);
    // const receipt = await window.ethereum.wait(vote);
    console.log(vote);
    if (vote) {
      if (support) {
        setUpVote(true);
      } else {
        setDownVote(true);
      }
      alert(
        "Thank you for casting a vote, your vote will be displayed once the transaction is approved"
      );
    }
  };
  const createCards = (recipes) => {
    return (
      <Row md="auto" className="g-4 p-4">
        {recipes.map((recipe) => {
          return (
            <Col>
              <Card bg={"info"} style={{ width: "18rem" }}>
                <Card.Img
                  variant="top"
                  src={recipe.data.image}
                  style={{ height: "300px" }}
                />
                <Card.Header>{recipe.data.name}</Card.Header>
                <Card.Body>
                  <Card.Text style={{ fontSize: "20px" }}>
                    {recipe.data.description}
                  </Card.Text>
                  <Card.Text style={{ fontSize: "17px" }}>
                    Created By: {recipe.chef.substring(2, 6)} ...
                    {recipe.chef.substring(37, 41)}{" "}
                  </Card.Text>
                  <Button
                    variant="info"
                    onClick={(e) => handleVote(e, recipe.tokenId, true)}
                  >
                    {upVote ? <ArrowUpCircleFill /> : <ArrowUpCircle />}
                  </Button>

                  {Number(recipe.upCount) - Number(recipe.downCount)}
                  <Button
                    variant="info"
                    onClick={(e) => handleVote(e, recipe.tokenId, false)}
                  >
                    {downVote ? <ArrowDownCircleFill /> : <ArrowDownCircle />}
                  </Button>
                  <Collapse in={open}>
                    <div id="example-collapse-text">
                      <ul>
                        {recipe.data.attributes.map((ingredient) => {
                          return (
                            <li style={{ fontSize: "20px" }}>
                              {ingredient.trait_type} - {ingredient.value}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </Collapse>
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
  console.log(!recipes.length);
  return (
    <div>
      {/* <div>{karma ? <div>Your Karma count is: {karma}</div> : ""}</div> */}
      <div className="RecipeUpload">
        <div className="center">
          {recipes.length ? (
            <div>
              {card}
              {open ? (
                <Button
                  onClick={() => setOpen(!open)}
                  aria-controls="attributes"
                  aria-expanded={open}
                >
                  Collapse
                </Button>
              ) : (
                <Button
                  onClick={() => setOpen(!open)}
                  aria-controls="attributes"
                  aria-expanded={open}
                >
                  See Attributes
                </Button>
              )}
            </div>
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
    </div>
  );
};

export default NFTDashboard;
