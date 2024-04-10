import { useEffect, useState } from "react";

export const useUsfm2Usj = () => {
  const [usfm, setUsfm] = useState<string>();
  const [usj, setUsj] = useState<any>();

  useEffect(() => {
    // import("../data/titus").then((data) => {
    import("../data/tit.usfm").then((data) => {
      setUsfm(data.default);
    });
  }, []);
  useEffect(() => {
    usfm && sendData({ usfm: usfm });
  }, [usfm]);

  const sendData = async (data: { usfm: string }) => {
    try {
      const response = await fetch("http://localhost:5000/process_usfm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      // console.log({ responseData });
      setUsj(responseData);
      // setUsj(responseData.message); // Assuming server sends a JSON response with a message field
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return { usj };
};
