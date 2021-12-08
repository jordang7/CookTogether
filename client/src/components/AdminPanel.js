import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { endCompetition } from "../actions/MarketActions";

const AdminPanel = (props) => {
  let endComp = async (e) => {
    e.preventDefault();
    try {
      const res = await endCompetition(props.account);
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  };
  if (props.account == 0x6f234fa20558743970ccebd6af259fcb49eea73c) {
    return (
      <div>
        <div className="RecipeUpload">
          <Button onClick={endComp}>End Competition</Button>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="RecipeUpload">You are not authorized to see this</div>
      </div>
    );
  }
};

export default AdminPanel;
