import { useEffect, useState } from 'react';
import { SystemProgram, Connection, PublicKey, clusterApiUrl} from '@solana/web3.js'
import {
  Program, Provider, web3
} from '@project-serum/anchor'
import idl from './../likes.json';
import Transactions from './Transactions';

// const {SystemProgram} = web3;

const opts = {
  preflightCommitment: "processed"
}
const network = clusterApiUrl('devnet');
const programID = new PublicKey(idl.metadata.address);
const seed = "likes"
export default function Likes() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [likes, setLikes] = useState([])
  const [pubKey, setPubKey] = useState(null)
  const [payer, setPayer] = useState()
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          /*
           * The solana object gives us a function that will allow us to connect
           * directly with the user's wallet!
           */
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );
          const pubKey = await PublicKey.createWithSeed(response.publicKey, seed, programID)
          setPubKey(pubKey)
          setWalletAddress(response.publicKey.toString());
          getLikes();
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    console.log(provider.wallet)
    setPayer(provider.wallet.payer);
    return provider;
  }

  const getLikes = async() => {
      try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
          const account = await program.account.likes.fetch(walletAddress.publicKey)
      } catch {
          setLikes(null)
      }
  }

  const createLikesAccount = async() => {
    try {
        const provider = await getProvider();
        const program = new Program(idl, programID, provider);
        const likes = await PublicKey.createWithSeed(provider.wallet.publicKey, seed, programID)

        await program.rpc.createLikesAccount({
        accounts: {
            likes: likes, 
            user: provider.wallet.publicKey,
        },
        instructions: [
          SystemProgram.createAccountWithSeed({
            basePubkey: provider.wallet.publicKey,
            fromPubkey: provider.wallet.publicKey,
            lamports:
              await provider.connection.getMinimumBalanceForRentExemption(
                program.account.likes.size
              ),
            newAccountPubkey: likes,
            programId: program.programId,
            seed: seed,
            space: program.account.likes.size,
          }),
        ],
        });
        console.log("Created a new BaseAccount w/ address:", provider.wallet.publicKey._bn.words)
    } catch(error) {
        console.log("Error creating BaseAccount account:", error)
    }     
  }


  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
      console.log(likes)
      if (likes === null) {
        return ( 
        <div>nada
            <button onClick={createLikesAccount}>create likes account to start</button>
        </div>
        )
      } else {
          return <div>we got him boys</div>
      }
    return <div> connected </div>
  }


  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);




  return (
      <div>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
          <Transactions></Transactions>
      </div>
  );
}