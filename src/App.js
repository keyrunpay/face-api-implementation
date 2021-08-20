import { BrowserRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import NavBar from "./components/NavBar";
import FaceMatcher from "./features/face_matcher";
import FaceTrain from "./features/face_train";
import FacialExpression from "./features/facial_expression";
import FindFace from "./features/find_face";

function App() {
  return (
    <>
      <BrowserRouter>
        <NavBar />
        <Switch>
          <Route path="/" exact component={HomeComponent}></Route>
          <Route path="/match" exact component={FaceMatcher}></Route>
          <Route path="/find" exact component={FindFace}></Route>
          <Route path="/train" exact component={FaceTrain}></Route>
          <Route path="/expression" exact component={FacialExpression}></Route>
        </Switch>
      </BrowserRouter>
    </>
  );
}

const HomeComponent = () => {
  return (
    <AppWrapper>
      <div>
        <h1>Welcome to face recognization</h1>
        <br /> <br /> <br />
        <h1>Project Contributor</h1>
        <ul>
          <li>Kiran Neupane</li>
          <li>Prabhat Neupane</li>
          <li>Amisha Dahal</li>
        </ul>
        <br /> <br /> <br />
        <h1>Project Supervisor</h1>
        <ul>
          <li>Santosh Khanal</li>
        </ul>
      </div>
    </AppWrapper>
  );
};

const AppWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  text-align: center;
  color: #fff;

  h1 {
    color: #fff;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      font-size: 18px;
    }
  }
`;

export default App;
