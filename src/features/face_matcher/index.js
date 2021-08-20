import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as faceapi from "face-api.js";
import axios from "axios";
import constant from "../../constant";

let labeledFaceDescriptors;
let faceMatcher;

export default function FaceMatcher() {
  const [modelLoading, setModelLoading] = useState(true);
  const [loadedImage, setLoadedImage] = useState(null);
  const [groupImage, setGroupImage] = useState(null);
  const imageRef = useRef(null);

  const [datasetFetched, setDSF] = useState(false);

  const loadModels = () => {
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.loadFaceExpressionModel("/models"),
    ]).then(() => {
      setModelLoading(false);
      setFaceMatcher();
    });
  };

  const setFaceMatcher = async () => {
    labeledFaceDescriptors = await loadLabelledDiscriptors();
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);
    console.log("Face matcher loaded");
    setDSF(true);
  };

  const loadLabelledDiscriptors = async () => {
    let { data } = await axios.get(`${constant.BASE_URL}/face`);
    if (!data?.length) return;
    return Promise.all(
      data.map(async (el) => {
        const { label: name, details } = el;
        const modifiedDescriptor = new Float32Array(JSON.parse(details));
        return new faceapi.LabeledFaceDescriptors(name, [modifiedDescriptor]);
      })
    );
  };

  const matchImage = async (e) => {
    const image = await faceapi.bufferToImage(e.target.files[0]);
    const canvas = faceapi.createCanvasFromMedia(image);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );

    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      console.log(i, result);
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);
    });

    setGroupImage(image.src);
    setLoadedImage(canvas.toDataURL());
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <FaceMatcherWrapper>
      {modelLoading && <h1>Please wait face models are loading</h1>}
      {!modelLoading && !datasetFetched && (
        <h1>Please wait datasets are loading</h1>
      )}
      {!modelLoading && datasetFetched && (
        <div className="center face-center">
          <div>
            <h1>Match Face from DataSet</h1>
            <br />
            <input
              style={{ display: "none" }}
              type="file"
              ref={imageRef}
              accept="image/*"
              onChange={matchImage}
            />
            <button
              onClick={() => {
                imageRef.current.click();
              }}
            >
              Load Image
            </button>
            <br />
            <br />
          </div>
        </div>
      )}

      {loadedImage && groupImage && (
        <div className="image-container">
          <img src={groupImage} alt="" />
          <img src={loadedImage} alt="" />
        </div>
      )}
      <br />
      <br />
    </FaceMatcherWrapper>
  );
}

const FaceMatcherWrapper = styled.div`
  margin-top: 40px;

  .center {
    display: flex;
    justify-content: center;
    text-align: center;
  }

  h1 {
    color: #fff;
    text-align: center;
  }

  .din {
    display: inline-block;
  }

  button {
    border: 0;
    padding: 6px 15px;
    border-radius: 2px;
    background: #f25153;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .image-container {
    position: relative;
    img {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, 0);
      width: 90%;
    }
  }
`;
