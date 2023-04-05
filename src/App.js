import { lazy, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { appController } from './libs/appController';
import { globalUtils } from './libs/globalUtils';
import { Footer } from './views/Footer';
import { Header } from './views/Header';
import { MainView } from './views/MainView';

let updatingTimer = null;
let isFetching = false;

const DepositInfo = lazy(() => import("./views/DepositInfo"));

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
    turnTimerOff();
    turnTimerOn()
  };

  const checkNetwork = async networkSupported => {
    if (networkSupported) {
      turnTimerOn();
      await updateData();
    } else {
      window.alert("Unsupported network, this Demo supports running on BSC and Arbitrum network.");
    }
  };

  useEffect(() => {
    const init = async () => {
      turnTimerOff();

      let networkSupported = false;
      if (parseInt(window.localStorage.getItem(globalUtils.constants.AUTOCONNECT)) === 1) {
        networkSupported = await appController.init(updateWeb3);
        // window.localStorage.removeItem(globalUtils.constants.AUTOCONNECT);
      } else {
        networkSupported = await appController.init();
      }
      checkNetwork(networkSupported);
    };

    init();
  }, []);

  const handleConnect = async () => {
    const networkSupported = await appController.init(updateWeb3);
    checkNetwork(networkSupported);
  };

  return (
    <div className="App">
      <Header
        account={data?.account}
        chainId={data?.chainId}
        onConnect={handleConnect} />

      <div className='appView'>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<MainView data={data} />} />
            <Route path='/deposit/:secret' element={<DepositInfo chainId={data?.chainId} />} />
          </Routes>
        </BrowserRouter>
      </div>

      <Footer />
    </div>
  );
}

export default App;
