import { db } from "./firebase"
import { doc,updateDoc } from 'firebase/firestore'

import "./editPopUp.css"

import { faPenToSquare} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

export default function Editpop({props}){
    
    const [title,setTitle] = useState(props.title)
    const [tagline,setTagline] = useState(props.tagline)
    const [body,setBody] = useState(props.body)
    
    function updateInfo(e){
        
        let vl = e.target.value
        let id = e.target.id
        
        if(id === 'title') setTitle(vl)
        if(id === 'tagline') setTagline(vl)
        if(id === 'body') setBody(vl)
    }
    
    
    async function Save(){

        let dateobj = new Date()
        let date = dateobj.getUTCDate()+"-"+dateobj.getUTCMonth()+"-"+dateobj.getFullYear()
        let time = dateobj.getHours()+":"+dateobj.getMinutes()+":"+dateobj.getSeconds()
        var newData
        let tmpNotes = props.tmpNotesDis.length === 0 ? props.notes:props.tmpNotesDis
          for(let i=0;i<tmpNotes.length;i++){
            if(tmpNotes[i].id === props.id){
              tmpNotes[i].title = title
              tmpNotes[i].tagline = tagline
              tmpNotes[i].body = body
              tmpNotes[i].lastEdited = date+","+time
              newData = tmpNotes[i]
              break
            }
        }

        props.setTmpNotesDis(tmpNotes)
        props.setNotes([])
        
        let noteDoc = doc(db,'notes-list',props.id)
        await updateDoc(noteDoc,newData)
        props.notify("saved...!","success")
    }


    return <div className='modal'>
    <Popup trigger=
      {<FontAwesomeIcon icon={faPenToSquare} size="sm"/>}
      modal nested>
      {
          close => (
              <div className='modal'>
                  <div className='content'>
                      <input style={{width:"100%"}}
                      value={title}
                      onChange={(e)=>updateInfo(e)}
                      placeholder={title===""?'title........':''}
                      id="title"
                      /><br/>
                      <input style={{width:"100%"}}
                      value={tagline}
                      onChange={(e)=>updateInfo(e)}
                      placeholder={tagline===""?'tagline........':''}
                      id="tagline"
                      /><br/>
                      <textarea style={{width:"100%"}}
                      value={body}
                      onChange={(e)=>updateInfo(e)}
                      placeholder={body===""?'body........':''}
                      id="body"
                      /><br/><br/>
                      <button onClick={()=>{
                        Save()
                        close()
                        }}>Save</button>
                      <button onClick={()=>close()}>Close</button>
                  </div>
              </div>
              )
        }
      </Popup>
    </div>
}