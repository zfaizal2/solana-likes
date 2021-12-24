import { useEffect, useState } from 'react';
import { SystemProgram, Connection, PublicKey, clusterApiUrl} from '@solana/web3.js'
import {
  Program, Provider, setProvider, web3
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
export default function Likes(props) {
  const [likes, setLikes] = useState([])
  const [pubKey, setPubKey] = useState(null)
  const [payer, setPayer] = useState()
  const walletAddress = props.walletAddress;
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

        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
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
//deserialize unbuffer likes 
  const getLikes = async() => {
      try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
          const likesKey = await PublicKey.createWithSeed(provider.wallet.publicKey, seed, programID)
          const acct = await provider.connection.getAccountInfo(likesKey)
          const likes = acct.data;
          setLikes(likes)

          console.log(acct)
        } catch (error){
          console.log(error)
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
        setLikes(likes)
        console.log("Created a new BaseAccount w/ address:", provider.wallet.publicKey._bn.words)
    } catch(error) {
        console.log("Error creating BaseAccount account:", error)
    }     
  }

  useEffect(() => { 
    async function accountExists() {
      await getLikes()
    }
    accountExists()
  }, [walletAddress]);


  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);
            // setTxns("loading...")

      


  return (
    
      <div>
          {console.log(walletAddress)}
          
          {likes ?
            <Transactions walletAddress={walletAddress}></Transactions>
            :
            <button onClick={createLikesAccount}>plz create account </button>
          }
      </div>
  );
}