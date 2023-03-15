import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { appController } from './libs/appController';
import { DepositInfo } from './views/DepositInfo';
import { Header } from './views/Header';
import { MainView } from './views/MainView';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const init = async () => {
      await appController.init();
      const d = await appController.getData();
      setData(d);
    };

    init();
  }, []);

  return (
    <div className="App">
      <Header />

      <div className='appView'>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<MainView data={data} />} />
            <Route path='/deposit/:secret' element={<DepositInfo />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
