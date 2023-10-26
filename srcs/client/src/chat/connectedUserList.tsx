import React, {useState, useEffect} from 'react'
import { Socket } from 'socket.io-client'
import { Chatbox } from './Chatbox';



const DynamicList = (data : {list : string[], setId : any}) => {
  
  const getSocketId = (list : string [], index : number) => {
    data.setId(list[index]);
}
  return (
    <ul>
      {data.list.map((item: string, index: number) => (
        <li  onClick={() => getSocketId(data.list, index)} key={index}>{item}</li>
      ))}
    </ul>
  );
};
//TO DO reparer cette merde qui refresh l'useEffect en BALLE
export function ConnectedUserList(props : any){

  const [list, setList] = useState<string[]>([])
  useEffect(() => {
    const handleClientList = (clientList: string[]) => {
      // Use a callback function to update the state based on the previous state
      setList(prevList => [...clientList]);
    };

    console.log('feur')
    props.socket.emit('getClients');
    props.socket.on('clientList', handleClientList);

    // Cleanup function to remove the event listener when the component is unmounted
    return () => {
      props.socket.off('clientList', handleClientList);
    };
  }, []); // <-- Empty dependency array

  return (<>
    <div>
      <h1>Dynamic List of client Id</h1>
      <DynamicList list={list} setId={props.fc}/>
    </div>
  </>
  )
}