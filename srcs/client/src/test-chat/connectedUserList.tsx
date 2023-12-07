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
export function ConnectedUserList(props : any){

  const [list, setList] = useState<string[]>([])
  useEffect(() => {
    props.socket?.on("clientList", (clientList : string[]) => {
      setList(clientList);
    });

    return (() => {
      props.sock?.off("clientList");
    })
  }, []);

  return (<>
    <div>
      <h1>Dynamic List of client Id</h1>
      <DynamicList list={list} setId={props.fc}/>
    </div>
  </>
  )
}