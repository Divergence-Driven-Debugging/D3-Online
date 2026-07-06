import { useState } from "react";
import "./ExpStartLayout.css";
import BackArrow from "../../assets/icons/arrow_back.svg?react";
import DebugIcon from "../../assets/icons/bug.svg?react";
import CheckIcon from "../../assets/icons/check.svg?react";
import ErrorIcon from "../../assets/icons/error.svg?react";
import { useExperimentContext } from "../../hooks/useExperimentContext";
import { useDivergence } from "../../hooks/useDivergence";
import { useStacks } from "../../hooks/useStacks";
import { Spinner } from "../../components/spinner/Spinner";
import { startDebug } from "../../services/api";

const ExpStartLayout = () => {
  const [url1Input, setUrl1Input] = useState<string>("");
  const [url2Input, setUrl2Input] = useState<string>("");
  const [userIDInput, setUserIDInput] = useState<string>("");

  const { setUrl1, setUrl2, setUserID, clearAll } = useExperimentContext();
  const { setFlowDivergences, setStateDivergences } = useDivergence();
  const { setOriginalStack, setModifiedStack } = useStacks();
  const [fetching, setFetching] = useState<boolean>(false);

  const handleStartDebug = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (
      !isValidUrl(url1Input) ||
      !isValidUrl(url2Input) ||
      !isValidID(userIDInput)
    )
      return;

    setFetching(true);
    const data = await startDebug(url1Input, url2Input, userIDInput);
    setFlowDivergences(data.flowDivergences);
    setStateDivergences(data.stateDivergences);
    setOriginalStack(data.v1);
    setModifiedStack(data.v2);

    setFetching(false);
    setUrl1(url1Input);
    setUrl2(url2Input);
    setUserID(userIDInput);
  };

  const isValidUrl = (url: string) => {
    return (
      url.length > 0 &&
      (url.startsWith("http://") || url.startsWith("https://"))
    );
  };

  const isValidID = (id: string) => {
    return id.trim().length > 0;
  };

  if (fetching) {
    return (
      <div className="exp-start-wrapper">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="exp-start-wrapper">
      <div className="exp-start container">
        <h1>Experiment Start</h1>
        <form onSubmit={handleStartDebug} className="exp-form">
          <label>Please insert the required informations to continue : </label>
          <div className="exp-form-input">
            <input
              value={url1Input}
              onChange={(e) => setUrl1Input(e.target.value)}
              placeholder="First URL"
            />
            <span className={isValidUrl(url1Input) ? "valid" : "invalid"}>
              {isValidUrl(url1Input) ? <CheckIcon /> : <ErrorIcon />}
            </span>
          </div>
          <div className="exp-form-input">
            <input
              value={url2Input}
              onChange={(e) => setUrl2Input(e.target.value)}
              placeholder="Second URL"
            />
            <span className={isValidUrl(url2Input) ? "valid" : "invalid"}>
              {isValidUrl(url2Input) ? <CheckIcon /> : <ErrorIcon />}
            </span>
          </div>
          <div className="exp-form-input">
            <input
              value={userIDInput}
              onChange={(e) => setUserIDInput(e.target.value)}
              placeholder="Your user ID"
            />
            <span className={isValidID(userIDInput) ? "valid" : "invalid"}>
              {isValidID(userIDInput) ? <CheckIcon /> : <ErrorIcon />}
            </span>
          </div>
          <div className="exp-start-actions">
            <button
              type="button"
              className="exp-btn-back outlined"
              onClick={clearAll}
            >
              <BackArrow />
              Back
            </button>
            <button
              type="submit"
              className="exp-btn-start"
              disabled={
                !isValidUrl(url1Input) ||
                !isValidUrl(url2Input) ||
                !isValidID(userIDInput)
              }
              onClick={handleStartDebug}
            >
              <DebugIcon />
              Debug
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpStartLayout;
