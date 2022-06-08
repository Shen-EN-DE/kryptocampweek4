import React from "react";
import { ethers } from "ethers";
import { chain } from "wagmi";

export const BlockchainContext = React.createContext({
  currentAccount: null,
  provider: null,
  key1:null,
  blockchainID:null,
});

const BlockchainContextProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = React.useState(null);
  const [provider, setProvider] = React.useState(null);
  const [blockchainID, setBlockchainID] = React.useState(null);
  const [key1,setKey1] = React.useState("123456");
  
  
  
  React.useEffect(() => {
    
    //帳號
    const updateCurrentAccounts = (accounts) =>{ //從別人那裏拿到參數，而這參數是
      // accounts = ['地址']
      const [_account] = accounts;
      setCurrentAccount(_account);
    }

    //問號的用途
    // var obj = {
    //   key1: 'value',
    // }
    // undefined | null 
    // let a = obj.key1
    // 如果我要取obj的值，但因為前端有可能我沒取道，那他就會顯示underfine或Null
    // 所以?的意思是要防呆的，就是我要先判斷obj有沒有值

    const requestAccount = () =>{
      //window.ethereum? 也等於
      //if(window.ethereum){} 如果我有window.ethereum有值的話就...，有問號就不會報錯
      window.ethereum?.request({method:"eth_requestAccounts"}) //問號
      .then(updateCurrentAccounts);//有then就是先等待取得帳號，在執行下一行

      window.ethereum?.on("accountsChanged", updateCurrentAccounts); //切換練
      window.ethereum?.on("accountsChanged", (accounts) =>{
        console.log(accounts);
      })
    }
    requestAccount(); //取得帳號與換帳號

    //區塊鏈
    const isRinkebyTest = (chainID) =>{ //chainId = rinkeyby、ropsten、Kovan，他會回傳是哪個給你
      console.log(chainID)  
      const _chainID = chainID;
      setBlockchainID(_chainID);
        if(chainID !== '0x4' || !chainID){
          window.ethereum?.request({
            method: "wallet_switchEthereumChain", //提示metamask不是rinkeyby的鏈
            params:[{chainID: "0x4"}],    
          })     
          .catch((error)=>{
            if(error.code == -33002){
              console.log(chainID)  
              window.alert("請確認metamask是否為rinkeyby");
            }
          });
        }
    }

    
    window.ethereum?.on("chainChange", isRinkebyTest);
    window.ethereum?.request(
       {
       method: "net_version",
       }
    )
    .then((networkKid)=>{
      if(networkKid !=="4"){
          isRinkebyTest();
      }
     })  
    


    /*
     * 使用 window.ethereum 來透過 Matamask 來取得錢包地址
     * 參考資料: https://docs.metamask.io/guide/rpc-api.html
     * 並且將錢包地址設定在上方事先寫好的 currentAccount state
     * 加分項目1: 使用 window.ethereum 偵測換錢包地址事件，並且切換 currentAccount 值
     * 加分項目2: 使用 window.ethereum 偵測目前的鏈是否為 Rinkeby，如果不是，則透過 window.ethereum 跳出換鏈提示
     * 提示: Rinkeby chain ID 為 0x4
     */
  }, []);

  React.useEffect(() => { 

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(provider);
    setProvider(provider);

    /*
     * 使用 ethers.js
     * 透過 Web3Provider 將 window.ethereum 做為參數建立一個新的 web3 provider
     * 並將這個新的 web3 provider 設定成 provider 的 state
     */
  }, [currentAccount]);

  return (
    <BlockchainContext.Provider value={{ currentAccount, provider, key1, blockchainID }}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContextProvider;
