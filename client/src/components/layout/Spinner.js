/* eslint-disable import/no-anonymous-default-export */
import React, { Fragment } from "react";
import spinner from "../../assets/Rolling-1s-200px.svg";

export default () => (
  <Fragment>
    <img
      src={spinner}
      style={{ width: "50px", margin: "auto", display: "block" }}
      alt="Loading.."
    />
  </Fragment>
);
