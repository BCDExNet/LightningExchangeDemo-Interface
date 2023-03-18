import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { appController } from './libs/appController';
import { DepositInfo } from './views/DepositInfo';
import { Header } from './views/Header';
import { MainView } from './views/MainView';

let updatingTimer = null;
let isFetching = false;

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const updateData = async () => {
      if (!isFetching) {
        isFetching = true;
        const d = await appController.getData();
        d.updated = new Date().getTime();
        setData(d);
        isFetching = false;
      }
    };

    const init = async () => {
      if (updatingTimer) {
        window.clearInterval(updatingTimer);
        updatingTimer = null;
      }

      await appController.init();

      updatingTimer = setInterval(async () => {
        await updateData();
      }, 10000);

      await updateData();
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
