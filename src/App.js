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

  const updateData = async () => {
    if (!isFetching) {
      isFetching = true;
      const d = await appController.getData();
      d.updated = new Date().getTime();
      d.account = appController.account;
      d.chainId = appController.chainId;
      setData(d);
      isFetching = false;
    }
  };

  console.debug("data =", data);

  const turnTimerOff = () => {
    if (updatingTimer) {
      window.clearInterval(updatingTimer);
      updatingTimer = null;
    }
  };

  const turnTimerOn = () => {
    updatingTimer = setInterval(async () => {
      await updateData();
    }, 10000);
  };

  const updateWeb3 = eventObject => {
    console.debug("更新web3环境", eventObject);

    turnTimerOff();
    turnTimerOn()
  };

  useEffect(() => {
    const init = async () => {
      turnTimerOff();

      await appController.init(updateWeb3);

      turnTimerOn();

      await updateData();
    };

    init();
  }, []);

  return (
    <div className="App">
      <Header
        account={data?.account}
        chainId={data?.chainId} />

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
