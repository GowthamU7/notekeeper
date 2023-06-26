import { useState,useEffect } from "react";

import { db } from "./firebase"
import { collection,getDocs,addDoc, doc,deleteDoc,updateDoc } from 'firebase/firestore'


import "./App.css"

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBookmark,faTrash,faClipboard,faPlus,faClone,faPenToSquare,faLink} from "@fortawesome/free-solid-svg-icons"



import toast,{Toaster} from 'react-hot-toast'

import Editpop from "./editPopUp";

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

  async function createCopy(id){

    notify('Copy create','success')
    let tmpNotes = tmpNotesDis.length === 0 ?notes:tmpNotesDis
    let copy
    for(let i=0;i<tmpNotes.length;i++){
      if(tmpNotes[i].id === id){
        copy = tmpNotes[i]
        break
      }
    }

    let dateobj = new Date()
    let date = dateobj.getUTCDate()+"-"+dateobj.getUTCMonth()+"-"+dateobj.getFullYear()
    let time = dateobj.getHours()+":"+dateobj.getMinutes()+":"+dateobj.getSeconds()

    copy.lastEdited = date+","+time
    copy.pinned = false
    tmpNotes.push(copy)
    setNoofPages(Math.ceil(tmpNotes.length/6))
    await addDoc(notesCollection,copy)
    setTmpNotesDis(tmpNotes)
    setNotes([])

    window.location.reload()
  

  }

  function gotoAbout(){
    console.log(window.innerHeight)
    window.scrollTo({top:window.innerHeight,left:0,behavior:"smooth"})
  }


  let mainNotes = tmpNotesDis.length === 0 ? notes : tmpNotesDis
  mainNotes = mainNotes.slice(page===1?0:(6*(page-1)),(6*(page-1))+6)
  


  return (
    <div className="Home">
      <Toaster/>
        <div className="header">
            <a className="icon" href="/notekeeper"><FontAwesomeIcon size="xl" icon={faClipboard} style={{color: "rgba(113, 238, 81, 0.61)",}} /> Note Keeper</a>
            <a className="about" href="#" onClick={()=>gotoAbout()}>about</a>
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
            <button onClick={()=>createContext()}>Add note</button>
            <button onClick={()=>setShowAddNotes(false)}>close</button>
          </div>
        </div>
        :    
        <div className="notetaker" style={{cursor:"pointer"}} onClick={()=>setShowAddNotes(true)}>
            <FontAwesomeIcon icon={faPlus} bounce={true} size="2xl" style={{color: "rgba(113, 238, 81, 0.61)",}} />
        </div>
        }
        
        </div><br/>
        <div className="notes" onClick={()=>setShowAddNotes(false)}>
          {mainNotes.map((note,index)=>{
            return (<div className="card" key={index}
              style={
                {
                  boxShadow:note.pinned?"4px 4px 2px 2px #000205":"4px 4px 2px 2px rgba(0,0,0,0.2)",
                  border:note.pinned?"0.6px solid #bbc2c9":"0.3px solid rgba(0,0,0,0.2)"}}
              >

            <div className="card-head">
                <div>
                     <h2 style={{wordWrap:"break-word",wordBreak:"break-word"}}>{note.title}</h2>
                     <h5 style={{wordWrap:"break-word",wordBreak:"break-word"}}>{note.tagline}</h5>
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
            <div style={{display:"flex",justifyContent:"space-between",cursor:"pointer",width:"18%"}}>
              <Editpop props={{...note,notes,setNotes,tmpNotesDis,setTmpNotesDis,notify}}/>|
              <FontAwesomeIcon icon={faTrash} size="sm" onClick={()=>deleteNote(note.id,note)}/>|
              <FontAwesomeIcon icon={faClone} style={{color: "#111b2c"}} onClick={()=>createCopy(note.id)} size="sm"/>
            </div>
            <p style={{fontFamily:"monospace",fontSize:'small'}}>edit {note.lastEdited}</p>
            </div>
        </div>)
         })}
        </div>
        <div className="nav" style={{textAlign:"center",display:"flex",justifyContent:"center",position:"relative"}}>
        {mainNotes.length !== 0?
        <Stack spacing={2}>
        <Pagination 
          count={noofPages}
          variant="outlined" 
          shape="rounded" 
          page={page}
          onChange={handlePaginationChange}
          />
        </Stack>:
       <p>empty........</p> 
    }
          </div>
    <div className="footer">
        <div>
        <ul>
          <p>
            <FontAwesomeIcon icon={faBookmark} style={{color: "green",}}/> click to pin/unpin a Note.
          </p>
          <p>
            <FontAwesomeIcon icon={faPenToSquare} style={{color: "green",}} size="sm"/> click to edit a Note
          </p>
          <p>
            <FontAwesomeIcon icon={faTrash} style={{color: "green",}} size="sm" /> click to delete a Note
          </p>
          <p>
            <FontAwesomeIcon icon={faClone}  style={{color: "green",}} size="sm"/> click to create a copy of a note
          </p>
          <p>
          <FontAwesomeIcon icon={faPlus} size="sm" style={{color: "green",}} /> click to add a note
          </p>
        </ul>
        </div>
        <div>
            <a 
            style={{textDecoration:"none",color:"black"}}
            href="https://gowthamu7.github.io/notekeeper/"
            target="new"
            ><FontAwesomeIcon icon={faLink} style={{color: "#32b335",}} /> Project Link</a>
        </div>
    </div>
    </div>
  );
}

export default App;
