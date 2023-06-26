import { useState,useEffect } from "react";

import { db } from "./firebase"
import { collection,getDocs,addDoc, doc,deleteDoc,updateDoc } from 'firebase/firestore'


import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import "./App.css"

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBookmark,faTrash,faPenToSquare} from "@fortawesome/free-solid-svg-icons"

import toast,{Toaster} from 'react-hot-toast'
import { Typography } from "@mui/material";

  function App() { 
  
    const [showAddNotes,setShowAddNotes] = useState(false)
    const [notes,setNotes] = useState([])
    const [title,setTitle] = useState("")
    const [tagLine,setTagLine] = useState("")
    const [body,setBody] = useState("")
    const notesCollection = collection(db,"notes-list")
    const [page,setPage] = useState(1)
    const [tmpNotesDis,setTmpNotesDis] = useState([])
    const [noofPages,setNoofPages] = useState(0)

    useEffect(()=>{
      async function getNotes(){
        try{
          const data = await getDocs(notesCollection)
          let pinnedNotes = [],unpinnedNotes=[]
          data.docs.map((doc)=>{
              if(doc.data().pinned) pinnedNotes.push({...doc.data(),id:doc.id})
              else unpinnedNotes.push({...doc.data(),id:doc.id})
           })
          if(pinnedNotes.length > 0){
            setNoofPages(Math.ceil(pinnedNotes.concat(unpinnedNotes).length/6))
            setNotes(pinnedNotes.concat(unpinnedNotes))
          }else{
            setNoofPages(Math.ceil(unpinnedNotes.concat(pinnedNotes).length/6))
            setNotes(unpinnedNotes.concat(pinnedNotes))          
          }
        }
        catch(e){
          alert("Resource not responding")
        }
      }
        getNotes()
  },[])
  

  function dataSorter(updateNote,pinStatus,updateNoteIndex){
    
    let tmpNotes = tmpNotesDis.length === 0 ? notes : tmpNotesDis

    tmpNotes.splice(updateNoteIndex,1)
    if(pinStatus){
      tmpNotes.unshift(updateNote)
    }else{
      tmpNotes.push(updateNote)
    }
    setTmpNotesDis(tmpNotes)
    setNotes([])
  }



  const notify = (ct,type) => {
    
    if(type === "info" ) toast.success(ct,{position:"top-right",duration:2000})
    if(type === "error") toast.error(ct,{position:"top-right",duration:2000})
    if(type === "success" ) toast.success(ct,{position:"top-right",duration:2000})
  
  }


  async function deleteNote(id,note){
    
    let noteDoc = doc(db,'notes-list',id)
    let tmpNotes = tmpNotesDis.length !==0 ? tmpNotesDis:notes
    tmpNotes.splice(tmpNotes.indexOf(note),1)
    
    setNoofPages(Math.ceil(tmpNotes.length/6))
    setTmpNotesDis(tmpNotes)
    setNotes([])
    let pg = (tmpNotes.slice(page===1?0:(6*(page-1)),(6*(page-1))+6)).length>0?page:page-1
    setPage(pg)
    await deleteDoc(noteDoc)

    notify("Note deleted","success")
  
  }

  async function switchPin(pinned,id,note){
    
    let noteDoc = doc(db,'notes-list',id)
    let pinStatus = !pinned
    let tmpNotes = tmpNotesDis.length === 0 ? notes:tmpNotesDis
    let updateNoteIndex = tmpNotes.indexOf(note)

    note.pinned = pinStatus
    dataSorter(note,pinStatus,updateNoteIndex)
    console.log("tmp = ",tmpNotesDis)
    console.log("notes = ",notes)
    let newData = {pinned:pinStatus}
    await updateDoc(noteDoc,newData)
    notify(pinStatus?"Pinned successfully":"UnPinned Succesfully","info")



  
  }
  
  function updateValue(e){

    let vl = e.target.value
    if (e.target.id === "title"){
      setTitle(vl)
    }
    if (e.target.id === "tagline"){
      setTagLine(vl)
    }
    if (e.target.id === "body"){
      setBody(vl)
    }
  }

  async function createContext(){
    
    let dateobj = new Date()
    let date = dateobj.getUTCDate()+"-"+dateobj.getUTCMonth()+"-"+dateobj.getFullYear()
    let time = dateobj.getHours()+":"+dateobj.getMinutes()+":"+dateobj.getSeconds()
    if( title === "" || tagLine === "" || body === "" ) return notify("fields Should not be a empty","error")

    let tmpNotes = tmpNotesDis.length === 0 ?notes:tmpNotesDis
    tmpNotes.push({title,tagline:tagLine,body,pinned:false,lastEdited:date+","+time})
    
    await addDoc(notesCollection,{title,tagline:tagLine,body,pinned:false,lastEdited:date+","+time})
    window.location.reload()

  }

  const handlePaginationChange = (e,vl)=>{
    setPage(vl)
  }

  function Save(id){
    let dateobj = new Date()
    let date = dateobj.getUTCDate()+"-"+dateobj.getUTCMonth()+"-"+dateobj.getFullYear()
    let time = dateobj.getHours()+":"+dateobj.getMinutes()+":"+dateobj.getSeconds()
    
    let tmpNotes = tmpNotesDis.length === 0 ? notes:tmpNotesDis
      for(let i=0;i<tmpNotes.length;i++){
        if(tmpNotes[i].id === id){
          tmpNotes[i].lastEdited = date+","+time
          break
        }
    }
    setTmpNotesDis(tmpNotes)
    setNotes([])
      
  }
  function updateInfo(e,id){
    
    let vl = e.target.value
    let tmpNotes = tmpNotesDis.length === 0 ? notes:tmpNotesDis
      
    for(let i=0;i<tmpNotes.length;i++){
        
        if(tmpNotes[i].id === id){
          
          if(e.target.id === "title"){
            tmpNotes[i].title = vl
          }
          if(e.target.id === "tagline"){
            tmpNotes[i].tagline = vl
          }
          if(e.target.id === "body"){
            tmpNotes[i].body = vl
          }
          break
        }
      }
      setTmpNotesDis(tmpNotes)
      setNotes([])
  }

  let mainNotes = tmpNotesDis.length === 0 ? notes : tmpNotesDis
  mainNotes = mainNotes.slice(page===1?0:(6*(page-1)),(6*(page-1))+6)
  
  return (
    <div className="Home">
      <Toaster/>
        <div className="header">
            <h1>Notes Keeper</h1>
        </div><br/>
        <div className="notetaker">
        
        {
        showAddNotes
        ?
        <div className="takeanote">
          <input placeholder="Title....." type="text" value={title} onChange={(e)=>{updateValue(e)}} id="title"/>
          <br/><input placeholder="Tagline..." type="text" value={tagLine} onChange={(e)=>{updateValue(e)}} id="tagline"/>
          <br/><textarea placeholder="Body....." onChange={(e)=>{updateValue(e)}} value={body} id="body"></textarea>
          <br/>
          <div>
            <button onClick={()=>createContext()}>create note</button>
            <button onClick={()=>setShowAddNotes(false)}>close</button>
          </div>
        </div>
        :    
        <div className="notetaker" onClick={()=>setShowAddNotes(true)}>
            <p style={{textDecoration:"underline",cursor:"pointer"}}>Take a note</p>
        </div>    
        }
        
        </div>
        <div className="notes" onClick={()=>setShowAddNotes(false)}>
          {mainNotes.map((note,index)=>{
            return (<div className="card" key={index}
              style={
                {boxShadow:note.pinned?"4px 4px 2px 2px rgb(18, 24, 11)":"4px 4px 2px 2px rgba(0,0,0,0.2)",border:note.pinned?"2px solid black":"2px solid rgba(0,0,0,0.2)"}}
              >

            <div className="card-head">
                <div>
                     <h2>{note.title}</h2>
                     <h5>{note.tagline}</h5>
                </div>
                <div>
                <div style={{cursor:"pointer"}} onClick={()=>switchPin(note.pinned,note.id,note)}>
                    {
                    !note.pinned?
                    <FontAwesomeIcon icon={faBookmark} style={{color: "#bbc2c9",}}/>:
                    <FontAwesomeIcon icon={faBookmark} style={{color: "#000205",}}/>
                    }
                    </div>
                </div>
            </div>
            <div className="card-body" style={{textAlign:"start"}}>
                <p>{note.body}</p>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{display:"flex",justifyContent:"space-between",cursor:"pointer",width:"12%"}}>
            
            <div className='modal'>
              <Popup trigger=
                {<FontAwesomeIcon icon={faPenToSquare} size="sm"/>}
                modal nested>
                {
                    close => (
                        <div className='modal'>
                            <div className='content'>
                                <input 
                                value={note.title}
                                onChange={(e)=>updateInfo(e,note.id)}
                                placeholder={note.title===""?'title........':''}
                                id="title"
                                /><br/>
                                <input 
                                value={note.tagline}
                                onChange={(e)=>updateInfo(e,note.id)}
                                placeholder={note.tagline===""?'tagline........':''}
                                id="tagline"
                                /><br/>
                                <textarea
                                value={note.body}
                                onChange={(e)=>updateInfo(e,note.id)}
                                placeholder={note.body===""?'body........':''}
                                id="body"
                                /><br/><br/>
                                <button onClick={()=>{
                                  Save(note.id)
                                  close()
                                  }}>Save</button>
                                <button onClick={()=>close()}>Close</button>
                            </div>
                        </div>
                        )
                  }
                </Popup>
              </div>

                 <FontAwesomeIcon icon={faTrash} size="sm" onClick={()=>deleteNote(note.id,note)}/>
            </div>
            <p style={{fontFamily:"monospace",fontSize:'small'}}>edited {note.lastEdited}</p>
            </div>
        </div>)
         })}
        </div>
         {mainNotes.length !== 0?
          <div style={{textAlign:"center",display:"flex",justifyContent:"center",position:"relative"}}>
          <Stack spacing={2}>
             <Pagination 
               count={noofPages}
               variant="outlined" 
               shape="rounded" 
               page={page}
               onChange={handlePaginationChange}
               />
           </Stack>
          </div>:"" 
        }
    </div>
  );
}

export default App;
