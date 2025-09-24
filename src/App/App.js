import Header from "../Components/Header";
import './App.css';
import '../Components/Header.css';
import Home from '../Pages/Home';

function App() {
  return (
    <div className="App">
      <header className="App-header">
          <Header></Header>
          <Home></Home>
        <p>
        </p>
      </header>
    </div>
  );
}

export default App;
