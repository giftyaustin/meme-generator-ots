import React from "react";
import "./generate.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import LoadingBtn from "./loadingBtnComp/LoadingBtn";
import { GENERATE, GENERATED_MEME} from "../store/constants";
import LoadingMain from "./loadingComp/LoadingMain"


const Generate = () => {
  const {user} = useSelector(state=>state.user)
  const dispatch = useDispatch()
  const generateBtnLoading = useSelector(state=>state.button.generateBtnLoading)
  const generatedMemeLoading = useSelector(state=>state.button.generatedMeme)
  const history = useNavigate();
 const meme = useState(JSON.parse(sessionStorage.getItem("memeSelected")) || '')
  const url = meme.url

const [generatedMemeUrl, setGeneratedMemeUrl] = useState('')

  const [captions, setCaptions] = useState(Array(meme.box_count).fill(""));
  const formData = new FormData();
  formData.append("username", "giftyaustin");
  formData.append("password", process.env.REACT_APP_IMGFLIP_PASSWORD);

  formData.append("template_id", meme.id);
  const arr = [];
  for (let i = 0; i < meme.box_count; i++) {
    arr.push("Text " + (i + 1));
  }
  arr.forEach((element, i) => {
    formData.append(`boxes[${i}][text]`, element);
  });

  //  = ====================== function to fetch meme from api ==================

 




  const storeMeme = (imageUrl)=>{ 
  
   
      if(user){
      
        const data = {image:imageUrl}
        fetch(`${process.env.REACT_APP_CLIENT_URL}/image/upload`, {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(data),
          credentials:'include'
        }).catch((err)=>{console.log(err)})
        alert('Your meme is now stored on cloud, you can access it later')
      }
  }

 


  // ==========================================================================

  // ================= meme generation ===================
  const generateMeme = (storeMeme) => {
   
    const memeFormData = new FormData();
    memeFormData.append("password", process.env.REACT_APP_IMGFLIP_PASSWORD);
    memeFormData.append("username", "giftyaustin");
    memeFormData.append("template_id", meme.id);
    captions.forEach((c, i) => {
      memeFormData.append(`boxes[${i}][text]`, c);
    });
    fetch("https://api.imgflip.com/caption_image", {
      method: "POST",
      body: memeFormData,
    }).then((res) => {
      res.json().then((res) => {
        try {
          storeMeme(res.data.url)
          setGeneratedMemeUrl(res.data.url)
          
         
        } catch (error) {
          console.log(error);
        }
        dispatch({type:GENERATE,payload:false})
          dispatch({type:GENERATED_MEME, payload:false})
      });
    });
  };
  // ============================

  //  ======================= download meme ========================

  const downloadMeme=()=>{
    const downloadUrl = generatedMemeUrl;
    const filename = meme.name+".jpg";
    saveAs(downloadUrl, filename)
  }
  return (
    <div className="container">


      {/* back button functionality */}

      <div className="back-btn-holder my-3 btn">
        <button
          className="back-btn btn btn-danger"
          onClick={() => {
            history("/main");
          }}
        >
          Back
        </button>
      </div>

      {/* ======== meme-template ========= */}


      <div className="template-holder gm-holder">
        {generatedMemeUrl ? (
          <img
            src={generatedMemeUrl}
            alt={'Meme Template'}
            className="meme-template-generate gm-o"
          />
        ) : (
          generatedMemeLoading? <LoadingMain/> :
          <img
            src={url ? url : ""}
            alt="Meme Template"
            className="meme-template-generate gm-o"
          />
        )}
      </div>

      {generatedMemeUrl ? (
        ""
      ) : (
        <div className="caption-boxes-holder">
          {Array(meme.box_count)
            .fill(0)
            .map((c, i) => {
              return (
                <div className="container-fluid text-center my-3" key={i}>
                  <div className="text-name mx-3">Text {i + 1}: </div>
                  <div className="caption-input-holder mx-3">
                    <input style={{color:'black'}}
                      type="text"
                      value={captions[i]}
                      onChange={(e) => {
                        setCaptions(
                          captions.map((ele, ind) => {
                            return ind === i ? e.target.value : ele;
                          })
                        );
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
      {generatedMemeUrl ? (
        <div className="text-center my-3">
          <button className="btn generate-btn" onClick={downloadMeme}>
            Download
          </button>
        </div>
      ) : (
        <div className="text-center my-3">
          <button className="generate-btn" onClick={()=>{
            dispatch({type:GENERATE, payload:true})
            dispatch({type:GENERATED_MEME, payload:true})
            var filteredCaptions = []
            filteredCaptions = captions.filter((c)=>{
              return(c!==""&&c.replaceAll(" ","")!=="")
            })
           
            if(filteredCaptions.length !==0){
             
           
              generateMeme(storeMeme)
            }
            else{
              alert('Enter atleast one caption')
              dispatch({type:GENERATE, payload:false})
              dispatch({type:GENERATED_MEME, payload:false})
            }
          }}>
            {<LoadingBtn isLoading={generateBtnLoading} btnText={'Generate'}/>}
          </button>
        </div>
      )}

    </div>
  );
};

export default Generate;
