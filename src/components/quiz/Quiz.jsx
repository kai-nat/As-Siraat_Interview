import "./quiz.scss";
import React, { useEffect, useState, useRef, useContext } from "react";
import { ReactComponent as WatchIcon } from "../images/stopwatch.svg";
import { GlobalContext } from "../../context/Context";
import LoadingBar from "react-top-loading-bar";
import { quizArray } from "../../core";
import Timer from "../Timer/Timer";
import Rating from "@mui/material/Rating";
import { CircularProgress } from "@mui/material";

import axios from "axios";

function sendScoreToBackend(username, score) {
  axios
    .post("http://localhost:3001/score", {
      username,
      score,
    })
    .then((response) => {
      console.log("Score sent successfully");
    })
    .catch((error) => {
      console.error("Error sending score:", error);
    });
}

export default function Quiz() {
  // Usestate variables
  const buttonRef = useRef([]);
  const { state } = useContext(GlobalContext);
  const [startQuiz, setStartQuiz] = useState(false);
  let [currentQuestion, setCurrentQuestion] = useState(0);
  const [informAnwser, setInformAnswer] = useState(undefined);
  const [loadProgress, setLoadProgress] = useState(5);
  const [options, setOptions] = useState("");
  const [rating, setRating] = useState(0);
  const [result, setResult] = useState(true);
  const [disableOption, setDisableOption] = useState(false);
  const [scoreBar, setScoreBar] = useState({
    danger: 0,
    orange: 0,
    yellow: 0,
  });
  const [userName, setUserName] = useState("");
  const [answer, setAnswer] = useState({
    correct: 0,
    wrong: 0,
  });

  // UseEffect hook for setting default behaviour of  functions , setting options and etc...
  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentQuestion < 5) {
      setOptions(
        quizArray &&
          handleOptions([
            quizArray[currentQuestion].correct_answer,
            ...quizArray[currentQuestion].incorrect_answers,
          ])
      );
      if (quizArray[currentQuestion].difficulty === "easy") {
        return setRating(1);
      } else if (quizArray[currentQuestion].difficulty === "medium") {
        return setRating(2);
      } else if (quizArray[currentQuestion].difficulty === "hard") {
        return setRating(3);
      } else {
        return setRating(0);
      }
    }
  }, [currentQuestion]);

  // Sorting Options
  const handleOptions = (option) => {
    return option.sort(() => Math.random() - 0.5);
  };
  const onInputChange = (e) => {
    setUserName(e.target.value);
  };
  // Checking Answer to which user clicked
  const checkAnswer = (e) => {
    if (currentQuestion === 4) {
      sendScoreToBackend(userName, answer.correct);
      setResult(!result);
    }
    if (e.target.innerText === quizArray[currentQuestion].correct_answer) {
      setAnswer((answer) => ({ ...answer, correct: answer.correct + 1 }));
      setScoreBar({ ...scoreBar, orange: orangeBar(), yellow: yellowBar() });
      setInformAnswer("correct");
      e.target.classList.add("correct");
      setDisableOption(true);
      for (let i = 0; i < e.target.parentElement.children.length; i++) {
        if (
          e.target.parentElement.children[i].innerText ===
          quizArray[currentQuestion].correct_answer
        ) {
          e.target.parentElement.children[i].classList.add("correct");
        } else {
          e.target.parentElement.children[i].classList.remove("quiz__hover");
        }
      }
    } else {
      setAnswer((answer) => ({ ...answer, wrong: answer.wrong + 1 }));
      setScoreBar({ ...scoreBar, danger: dangerBar(), yellow: yellowBar() });
      setInformAnswer("wrong");
      e.target.classList.add("wrong");
      for (let i = 0; i < e.target.parentElement.children.length; i++) {
        if (
          e.target.parentElement.children[i].innerText ===
          quizArray[currentQuestion].correct_answer
        ) {
          e.target.parentElement.children[i].classList.add("correct");
        } else {
          e.target.parentElement.children[i].classList.remove("quiz__hover");
        }
      }
      setDisableOption(true);
    }
  };

  // Iterating next Question from quizArray
  const handleNewQuestion = () => {
    window.scrollTo(0, 0);
    buttonRef?.current.forEach((element) => {
      if (element) {
        element.className = "";
        element.classList.add("quiz__hover");
      }
    });
    setCurrentQuestion(++currentQuestion);
    setInformAnswer(undefined);
    setLoadProgress((loadProgress) => loadProgress + 5);
    setDisableOption(false);
  };

  // Handling Score Yellow Bar
  const yellowBar = () => {
    return (
      ((currentQuestion + 1) / quizArray.length) * 100 -
      scoreBar.orange -
      scoreBar.danger
    );
  };

  // Handling Score Red Bar
  const dangerBar = () => {
    return ((answer?.wrong + 1) / quizArray.length) * 100;
  };

  // Handling Score Orange Bar
  const orangeBar = () => {
    return ((answer?.correct + 1) / quizArray.length) * 100;
  };

  return (
    <div className="quiz">
      {state.user ? (
        <>
          <h1 className="quiz__question text-center">Sorry Time Out</h1>
          <div className="quiz__next">
            <button onClick={() => window.location.reload()}>
              Start Again
            </button>
          </div>
        </>
      ) : !startQuiz ? (
        <>
          <h1 className="quiz__question text-center">
            Enter your name To Start your Quiz?
          </h1>
          <input
            type="text"
            // value={userName}
            placeholder="Enter your name"
            style={{
              width: "400px",
              marginLeft: "75px",
              borderRadius: "5px",
              height: "40px",
              paddingLeft: "5px",
            }}
            onChange={onInputChange}
          />
          <div className="quiz__next">
            <button
              style={{ backgroundColor: "#3ace7a", border: "none" }}
              onClick={() => {
                console.log(userName.length);
                userName.length > 0
                  ? setStartQuiz(true)
                  : alert("Please Enter Your Name to start the Quiz");
              }}
            >
              Start
            </button>
          </div>
        </>
      ) : (
        <>
          <LoadingBar
            color="#2ecc71"
            progress={loadProgress}
            onLoaderFinished={() => setLoadProgress(0)}
          />
          <div
            className="quiz__progBar"
            style={{ width: `${loadProgress}%` }}
          ></div>
          <div className="quiz__quesContainer">
            <h4>{quizArray[currentQuestion]?.category}</h4>
            <div className="quesNum">
              <h1>
                Question {currentQuestion + 1} of {5}
              </h1>
              <div>
                <WatchIcon />
                <Timer />
              </div>
            </div>
            <div className="star">
              <Rating
                name="read-only"
                size="large"
                value={rating}
                max={3}
                readOnly
              />
            </div>
          </div>
          <p className="quiz__questions">
            {quizArray[currentQuestion]?.question}?
          </p>

          <div className="quiz__buttons">
            {!options ? (
              <CircularProgress />
            ) : (
              options?.map((element, i) => {
                return (
                  <button
                    className="quiz__hover"
                    disabled={disableOption}
                    onClick={checkAnswer}
                    key={i}
                    ref={(item) => (buttonRef.current[i] = item)}
                  >
                    {element}
                  </button>
                );
              })
            )}
          </div>
          <div className="quiz__next">
            {informAnwser ? (
              <h2 className={informAnwser}>
                {informAnwser.charAt(0).toUpperCase() + informAnwser.slice(1)}!
              </h2>
            ) : (
              ""
            )}
            {informAnwser ? (
              result ? (
                <button onClick={handleNewQuestion}>Next Question</button>
              ) : (
                <>
                  <button
                    style={{
                      backgroundColor: "#dd514c",
                      border: "none",
                      marginBottom: "10px",
                    }}
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                  <br />
                  <button onClick={() => window.scrollTo(0, 400)}>
                    Result Is Given Below &#8595;
                  </button>
                  <br />
                </>
              )
            ) : (
              ""
            )}
          </div>
          <div className="quiz__scoreBar">
            <div className="container">
              <div className="d-flex justify-content-between">
                <div>
                  Score{" "}
                  {((answer?.correct / (currentQuestion + 1)) * 100).toFixed(0)}{" "}
                  %
                </div>
                <div>
                  Max Score{" "}
                  {((answer?.correct / quizArray.length) * 100).toFixed(0)} %
                </div>
              </div>
              <div className="border border-5 rounded-pill border-light">
                <div className="progress rounded-pill">
                  <div
                    className="progress-bar  rounded-end"
                    role="progressbar"
                    style={{
                      width: `${scoreBar?.danger}%`,
                      backgroundColor: "#F89E68",
                    }}
                    aria-valuenow="30"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                  <div
                    className="progress-bar rounded-end"
                    role="progressbar"
                    style={{
                      width: `${scoreBar?.orange}%`,
                      backgroundColor: "#FEBD5C",
                    }}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                  <div
                    className="progress-bar rounded-end"
                    role="progressbar"
                    style={{
                      width: `${scoreBar?.yellow}%`,
                      backgroundColor: "#F6E763",
                    }}
                    aria-valuenow="30"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                  <div
                    className="progress-bar rounded-end"
                    role="progressbar"
                    style={{
                      width: `${
                        100 -
                        scoreBar?.yellow -
                        scoreBar?.orange -
                        scoreBar?.danger
                      }%`,
                      backgroundColor: "#BAE17C",
                    }}
                    aria-valuenow="30"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
