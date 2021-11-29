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
    { name: "", quantity: "" },
  ]);
  const [photo, setPhotoData] = useState();
  const [recipeName, setRecipeName] = useState();
  let handleChange = (i, e) => {
    let newIngredientsArray = [...IngredientsArray];
    newIngredientsArray[i][e.target.name] = e.target.value;
    setIngredientsArray(newIngredientsArray);
  };

  let addNewIngredient = () => {
    setIngredientsArray([...IngredientsArray, { name: "", quantity: "" }]);
  };

  let removeIngredient = (i) => {
    let newIngredientsArray = [...IngredientsArray];
    newIngredientsArray.splice(i, 1);
    setIngredientsArray(newIngredientsArray);
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="RecipeUpload">
      <h1>Upload your recipe here!</h1>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <label className="primary">Recipe Name</label>
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
          </Col>
          <Col>
            <label>Photo</label>
            <Form.Group controlId="formFile">
              <Form.Control
                type="file"
                onChange={(e) => setPhotoData(e.target.files[0])}
                className="mb-3"
                required
              />
            </Form.Group>
          </Col>
        </Row>
        Ingredients
        {IngredientsArray.map((element, index) => (
          <div className="form-inline" style={style.IngredientBox} key={index}>
            <Row className="p-4">
              <Col md="auto">#{index + 1}</Col>
              <Col>
                <InputGroup>
                  <FormControl
                    placeholder="name"
                    aria-label="name"
                    type="text"
                    name="name"
                    value={element.name || ""}
                    id="validationCustom03"
                    onChange={(e) => handleChange(index, e)}
                    required
                  />
                </InputGroup>
              </Col>
              <Col>
                <InputGroup>
                  <FormControl
                    placeholder="quantity"
                    aria-label="quantity"
                    type="text"
                    name="quantity"
                    value={element.quantity || ""}
                    onChange={(e) => handleChange(index, e)}
                    required
                  />
                </InputGroup>
              </Col>

              {index ? (
                <Col md="auto">
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeIngredient(index)}
                  >
                    Remove
                  </Button>
                </Col>
              ) : null}
            </Row>
          </div>
        ))}
        <div>
          <Button
            className="mx-1 my-2"
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
