import React, { useState } from 'react';
import './MyComponents.scss';
import {UrlState, BaseService, AppConfig, AuthenticationService, repo, srv} from 'bi-internal/core';

// Основной компонент
function CustomInterface_1(props) {  
  const [sel_1, setSel_1] = React.useState(''); // Состояние листбокса 1
  const [sel_2, setSel_2] = React.useState(''); // Состояние листбокса 2
  const [file, setFile] = React.useState(null); // Состояние выбранного файла
  const [msg, setMsg] = React.useState('');     // Состояние сообщения о рез-те загрузки
  const [msgTp, setMsgTp]= React.useState('');  // Состояние типа отображения рез-та загрузки
  const [cursor,setCursor]= React.useState('cursor_1');     // Состояние типа курсора
  const [bcursor,setBCursor]= React.useState('bcursor_1');  // Состояние типа курсора для кнопок

  // ф-я по обработке события выбора эл-та из списка листбокса
  const fn_onSelChange = (e) => {
    switch(e.target.id){ 
      case "1": 
          setSel_1(e.target.value);          
          break;
      case "2": 
          setSel_2(e.target.value);         
          break;
    }    
  };

  // Ф-я по обработке события выбора файла
  const fn_onFileSel=(selectedFile)=>{
    setFile(selectedFile);
  };

  // ф-я по проверке выбора эл-ов листбоксов и файла
  const fn_checkIfReady=()=>{   
    // проверка что выбраны значения из листбоксов и выбран файл
    let msg;   
    if (!sel_1){
      msg = 'Элемент списка 1 (Ключ методологии);' + '\n'; 
    }
    if (!sel_2){
      msg = msg = msg + 'Элемент списка 2 (Бизнес блок);' + '\n';
    }
    if (!file){
      msg = msg = msg + 'Файл для загрузки';
    }
    if (msg){
      alert('Не выбрано: ' + msg);
      return;
    }
    // проверки пройдены, вернуть true
    return true;
  }

  // ф-я по отправке выбранных данных вебсервису
  const fn_sendFile=()=>{
    // проверка что все данные  выбраны  
    if (!fn_checkIfReady()) {
      return;
    }  
    const formData = new FormData();
    formData.append('meth_key', '2025_v62'); //ключ методологии
    formData.append('cube', 'spp_block_1');  // модель  */
    formData.append('files', file);          // 'file'  файл
  
    const url = 'http://172.22.194.56:8012/v1/mthd/write_meth';
    const optn ={    
                  method: 'POST', 
                  //headers: {'Content-Type': 'application/json'},
                  //mode: 'no-cors',
                  body : formData
                }; 

    setCursor('cursor_2');    
    setBCursor('bcursor_2');          
    fetch(url, optn)
        .then(res=>{
            return res.json();
          }
        ).then(data => {
            setMsg(fn_getResult(data));
            fn_ShowMsg();
          }
        ).catch(error => {
            setMsg(fn_getResult(error));
            fn_ShowMsg();
          });  
          
  }

  // элемент окна вывода результатов  
  const dialog = document.getElementById('Result'); 

  //ф-я показа окна рез-та
  const fn_ShowMsg=()=>{
    setCursor('cursor_1');
    setBCursor('bcursor_1'); 
    dialog.showModal()
  }

  // ф-я обработки результата отправки
  const fn_getResult=(result)=>{
     let stts, msg;
     if (typeof(result) == 'object') {
        if ('status' in result){
            stts = result.status; 
            if (stts == "success") {
              msg = 'Загрузка данных произведена.' 
              setMsgTp(stts);
            }else if (stts == "error") {
              let msgArr;
              msgArr = result.error.details[0]
              for (const itm of msgArr) {
              msg += itm.msf_txt + '/n';      
              }
              msg = 'Ошибка при отправке данных: ' + msg;
              setMsgTp(stts);
            }
        }else {
            msg = 'Ошибка при отправке запроса: ' +  result.toString();
            setMsgTp("error");
        }    
      }else{
        msg = 'Ошибка при отправке запроса:' + result;
        setMsgTp("error");
      }  

    return msg;
  } 

  // функция закрытия окна вывода результатов загрузки
  const fn_dialogClose= () => {
        dialog.close();
    }  
  
  return (
      <div className="main_style">
        <table className={`table ${cursor}`}>
          <tr>
            <td>
              <ListBox sel_Id="1" arr={Arr_1} name="Список 1" selected={sel_1} onSelChange={fn_onSelChange}/>
            </td>  
            <td>
              <ListBox sel_Id="2" arr={Arr_2} name="Список 2" selected={sel_2} onSelChange={fn_onSelChange}/>
            </td>                          
          </tr>
          <tr>
            <td>
              <SelectFile extention=".zip" onSelect = {fn_onFileSel} bcursor={bcursor}/>
            </td>
            <td>
              <SendFile onClick={fn_sendFile} bcursor={bcursor}/>
            </td>
          </tr>
        </table>
        <ShowResult onClick={fn_dialogClose} result={msg} className={msgTp}/>    
      </div>
    );
}

// Временный массив списка листбокса 1
const Arr_1 = [
  { value: '', label: '' },  
  { value: 'option_a1', label: 'Option A1' },
  { value: 'option_a2', label: 'Option A2' },
  { value: 'option_a3', label: 'Option A3' },
];
// Временный массив списка листбокса 2
const Arr_2 = [
  { value: '', label: '' },
  { value: 'option_b1', label: 'Option B1' },
  { value: 'option_b2', label: 'Option B2' },
  { value: 'option_b3', label: 'Option B3' },
];

// Компонент вывода листбокса
function ListBox(props) {
  let Arr = props.arr;
  return (
    <div>
      <p>{props.name}:</p>
      <select id={props.sel_Id} value={props.selected} onChange={props.onSelChange}> 
        {Arr.map((itm, index) => (
          <option key={index} value={itm.value}>
            {itm.label}
          </option>
        ))}
      </select>
      <p className='info'>Выбрано: {props.selected}</p>
    </div>
  );
}

// Компонент вывода инпута по выбору файла
function SelectFile(props) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [msg, setMsg] = useState('Выберите zip файл');
  const [clr, setClr] = useState('gray');

  const fn_handleFileChange = (event) => {    
    const file = event.target.files[0];  
    //    if (!file || !file.name.endsWith('.zip')) {
    if (!file){
      setMsg('Файл не выбран !');
      setSelectedFile(null);  
      setClr('red');     
    }else if (!file.name.endsWith('.zip')) {
      setMsg('Выбранный файл не является zip архивом !');
      setSelectedFile(null);  
      setClr('red');   
    }else{      
      setMsg('Выбран файл: ' + file.name);
      setSelectedFile(file);
      setClr('green');
      props.onSelect(file);
    }
  }

  return (
    <div>
      <label className={`button ${props.bcursor}`} for="fileinput">Выбрать файл</label>
      <input id="fileinput" className='button' type="file" accept={props.extention} onChange={fn_handleFileChange} hidden/>
      <p className='info' style={{color: clr}}>{msg}</p>            
    </div>
  );
};

// Компонент кнопки по отправке выбранных данных вебсервису
function SendFile(props){
  return(
  <input type="button" onClick={props.onClick} className={`button ${props.bcursor}`} value='Загрузить'/>  
  );
}

// Компонент вывода на экран модального окна с результатами загрузки
function ShowResult(props){
  return(
    <dialog id="Result" className={`${props.className} main_style`}>
      <h1>Результат загрузки</h1>
      <p>{props.result}</p>
      <br/>
      <button id="closeDialog" className='button' onClick={props.onClick}>Закрыть</button>
  </dialog> 
  )
}

export default CustomInterface_1; // обязательно должен содержать export default!