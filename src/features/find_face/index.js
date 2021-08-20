import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as faceapi from "face-api.js";
import { notification } from "antd";

export default function FindFace() {
  const [modelLoading, setModelLoading] = useState(true);
  const imageRef = useRef(null);
  const [loadedImage, setLoadedImage] = useState(null);
  const [groupImage, setGroupImage] = useState(null);

  const loadModels = () => {
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.loadFaceExpressionModel("/models"),
    ]).then(() => {
      setModelLoading(false);
    });
  };

  const matchImage = async (e) => {
    const image = await faceapi.bufferToImage(e.target.files[0]);
    const canvas = faceapi.createCanvasFromMedia(image);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks();

    if (!detections || !detections?.length) {
      // notify
      notification.error({
        message: "No face detected on image",
        placement: "bottomLeft",
      });
      return;
    }

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    setGroupImage(image.src);
    setLoadedImage(canvas.toDataURL());
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <FaceMatcherWrapper>
      {modelLoading && <h1>Please wait face models are loading</h1>}
      {!modelLoading && (
        <div className="face-center">
          <br />
          <h1>Find Your Face & Landmark</h1>
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
      )}

      {loadedImage && groupImage && (
        <div className="image-container">
          <img src={groupImage} alt="" />
          <img src={loadedImage} alt="" />
        </div>
      )}
    </FaceMatcherWrapper>
  );
}

const FaceMatcherWrapper = styled.div`
  margin-top: 40px;
  text-align: center;

  .center {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    text-align: center;
  }

  h1 {
    color: #fff;
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
      width: 60%;
    }
  }
`;
