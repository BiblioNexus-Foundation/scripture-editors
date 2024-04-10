// import { useEffect, useState } from "react";
// import { Usj } from "shared/converters/usj/usj.model";

// export const useUsfm2Usj = () => {
//   const [usfm, setUsfm] = useState<string>();
//   const [usj, setUsj] = useState<Usj>();

//   useEffect(() => {
//     // import("../data/titus").then((data) => {
//     import("../data/tit.usfm").then((data) => {
//       setUsfm(data.default);
//     });
//   }, []);
//   useEffect(() => {
//     usfm && sendData({ usfm: usfm });
//   }, [usfm]);

//   const sendData = async (data: { usfm: string }) => {
//     try {
//       const response = await fetch("http://localhost:5000/process_usfm", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Access-Control-Allow-Origin": "*",
//           "Access-Control-Allow-Credentials": "true",
//         },
//         body: JSON.stringify(data),
//       });
//       const responseData = await response.json();
//       // console.log({ responseData });
//       setUsj(responseData);
//       // setUsj(responseData.message); // Assuming server sends a JSON response with a message field
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//   return { usj };
// };

import { useEffect, useState } from "react";
import USFMParser from "sj-usfm-grammar";
import { Usj } from "shared/converters/usj/usj.model";

export const useUsfm2Usj = () => {
  const [usfm, setUsfm] = useState<string>();
  const [usj, setUsj] = useState<Usj>();

  const parseUSFM = async (usfm: string) => {
    await USFMParser.init();
    const usfmParser = new USFMParser();
    const usj = usfmParser.usfmToUsj(usfm);
    console.log("1", { usj });
    usj && setUsj(usj);
  };

  useEffect(() => {
    import("../data/titus").then((data) => {
      setUsfm(data.default);
    });
  }, []);

  useEffect(() => {
    (async () => usfm && parseUSFM(usfm))();
  }, [usfm]);


  console.log("2", { usj });
  return { usj };
};
