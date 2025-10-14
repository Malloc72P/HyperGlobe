import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import { A01_BasicPage } from './pages/a01-basic';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Home />

        <main>
          <Routes>
            <Route path="/" element={<></>}></Route>
            <Route path="/a01-basic" element={<A01_BasicPage />}></Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <>
      <h1>HyperGlobe</h1>

      <ul>
        <li>
          <Link to="/a01-basic">A01 Basic</Link>
        </li>
      </ul>
    </>
  );
}

export default App;
