import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Form from "react-bootstrap/Form";

const NFTDashboard = () => {
  const [address, setUserAddress] = useState("");

  return (
    <div class="d d-flex align-items-center justify-content-center">
      <Form>
        <h5 class="text-center">Input your address to see your NFTs!</h5>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">0x</InputGroup.Text>
          <FormControl
            placeholder="Address"
            aria-label="Address"
            aria-describedby="basic-addon1"
            onChange={(e) => setUserAddress(e.target.value)}
          />
        </InputGroup>
        <div class="text-center pb-3">
          <Button variant="primary">Submit</Button>
        </div>
      </Form>
    </div>
  );
};

export default NFTDashboard;
