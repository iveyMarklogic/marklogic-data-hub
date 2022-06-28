
import React, {} from 'react';
import {useNavigate} from 'react-router-dom';
import "./ErrorView.scss";


type ErrorViewProps = {
  errorMessage: string;
  onBackHome: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = (props) => {
  const navigate = useNavigate();
  const handleGoBackHome = () => {
    props.onBackHome();
    navigate("/");
  }
  return (
    <div className="errorBoundariesContainer">
      <h2 className="title">Something went wrong!</h2>
      {props?.errorMessage && <div className="errorContainer">
        <span className="title">Error message:</span>
        <p className="message">{props.errorMessage}</p>
      </div>}
      <button className="errorButton" onClick={handleGoBackHome}>Return to Home</button>
    </div>
  );
};

export default ErrorView;