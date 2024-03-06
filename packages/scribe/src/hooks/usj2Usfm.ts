import { useEffect, useState } from "react";
import { Usj } from "shared/converters/usj/usj.model";

export const Usj2Usfm = ({ usj }: { usj: Usj }) => {
  let usfm: string;
  const sendData = async (data: { usj: Usj }) => {
    try {
      const response = await fetch("http://localhost:5000/process_usj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log({ responseData });
      usfm = responseData;
    } catch (error) {
      console.error("Error:", error);
    }
  };
  usj && sendData({ usj: usj });
  return;
};
