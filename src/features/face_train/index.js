import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as faceapi from "face-api.js";
import axios from "axios";
import { notification, Spin } from "antd";
import constant from "../../constant";

export default function FaceTrain() {
  const [modelLoading, setModelLoading] = useState(true);
  const [trainLoading, setTrainLoading] = useState(false);
  const inputRef = useRef(null);

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

  const getImage = async (e) => {
    setTrainLoading(true);
    const image = await faceapi.bufferToImage(e.target.files[0]);
    const allD = await faceapi.detectAllFaces(image);
    if (allD.length > 1) {
      notification.error({
        message: "Only single faced image is allowed",
        placement: "bottomLeft",
      });
      setTrainLoading(false);
      return;
    }

    const detections = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions();

    if (!detections) {
      // notify
      notification.error({
        message: "No face detected on image",
        placement: "bottomLeft",
      });
      setTrainLoading(false);
      return;
    }

    const faceLabels = detections.descriptor;
    const faceLabelString = JSON.stringify(
      Object.values(JSON.parse(JSON.stringify(faceLabels)))
    );
    const label = window.prompt(
      "Please enter label for your image",
      "Harry Potter"
    );

    console.log(label);

    if (!label) {
      notification.error({
        message: "Label is needed",
        placement: "bottomLeft",
      });
      setTrainLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${constant.BASE_URL}/face`, {
        label,
        details: faceLabelString,
      });
      console.log(data);
    } catch (err) {
      console.log(err?.response?.data);
    }
    notification.success({
      message: "Face trained successfully",
      placement: "bottomLeft",
    });
    setTrainLoading(false);
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
          <h1>Train face so that it can be used to recognize image</h1>
          <br />
          <input
            style={{ display: "none" }}
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={getImage}
          />
          <div className="din">
            <Spin spinning={trainLoading}>
              <button onClick={() => inputRef.current?.click()}>
                Select Face
              </button>
            </Spin>
          </div>
        </div>
      )}
    </FaceMatcherWrapper>
  );
}

const FaceMatcherWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  text-align: center;

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
`;
