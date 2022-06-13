
import React, {} from 'react';
import {Button} from 'react-bootstrap';
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
      <h1 className="title">Oops!</h1>
      <h4>SOMETHING WENT WRONG</h4>
      <span className='d-block'>The resource that you are looking for might be is unbailable</span>
      {props?.errorMessage && <div className="errorMessageContainer">
        <span className='errorMessageTitle'>Error message</span>
        <p className="errorMessageMessage">{props.errorMessage}</p>
      </div>}
      <Button variant="info" onClick={handleGoBackHome}>GO BACK HOME</Button>
    </div>
  );
};

export default ErrorView;