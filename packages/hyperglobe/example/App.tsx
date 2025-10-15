import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import { A01_BasicPage } from './pages/a01-basic';
import { Header } from './components/home';
import { Nav, NavModel } from './components/nav';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Header />

        <div className="grid grid-cols-12">
          <div className="col-span-3  min-h-[calc(100vh-60px)] px-4 py-3 border-r border-gray-200">
            <Nav />
          </div>
          <div className="col-span-9  min-h-[calc(100vh-60px)] p-3">
            <main>
              <Routes>
                <Route path="/" element={<div className="p-5">Home</div>}></Route>

                {Object.entries(NavModel).map(([key, value]) => (
                  <Route key={key} path={value.link} element={<value.component />} />
                ))}
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
