import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { mintRecipeNFT } from "../actions/RecipeUploadActions";

const RecipeUpload = () => {
  const style = {
    IngredientBox: {
      border: "2px solid #FFFFFF",
    },
  };
  const [IngredientsArray, setIngredientsArray] = useState([
    { Ingredient: "", Amount: "" },
  ]);
  const [photo, setPhotoData] = useState();
  const [recipeName, setRecipeName] = useState();
  let handleChange = (i, e) => {
    let newIngredientsArray = [...IngredientsArray];
    newIngredientsArray[i][e.target.name] = e.target.value;
    setIngredientsArray(newIngredientsArray);
  };

  let addNewIngredient = () => {
    setIngredientsArray([...IngredientsArray, { Ingredient: "", Amount: "" }]);
  };

  let removeIngredient = (i) => {
    let newIngredientsArray = [...IngredientsArray];
    newIngredientsArray.splice(i, 1);
    setIngredientsArray(newIngredientsArray);
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    console.log(photo);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];
    let success = await mintRecipeNFT(
      recipeName,
      IngredientsArray,
      photo,
      account
    );
    if (success) {
      alert("Minting is complete!");
    } else {
      alert("Minting failed");
    }
  };

  return (
    <div>
      <h1>Upload your recipe here!</h1>
      <Form onSubmit={handleSubmit}>
        <Row>
          <InputGroup>
            <FormControl
              placeholder="Recipe Name"
              aria-label="Recipe Name"
              type="text"
              name="Recipe-Name"
              className="mb-3"
              onChange={(e) => setRecipeName(e.target.value)}
              required
            />
          </InputGroup>
        </Row>
        {IngredientsArray.map((element, index) => (
          <div className="form-inline" style={style.IngredientBox} key={index}>
            <Row className="p-4">
              <Col md="auto">#{index + 1}</Col>
              <Col>
                <InputGroup>
                  <FormControl
                    placeholder="Ingredient"
                    aria-label="Ingredient"
                    type="text"
                    name="Ingredient"
                    value={element.Ingredient || ""}
                    id="validationCustom03"
                    onChange={(e) => handleChange(index, e)}
                    required
                  />
                </InputGroup>
              </Col>
              <Col>
                <InputGroup>
                  <FormControl
                    placeholder="Amount"
                    aria-label="Amount"
                    type="text"
                    name="Amount"
                    value={element.Amount || ""}
                    onChange={(e) => handleChange(index, e)}
                    required
                  />
                </InputGroup>
              </Col>

              {index ? (
                <Col md="auto">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => removeIngredient(index)}
                  >
                    Remove
                  </Button>
                </Col>
              ) : null}
            </Row>
          </div>
        ))}
        <Form.Group controlId="formFile" className="m-3">
          <Form.Control
            type="file"
            onChange={(e) => setPhotoData(e.target.files[0])}
          />
        </Form.Group>
        <div>
          <Button
            className="mx-1"
            variant="primary"
            onClick={() => addNewIngredient()}
          >
            Add
          </Button>
          <Button className="mx-1" variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};
export default RecipeUpload;
