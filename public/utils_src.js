'use strict';

function $id(id) {	return document.getElementById(id);}

function setoptions(pnode,options) {
  if(options) {
    for( var key in options ){
      if (options.hasOwnProperty(key)) {
        pnode.setAttribute(key,options[key]);
      }
    }
  }
}

function triggerEvent(observable, eventType) {
  if(typeof(Event) === 'function') {
    var evnt = new Event(eventType);
  } else{
    var evnt = document.createEvent('Event');
    evnt.initEvent(eventType, true, true);
  }
  observable.dispatchEvent(evnt);
  //var evnt = new Event(eventType);
  //if (document.createEvent) {
  //    event = document.createEvent("HTMLEvents");
  //    event.initEvent(eventType, true, true);
  //    observable.dispatchEvent(event);
  //} else {
  //    event = document.createEventObject();
  //    event.eventType = eventType;
  //    observable.fireEvent("on" + eventType, event);
  //}
}

function setFieldValue(obj,fieldValue) {
  var changedObj = (typeof(obj)==='string')?$id(obj):obj;
  if(changedObj) {
    if (changedObj.type && ((changedObj.type === 'checkbox') || (changedObj.type === 'radio'))) {
      changedObj.checked = fieldValue;
    } else  {
      changedObj.value = fieldValue;
    }
    triggerEvent(changedObj,'change');
  }
}

Object.byString = function(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (isObject(o) && k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
};

function isObject (o) {
  return o !== null && typeof o === 'object';   
  return (!!o) && (o.constructor === Object);
}

function observe(oobj,listenerID,formula,listenerCB,listenerprefix) {
  if(!oobj.listeners) {
    oobj.listeners = new Object();
    oobj.addEventListener('change',notifylisteners);
    setTimeout(	triggerEvent, 1000, oobj, 'change');
  }
  if(!oobj.listeners[listenerID]) oobj.listeners[listenerID]=[];
  oobj.listeners[listenerID].push({frmla: formula, lcbf: listenerCB, prefix:listenerprefix});
  //console.log("observing " + oobj.id + " for listener "+listenerID);
}

function observeFields(fieldprfx,listenerID,formula,listenerCB) {
  //console.log("Listener "+listenerID+" formula "+formula);
  var reg = /{(.*?)}/g;
  var match;
  var matches = [];
  while(match = reg.exec(formula)) {
    if(matches.indexOf(match[1]) > -1) continue;
    matches.push(match[1]);
		
    var oobj = $id(fieldprfx + match[1]) || $id(match[1]);
    if(oobj) {
      observe(oobj,listenerID,formula,listenerCB,fieldprfx);
    } else {
      oobj = document.querySelectorAll('[id^=\'' + fieldprfx + match[1] + '\']');
      if(oobj.length) {
        Array.prototype.forEach.call(oobj,function(node){
          observe(node,listenerID,formula,listenerCB,fieldprfx);
        });
      } else {
        oobj = document.querySelectorAll('[id^=\'' + match[1] + '\']');
        if(oobj.length) {
          Array.prototype.forEach.call(oobj,function(node){
            observe(node,listenerID,formula,listenerCB,fieldprfx);
          });
        } else {
          oobj = document.querySelectorAll('[id$=\'' + match[1] + '\']');
          if(oobj.length) {
            observe(oobj,listenerID,formula,listenerCB);
          } else {
            console.log('Couldn\'t find observant '+match[1]);
          }
        }				
      }
    }
  }
}

//function jq( myid ) {  return "#" + myid.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );}

function getObjectVal(obj) {
  if((obj.nodeName=='INPUT') && (obj.getAttribute('list'))) {
    var dataoptions = $id(obj.id+'_list').childNodes;
    var retval = obj.value;
    for(var i=0;i<dataoptions.length;i++) {
      if((dataoptions[i].value==obj.value)) {
        retval = dataoptions[i].getAttribute('data') || obj.value;
        break;
      }
    }
    return retval;
  } else 
    return obj.value;
}

function parseStringFields(strWfields,keyprfx,uriEncode) {
  var fieldprfx = keyprfx || '';
  var retval;
  if(strWfields) {
    return strWfields.replace( /{(.*?)}/g,
		 function(m,a,b){
        //console.log(a);
        var oobj = $id(fieldprfx+a) || $id(a); 
        if(oobj) {
          retval = getObjectVal(oobj) || '';
          return (uriEncode?encodeURIComponent(retval):retval);
        } else {
          oobj = document.querySelectorAll('[id^=\'' + fieldprfx + a + '\']');
          if(oobj.length) {
            var arrayresult=[];
            for(var i=0; i<oobj.length; i++) {
              if((oobj[i].type=='checkbox') || (oobj[i].type=='radio')) {
                if(oobj[i].checked) arrayresult.push(oobj[i].value);
              } else {
                if(oobj[i].value) arrayresult.push(getObjectVal(oobj[i]));
              }
            }
            retval = ((arrayresult.length>1)?JSON.stringify(arrayresult):(arrayresult.length>0)?arrayresult[0]:'');
            return (uriEncode?encodeURIComponent(retval):retval);
          } else {
            oobj = document.querySelectorAll('[id^=\'' + a + '\']');
            if(oobj.length) {
              var arrayresult=[];
              for(var i=0; i<oobj.length; i++) {
                if((oobj[i].type=='checkbox') || (oobj[i].type=='radio')) {
                  if(oobj[i].checked) arrayresult.push(oobj[i].value);
                } else {
                  if(oobj[i].value) arrayresult.push(getObjectVal(oobj[i]));
                }
              }
              retval = ((arrayresult.length>1)?JSON.stringify(arrayresult):(arrayresult.length>0)?arrayresult[0]:'');
              return (uriEncode?encodeURIComponent(retval):retval);
            } else {
              oobj = document.querySelector('[id$=\'' + a + '\']');
              if(oobj) {
                retval = getObjectVal(oobj) || '';
                return (uriEncode?encodeURIComponent(retval):retval);
              }
            }
          }
        }
        return '';
		 }
    );
  }
  return null;
}

function copyListeners(oobjSource,oobjDestination) {
  var tf = oobjSource.listeners;
  if(tf) {
    for (var listenerID in tf) {
      if (tf.hasOwnProperty(listenerID)) {
        var oobj = tf[listenerID];
        oobj.forEach(function(objcb) {
          observe(oobjDestination,listenerID,objcb.frmla,objcb.lcbf,objcb.prefix);
        });
      }
    }
  }
}
 
function notifylisteners(e) {
  var tf = this.listeners;
  var cbValue = this.value;
  for (var listenerID in tf) {
    if (tf.hasOwnProperty(listenerID)) {
      var oobj = tf[listenerID];
      oobj.forEach(function(objcb) {
        objcb.lcbf(listenerID, objcb.frmla, cbValue, objcb.prefix);
      });
    }
  }
}
function buildOptionsFromAjax(sdrp,skey,objParams) {
  return function(response) {
    //console.log(response)
    var avl = JSON.parse(response);
    //myfields[skey].values = avl.values;
    //dataArrayPath = dataArrayPath || "values";
    var isdrop = (sdrp.nodeName=='SELECT');
    var dataObj= (objParams.dataArray)?(Object.byString(avl,objParams.dataArray)):avl;
    var labelObj= (objParams.labelArray)?(Object.byString(avl,objParams.labelArray) || dataObj):dataObj;
		
    var labelkey = objParams.labelKey || objParams.dataKey;
		
    if(!dataObj) return;
    //console.log(objParams);	console.log(dataObj);console.log(labelObj);
		
    for (var k = 0;k < dataObj.length; k++ ) {
      var slopt = document.createElement('option');
      //slopt.setAttribute("id",skey + "_" + String(k + 1));
      var optval = objParams.dataKey?dataObj[k][objParams.dataKey]:dataObj[k];
			
      if(isdrop) {
        slopt.textContent = labelObj[k][labelkey] || labelObj[k];
        slopt.setAttribute('value',optval);
      } else {
        slopt.setAttribute('value',labelObj[k][labelkey] || labelObj[k]);
				
        if((objParams.dataKey !== labelkey) || (labelObj!==dataObj)) {
          slopt.setAttribute('data',optval);
					
        }
      }
			
      sdrp.appendChild(slopt);
    }
    if(sdrp.nodeName=='DATALIST') 
      polyfilldatalist(skey);
    else
      sdrp.selectedIndex = objParams.selectedIndex || -1;
  };
}

var utils = {
	
  getURLParameter : function(name) {
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
    else return '';
  },
	
  ajaxGet : function(url, successcbf, failcbf, headers) {
    this.ajax('GET',url,successcbf, failcbf, headers);
  },
  ajax : function(method, url, successcbf, failcbf, headers, fdata) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if(this.status==200) {
          if(successcbf) successcbf(this.responseText);
        } else {
          if(failcbf)	failcbf(this.responseText);
        }
      }
    };
    xmlhttp.open(method, url, true);
    if(headers) {
      for( var key in headers ){
        if (headers.hasOwnProperty(key)) {
          //console.log(key + " "+headers[key]);
          xmlhttp.setRequestHeader(key,headers[key]);
        }
      }
    }
    if(fdata && (method!=='GET')) 
      xmlhttp.send(fdata); 
    else 
      xmlhttp.send(); //is this redundant?
  },
	
  getTodaysDate : function(dayOffset) {
    var now = new Date();
    if(dayOffset) now.setDate(now.getDate()+dayOffset);
    return now.getFullYear() + '-' + (('0' + (now.getMonth() + 1)).slice(-2)) + '-' + (('0' + now.getDate()).slice(-2));
  },
  getWallClock : function(offsetSeconds) {
    var now = new Date();
    if(offsetSeconds) now.setTime(now.getTime()+offsetSeconds*1000);
    return (('0' + now.getHours()).slice(-2)) + ':' + (('0' + now.getMinutes()).slice(-2)) + ':' + (('0' + now.getSeconds()).slice(-2));
  },
	
  createEmail : function (mto,mcc,msubj,mbody) {
    var aref = document.createElement('a');
    var maillink = 'mailto:';
    var sep = '?';
    if(mto) maillink += mto;
    if(mcc) {maillink += '?cc=' +mcc; sep = '&';}
    maillink += sep + 'subject=' + encodeURIComponent(msubj?msubj:' ');
    if(mbody) maillink += '&body=' + encodeURIComponent(mbody);
    //console.log(maillink);
    aref.setAttribute('href',maillink);
    document.body.appendChild(aref);
    aref.click();
    document.body.removeChild(aref);
  }
};

	
var mdom = {
	
  clearaDiv : function(divId) {
    var box =  $id(divId);
    var newBox = box.cloneNode(false);
    box.parentNode.replaceChild(newBox,box);
    box = newBox;	
  },
	
  disableDiv : function(divID) {
    var box = $id(divID);
    if(box) {
      box.disabled = true;
      Array.prototype.forEach.call( box.getElementsByTagName('*'),
        function(elem) {
          //console.log(elem);
          if(elem.type) {
            if((elem.type == 'radio') || (elem.type == 'checkbox') || (elem.type.indexOf('select')>-1) || (elem.nodeName=='BUTTON')) 
              elem.disabled = true;
            elem.readOnly = true;
          }
        }
      );
    }
  },
	
  enableDiv : function(divID) {
    var box = $id(divID);
    if(box) {
      box.disabled = false;
      Array.prototype.forEach.call( box.getElementsByTagName('*'),
        function(elem) {
          if(elem.type && (elem.type!='calculation')) {
            elem.disabled = false;
            elem.readOnly = false;
          }
        }
      );		
    }		
  },
	
  hideDiv : function (divID) {
    var box = $id(divID);
    if(box) {
      if(!box.classList.contains('hideDiv')) box.classList.add('hideDiv');
      //disableDiv(divID);
    }
  },
	
  unhideDiv : function(divID) {
    var box = $id(divID);
    if(box)	{
      box.classList.remove('hideDiv');
      //enableDiv(divID);
    }
  },
	
  insertAfter : function(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  },
	
  createDiv : function(cellclass,optid) { 
    var ncell = document.createElement('div'); 
    ncell.setAttribute('class',cellclass); 
    if(optid) ncell.setAttribute('id',optid);
    return ncell;
  },
	
  addbutton : function(pNode,stext,rid,callbackfunction,options) {
    var abutton = document.createElement('button');
    abutton.innerHTML = stext;
    if(rid) abutton.setAttribute('id',rid);
		
    setoptions(abutton,options);
		
    if(callbackfunction) abutton.addEventListener('click',callbackfunction);
    pNode.appendChild(abutton);
		
    return abutton;
  },
	
  addhref : function (pNode,stext,href,options) {
    var aref = document.createElement('a');
    aref.setAttribute('href',href);
    aref.innerHTML = stext;
    setoptions(aref,options);
    pNode.appendChild(aref);
    return aref;
  },
	 
  createField : function(frmRO,rtype, rid, rname, rvalue, options) {
    var infield;
    if(rtype!='textarea') {
      infield = document.createElement('input');
      infield.setAttribute('type',rtype);
      infield.setAttribute('name',rname);
    } else {
      infield = document.createElement('textarea');
    }
    infield.setAttribute('id',rid);
		
    if((rtype=='checkbox') || (rtype=='radio')) {
      infield.setAttribute('value',rvalue);
      if(frmRO) infield.disabled = true;
    }
    setoptions(infield,options);
		
    if(frmRO) infield.readOnly = true;
    return infield;
  },
		 
  addsignaturef : function(frmRO, pNode, rid, callbackclick ,callbackbutton) {
    var ccnvs = document.createElement('canvas'); 
    ccnvs.setAttribute('id',rid);
    //ccnvs.setAttribute("style",$id("sigcnvs").style);
    ccnvs.setAttribute('style','background: #fff;width: 300px;height: 150px;border: solid thin;');
    ccnvs.addEventListener('click', callbackclick, false);
    pNode.appendChild(ccnvs); 
    if(!frmRO) { 
      this.addbutton(pNode,'...','d_'+rid, callbackbutton);
    }
  },
  addhyperlink: function(frmRO, pNode, rid, callbackbutton,options ) {
    var aref = this.addhref(pNode,'','http://',options); 
    aref.setAttribute('id',rid);
    aref.setAttribute('target','_blank');
		
    if(!frmRO) { 
      this.addbutton(pNode,'...','l_'+rid, callbackbutton,{'style':'float:right;padding:1px;'});
    }
  },

  addbreak : function(pNode, n) {
    n = n || 0;
    for (var i = 0; i < n; i++)
      pNode.appendChild(document.createElement('br'));
  },
	
  addimage : function (pNode,imgsrc,options) {
    var eimg = document.createElement('img');
    eimg.src = imgsrc;
    setoptions(eimg,options);
    pNode.appendChild(eimg);
  },

  addlabel : function(pNode,stext,n,options) {	
    setoptions(pNode,options);
    if(options && options.style && (options.style.indexOf('font-weight')>=0)) {
      pNode.innerHTML = stext;
    } else {
      var el = document.createElement('b');
      el.innerHTML = stext; 
      pNode.appendChild(el); 
    }
    this.addbreak(pNode,n);
  },

  addtext : function (pNode,stext,n) { 	
    pNode.appendChild(document.createTextNode(stext)); 
    this.addbreak(pNode,n);
  },
	
  addlabelfor : function (pNode,stext,key) {
    var tl= document.createElement('label');
    tl.appendChild(document.createTextNode(stext));
    tl.setAttribute('for',key);
    pNode.appendChild(tl);
  },
	
  addfield : function(frmRO, pNode, rtype, rid, rname, rvalue, options,prefix,postfix) {
    var afield = this.createField(frmRO, rtype, rid, rname, rvalue, options);
    if(prefix) {
      var etn = document.createElement('b'); 
      etn.innerHTML = prefix;
      pNode.appendChild(etn);
    }
    pNode.appendChild(afield);
    if(postfix) {
      var etn = document.createElement('b'); 
      etn.innerHTML = postfix;
      pNode.appendChild(etn);
    }
    return afield;
  },
	
	

  rebuildFilteredList : function(targetID, formula, CBValue, keyprefix) {
    var aslist = $id(targetID);
    var objformula = aslist.getfilteredvaluelist;
    var sopt;
    var parentCell;
    if(aslist) {
      parentCell = aslist.parentNode;
      if((aslist.nodeName=='INPUT')) { 
        if($id(targetID+'_list')) 
          parentCell.removeChild($id(targetID+'_list'));
      }
      if((aslist.nodeName=='SELECT')) parentCell.removeChild(aslist);
    }
    aslist = $id(targetID);
		
    if(aslist) {
      sopt = document.createElement('datalist');
      sopt.setAttribute('id',targetID+'_list');
    } else {
      sopt = document.createElement('select'); 
      sopt.setAttribute('id',targetID);
      sopt.setAttribute('style','width: 80%');
    }
    parentCell.appendChild(sopt);
    if(objformula.listname) {
      var ajaxReturnParams = {'dataArray':'values','dataKey':null,'labelArray':'labels','labelKey':null};
      utils.ajaxGet('getvaluelist.php?l=' + objformula.listname + '&f=' + encodeURIComponent(objformula.prefix + '\'' + CBValue + '\''), buildOptionsFromAjax(sopt,targetID,ajaxReturnParams));
    } else if(objformula.url) {
      utils.ajaxGet(
        parseStringFields(objformula.url,keyprefix,true), 
        buildOptionsFromAjax(sopt,targetID,objformula),
        null,objformula.headers
      );
    }
  },
	
  createComboDropDown : function (frmRO,celldf,key,jsf,frmID,keyprefix) {
    var sl;
    var inpfld;
    //var combodiv;
    if(jsf.type=='dropdown') {
      sl = document.createElement('select'); 
      sl.setAttribute('id',key);
      sl.setAttribute('style','width: 90%');
      sl.selectedIndex = jsf.selectedIndex || -1;
    } else {
      //combodiv = createDiv("combodiv");
      inpfld = this.createField(frmRO,'text',key, key,'',jsf.options);
      inpfld.style.width='90%';
      inpfld.setAttribute('list',key+'_list');
			
      if(jsf.options && jsf.options['style']) {
        celldf.setAttribute('style',jsf.options['style']);
      }
      //inpfld.setAttribute("style","width: 80%");
			
      if(jsf.prefix) {
        var etn = document.createElement('b'); 
        etn.innerHTML = jsf.prefix;
        celldf.appendChild(etn);
      }
      //combodiv.appendChild(inpfld);
      celldf.appendChild(inpfld);
			
      //var comboarrow = document.createElement("span");
      //comboarrow.setAttribute("class","darrow");
      //celldf.appendChild(comboarrow);
			
      if(jsf.postfix) {
        var etn = document.createElement('b'); 
        etn.innerHTML = jsf.postfix;
        celldf.appendChild(etn);
      }
			
      sl = document.createElement('datalist');
      sl.setAttribute('id',key+'_list');
    }
    var targetelem = inpfld || sl;
		
    if(jsf.values) {
      for (var k = 0;k < jsf.values.length; k++ ) {
        var slopt = document.createElement('option');
        //slopt.setAttribute("id",key + "_" + String(k + 1));
        slopt.setAttribute('value',jsf.values[k]);
        slopt.innerHTML = (jsf.labels)?jsf.labels[k]:jsf.values[k];
        sl.appendChild(slopt);
      }
      if((jsf.type=='combobox')||(jsf.type=='combo')) 
        polyfilldatalist(key);
      else 
        sl.selectedIndex = jsf.selectedIndex || -1;
    }
    if(jsf.getvaluelist) {
      var sourceurl = jsf.getvaluelist.url || ((jsf.getvaluelist==='self')? ('getselfvaluelist.php?fid=' + frmID + '&field=' + key) : ('getvaluelist.php?l=' + jsf.getvaluelist));
      //console.log(sourceurl);
      var ajaxReturnParams = {'selectedIndex':jsf.selectedIndex,'dataArray':(jsf.getvaluelist.url)?jsf.getvaluelist.dataArray:'values','dataKey':jsf.getvaluelist.dataKey,'labelArray':(jsf.getvaluelist.url)?jsf.getvaluelist.labelArray:'labels','labelKey':jsf.getvaluelist.labelKey};
      utils.ajaxGet(sourceurl, 
        buildOptionsFromAjax(sl,key,ajaxReturnParams),
        null,jsf.getvaluelist.headers);
								
    } else if(jsf.getfilteredvaluelist) {
			
      var vlfopt = jsf.getfilteredvaluelist;
      //var filterSource = $id(vlfopt.filterby);
      //if(!filterSource) {
      //	console.log("error. not find ID " + vlfopt.filterby);
      //	return;
      //}
      //observe(filterSource, key, vlfopt, this.rebuildFilteredList);
      targetelem.getfilteredvaluelist = vlfopt;
      observeFields(keyprefix, key, vlfopt.url || ('{'+(vlfopt.filterby || '')+'}'), this.rebuildFilteredList);
			
      //this next if doesn't seem right or possible to ever happen? unless there is a default value associated with a created control.
      //if(filterSource.value && !filterSource.timeout) {
      //	filterSource.timeout = true;
      //	setTimeout(	(function(a){ return function() {a.timeout = false; triggerEvent(a,"change");}})(filterSource), 750);
      //}
    }
		
    setoptions(targetelem,jsf.options);
		
    if(frmRO) sl.disabled = true;
		
    if((jsf.type=='dropdown') && jsf.prefix) {
      var etn = document.createElement('b'); 
      etn.innerHTML = jsf.prefix;
      celldf.appendChild(etn);
    }
		
    //if(combodiv) combodiv.appendChild(sl); else 
    celldf.appendChild(sl);
		
    if((jsf.type=='dropdown') && jsf.postfix) {
      var etn = document.createElement('b'); 
      etn.innerHTML = jsf.postfix;
      celldf.appendChild(etn);
    }
    return targetelem;
	 }
};
