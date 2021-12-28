import './App.css';
import Likes from './components/Likes.js'
import React, {useState} from "react"
function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  return (
    <div className="App">
      <header className="App-header">
        <div className='App-header-text'>likes. <div style={{fontSize:".7rem"}}> devnet</div></div>
        <div className='connect-wallet'>
          {!walletAddress && renderNotConnectedContainer()}
        </div>
      </header>
      <div className="App-notice">
        <div>transaction data is from mainnet powered by solscan</div>
        <div>and transaction likes are executed on devnet.</div>
        <div>so... sorry or you're welcome.</div>
      </div>
      { walletAddress ?
        <Likes walletAddress={walletAddress}/>
        :
        <div style={{color:"white"}}>connect wallet to get started </div>
      }

    </div>
  );
}

export default App;
