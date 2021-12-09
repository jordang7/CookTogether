import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Collapse from "react-bootstrap/Collapse";
import {
  getRecipesByChef,
  hasRewardAvailable,
  getAllRewardFruit,
} from "../actions/MarketActions";
import { claimRewardNFT } from "../actions/RecipeUploadActions";
import {
  ArrowDownCircleFill,
  ArrowUpCircleFill,
  ArrowUpCircle,
  ArrowDownCircle,
} from "react-bootstrap-icons";

const axios = require("axios");
async function getIPFSData(nftList) {
  return Promise.all(
    nftList.map(async (recipe) => {
      const res = await axios.get(
        `https://gateway.ipfs.io/ipfs/${recipe.tokenUri}`
      );
      recipe.data = res.data;
      return recipe;
    })
  );
}
async function getIPFSDataReward(nftList) {
  return Promise.all(
    nftList.map(async (recipe) => {
      const res = await axios.get(
        `https://gateway.ipfs.io/ipfs/${recipe.tokenUri}`
      );
      const image = await axios.get(res.data.image);
      res.data.image = image.data;
      recipe.data = res.data;
      return recipe;
    })
  );
}

const AccountPage = (props) => {
  const [recipes, setRecipesList] = useState("");
  const [karma, setKarmaValue] = useState("");
  const [fruitList, setFruitList] = useState("");
  const [rewardCount, setRewardCount] = useState(0);
  const [loading, setLoadingValue] = useState(false);
  const [open, setOpen] = useState(false);

  let card,
    rewardCards = null;
  useEffect(() => {
    async function fetchData() {
      let recipeList, karma0, fruitArr;
      setLoadingValue(true);
      [recipeList, karma0] = await getRecipesByChef(props.account);
      let comb = await getIPFSData(recipeList);
      setRecipesList(comb);
      setLoadingValue(false);
      if (karma0) {
        setKarmaValue(karma0.toString());
      }
      fruitArr = await getAllRewardFruit(props.account);
      let fruitArrwithData = await getIPFSDataReward(fruitArr);
      setFruitList(fruitArrwithData);
      const rewardCount = await hasRewardAvailable();
      setRewardCount(rewardCount);
    }
    if (props.account) {
      fetchData();
    }
  }, [props.account]);

  let handleRewardMint = async (e) => {
    e.preventDefault();
    let account = null;
    if (!props.account) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      account = accounts[0];
    }
    account = props.account;
    let success = await claimRewardNFT(account);
    if (success) {
      alert("Minting is complete!");
    } else {
      alert("Minting failed");
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
                  {Number(recipe.upCount) - Number(recipe.downCount)}

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
  if (fruitList.length) {
    rewardCards = createCards(fruitList);
  }
  return (
    <div className="RecipeUpload">
      <div>
        <div>
          {rewardCount > 0 ? (
            <div>
              <Alert key={0} variant={"success"}>
                Congrats on winning the last contest! You have {rewardCount}{" "}
                unclaimed {rewardCount == 1 ? "reward" : "rewards"}.
                <Button
                  variant="success"
                  className="float-end"
                  onClick={handleRewardMint}
                >
                  Mint Your Fruit!
                </Button>
              </Alert>
            </div>
          ) : (
            ""
          )}
        </div>
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
        {fruitList.length ? (
          <div className="text-center">Rewards! {rewardCards}</div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default AccountPage;
