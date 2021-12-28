import { useEffect, useState } from 'react';
import { SystemProgram, Connection, PublicKey, clusterApiUrl} from '@solana/web3.js'
import {
  Program, Provider
} from '@project-serum/anchor'
import idl from './../likes.json';
import Transactions from './Transactions';
import LikeCard from './LikeCard'
// const {SystemProgram} = web3;

const opts = {
  preflightCommitment: "processed"
}
const network = clusterApiUrl('devnet');
const programID = new PublicKey(idl.metadata.address);
const seed = "likes"
export default function Likes(props) {
  const [likes, setLikes] = useState([])
  const [myLikes, setMyLikes] = useState(false)
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
          // const pubKey = await PublicKey.createWithSeed(response.publicKey, seed, programID)

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
    return provider;
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
        setLikes([])
        console.log("Created a new BaseAccount w/ address:", provider.wallet.publicKey._bn.words)
    } catch(error) {
        console.log("Error creating BaseAccount account:", error)
    }     
  }

  useEffect(() => { 
    async function accountExists() {

      var txns = []
      try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
          const likesKey = await PublicKey.createWithSeed(provider.wallet.publicKey, seed, programID)
          const acct = await program.account.likes.fetch(likesKey)
          const likes = acct.transactions;
          let utf8decoder = new TextDecoder("utf-8");
          likes.map(txn => {
            var item = txn.signature
            while (item[item.length - 1] === 0) {
              item = item.slice(0, -1);
            }
            var txnData = new Uint8Array(item)
            let txnHash = utf8decoder.decode(txnData);
            if (txnHash.length > 0) {
              txns.push(txnHash)
            }
            
          })
          setLikes(txns)
      } catch (error){
        console.log(error)
        setLikes(null)
      }
    }
    accountExists()
  }, [walletAddress, myLikes]);


  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);

  const toggleMyLikes = () => {
    setMyLikes(!myLikes);
  }

  const renderLikes = () => {
    return (
      likes.map(txnSig => {
        return <div> <LikeCard txn={txnSig}/></div>
      })
    )
  }


  return (
    
      <div>
          {likes ?
            <div>
              <button style={{marginBottom:"1rem"}} onClick={toggleMyLikes}>{myLikes ? "find txns" : "my likes"}</button>
              {myLikes && likes.length > 0 ?
                <>{renderLikes()}</>
                :
                <Transactions walletAddress={walletAddress} likes={likes}></Transactions>
              }
            </div>
            :
            <button onClick={createLikesAccount}>plz create account </button>
          }
      </div>
  );
}